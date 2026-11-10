import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Navbar } from './index.ts'
import type { NavbarItem } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette
const dark = libraryTheme.colorSchemes.dark!.palette

/** Every CSS rule Emotion inserted, as text. */
const insertedCss = () =>
  [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .join('\n')

/** The `::after` rule that draws the current line under an item. */
const lineRule = (element: HTMLElement) => {
  const generated = [...element.classList].find((name) => name.endsWith('-CmNavbar-item'))
  return insertedCss()
    .split('\n')
    .find((text) => text.startsWith(`.${generated}::after`))
}

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

const routerTheme: ThemeOptions = {
  components: {
    MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } },
    MuiLink: { defaultProps: { component: LinkBehavior } },
  },
}

const items: NavbarItem[] = [
  { id: 'products', label: 'Products', href: '/products' },
  {
    id: 'resources',
    label: 'Resources',
    children: [
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'blog', label: 'Blog', href: '/blog' },
    ],
  },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
]

// jsdom's window is 1024px wide, so the bar's links show and the menu button
// is hidden by the `md` media query.
const nav = () => screen.getByRole('navigation', { name: 'Main' })
const link = (name: string) => screen.getByRole('link', { name })
const allNavs = () => [...document.querySelectorAll<HTMLElement>('nav.CmNavbar-nav')]
const collapsedNav = () => allNavs().find((element) => element.querySelector('[aria-haspopup]') && !element.querySelector('ul'))!
const menuButton = () => within(collapsedNav()).getByRole('button', { hidden: true })

describe('Navbar', () => {
  let warn: MockInstance
  let error: MockInstance

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn')
    error = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const expectNoWarnings = () => {
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  }

  it('renders a banner with a navigation named "Main", holding a list with a link per item', () => {
    renderThemed(<Navbar items={items} />, routerTheme)

    const banner = screen.getByRole('banner')
    expect(banner).toContainElement(nav())
    const list = within(nav()).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(within(nav()).getAllByRole('link').map((element) => element.textContent)).toEqual([
      'Products',
      'Pricing',
    ])
    expect(link('Products')).toHaveAttribute('href', '/products')
    expect(link('Products')).toHaveAttribute('data-router-link')
    expectNoWarnings()
  })

  it('renders brand with brandHref as a link before the navigation, through MuiLink', () => {
    renderThemed(<Navbar items={items} brand={<img src="/logo.svg" alt="Acme" />} brandHref="/" />, routerTheme)

    const brand = link('Acme')
    expect(brand).toHaveAttribute('href', '/')
    expect(brand).toHaveAttribute('data-router-link')
    expect(brand).toHaveClass('CmNavbar-brand', 'MuiLink-underlineNone')
    expect(brand.compareDocumentPosition(nav()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders brand without brandHref as plain content', () => {
    render(<Navbar items={items} brand="Acme" />)

    expect(screen.getByText('Acme')).toHaveClass('CmNavbar-brand')
    expect(screen.queryByRole('link', { name: 'Acme' })).not.toBeInTheDocument()
  })

  it('marks the item matching value as the current page', () => {
    render(<Navbar items={items} value="pricing" />)

    expect(link('Pricing')).toHaveAttribute('aria-current', 'page')
    expect(link('Products')).not.toHaveAttribute('aria-current')
  })

  it('shows a group holding the current item as current, without aria-current', async () => {
    renderThemed(<Navbar items={items} value="blog" />)

    const group = within(nav()).getByRole('button', { name: 'Resources' })
    expect(group).not.toHaveAttribute('aria-current')
    expect(group).toHaveStyle({ color: light.primary.dark })
    expect(link('Products')).not.toHaveStyle({ color: light.primary.dark })

    await userEvent.click(group)
    expect(screen.getByRole('menuitem', { name: 'Blog' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('menuitem', { name: 'Docs' })).not.toHaveAttribute('aria-current')
  })

  it('opens a group’s Menu with its children as links, and reports the chosen one', async () => {
    const onItemClick = vi.fn()
    renderThemed(<Navbar items={items} onItemClick={onItemClick} />, routerTheme)
    const group = within(nav()).getByRole('button', { name: 'Resources' })
    expect(group).toHaveAttribute('aria-haspopup', 'menu')

    await userEvent.click(group)

    const docs = screen.getByRole('menuitem', { name: 'Docs' })
    expect(docs.tagName).toBe('A')
    expect(docs).toHaveAttribute('href', '/docs')
    expect(group).toHaveAttribute('aria-expanded', 'true')
    docs.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(docs)
    expect(onItemClick).toHaveBeenCalledWith(expect.anything(), 'docs')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('calls onItemClick when a link in the bar is followed', async () => {
    const onItemClick = vi.fn()
    render(<Navbar items={items} onItemClick={onItemClick} />)
    link('Products').addEventListener('click', (event) => event.preventDefault())

    await userEvent.click(link('Products'))

    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), 'products')
  })

  describe('collapsed', () => {
    it('hides the menu button at or above collapseBelow, and the links below it, with CSS', () => {
      renderThemed(<Navbar items={items} />)

      expect(allNavs()).toHaveLength(2)
      expect(collapsedNav()).not.toBeVisible()
      expect(nav()).toBeVisible()
      const css = insertedCss()
      // `md` is 900px: below it, the bar's nav is hidden and the collapsed one shown.
      expect(css).toMatch(/@media \(max-width: ?899\.95px\)\s*\{[^}]*display: none/)
      expect(css).toMatch(/@media \(max-width: ?899\.95px\)\s*\{[^}]*display: flex/)
    })

    it('opens a Menu with every link, groups flattened between dividers', async () => {
      const onItemClick = vi.fn()
      renderThemed(<Navbar items={items} value="docs" onItemClick={onItemClick} />)
      expect(menuButton()).toHaveAccessibleName('Open navigation menu')

      await userEvent.click(menuButton())

      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.map((element) => element.textContent)).toEqual(['Products', 'Docs', 'Blog', 'Pricing'])
      expect(menuItems.map((element) => element.classList.contains('MuiMenuItem-divider'))).toEqual([
        true,
        false,
        true,
        false,
      ])
      expect(menuItems[1]).toHaveAttribute('aria-current', 'page')
      expect(menuItems[1]).toHaveClass('Mui-selected')

      menuItems[3].addEventListener('click', (event) => event.preventDefault())
      await userEvent.click(menuItems[3])
      expect(onItemClick).toHaveBeenCalledWith(expect.anything(), 'pricing')
    })

    it('doesn’t draw a divider after a group at the end', async () => {
      render(<Navbar items={[items[1]]} />)

      await userEvent.click(menuButton())

      expect(screen.getAllByRole('menuitem').map((element) => element.classList.contains('MuiMenuItem-divider'))).toEqual([
        false,
        false,
      ])
    })

    it('never collapses with collapseBelow={false}', () => {
      renderThemed(<Navbar items={items} collapseBelow={false} />)

      expect(allNavs()).toHaveLength(1)
      expect(nav()).toBeVisible()
      expect(screen.queryByRole('button', { name: 'Open navigation menu', hidden: true })).not.toBeInTheDocument()
    })

    it('uses the collapseBelow breakpoint', () => {
      renderThemed(<Navbar items={items} collapseBelow="lg" />)

      // `lg` is 1200px, so at 1024px the menu button shows and the links hide.
      expect(nav()).toBeVisible()
      expect(within(nav()).getByRole('button', { name: 'Open navigation menu' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Products' })).not.toBeInTheDocument()
    })

    it('renders both layouts on the server, with the right one hidden by CSS', () => {
      const html = renderToString(
        <CmThemeProvider>
          <Navbar items={items} />
        </CmThemeProvider>,
      )

      expect(html.match(/<nav/g)).toHaveLength(2)
      expect(html).toContain('Open navigation menu')
      expect(html).toContain('href="/products"')
    })
  })

  it('renders actions at the end', () => {
    render(<Navbar items={items} actions={<button type="button">Account</button>} />)

    const actions = document.querySelector('.CmNavbar-actions')!
    expect(actions).toContainElement(screen.getByRole('button', { name: 'Account' }))
    expect(screen.getByRole('banner').querySelector('.MuiToolbar-root')!.lastElementChild).toBe(actions)
  })

  it('renders no navigation and no menu button without items', () => {
    render(<Navbar items={[]} brand="Acme" actions={<button type="button">Account</button>} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(allNavs()).toHaveLength(0)
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
  })

  it('replaces the default names with labels', () => {
    render(<Navbar items={items} labels={{ nav: 'Principal', openMenu: 'Abrir menú' }} />)

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(menuButton()).toHaveAccessibleName('Abrir menú')
  })

  it('passes position, color, ref, className, sx and other props to the AppBar', () => {
    const ref = createRef<HTMLElement>()
    renderThemed(
      <Navbar
        ref={ref}
        items={items}
        position="static"
        color="primary"
        className="custom"
        data-testid="bar"
        sx={{ marginTop: '7px' }}
      />,
    )

    const banner = screen.getByRole('banner')
    expect(ref.current).toBe(banner)
    expect(banner).toHaveClass('custom', 'CmNavbar-root', 'MuiAppBar-positionStatic', 'MuiAppBar-colorPrimary')
    expect(banner).toHaveAttribute('data-testid', 'bar')
    expect(banner).toHaveStyle({ marginTop: '7px' })
  })

  it('passes every slotProps entry to its elements', async () => {
    render(
      <Navbar
        items={items}
        brand="Acme"
        brandHref="/"
        actions="Account"
        slotProps={{
          toolbar: { className: 'toolbar', variant: 'dense' },
          brand: { className: 'brand' },
          nav: { className: 'nav' },
          item: { className: 'item', size: 'small' },
          menu: { className: 'menu-paper' },
          menuButton: { className: 'menu-button' },
          actions: { className: 'actions' },
        }}
      />,
    )

    expect(document.querySelector('.toolbar')).toHaveClass('MuiToolbar-dense')
    expect(link('Acme')).toHaveClass('brand')
    expect(allNavs().every((element) => element.classList.contains('nav'))).toBe(true)
    expect(link('Products')).toHaveClass('item', 'MuiButton-sizeSmall')
    expect(within(nav()).getByRole('button', { name: 'Resources' })).toHaveClass('item')
    expect(menuButton()).toHaveClass('menu-button')
    expect(document.querySelector('.actions')).toHaveTextContent('Account')

    await userEvent.click(within(nav()).getByRole('button', { name: 'Resources' }))
    expect(document.querySelector('.CmMenu-paper')).toHaveClass('menu-paper')
  })

  it('adds the CmNavbar-root, brand, nav, item and actions classes', () => {
    render(<Navbar items={items} brand="Acme" actions="Account" />)

    for (const name of ['root', 'brand', 'nav', 'item', 'actions']) {
      expect(document.querySelector(`.CmNavbar-${name}`)).toBeInTheDocument()
    }
  })

  describe('under the library theme', () => {
    it('colors the current label primary.dark in light mode and primary.main in dark mode, with a primary.main line', () => {
      renderThemed(
        <>
          <Navbar items={items} value="products" />
          <div className="dark">
            <Navbar items={items} value="products" labels={{ nav: 'Dark' }} />
          </div>
        </>,
        { cssVariables: { colorSchemeSelector: 'class' } },
      )

      const [lightLink, darkLink] = screen.getAllByRole('link', { name: 'Products' })
      expect(lightLink).toHaveStyle({ color: light.primary.dark })
      expect(darkLink).toHaveStyle({ color: dark.primary.main })
      expect(lineRule(lightLink)).toContain('--mui-palette-primary-main')
    })

    it('keeps the bar’s text color on a colored bar, marking the current link by the line only', () => {
      renderThemed(<Navbar items={items} value="products" color="primary" />)

      expect(link('Products')).toHaveStyle({ color: light.primary.contrastText })
      expect(lineRule(link('Products'))).toMatch(/background-color: currentcolor/i)
    })

    it('shows the focus ring on keyboard focus', async () => {
      renderThemed(<Navbar items={items} />)

      await userEvent.tab()

      expect(link('Products')).toHaveFocus()
      expect(link('Products')).toHaveClass('Mui-focusVisible')
    })
  })

  it('works with the keyboard', async () => {
    render(<Navbar items={items} brand="Acme" brandHref="/" actions={<button type="button">Account</button>} />)

    await userEvent.tab()
    expect(link('Acme')).toHaveFocus()
    await userEvent.tab()
    expect(link('Products')).toHaveFocus()
    await userEvent.tab()
    const group = within(nav()).getByRole('button', { name: 'Resources' })
    expect(group).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Docs' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(group).toHaveFocus())
    await userEvent.tab()
    expect(link('Pricing')).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus()
  })

  describe('with overrides', () => {
    it('applies a project-level CmNavbar.defaultProps.collapseBelow', () => {
      renderThemed(<Navbar items={items} />, {
        components: { CmNavbar: { defaultProps: { collapseBelow: 'lg' } } },
      })

      expect(screen.queryByRole('link', { name: 'Products' })).not.toBeInTheDocument()
    })

    it('applies a project-level styleOverrides.item object', () => {
      renderThemed(<Navbar items={items} />, {
        components: { CmNavbar: { styleOverrides: { item: { letterSpacing: '3px' } } } },
      })

      expect(link('Products')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('applies project-level styleOverrides to root, brand, nav and actions', () => {
      renderThemed(<Navbar items={items} brand="Acme" actions="Account" />, {
        components: {
          CmNavbar: {
            styleOverrides: {
              root: { letterSpacing: '1px' },
              brand: { marginRight: '32px' },
              nav: { letterSpacing: '2px' },
              actions: { letterSpacing: '4px' },
            },
          },
        },
      })

      expect(screen.getByRole('banner')).toHaveStyle({ letterSpacing: '1px' })
      expect(screen.getByText('Acme')).toHaveStyle({ marginRight: '32px' })
      expect(nav()).toHaveStyle({ letterSpacing: '2px' })
      expect(document.querySelector('.CmNavbar-actions')).toHaveStyle({ letterSpacing: '4px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<Navbar items={items} sx={{ letterSpacing: '2px' }} />, {
        components: { CmNavbar: { styleOverrides: { root: { letterSpacing: '1px' } } } },
      })

      expect(screen.getByRole('banner')).toHaveStyle({ letterSpacing: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme, as MUI’s fixed primary bar', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <Navbar items={items} value="products" />
        </ThemeProvider>,
      )

      expect(screen.getByRole('banner')).toHaveClass('MuiAppBar-positionFixed', 'MuiAppBar-colorPrimary')
      expect(link('Products')).toHaveStyle({ color: '#fff' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const numbered = [
      { id: 1, label: 'One', href: '/one' },
      { id: 2, label: 'Two', children: [{ id: 3, label: 'Three', href: '/three' }] },
    ]
    const accepted = [
      <Navbar items={items} value="docs" onItemClick={(_, id: string) => id} />,
      <Navbar items={numbered} value={3} onItemClick={(_, id: number) => id} collapseBelow={false} />,
      <Navbar items={items} position="static" color="primary" slotProps={{ item: { size: 'small' } }} />,
    ]
    const rejected = [
      // @ts-expect-error: onItemClick receives a number
      <Navbar items={numbered} onItemClick={(_, id: string) => id} />,
      // @ts-expect-error: an item can't have both href and children
      <Navbar items={[{ id: 'a', label: 'A', href: '/a', children: [] }]} />,
      // @ts-expect-error: a child needs href
      <Navbar items={[{ id: 'a', label: 'A', children: [{ id: 'b', label: 'B' }] }]} />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmNavbar: {
            defaultProps: { collapseBelow: 'sm' },
            styleOverrides: { brand: { marginRight: 32 } },
          },
        },
      }),
      // @ts-expect-error: not a CmNavbar slot
      createCmTheme({ components: { CmNavbar: { styleOverrides: { menu: { padding: 0 } } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(8)
  })
})
