import IconButton from '@mui/material/IconButton'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Menu } from './index.ts'
import type { MenuItemData } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

// MUI's `Modal` hides the rest of the page from screen readers while the menu is open.
const trigger = (name = 'Export') => screen.getByRole('button', { name, hidden: true })
const menu = () => screen.getByRole('menu')
const menuItems = () => screen.getAllByRole('menuitem')
const menuItem = (name: string | RegExp) => screen.getByRole('menuitem', { name })
const paper = () => document.querySelector<HTMLElement>('.CmMenu-paper')!

/** Waits for the menu to close: MUI's transition removes it from the DOM. */
const waitForClosed = () => waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())

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

const items: MenuItemData[] = [
  { id: 'csv', label: 'CSV' },
  { id: 'pdf', label: 'PDF' },
  { id: 'xlsx', label: 'Excel' },
]

const withDisabled: MenuItemData[] = [
  { id: 'edit', label: 'Edit', disabled: true },
  { id: 'copy', label: 'Duplicate' },
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete', disabled: true },
]

describe('Menu', () => {
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

  it('renders only the trigger while closed', () => {
    render(<Menu trigger={<Button>Export</Button>} items={items} />)

    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger()).not.toHaveAttribute('aria-expanded')
    expect(trigger()).not.toHaveAttribute('aria-controls')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expectNoWarnings()
  })

  it('opens a menu named by the trigger on click, with a menuitem per item in order', async () => {
    render(
      <Menu
        trigger={<Button>Export</Button>}
        items={[
          { id: 'csv', label: 'CSV', icon: <svg data-testid="icon" />, secondary: '⌘C' },
          { id: 'pdf', label: 'PDF' },
        ]}
      />,
    )

    await userEvent.click(trigger())

    expect(screen.getByRole('menu', { name: 'Export' })).toBe(menu())
    expect(menuItems().map((element) => element.textContent)).toEqual(['CSV⌘C', 'PDF'])
    expect(within(menuItems()[0]).getByTestId('icon')).toBeInTheDocument()
    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    expect(trigger()).toHaveAttribute('aria-controls', menu().id)
    expect(menuItem('CSV ⌘C')).toHaveFocus()
    expectNoWarnings()
  })

  it('calls the item’s onClick, then onItemClick with the event and id, then closes', async () => {
    const calls: string[] = []
    const onClick = vi.fn(() => calls.push('onClick'))
    const onItemClick = vi.fn(() => calls.push('onItemClick'))
    const onOpenChange = vi.fn(() => calls.push('onOpenChange'))
    render(
      <Menu
        trigger={<Button>Export</Button>}
        items={[{ id: 'csv', label: 'CSV', onClick }, items[1]]}
        onItemClick={onItemClick}
        onOpenChange={onOpenChange}
      />,
    )

    await userEvent.click(trigger())
    calls.length = 0
    await userEvent.click(menuItem('CSV'))

    expect(calls).toEqual(['onClick', 'onItemClick', 'onOpenChange'])
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), 'csv')
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), false)
    await waitForClosed()
    expect(trigger()).toHaveFocus()
  })

  it('chooses the focused item with Enter and Space', async () => {
    const onItemClick = vi.fn()
    render(<Menu trigger={<Button>Export</Button>} items={items} onItemClick={onItemClick} />)

    trigger().focus()
    await userEvent.keyboard('{Enter}')
    expect(menuItem('CSV')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onItemClick).toHaveBeenLastCalledWith(expect.anything(), 'pdf')
    await waitForClosed()

    await userEvent.keyboard(' ')
    expect(menuItem('CSV')).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(onItemClick).toHaveBeenLastCalledWith(expect.anything(), 'csv')
  })

  describe('placement', () => {
    it.each([
      ['bottom-start', { vertical: 'bottom', horizontal: 'left' }, { vertical: 'top', horizontal: 'left' }],
      ['bottom-end', { vertical: 'bottom', horizontal: 'right' }, { vertical: 'top', horizontal: 'right' }],
      ['top-start', { vertical: 'top', horizontal: 'left' }, { vertical: 'bottom', horizontal: 'left' }],
      ['top-end', { vertical: 'top', horizontal: 'right' }, { vertical: 'bottom', horizontal: 'right' }],
    ] as const)('maps %s to MUI’s origins, and swaps them in a right-to-left layout', async (placement, anchor, transform) => {
      const spy = vi.fn()
      const theme = createCmTheme({
        components: {
          MuiPopover: {
            defaultProps: {
              // Reads the origins Menu passes, through a slot that sees them.
              slotProps: { paper: (ownerState) => (spy(ownerState.anchorOrigin, ownerState.transformOrigin), {}) },
            },
          },
        },
      })
      const { unmount } = render(
        <CmThemeProvider theme={theme}>
          <Menu trigger={<Button>Export</Button>} items={items} placement={placement} />
        </CmThemeProvider>,
      )
      await userEvent.click(trigger())
      expect(spy).toHaveBeenLastCalledWith(anchor, transform)
      unmount()

      const flip = (origin: typeof anchor | typeof transform) => ({
        ...origin,
        horizontal: origin.horizontal === 'left' ? 'right' : 'left',
      })
      render(
        <CmThemeProvider theme={createCmTheme({ direction: 'rtl', components: theme.components })}>
          <Menu trigger={<Button>Export</Button>} items={items} placement={placement} />
        </CmThemeProvider>,
      )
      await userEvent.click(trigger())
      expect(spy).toHaveBeenLastCalledWith(flip(anchor), flip(transform))
    })

    it('lets slotProps.menu.anchorOrigin win over placement', async () => {
      const spy = vi.fn()
      renderThemed(
        <Menu
          trigger={<Button>Export</Button>}
          items={items}
          placement="bottom-end"
          slotProps={{ menu: { anchorOrigin: { vertical: 'center', horizontal: 'center' } } }}
        />,
        {
          components: {
            MuiPopover: {
              defaultProps: { slotProps: { paper: (ownerState) => (spy(ownerState.anchorOrigin), {}) } },
            },
          },
        },
      )

      await userEvent.click(trigger())

      expect(spy).toHaveBeenLastCalledWith({ vertical: 'center', horizontal: 'center' })
    })
  })

  it('renders an item with href as a menuitem link through the theme’s LinkComponent', async () => {
    const onItemClick = vi.fn()
    renderThemed(
      <Menu
        trigger={<Button>Options</Button>}
        items={[
          { id: 'edit', label: 'Edit', href: '/projects/1/edit' },
          { id: 'copy', label: 'Duplicate' },
        ]}
        onItemClick={onItemClick}
      />,
      { components: { MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } } } },
    )

    await userEvent.click(trigger('Options'))

    const edit = menuItem('Edit')
    expect(edit.tagName).toBe('A')
    expect(edit).toHaveAttribute('href', '/projects/1/edit')
    expect(edit).toHaveAttribute('data-router-link')
    expect(menuItem('Duplicate').tagName).toBe('LI')

    edit.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(edit)
    expect(onItemClick).toHaveBeenCalledWith(expect.anything(), 'edit')
  })

  it('doesn’t choose a disabled item, and the arrow keys skip it', async () => {
    const onItemClick = vi.fn()
    render(<Menu trigger={<Button>Options</Button>} items={withDisabled} onItemClick={onItemClick} />)

    await userEvent.click(trigger('Options'))

    expect(menuItem('Edit')).toHaveAttribute('aria-disabled', 'true')
    expect(menuItem('Duplicate')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(menuItem('Archive')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(menuItem('Duplicate')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(menuItem('Archive')).toHaveFocus()

    await userEvent.setup({ pointerEventsCheck: 0 }).click(menuItem('Edit'))
    expect(onItemClick).not.toHaveBeenCalled()
  })

  it('marks an item with current as the page, with the selected class, and still focuses the first item', async () => {
    render(
      <Menu
        trigger={<Button>Resources</Button>}
        items={[
          { id: 'docs', label: 'Docs', href: '/docs' },
          { id: 'blog', label: 'Blog', href: '/blog', current: true },
        ]}
      />,
    )

    await userEvent.click(trigger('Resources'))

    expect(menuItem('Blog')).toHaveAttribute('aria-current', 'page')
    expect(menuItem('Blog')).toHaveClass('Mui-selected')
    expect(menuItem('Docs')).not.toHaveAttribute('aria-current')
    expect(menuItem('Docs')).toHaveFocus()
  })

  describe('state', () => {
    it('works controlled', async () => {
      const onOpenChange = vi.fn()
      function Controlled() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <Menu
              trigger={<Button>Export</Button>}
              items={items}
              open={open}
              onOpenChange={(event, next) => {
                onOpenChange(event, next)
                setOpen(next)
              }}
            />
            <button type="button" onClick={() => setOpen(true)}>
              Open from code
            </button>
          </>
        )
      }
      render(<Controlled />)

      await userEvent.click(trigger())
      expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), true)
      expect(menu()).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), false)
      await waitForClosed()

      await userEvent.click(screen.getByRole('button', { name: 'Open from code' }))
      expect(menu()).toBeInTheDocument()
      expect(trigger()).toHaveAttribute('aria-expanded', 'true')
      expectNoWarnings()
    })

    it('stays closed when a controlled open doesn’t change', async () => {
      const onOpenChange = vi.fn()
      render(<Menu trigger={<Button>Export</Button>} items={items} open={false} onOpenChange={onOpenChange} />)

      await userEvent.click(trigger())

      expect(onOpenChange).toHaveBeenCalledWith(expect.anything(), true)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('works uncontrolled with defaultOpen', async () => {
      render(<Menu trigger={<Button>Export</Button>} items={items} defaultOpen />)

      expect(menu()).toBeInTheDocument()
      await userEvent.click(menuItem('PDF'))
      await waitForClosed()
      expectNoWarnings()
    })

    it('opens an empty menu and focuses the menu itself', async () => {
      render(<Menu trigger={<Button>Export</Button>} items={[]} />)

      await userEvent.click(trigger())

      expect(menu()).toHaveFocus()
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
    })
  })

  describe('trigger', () => {
    it('keeps the trigger’s own onClick, id and ref', async () => {
      const onClick = vi.fn()
      const ref = createRef<HTMLButtonElement>()
      render(
        <Menu
          trigger={
            <Button id="export-button" ref={ref} onClick={onClick}>
              Export
            </Button>
          }
          items={items}
        />,
      )

      await userEvent.click(trigger())

      expect(onClick).toHaveBeenCalledOnce()
      expect(trigger()).toHaveAttribute('id', 'export-button')
      expect(ref.current).toBe(trigger())
      expect(menu()).toHaveAttribute('aria-labelledby', 'export-button')
    })

    it('doesn’t open when the trigger’s onClick calls preventDefault', async () => {
      const onOpenChange = vi.fn()
      render(
        <Menu
          trigger={<Button onClick={(event) => event.preventDefault()}>Export</Button>}
          items={items}
          onOpenChange={onOpenChange}
        />,
      )

      await userEvent.click(trigger())

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('works with an icon button named by aria-label', async () => {
      render(
        <Menu
          trigger={
            <IconButton aria-label="Options for Apollo">
              <svg />
            </IconButton>
          }
          items={withDisabled}
        />,
      )

      await userEvent.click(trigger('Options for Apollo'))

      expect(screen.getByRole('menu', { name: 'Options for Apollo' })).toBeInTheDocument()
    })
  })

  describe('keyboard', () => {
    it('opens on the first enabled item with ArrowDown', async () => {
      render(<Menu trigger={<Button>Options</Button>} items={withDisabled} />)

      trigger('Options').focus()
      await userEvent.keyboard('{ArrowDown}')

      expect(menuItem('Duplicate')).toHaveFocus()
    })

    it('opens on the last enabled item with ArrowUp', async () => {
      render(<Menu trigger={<Button>Options</Button>} items={withDisabled} />)

      trigger('Options').focus()
      await userEvent.keyboard('{ArrowUp}')

      await waitFor(() => expect(menuItem('Archive')).toHaveFocus())
      await userEvent.keyboard('{ArrowDown}')
      expect(menuItem('Duplicate')).toHaveFocus()
    })

    it('moves with Home, End and typed characters', async () => {
      render(<Menu trigger={<Button>Export</Button>} items={items} />)

      await userEvent.click(trigger())
      await userEvent.keyboard('{End}')
      expect(menuItem('Excel')).toHaveFocus()
      await userEvent.keyboard('{Home}')
      expect(menuItem('CSV')).toHaveFocus()
      await userEvent.keyboard('p')
      expect(menuItem('PDF')).toHaveFocus()
    })

    it.each(['{Escape}', '{Tab}'])('closes with %s and returns focus to the trigger', async (key) => {
      const onOpenChange = vi.fn()
      render(<Menu trigger={<Button>Export</Button>} items={items} onOpenChange={onOpenChange} />)

      await userEvent.click(trigger())
      await userEvent.keyboard(key)

      expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), false)
      await waitForClosed()
      expect(trigger()).toHaveFocus()
      expect(trigger()).not.toHaveAttribute('aria-expanded')
    })
  })

  it('passes divider and dense to MUI’s MenuItem', async () => {
    render(
      <Menu
        trigger={<Button>Export</Button>}
        items={[{ ...items[0], divider: true }, items[1]]}
        dense
      />,
    )

    await userEvent.click(trigger())

    expect(menuItems()[0]).toHaveClass('MuiMenuItem-divider', 'MuiMenuItem-dense')
    expect(menuItems()[1]).not.toHaveClass('MuiMenuItem-divider')
  })

  it('passes ref, className and sx to the paper', async () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Menu
        trigger={<Button>Export</Button>}
        items={items}
        ref={ref}
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    await userEvent.click(trigger())

    expect(ref.current).toBe(paper())
    expect(paper()).toHaveClass('custom', 'MuiMenu-paper', 'MuiPaper-root')
    expect(paper()).toHaveStyle({ marginTop: '7px' })
    expect(paper()).toContainElement(menu())
  })

  it('passes slotProps.menu, item, itemIcon and itemText to their elements', async () => {
    render(
      <Menu
        trigger={<Button>Export</Button>}
        items={[{ id: 'csv', label: 'CSV', icon: <svg /> }]}
        slotProps={{
          menu: { className: 'menu-root', slotProps: { list: { className: 'menu-list' } } },
          item: { className: 'item' },
          itemIcon: { className: 'item-icon' },
          itemText: { className: 'item-text' },
        }}
      />,
    )

    await userEvent.click(trigger())

    expect(document.querySelector('.CmMenu-root')).toHaveClass('menu-root', 'MuiMenu-root')
    expect(menu()).toHaveClass('menu-list')
    expect(menuItem('CSV')).toHaveClass('item')
    expect(document.querySelector('.item-icon')).toHaveClass('MuiListItemIcon-root')
    expect(document.querySelector('.item-text')).toHaveClass('MuiListItemText-root')
  })

  it('adds the CmMenu-root, CmMenu-paper and CmMenu-item classes', async () => {
    render(<Menu trigger={<Button>Export</Button>} items={items} />)

    await userEvent.click(trigger())

    expect(document.querySelector('.CmMenu-root')).toHaveClass('MuiPopover-root')
    expect(paper()).toHaveClass('MuiPopover-paper')
    for (const element of menuItems()) expect(element).toHaveClass('CmMenu-item')
  })

  describe('under the library theme', () => {
    it('uses the theme’s text colors, and text.secondary for secondary', async () => {
      renderThemed(<Menu trigger={<Button>Export</Button>} items={[{ id: 'a', label: 'Cut', secondary: '⌘X' }]} />)

      await userEvent.click(trigger())

      expect(screen.getByText('⌘X')).toHaveStyle({ color: light.text.secondary })
    })

    it('shows the focus ring on keyboard focus', async () => {
      renderThemed(<Menu trigger={<Button>Export</Button>} items={items} />)

      trigger().focus()
      await userEvent.keyboard('{ArrowDown}')

      expect(menuItem('CSV')).toHaveFocus()
      expect(menuItem('CSV')).toHaveClass('Mui-focusVisible')
    })
  })

  describe('with overrides', () => {
    it('applies a project-level CmMenu.defaultProps.placement', async () => {
      const spy = vi.fn()
      renderThemed(<Menu trigger={<Button>Export</Button>} items={items} />, {
        components: {
          CmMenu: { defaultProps: { placement: 'bottom-end' } },
          MuiPopover: {
            defaultProps: { slotProps: { paper: (ownerState) => (spy(ownerState.anchorOrigin), {}) } },
          },
        },
      })

      await userEvent.click(trigger())

      expect(spy).toHaveBeenLastCalledWith({ vertical: 'bottom', horizontal: 'right' })
    })

    it('applies project-level CmMenu styleOverrides to root, paper and item', async () => {
      renderThemed(<Menu trigger={<Button>Export</Button>} items={items} />, {
        components: {
          CmMenu: {
            styleOverrides: {
              root: { letterSpacing: '1px' },
              paper: { letterSpacing: '2px' },
              item: { letterSpacing: '3px' },
            },
          },
        },
      })

      await userEvent.click(trigger())

      expect(document.querySelector('.CmMenu-root')).toHaveStyle({ letterSpacing: '1px' })
      expect(paper()).toHaveStyle({ letterSpacing: '2px' })
      expect(menuItem('CSV')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('keeps MuiMenu paper overrides', async () => {
      renderThemed(<Menu trigger={<Button>Export</Button>} items={items} />, {
        components: { MuiMenu: { styleOverrides: { paper: { letterSpacing: '4px' } } } },
      })

      await userEvent.click(trigger())

      expect(paper()).toHaveStyle({ letterSpacing: '4px' })
    })

    it('lets an instance-level sx value override the theme', async () => {
      renderThemed(<Menu trigger={<Button>Export</Button>} items={items} sx={{ letterSpacing: '5px' }} />, {
        components: { CmMenu: { styleOverrides: { paper: { letterSpacing: '2px' } } } },
      })

      await userEvent.click(trigger())

      expect(paper()).toHaveStyle({ letterSpacing: '5px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', async () => {
      const theme = createTheme({ palette: { text: { secondary: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <Menu trigger={<Button>Export</Button>} items={[{ id: 'a', label: 'Cut', secondary: '⌘X' }]} />
        </ThemeProvider>,
      )
      await userEvent.click(trigger())

      expect(screen.getByText('⌘X')).toHaveStyle({ color: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const numbered = [
      { id: 1, label: 'One' },
      { id: 2, label: 'Two', href: '/two' },
    ]
    const accepted = [
      <Menu trigger={<Button>A</Button>} items={items} onItemClick={(_, id: string) => id} />,
      <Menu trigger={<Button>A</Button>} items={numbered} onItemClick={(_, id: number) => id} />,
      <Menu
        trigger={<Button>A</Button>}
        items={items}
        open
        onOpenChange={(_, open: boolean) => open}
        placement="top-end"
        dense
        slotProps={{ menu: { anchorOrigin: { vertical: 'top', horizontal: 'left' } } }}
      />,
    ]
    const rejected = [
      // @ts-expect-error: trigger is required
      <Menu items={items} />,
      // @ts-expect-error: onItemClick receives a number
      <Menu trigger={<Button>A</Button>} items={numbered} onItemClick={(_, id: string) => id} />,
      // @ts-expect-error: not a placement
      <Menu trigger={<Button>A</Button>} items={items} placement="left" />,
      // @ts-expect-error: open is set by Menu
      <Menu trigger={<Button>A</Button>} items={items} slotProps={{ menu: { open: true } }} />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmMenu: {
            defaultProps: { dense: true },
            styleOverrides: { item: { minHeight: 40 } },
          },
        },
      }),
      // @ts-expect-error: not a CmMenu slot
      createCmTheme({ components: { CmMenu: { styleOverrides: { list: { padding: 0 } } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(9)
  })
})
