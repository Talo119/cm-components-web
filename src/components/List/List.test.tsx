import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { List } from './index.ts'
import type { ListItemData } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const list = () => screen.getAllByRole('list')[0]
const listItems = () => [...list().children].filter((element) => element.tagName === 'LI')
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const link = (name: string | RegExp) => screen.getByRole('link', { name })
const root = () => screen.getByTestId('root')

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

const routerTheme: ThemeOptions = {
  components: { MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } } },
}

const people: ListItemData[] = [
  { id: 'ana', primary: 'Ana', secondary: 'Designer' },
  { id: 'luis', primary: 'Luis', secondary: 'Engineer' },
  { id: 'eva', primary: 'Eva', secondary: 'Manager' },
]

const settings: ListItemData[] = [
  { id: 'profile', primary: 'Profile', href: '/settings/profile' },
  {
    id: 'billing',
    primary: 'Billing',
    children: [
      { id: 'invoices', primary: 'Invoices', href: '/settings/billing/invoices' },
      { id: 'plans', primary: 'Plans', href: '/settings/billing/plans' },
    ],
  },
]

describe('List', () => {
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

  it('renders a list named by aria-label, with a listitem per item showing its parts', () => {
    render(
      <List
        aria-label="Team"
        items={[
          {
            id: 'ana',
            primary: 'Ana',
            secondary: 'Designer',
            icon: <svg data-testid="icon" />,
            end: '3',
            action: <button type="button">Remove Ana</button>,
          },
          { id: 'luis', primary: 'Luis', avatar: <span data-testid="avatar">L</span> },
        ]}
      />,
    )

    expect(screen.getByRole('list', { name: 'Team' })).toBe(list())
    expect(listItems()).toHaveLength(2)
    const [first, second] = listItems()
    expect(first).toHaveTextContent('Ana')
    expect(first).toHaveTextContent('Designer')
    expect(first).toHaveTextContent('3')
    expect(within(first as HTMLElement).getByTestId('icon')).toBeInTheDocument()
    expect(within(first as HTMLElement).getByRole('button', { name: 'Remove Ana' })).toBeInTheDocument()
    expect(within(second as HTMLElement).getByTestId('avatar')).toBeInTheDocument()
    expect(second.querySelector('.MuiListItemAvatar-root')).toContainElement(
      screen.getByTestId('avatar'),
    )
    expectNoWarnings()
  })

  it('renders items in order', () => {
    render(<List aria-label="Team" items={people} />)

    expect(listItems().map((item) => item.querySelector('.MuiListItemText-primary')?.textContent)).toEqual([
      'Ana',
      'Luis',
      'Eva',
    ])
  })

  it('is named by its subheader without aria-label or aria-labelledby', () => {
    const { rerender } = render(<List subheader="Members" items={people} />)
    expect(screen.getByRole('list', { name: 'Members' })).toBeInTheDocument()

    rerender(<List subheader="Members" aria-label="Team" items={people} />)
    expect(screen.getByRole('list', { name: 'Team' })).toBeInTheDocument()

    rerender(
      <>
        <h2 id="heading">People</h2>
        <List subheader="Members" aria-labelledby="heading" items={people} />
      </>,
    )
    expect(screen.getByRole('list', { name: 'People' })).toBeInTheDocument()
  })

  it('renders a static list without buttons or links', () => {
    render(<List aria-label="Team" items={people} />)

    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(document.querySelector('.CmList-itemButton')).not.toBeInTheDocument()
  })

  it('renders an item with href as a link through the theme’s LinkComponent', () => {
    renderThemed(<List aria-label="Settings" items={settings} />, routerTheme)

    const profile = link('Profile')
    expect(profile.tagName).toBe('A')
    expect(profile).toHaveAttribute('href', '/settings/profile')
    expect(profile).toHaveAttribute('data-router-link')
    expect(profile.closest('li')).toHaveClass('CmList-item')
    expectNoWarnings()
  })

  it('renders plain anchors without a theme LinkComponent', () => {
    render(<List aria-label="Settings" items={settings} />)

    expect(link('Profile')).toHaveAttribute('href', '/settings/profile')
  })

  it('calls an item’s onClick, then onChange, with the event and the id', async () => {
    const calls: string[] = []
    const onClick = vi.fn(() => calls.push('onClick'))
    const onChange = vi.fn(() => calls.push('onChange'))
    render(
      <List
        aria-label="Actions"
        items={[{ id: 'archive', primary: 'Archive', onClick }]}
        onChange={onChange}
      />,
    )

    await userEvent.click(button('Archive'))

    expect(calls).toEqual(['onClick', 'onChange'])
    expect(onClick.mock.calls[0]).toEqual([expect.objectContaining({ type: 'click' })])
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), 'archive')
    expect(button('Archive').tagName).toBe('DIV')
    expectNoWarnings()
  })

  it('makes every item a button when the List has onChange', () => {
    render(<List aria-label="Team" items={people} onChange={() => {}} />)

    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('calls item.onClick and onChange for a link, and a preventDefault stops navigation', async () => {
    const onChange = vi.fn()
    const onClick = vi.fn((event) => event.preventDefault())
    render(
      <List
        aria-label="Settings"
        items={[{ id: 'profile', primary: 'Profile', href: '/profile', onClick }]}
        onChange={onChange}
      />,
    )

    await userEvent.click(link('Profile'))

    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(true)
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 'profile')
  })

  describe('selection', () => {
    it('works controlled', async () => {
      function Controlled() {
        const [selected, setSelected] = useState<string | null>('luis')
        return (
          <>
            <List
              aria-label="Team"
              items={people}
              value={selected}
              onChange={(_, id) => setSelected(id)}
            />
            <button type="button" onClick={() => setSelected(null)}>
              Clear
            </button>
          </>
        )
      }
      render(<Controlled />)
      expect(button(/Luis/)).toHaveClass('Mui-selected')

      await userEvent.click(button(/Eva/))
      expect(button(/Eva/)).toHaveClass('Mui-selected')
      expect(button(/Luis/)).not.toHaveClass('Mui-selected')

      await userEvent.click(button('Clear'))
      expect(document.querySelector('.Mui-selected')).not.toBeInTheDocument()
      expectNoWarnings()
    })

    it('keeps a controlled value the consumer doesn’t change', async () => {
      const onChange = vi.fn()
      render(<List aria-label="Team" items={people} value="ana" onChange={onChange} />)

      await userEvent.click(button(/Eva/))

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'eva')
      expect(button(/Ana/)).toHaveClass('Mui-selected')
      expect(button(/Eva/)).not.toHaveClass('Mui-selected')
    })

    it('works uncontrolled with defaultValue', async () => {
      render(<List aria-label="Team" items={people} defaultValue="ana" />)
      expect(button(/Ana/)).toHaveAttribute('aria-current', 'true')

      await userEvent.click(button(/Luis/))

      expect(button(/Luis/)).toHaveClass('Mui-selected')
      expect(button(/Luis/)).toHaveAttribute('aria-current', 'true')
      expect(button(/Ana/)).not.toHaveAttribute('aria-current')
      expectNoWarnings()
    })

    it('starts with nothing selected with defaultValue={null}', async () => {
      render(<List aria-label="Team" items={people} defaultValue={null} />)
      expect(document.querySelector('.Mui-selected')).not.toBeInTheDocument()

      await userEvent.click(button(/Eva/))

      expect(button(/Eva/)).toHaveClass('Mui-selected')
    })

    it('selects nothing without value or defaultValue', async () => {
      const onChange = vi.fn()
      render(<List aria-label="Team" items={people} onChange={onChange} />)

      await userEvent.click(button(/Eva/))

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'eva')
      expect(document.querySelector('.Mui-selected')).not.toBeInTheDocument()
      expect(button(/Eva/)).not.toHaveAttribute('aria-current')
    })

    it('marks a selected link with aria-current="page"', () => {
      render(<List aria-label="Settings" items={settings} value="profile" />)

      expect(link('Profile')).toHaveAttribute('aria-current', 'page')
      expect(link('Profile')).toHaveClass('Mui-selected')
    })

    it('selects nothing, without calling onChange, when the selected item is removed', () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <List aria-label="Team" items={people} defaultValue="eva" onChange={onChange} />,
      )

      rerender(<List aria-label="Team" items={people.slice(0, 2)} onChange={onChange} />)

      expect(document.querySelector('.Mui-selected')).not.toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expectNoWarnings()
    })

    it('selects nothing for a value that isn’t in items', () => {
      render(<List aria-label="Settings" items={settings} value="missing" />)

      expect(document.querySelector('.Mui-selected')).not.toBeInTheDocument()
      expectNoWarnings()
    })
  })

  describe('nested items', () => {
    const toggle = () => button('Billing')
    const nested = () => document.getElementById(toggle().getAttribute('aria-controls')!)!

    it('toggles on click, keeping aria-expanded and aria-controls in sync', async () => {
      const onExpandedChange = vi.fn()
      const onChange = vi.fn()
      render(
        <List
          aria-label="Settings"
          items={settings}
          onExpandedChange={onExpandedChange}
          onChange={onChange}
        />,
      )

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(nested().tagName).toBe('UL')
      expect(nested()).toHaveClass('CmList-nested')
      expect(toggle().closest('li')).toContainElement(nested())

      await userEvent.click(toggle())
      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
      expect(onExpandedChange).toHaveBeenLastCalledWith(expect.anything(), ['billing'])
      expect(within(nested()).getByRole('link', { name: 'Invoices' })).toBeVisible()

      await userEvent.click(toggle())
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(onExpandedChange).toHaveBeenLastCalledWith(expect.anything(), [])
      expect(onChange).not.toHaveBeenCalled()
      expect(toggle()).not.toHaveClass('Mui-selected')
    })

    it('toggles with Enter and Space and keeps focus on the parent', async () => {
      render(<List aria-label="Settings" items={settings} />)

      toggle().focus()
      await userEvent.keyboard('{Enter}')
      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
      expect(toggle()).toHaveFocus()

      await userEvent.keyboard(' ')
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(toggle()).toHaveFocus()
    })

    it('gives each nested list a valid unique id when item ids contain spaces', () => {
      render(
        <List
          aria-label="Files"
          items={[
            { id: 'my docs', primary: 'Docs', children: [{ id: 'a b', primary: 'A' }] },
            { id: 'my photos', primary: 'Photos', children: [{ id: 'c d', primary: 'C' }] },
          ]}
        />,
      )

      const ids = screen.getAllByRole('button').map((element) => element.getAttribute('aria-controls')!)
      expect(new Set(ids).size).toBe(2)
      for (const id of ids) expect(id).not.toMatch(/\s/)
    })

    it('expands the parents of the selected item when uncontrolled', () => {
      render(<List aria-label="Settings" items={settings} value="plans" />)

      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
      expect(link('Plans')).toHaveAttribute('aria-current', 'page')
    })

    it('expands every level of parents of the selected item', () => {
      render(
        <List
          aria-label="Files"
          defaultValue="leaf"
          items={[
            {
              id: 'outer',
              primary: 'Outer',
              children: [{ id: 'inner', primary: 'Inner', children: [{ id: 'leaf', primary: 'Leaf' }] }],
            },
          ]}
        />,
      )

      expect(button('Outer')).toHaveAttribute('aria-expanded', 'true')
      expect(button('Inner')).toHaveAttribute('aria-expanded', 'true')
      expect(button('Leaf')).toHaveClass('Mui-selected')
    })

    it('replaces that with defaultExpanded', () => {
      render(<List aria-label="Settings" items={settings} value="plans" defaultExpanded={[]} />)

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('works with a controlled expanded', async () => {
      const onExpandedChange = vi.fn()
      const { rerender } = render(
        <List
          aria-label="Settings"
          items={settings}
          expanded={[]}
          value="plans"
          onExpandedChange={onExpandedChange}
        />,
      )
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(toggle())
      expect(onExpandedChange).toHaveBeenCalledWith(expect.anything(), ['billing'])
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')

      rerender(<List aria-label="Settings" items={settings} expanded={['billing']} />)
      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
      expectNoWarnings()
    })

    it('keeps links inside a collapsed parent out of the tab order', async () => {
      render(
        <>
          <List aria-label="Settings" items={settings} />
          <button type="button">After</button>
        </>,
      )

      await userEvent.tab()
      expect(link('Profile')).toHaveFocus()
      await userEvent.tab()
      expect(toggle()).toHaveFocus()
      await userEvent.tab()
      expect(button('After')).toHaveFocus()

      await userEvent.click(toggle())
      await userEvent.tab()
      expect(link('Invoices')).toHaveFocus()
    })

    it('indents nested items by one spacing(2) per level', () => {
      renderThemed(<List aria-label="Settings" items={settings} defaultExpanded={['billing']} />)

      expect(link('Invoices')).toHaveStyle({ paddingLeft: '32px' })
      expect(link('Profile')).toHaveStyle({ paddingLeft: '16px' })
    })
  })

  describe('disabled items', () => {
    it('can’t be activated and aren’t in the tab order', async () => {
      const onClick = vi.fn()
      const onChange = vi.fn()
      render(
        <>
          <List
            aria-label="Actions"
            onChange={onChange}
            items={[
              { id: 'edit', primary: 'Edit', onClick, disabled: true },
              { id: 'view', primary: 'View', href: '/view', disabled: true },
              { id: 'copy', primary: 'Copy' },
            ]}
          />
        </>,
      )

      const edit = screen.getByRole('button', { name: 'Edit' })
      expect(edit).toHaveAttribute('aria-disabled', 'true')
      expect(edit).toHaveAttribute('tabindex', '-1')
      await userEvent.setup({ pointerEventsCheck: 0 }).click(edit)
      expect(onClick).not.toHaveBeenCalled()
      expect(onChange).not.toHaveBeenCalled()

      const view = link('View')
      expect(view).toHaveAttribute('aria-disabled', 'true')
      expect(view).toHaveAttribute('tabindex', '-1')

      await userEvent.tab()
      expect(button('Copy')).toHaveFocus()
    })
  })

  describe('keyboard', () => {
    it('moves with Tab through items and actions, and activates buttons with Enter and Space', async () => {
      const onChange = vi.fn()
      render(
        <List
          aria-label="Team"
          defaultValue={null}
          onChange={onChange}
          items={[
            { id: 'ana', primary: 'Ana', action: <button type="button">Remove Ana</button> },
            { id: 'luis', primary: 'Luis' },
          ]}
        />,
      )

      await userEvent.tab()
      expect(button('Ana')).toHaveFocus()
      await userEvent.keyboard('{Enter}')
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 'ana')

      await userEvent.tab()
      expect(button('Remove Ana')).toHaveFocus()
      await userEvent.tab()
      expect(button('Luis')).toHaveFocus()
      await userEvent.keyboard(' ')
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 'luis')
      expect(button('Luis')).toHaveAttribute('aria-current', 'true')
    })

    it('puts the action outside the item’s button', () => {
      render(
        <List
          aria-label="Team"
          onChange={() => {}}
          items={[{ id: 'ana', primary: 'Ana', action: <button type="button">Remove Ana</button> }]}
        />,
      )

      expect(button('Ana')).not.toContainElement(button('Remove Ana'))
      expect(button('Ana').closest('li')).toContainElement(button('Remove Ana'))
    })

    it('includes end in the button’s accessible name', () => {
      render(<List aria-label="Inbox" onChange={() => {}} items={[{ id: 'a', primary: 'Hi', end: '9:30' }]} />)

      expect(screen.getByRole('button', { name: 'Hi 9:30' })).toBeInTheDocument()
    })
  })

  it('passes dense, disablePadding and divider to MUI’s components', () => {
    render(
      <List
        aria-label="Team"
        dense
        disablePadding
        items={[{ ...people[0], divider: true }, people[1]]}
        onChange={() => {}}
      />,
    )

    expect(list()).toHaveClass('MuiList-dense')
    expect(list()).not.toHaveClass('MuiList-padding')
    expect(listItems()[0]).toHaveClass('MuiListItem-divider')
    expect(listItems()[1]).not.toHaveClass('MuiListItem-divider')
    expect(button(/Ana/)).toHaveClass('MuiListItemButton-dense')
  })

  it('passes ref, className, sx and other props to the root <ul>', () => {
    const ref = createRef<HTMLUListElement>()
    render(
      <List
        ref={ref}
        aria-label="Team"
        items={people}
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    expect(ref.current).toBe(root())
    expect(root().tagName).toBe('UL')
    expect(root()).toHaveClass('custom', 'CmList-root')
    expect(root()).toHaveStyle({ marginTop: '7px' })
  })

  it('passes every slotProps entry to its elements', () => {
    render(
      <List
        aria-label="Settings"
        subheader="Settings"
        defaultExpanded={['billing']}
        items={[
          { id: 'profile', primary: 'Profile', secondary: 'Name', icon: <svg />, href: '/p' },
          { id: 'ana', primary: 'Ana', avatar: <span>A</span> },
          settings[1],
        ]}
        slotProps={{
          item: { className: 'item' },
          itemButton: { className: 'item-button' },
          itemIcon: { className: 'item-icon' },
          itemAvatar: { className: 'item-avatar' },
          itemText: {
            className: 'item-text',
            slotProps: { primary: { className: 'primary' }, secondary: { className: 'secondary' } },
          },
          subheader: { className: 'subheader' },
          nested: { className: 'nested' },
        }}
      />,
    )

    // The first child is the subheader.
    expect(listItems()[1]).toHaveClass('item', 'CmList-item')
    expect(link(/Profile/)).toHaveClass('item-button', 'CmList-itemButton')
    expect(document.querySelector('.item-icon')).toHaveClass('MuiListItemIcon-root')
    expect(document.querySelector('.item-avatar')).toHaveClass('MuiListItemAvatar-root')
    expect(document.querySelector('.item-text')).toHaveClass('MuiListItemText-root')
    expect(document.querySelector('.primary')).toHaveTextContent('Profile')
    expect(document.querySelector('.secondary')).toHaveTextContent('Name')
    expect(document.querySelector('.subheader')).toHaveTextContent('Settings')
    expect(document.querySelector('.nested')).toHaveClass('CmList-nested')
  })

  it('adds the CmList-root, CmList-item, CmList-itemButton and CmList-nested classes', () => {
    render(<List aria-label="Settings" items={settings} data-testid="root" />)

    expect(root()).toHaveClass('CmList-root')
    expect(listItems()[0]).toHaveClass('CmList-item')
    expect(link('Profile')).toHaveClass('CmList-itemButton')
    expect(document.querySelectorAll('.CmList-nested')).toHaveLength(1)
  })

  it('renders an empty list, with the subheader if set', () => {
    render(<List subheader="Members" items={[]} />)

    expect(screen.getByRole('list', { name: 'Members' })).toBeInTheDocument()
    expect(listItems()).toHaveLength(1)
    expect(listItems()[0]).toHaveClass('MuiListSubheader-root')
    expectNoWarnings()
  })

  describe('under the library theme', () => {
    it('draws a primary.main bar on the start edge of the selected item', () => {
      renderThemed(<List aria-label="Team" items={people} defaultValue="ana" />)

      const css = insertedCss()
      const rule = css
        .split('\n')
        .find((text) => text.includes('Mui-selected::before') && text.includes('inset-inline-start'))
      expect(rule).toBeDefined()
      expect(rule).toMatch(/inset-inline-start:\s*0/)
      expect(rule).toMatch(/width:\s*3px/)
      expect(rule).toContain('--mui-palette-primary-main')
    })

    it('uses a logical property, so the bar is on the right in a right-to-left layout', () => {
      renderThemed(
        <div dir="rtl">
          <List aria-label="Team" items={people} defaultValue="ana" />
        </div>,
        { direction: 'rtl' },
      )

      const rule = insertedCss()
        .split('\n')
        .find((text) => text.includes('Mui-selected::before'))
      expect(rule).toMatch(/inset-inline-start:\s*0/)
      expect(rule).not.toMatch(/\bleft:/)
    })

    it('uses the theme’s text colors', () => {
      renderThemed(<List aria-label="Team" items={people} />)

      expect(screen.getByText('Designer')).toHaveStyle({ color: light.text.secondary })
    })

    it('shows the focus ring on keyboard focus', async () => {
      renderThemed(<List aria-label="Team" items={people} onChange={() => {}} />)

      await userEvent.tab()

      expect(button(/Ana/)).toHaveClass('Mui-focusVisible')
    })
  })

  describe('with overrides', () => {
    it('applies a project-level CmList.defaultProps', () => {
      renderThemed(<List aria-label="Team" items={people} />, {
        components: { CmList: { defaultProps: { dense: true } } },
      })

      expect(list()).toHaveClass('MuiList-dense')
    })

    it('applies a project-level styleOverrides.itemButton object', () => {
      renderThemed(<List aria-label="Team" items={people} onChange={() => {}} />, {
        components: { CmList: { styleOverrides: { itemButton: { letterSpacing: '3px' } } } },
      })

      expect(button(/Ana/)).toHaveStyle({ letterSpacing: '3px' })
    })

    it('applies project-level CmList styleOverrides to root, item and nested', () => {
      renderThemed(<List aria-label="Settings" items={settings} />, {
        components: {
          CmList: {
            styleOverrides: {
              root: { letterSpacing: '1px' },
              item: { letterSpacing: '2px' },
              nested: { letterSpacing: '4px' },
            },
          },
        },
      })

      expect(list()).toHaveStyle({ letterSpacing: '1px' })
      expect(listItems()[0]).toHaveStyle({ letterSpacing: '2px' })
      expect(document.querySelector('.CmList-nested')).toHaveStyle({ letterSpacing: '4px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<List aria-label="Team" items={people} sx={{ letterSpacing: '2px' }} />, {
        components: { CmList: { styleOverrides: { root: { letterSpacing: '1px' } } } },
      })

      expect(list()).toHaveStyle({ letterSpacing: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { text: { secondary: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <List aria-label="Team" items={people} />
        </ThemeProvider>,
      )

      expect(screen.getByText('Designer')).toHaveStyle({ color: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const numbered = [
      { id: 1, primary: 'One' },
      { id: 2, primary: 'Two', href: '/two' },
    ]
    const accepted = [
      <List items={people} value="ana" onChange={(_, id: string) => id} />,
      <List items={numbered} defaultValue={2} onChange={(_, id: number) => id} />,
      <List items={settings} expanded={['billing']} onExpandedChange={(_, ids: string[]) => ids} />,
      <List items={people} dense disablePadding subheader="Team" slotProps={{ itemButton: { dense: true } }} />,
    ]
    const rejected = [
      // @ts-expect-error: items is required
      <List aria-label="x" />,
      // @ts-expect-error: onChange receives a number
      <List items={numbered} onChange={(_, id: string) => id} />,
      // @ts-expect-error: an item can't have both href and children
      <List items={[{ id: 'a', primary: 'A', href: '/a', children: [] }]} />,
      // @ts-expect-error: selected is set from value
      <List items={people} slotProps={{ itemButton: { selected: true } }} />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmList: {
            defaultProps: { dense: true },
            styleOverrides: { nested: { paddingLeft: 0 } },
          },
        },
      }),
      // @ts-expect-error: not a CmList slot
      createCmTheme({ components: { CmList: { styleOverrides: { chevron: { padding: 0 } } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(10)
  })
})
