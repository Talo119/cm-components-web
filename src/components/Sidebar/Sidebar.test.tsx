import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Sidebar } from './index.ts'
import type { SidebarItem, SidebarSection } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

/** Every CSS rule Emotion inserted, as text. */
const insertedCss = () =>
  [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .join('\n')

/** Stands in for a router's link: `to` is required and isn't a DOM attribute. */
function RouterLink({
  to,
  ref,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string; ref?: Ref<HTMLAnchorElement> }) {
  return <a ref={ref} href={to} data-router-link {...props} />
}

/** Maps `href` to the router's `to`, as a project sets it in its theme. */
function LinkBehavior({ href, ...props }: ComponentProps<'a'> & { ref?: Ref<HTMLAnchorElement> }) {
  return <RouterLink to={href ?? ''} {...props} />
}

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Overview', href: '/' },
      { id: 'orders', label: 'Orders', href: '/orders', end: '3' },
      {
        id: 'customers',
        label: 'Customers',
        children: [
          { id: 'customers-list', label: 'All customers', href: '/customers' },
          { id: 'segments', label: 'Segments', href: '/customers/segments' },
        ],
      },
    ],
  },
  { id: 'admin', title: 'Admin', items: [{ id: 'settings', label: 'Settings', href: '/settings' }] },
]

const items: SidebarItem[] = [
  { id: 'overview', label: 'Overview', href: '/' },
  { id: 'orders', label: 'Orders', href: '/orders' },
]

/** Prevents navigation in jsdom, which doesn't implement it. */
const preventNavigation = (event: MouseEvent) => event.preventDefault()

// jsdom's window is 1024px wide, so with `responsive` the permanent drawer
// shows and the temporary one is hidden by the `md` media query.
const nav = () => screen.getByRole('navigation', { name: 'Main' })
const papers = () => [...document.querySelectorAll<HTMLElement>('.CmSidebar-paper')]
const temporaryPaper = () => papers().find((paper) => paper.closest('.MuiModal-root'))!
const permanentPaper = () => papers().find((paper) => !paper.closest('.MuiModal-root'))!

describe('Sidebar', () => {
  let warn: MockInstance
  let error: MockInstance

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn')
    error = vi.spyOn(console, 'error')
    document.addEventListener('click', preventNavigation)
  })

  afterEach(() => {
    document.removeEventListener('click', preventNavigation)
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const expectNoWarnings = () => {
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  }

  it('renders a navigation named "Main", with a list per section named by its title, and links', () => {
    renderThemed(<Sidebar sections={sections} />, {
      components: { MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } } },
    })

    const lists = within(nav()).getAllByRole('list').filter((list) => !list.classList.contains('CmList-nested'))
    expect(lists).toHaveLength(2)
    expect(within(nav()).getByRole('list', { name: 'Admin' })).toBe(lists[1])
    const overview = within(nav()).getByRole('link', { name: 'Overview' })
    expect(overview).toHaveAttribute('href', '/')
    expect(overview).toHaveAttribute('data-router-link')
    expect(within(nav()).getByRole('link', { name: 'Orders 3' })).toBeInTheDocument()
    expect(nav().querySelectorAll('hr')).toHaveLength(1)
    expectNoWarnings()
  })

  it('renders items as one section without a title', () => {
    render(<Sidebar items={items} />)

    const lists = within(nav()).getAllByRole('list')
    expect(lists).toHaveLength(1)
    expect(lists[0]).not.toHaveAttribute('aria-labelledby')
    expect(within(nav()).getAllByRole('link').map((link) => link.textContent)).toEqual(['Overview', 'Orders'])
  })

  it('marks the item matching value as the current page, and expands its parents', () => {
    render(<Sidebar sections={sections} value="segments" />)

    const segments = within(nav()).getByRole('link', { name: 'Segments' })
    expect(segments).toHaveAttribute('aria-current', 'page')
    expect(segments).toHaveClass('Mui-selected')
    expect(within(nav()).getByRole('button', { name: 'Customers' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav()).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
  })

  it('shows nothing as current for a value that isn’t in the items', () => {
    render(<Sidebar sections={sections} value="missing" />)

    expect(nav().querySelector('[aria-current]')).not.toBeInTheDocument()
  })

  it('expands and collapses parents, passing expanded, defaultExpanded and onExpandedChange to List', async () => {
    const onExpandedChange = vi.fn()
    const { rerender } = render(<Sidebar sections={sections} onExpandedChange={onExpandedChange} />)
    const parent = () => within(nav()).getByRole('button', { name: 'Customers' })

    await userEvent.click(parent())
    expect(parent()).toHaveAttribute('aria-expanded', 'true')
    expect(onExpandedChange).toHaveBeenCalledWith(expect.anything(), ['customers'])

    rerender(<Sidebar sections={sections} expanded={[]} />)
    expect(parent()).toHaveAttribute('aria-expanded', 'false')

    rerender(<Sidebar key="again" sections={sections} defaultExpanded={['customers']} />)
    expect(parent()).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls onItemClick when a link is followed', async () => {
    const onItemClick = vi.fn()
    render(<Sidebar sections={sections} onItemClick={onItemClick} />)

    await userEvent.click(within(nav()).getByRole('link', { name: 'Settings' }))

    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), 'settings')
  })

  describe('variants', () => {
    it('renders both drawers with responsive, with the temporary one hidden by CSS', () => {
      renderThemed(<Sidebar sections={sections} />)

      expect(papers()).toHaveLength(2)
      expect(permanentPaper()).toBeVisible()
      // `md` is 900px.
      const css = insertedCss()
      expect(css).toMatch(/@media \(max-width: ?899\.95px\)\s*\{[^}]*display: none/)
      expect(css).toMatch(/@media \(min-width: ?900px\)\s*\{[^}]*display: none/)
      expect(screen.getAllByRole('navigation', { hidden: true })).toHaveLength(2)
    })

    it('renders both drawers on the server, with their links in the HTML', () => {
      const html = renderToString(
        <CmThemeProvider>
          <Sidebar sections={sections} />
        </CmThemeProvider>,
      )

      expect(html.match(/<nav/g)?.length ?? 0).toBeGreaterThanOrEqual(1)
      expect(html).toContain('href="/orders"')
    })

    it('renders only the permanent drawer with variant="permanent"', () => {
      render(<Sidebar sections={sections} variant="permanent" />)

      expect(papers()).toHaveLength(1)
      expect(document.querySelector('.MuiModal-root')).not.toBeInTheDocument()
    })

    it('renders only the temporary drawer with variant="temporary"', () => {
      render(<Sidebar sections={sections} variant="temporary" />)

      expect(papers()).toHaveLength(1)
      expect(temporaryPaper()).toBeInTheDocument()
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('temporary drawer', () => {
    it('works controlled', async () => {
      const onOpenChange = vi.fn()
      function Controlled() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open navigation
            </button>
            <Sidebar
              sections={sections}
              variant="temporary"
              open={open}
              onOpenChange={(event, next) => {
                onOpenChange(event, next)
                setOpen(next)
              }}
            />
          </>
        )
      }
      render(<Controlled />)

      await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
      expect(screen.getByRole('dialog', { name: 'Main' })).toBeInTheDocument()

      await userEvent.keyboard('{Escape}')
      expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), false)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expectNoWarnings()
    })

    it('stays open when a controlled open doesn’t change', async () => {
      const onOpenChange = vi.fn()
      render(<Sidebar sections={sections} variant="temporary" open onOpenChange={onOpenChange} />)

      await userEvent.keyboard('{Escape}')

      expect(onOpenChange).toHaveBeenCalledWith(expect.anything(), false)
      expect(screen.getByRole('dialog', { name: 'Main' })).toBeInTheDocument()
    })

    it('works uncontrolled with and without defaultOpen', async () => {
      const { unmount } = render(<Sidebar sections={sections} variant="temporary" />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      unmount()

      render(<Sidebar sections={sections} variant="temporary" defaultOpen />)
      expect(screen.getByRole('dialog', { name: 'Main' })).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expectNoWarnings()
    })

    it('calls onItemClick, then onOpenChange with false, when a link is followed', async () => {
      const calls: string[] = []
      render(
        <Sidebar
          sections={sections}
          variant="temporary"
          defaultOpen
          onItemClick={(_, id) => calls.push(`item ${id}`)}
          onOpenChange={(_, open) => calls.push(`open ${open}`)}
        />,
      )

      await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Settings' }))

      expect(calls).toEqual(['item settings', 'open false'])
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('calls onOpenChange with false on a backdrop click', async () => {
      const onOpenChange = vi.fn()
      render(<Sidebar sections={sections} variant="temporary" defaultOpen onOpenChange={onOpenChange} />)

      await userEvent.click(document.querySelector('.MuiBackdrop-root')!)

      expect(onOpenChange).toHaveBeenCalledWith(expect.anything(), false)
    })

    it('only calls onItemClick in the permanent drawer', async () => {
      const onItemClick = vi.fn()
      const onOpenChange = vi.fn()
      render(<Sidebar sections={sections} variant="permanent" onItemClick={onItemClick} onOpenChange={onOpenChange} />)

      await userEvent.click(within(nav()).getByRole('link', { name: 'Orders 3' }))

      expect(onItemClick).toHaveBeenCalledWith(expect.anything(), 'orders')
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('is a dialog named like the nav that traps focus and returns it when it closes', async () => {
      function WithButton() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open navigation
            </button>
            <Sidebar items={items} variant="temporary" open={open} onOpenChange={(_, next) => setOpen(next)} aria-label="App" />
          </>
        )
      }
      render(<WithButton />)
      const opener = screen.getByRole('button', { name: 'Open navigation' })

      await userEvent.click(opener)
      const dialog = screen.getByRole('dialog', { name: 'App' })
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
      expect(within(dialog).getByRole('navigation', { name: 'App' })).toBeInTheDocument()

      await userEvent.tab()
      await userEvent.tab()
      await userEvent.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)

      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(opener).toHaveFocus())
    })

    it('closes an open temporary drawer when the screen widens past breakpoint', async () => {
      const listeners: ((event: MediaQueryListEvent) => void)[] = []
      const matchMedia = vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.push(listener),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
      vi.stubGlobal('matchMedia', matchMedia)
      const onOpenChange = vi.fn()
      render(<Sidebar sections={sections} defaultOpen onOpenChange={onOpenChange} breakpoint="lg" />)

      expect(matchMedia).toHaveBeenCalledWith('(min-width:1200px)')
      act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)))

      expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ matches: true }), false)
      await waitFor(() => expect(document.querySelector('.MuiModal-hidden')).toBeInTheDocument())
    })
  })

  it('applies width, anchor, header and footer, with the nav scrolling between them', () => {
    renderThemed(
      <Sidebar
        sections={sections}
        variant="permanent"
        width={280}
        anchor="right"
        header={<span>Acme</span>}
        footer={<span>Ana</span>}
        data-testid="root"
      />,
    )

    expect(permanentPaper()).toHaveStyle({ width: '280px', display: 'flex', flexDirection: 'column' })
    expect(permanentPaper().closest('.MuiDrawer-root')).toHaveClass('MuiDrawer-anchorRight')
    const [headerEl, navEl, footerEl] = [...permanentPaper().children] as HTMLElement[]
    expect(headerEl).toHaveClass('CmSidebar-header')
    expect(headerEl).toHaveTextContent('Acme')
    expect(headerEl).toHaveStyle({ padding: '16px' })
    expect(navEl).toBe(nav())
    expect(navEl).toHaveStyle({ flexGrow: '1', overflowY: 'auto' })
    expect(footerEl).toHaveClass('CmSidebar-footer')
    expect(footerEl).toHaveTextContent('Ana')
    expect(screen.getByTestId('root')).toHaveStyle({ width: '280px', flexShrink: '0' })
  })

  it('takes width where permanent and 0 where temporary', () => {
    const { rerender } = renderThemed(<Sidebar sections={sections} variant="temporary" data-testid="root" />)
    expect(screen.getByTestId('root')).toHaveStyle({ width: '0px' })

    rerender(
      <CmThemeProvider theme={createCmTheme()}>
        <Sidebar sections={sections} data-testid="root" />
      </CmThemeProvider>,
    )
    // At 1024px, `responsive` is permanent.
    expect(screen.getByTestId('root')).toHaveStyle({ width: '240px' })
    expect(insertedCss()).toMatch(/@media \(min-width: ?900px\)\s*\{[^}]*width: 240px/)
  })

  it('passes ref, className, sx and other props to the root <div>, and aria-label to the nav', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Sidebar
        ref={ref}
        sections={sections}
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
        aria-label="App"
      />,
    )

    const root = screen.getByTestId('root')
    expect(ref.current).toBe(root)
    expect(root).toHaveClass('custom', 'CmSidebar-root')
    expect(root).toHaveStyle({ marginTop: '7px' })
    expect(root).not.toHaveAttribute('aria-label')
    expect(screen.getByRole('navigation', { name: 'App' })).toBeInTheDocument()
  })

  it('passes every slotProps entry to its elements, in both drawers', () => {
    render(
      <Sidebar
        sections={sections}
        header="Acme"
        footer="Ana"
        slotProps={{
          drawer: { className: 'drawer' },
          paper: { className: 'paper' },
          header: { className: 'header' },
          nav: { className: 'nav' },
          list: { className: 'list', dense: true },
          footer: { className: 'footer' },
        }}
      />,
    )

    for (const name of ['drawer', 'paper', 'header', 'nav', 'footer']) {
      expect(document.querySelectorAll(`.${name}`)).toHaveLength(2)
    }
    expect(document.querySelectorAll('.list')).toHaveLength(4)
    expect(document.querySelector('.list')).toHaveClass('MuiList-dense')
  })

  it('adds the CmSidebar classes to its parts', () => {
    render(<Sidebar sections={sections} header="Acme" footer="Ana" />)

    for (const name of ['root', 'paper', 'header', 'nav', 'footer']) {
      expect(document.querySelector(`.CmSidebar-${name}`)).toBeInTheDocument()
    }
  })

  it('works with the keyboard in the permanent drawer', async () => {
    render(<Sidebar sections={sections} variant="permanent" header={<button type="button">Workspace</button>} />)

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Workspace' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveFocus()
    await userEvent.tab()
    await userEvent.tab()
    const parent = screen.getByRole('button', { name: 'Customers' })
    expect(parent).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(parent).toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    expect(screen.getByRole('link', { name: 'All customers' })).toHaveFocus()
  })

  describe('with overrides', () => {
    it('applies a project-level CmSidebar.defaultProps.width', () => {
      renderThemed(<Sidebar sections={sections} variant="permanent" />, {
        components: { CmSidebar: { defaultProps: { width: 280 } } },
      })

      expect(permanentPaper()).toHaveStyle({ width: '280px' })
    })

    it('applies a project-level styleOverrides.header object', () => {
      renderThemed(<Sidebar sections={sections} header="Acme" />, {
        components: { CmSidebar: { styleOverrides: { header: { letterSpacing: '3px' } } } },
      })

      expect(document.querySelector('.CmSidebar-header')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('applies project-level styleOverrides to root, paper, nav and footer', () => {
      renderThemed(<Sidebar sections={sections} variant="permanent" footer="Ana" data-testid="root" />, {
        components: {
          CmSidebar: {
            styleOverrides: {
              root: { letterSpacing: '1px' },
              paper: { borderRightWidth: '0px' },
              nav: { letterSpacing: '2px' },
              footer: { letterSpacing: '4px' },
            },
          },
        },
      })

      expect(screen.getByTestId('root')).toHaveStyle({ letterSpacing: '1px' })
      expect(permanentPaper()).toHaveStyle({ borderRightWidth: '0px' })
      expect(nav()).toHaveStyle({ letterSpacing: '2px' })
      expect(document.querySelector('.CmSidebar-footer')).toHaveStyle({ letterSpacing: '4px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<Sidebar sections={sections} data-testid="root" sx={{ letterSpacing: '2px' }} />, {
        components: { CmSidebar: { styleOverrides: { root: { letterSpacing: '1px' } } } },
      })

      expect(screen.getByTestId('root')).toHaveStyle({ letterSpacing: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      render(
        <ThemeProvider theme={createTheme({ spacing: 4 })}>
          <Sidebar sections={sections} header="Acme" />
        </ThemeProvider>,
      )

      expect(document.querySelector('.CmSidebar-header')).toHaveStyle({ padding: '8px' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const numbered = [{ id: 1, label: 'One', href: '/one' }]
    const accepted = [
      <Sidebar sections={sections} value="orders" onItemClick={(_, id: string) => id} />,
      <Sidebar items={numbered} value={1} onItemClick={(_, id: number) => id} />,
      <Sidebar
        items={items}
        variant="temporary"
        open
        onOpenChange={(_, open: boolean) => open}
        width="20rem"
        anchor="right"
        breakpoint="lg"
      />,
    ]
    const rejected = [
      // @ts-expect-error: onItemClick receives a number
      <Sidebar items={numbered} onItemClick={(_, id: string) => id} />,
      // @ts-expect-error: items and sections together
      <Sidebar items={items} sections={sections} />,
      // @ts-expect-error: an item needs href or children
      <Sidebar items={[{ id: 'a', label: 'A' }]} />,
      // @ts-expect-error: one of items or sections is required
      <Sidebar />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmSidebar: {
            defaultProps: { breakpoint: 'lg' },
            styleOverrides: { paper: { borderRight: 0 } },
          },
        },
      }),
      // @ts-expect-error: not a CmSidebar slot
      createCmTheme({ components: { CmSidebar: { styleOverrides: { list: { padding: 0 } } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(9)
  })
})
