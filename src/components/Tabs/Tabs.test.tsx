import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Tabs } from './index.ts'
import type { TabItem } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette
const dark = libraryTheme.colorSchemes.dark!.palette

const tablist = () => screen.getByRole('tablist')
const tab = (name: string) => screen.getByRole('tab', { name })
const panels = () => screen.queryAllByRole('tabpanel')
// Hidden panels are left out of the accessibility tree, so they're found by class.
const allPanels = () => [...document.querySelectorAll<HTMLElement>('.CmTabs-panel')]
const root = () => screen.getByTestId('root')

const items: TabItem[] = [
  { id: 'details', label: 'Details', content: <p>Details panel</p> },
  { id: 'activity', label: 'Activity', content: <p>Activity panel</p> },
  { id: 'settings', label: 'Settings', content: <p>Settings panel</p> },
]

const withDisabled: TabItem[] = [
  { id: 'details', label: 'Details', content: <p>Details panel</p> },
  { id: 'activity', label: 'Activity', content: <p>Activity panel</p>, disabled: true },
  { id: 'settings', label: 'Settings', content: <p>Settings panel</p> },
]

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

const linkItems: TabItem[] = [
  { id: '/settings/profile', label: 'Profile', href: '/settings/profile' },
  { id: '/settings/billing', label: 'Billing', href: '/settings/billing' },
]

describe('Tabs', () => {
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

  it('renders a tablist named by aria-label, with a tab per item in order', () => {
    render(<Tabs aria-label="Project" items={items} data-testid="root" />)

    expect(screen.getByRole('tablist', { name: 'Project' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((element) => element.textContent)).toEqual([
      'Details',
      'Activity',
      'Settings',
    ])
    expect(root()).not.toHaveAttribute('aria-label')
    expectNoWarnings()
  })

  it('names the tablist with aria-labelledby', () => {
    render(
      <>
        <h2 id="heading">Project</h2>
        <Tabs aria-labelledby="heading" items={items} data-testid="root" />
      </>,
    )

    expect(screen.getByRole('tablist', { name: 'Project' })).toBeInTheDocument()
    expect(root()).not.toHaveAttribute('aria-labelledby')
  })

  it('selects the first enabled item when uncontrolled, and shows its content in a tabpanel', () => {
    render(
      <Tabs
        aria-label="Project"
        items={[{ ...withDisabled[1] }, withDisabled[0], withDisabled[2]] as TabItem[]}
      />,
    )

    expect(tab('Details')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'false')
    expect(panels()).toHaveLength(1)
    expect(panels()[0]).toHaveTextContent('Details panel')
  })

  it('selects a tab on click, shows its panel and calls onChange with the id', async () => {
    const onChange = vi.fn()
    render(<Tabs aria-label="Project" items={items} onChange={onChange} />)

    await userEvent.click(tab('Activity'))

    expect(onChange).toHaveBeenCalledOnce()
    const [event, value] = onChange.mock.calls[0]
    expect(event).toHaveProperty('type', 'click')
    expect(value).toBe('activity')
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true')
    expect(panels()[0]).toHaveTextContent('Activity panel')
    expectNoWarnings()
  })

  describe('state', () => {
    it('works controlled', async () => {
      function Controlled() {
        const [tabValue, setTabValue] = useState<string | null>('settings')
        return (
          <>
            <Tabs
              aria-label="Project"
              items={items}
              value={tabValue}
              onChange={(_, id) => setTabValue(id)}
            />
            <button type="button" onClick={() => setTabValue('details')}>
              Reset
            </button>
          </>
        )
      }
      render(<Controlled />)
      expect(panels()[0]).toHaveTextContent('Settings panel')

      await userEvent.click(tab('Activity'))
      expect(panels()[0]).toHaveTextContent('Activity panel')

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      expect(tab('Details')).toHaveAttribute('aria-selected', 'true')
      expectNoWarnings()
    })

    it('keeps a controlled value that the consumer doesn’t change', async () => {
      const onChange = vi.fn()
      render(<Tabs aria-label="Project" items={items} value="details" onChange={onChange} />)

      await userEvent.click(tab('Settings'))

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'settings')
      expect(tab('Details')).toHaveAttribute('aria-selected', 'true')
    })

    it('works uncontrolled with defaultValue', async () => {
      render(<Tabs aria-label="Project" items={items} defaultValue="settings" />)
      expect(panels()[0]).toHaveTextContent('Settings panel')

      await userEvent.click(tab('Details'))

      expect(panels()[0]).toHaveTextContent('Details panel')
      expectNoWarnings()
    })

    it.each([
      ['value', { value: null }],
      ['defaultValue', { defaultValue: null }],
    ])('selects no tab and shows no panel with a null %s', (_, props) => {
      render(<Tabs aria-label="Project" items={items} {...props} />)

      for (const element of screen.getAllByRole('tab')) {
        expect(element).toHaveAttribute('aria-selected', 'false')
      }
      expect(panels()).toHaveLength(0)
      expectNoWarnings()
    })

    it('falls back to the first enabled item when the selected one is removed, uncontrolled', () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <Tabs aria-label="Project" items={withDisabled} defaultValue="settings" onChange={onChange} />,
      )

      rerender(
        <Tabs aria-label="Project" items={withDisabled.slice(0, 2)} onChange={onChange} />,
      )

      expect(tab('Details')).toHaveAttribute('aria-selected', 'true')
      expect(panels()[0]).toHaveTextContent('Details panel')
      expect(onChange).not.toHaveBeenCalled()
      expectNoWarnings()
    })

    it('falls back to the first enabled item when the selected one becomes disabled', () => {
      const { rerender } = render(
        <Tabs aria-label="Project" items={items} defaultValue="activity" />,
      )

      rerender(<Tabs aria-label="Project" items={withDisabled} />)

      expect(tab('Details')).toHaveAttribute('aria-selected', 'true')
    })

    it('renders an empty tab row and no panel with no items', () => {
      render(<Tabs aria-label="Project" items={[]} />)

      expect(tablist()).toBeEmptyDOMElement()
      expect(panels()).toHaveLength(0)
      expectNoWarnings()
    })

    it('shows no panel for an item without content or href', async () => {
      const onChange = vi.fn()
      render(
        <Tabs
          aria-label="View"
          items={[
            { id: 'list', label: 'List' },
            { id: 'grid', label: 'Grid' },
          ]}
          onChange={onChange}
        />,
      )

      await userEvent.click(tab('Grid'))

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'grid')
      expect(panels()).toHaveLength(0)
      expect(tab('Grid')).not.toHaveAttribute('aria-controls')
    })
  })

  describe('panels', () => {
    it('links each tab and panel, with valid ids when item ids contain spaces', () => {
      render(
        <Tabs
          aria-label="Project"
          keepMounted
          items={[
            { id: 'project details', label: 'Details', content: 'Details panel' },
            { id: 'recent activity', label: 'Activity', content: 'Activity panel' },
          ]}
        />,
      )

      const tabs = screen.getAllByRole('tab')
      allPanels().forEach((panel, index) => {
        expect(tabs[index].id).not.toMatch(/\s/)
        expect(panel.id).not.toMatch(/\s/)
        expect(tabs[index]).toHaveAttribute('aria-controls', panel.id)
        expect(panel).toHaveAttribute('aria-labelledby', tabs[index].id)
        expect(panel).toHaveAttribute('tabindex', '0')
        expect(document.getElementById(tabs[index].getAttribute('aria-controls')!)).toBe(panel)
      })
      expect(screen.getByRole('tabpanel', { name: 'Details' })).toHaveTextContent('Details panel')
    })

    it('renders only the selected panel without keepMounted, and points only its tab at it', () => {
      render(<Tabs aria-label="Project" items={items} />)

      expect(allPanels()).toHaveLength(1)
      expect(tab('Details')).toHaveAttribute('aria-controls', allPanels()[0].id)
      expect(tab('Activity')).not.toHaveAttribute('aria-controls')
    })

    it('keeps every panel in the DOM with keepMounted, hiding the others and keeping their state', async () => {
      render(
        <Tabs
          aria-label="Profile"
          keepMounted
          items={[
            { id: 'name', label: 'Name', content: <input aria-label="Name" /> },
            { id: 'bio', label: 'Bio', content: <p>Bio panel</p> },
          ]}
        />,
      )
      expect(allPanels()).toHaveLength(2)
      expect(allPanels()[1]).toHaveAttribute('hidden')

      await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Ana')
      await userEvent.click(tab('Bio'))
      expect(allPanels()[0]).toHaveAttribute('hidden')
      expect(allPanels()[0]).not.toBeVisible()
      await userEvent.click(tab('Name'))

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ana')
    })

    it('loses a panel’s state without keepMounted', async () => {
      render(
        <Tabs
          aria-label="Profile"
          items={[
            { id: 'name', label: 'Name', content: <input aria-label="Name" /> },
            { id: 'bio', label: 'Bio', content: <p>Bio panel</p> },
          ]}
        />,
      )

      await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Ana')
      await userEvent.click(tab('Bio'))
      await userEvent.click(tab('Name'))

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('')
    })

    it('keeps a hidden panel hidden when a project sets its display', () => {
      renderThemed(<Tabs aria-label="Project" items={items} keepMounted />, {
        components: { CmTabs: { styleOverrides: { panel: { display: 'block' } } } },
      })

      expect(allPanels()[1]).not.toBeVisible()
      expect(allPanels()[0]).toBeVisible()
    })
  })

  describe('disabled tabs', () => {
    it('can’t be selected and are skipped by the arrow keys', async () => {
      const onChange = vi.fn()
      render(<Tabs aria-label="Project" items={withDisabled} onChange={onChange} />)

      expect(tab('Activity')).toBeDisabled()
      await userEvent.tab()
      expect(tab('Details')).toHaveFocus()
      await userEvent.keyboard('{ArrowRight}')
      expect(tab('Settings')).toHaveFocus()
      await userEvent.keyboard('{ArrowLeft}')
      expect(tab('Details')).toHaveFocus()

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('link tabs', () => {
    it('renders links through the theme’s LinkComponent, with no panel', () => {
      renderThemed(<Tabs aria-label="Settings" items={linkItems} value="/settings/billing" />, {
        components: { MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } } },
      })

      const billing = tab('Billing')
      expect(billing.tagName).toBe('A')
      expect(billing).toHaveAttribute('href', '/settings/billing')
      expect(billing).toHaveAttribute('data-router-link')
      expect(billing).toHaveAttribute('aria-current', 'page')
      expect(billing).not.toHaveAttribute('aria-controls')
      expect(tab('Profile')).not.toHaveAttribute('aria-current')
      expect(panels()).toHaveLength(0)
      expectNoWarnings()
    })

    it('renders plain anchors without a theme LinkComponent', () => {
      render(<Tabs aria-label="Settings" items={linkItems} value="/settings/profile" />)

      expect(tab('Profile').tagName).toBe('A')
      expect(tab('Profile')).toHaveAttribute('href', '/settings/profile')
    })
  })

  describe('MUI props', () => {
    it('sets aria-orientation with orientation="vertical", and moves focus with ArrowDown and ArrowUp', async () => {
      render(<Tabs aria-label="Project" items={items} orientation="vertical" data-testid="root" />)

      expect(tablist()).toHaveAttribute('aria-orientation', 'vertical')
      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}')
      expect(tab('Activity')).toHaveFocus()
      await userEvent.keyboard('{ArrowUp}{ArrowUp}')
      expect(tab('Settings')).toHaveFocus()
    })

    it('passes variant, centered and scrollButtons to MUI’s Tabs', () => {
      const { rerender } = render(<Tabs aria-label="Project" items={items} centered />)
      expect(tablist()).toHaveClass('MuiTabs-centered')

      rerender(<Tabs aria-label="Project" items={items} variant="fullWidth" />)
      expect(tab('Details')).toHaveClass('MuiTab-fullWidth')

      rerender(<Tabs aria-label="Project" items={items} variant="scrollable" scrollButtons />)
      expect(document.querySelector('.MuiTabs-scrollableX')).toBeInTheDocument()
      expect(document.querySelectorAll('.MuiTabScrollButton-root')).toHaveLength(2)
    })

    it('selects on focus with selectionFollowsFocus', async () => {
      const onChange = vi.fn()
      render(<Tabs aria-label="Project" items={items} selectionFollowsFocus onChange={onChange} />)

      await userEvent.tab()
      await userEvent.keyboard('{ArrowRight}')

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'activity')
      expect(panels()[0]).toHaveTextContent('Activity panel')
    })

    it('moves focus but not the selection with the arrow keys by default', async () => {
      render(<Tabs aria-label="Project" items={items} />)

      await userEvent.tab()
      await userEvent.keyboard('{ArrowRight}')
      expect(tab('Activity')).toHaveFocus()
      expect(tab('Details')).toHaveAttribute('aria-selected', 'true')

      await userEvent.keyboard('{Enter}')
      expect(tab('Activity')).toHaveAttribute('aria-selected', 'true')
      await userEvent.keyboard('{End}')
      expect(tab('Settings')).toHaveFocus()
      await userEvent.keyboard(' ')
      expect(tab('Settings')).toHaveAttribute('aria-selected', 'true')
      await userEvent.keyboard('{Home}')
      expect(tab('Details')).toHaveFocus()
    })

    it('wraps at the ends and puts only the selected tab in the tab order', async () => {
      render(<Tabs aria-label="Project" items={items} defaultValue="settings" />)

      expect(tab('Settings')).toHaveAttribute('tabindex', '0')
      expect(tab('Details')).toHaveAttribute('tabindex', '-1')
      await userEvent.tab()
      expect(tab('Settings')).toHaveFocus()
      await userEvent.keyboard('{ArrowRight}')
      expect(tab('Details')).toHaveFocus()
    })

    it('moves from the selected tab to the panel with Tab', async () => {
      render(<Tabs aria-label="Project" items={items} />)

      await userEvent.tab()
      await userEvent.tab()

      expect(panels()[0]).toHaveFocus()
    })
  })

  it('passes ref, className, sx and other props to the root <div>', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tabs
        ref={ref}
        aria-label="Project"
        items={items}
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    expect(ref.current).toBe(root())
    expect(root().tagName).toBe('DIV')
    expect(root()).toHaveClass('custom', 'CmTabs-root')
    expect(root()).toHaveStyle({ marginTop: '7px' })
  })

  it('passes slotProps.tabs, slotProps.tab and slotProps.panel to their elements', () => {
    render(
      <Tabs
        aria-label="Project"
        items={items}
        slotProps={{
          tabs: { className: 'row', textColor: 'secondary', slotProps: { list: { className: 'list' } } },
          tab: { className: 'tab', iconPosition: 'start' },
          panel: { className: 'panel', 'aria-live': 'polite' },
        }}
      />,
    )

    expect(tablist().closest('.MuiTabs-root')).toHaveClass('row', 'CmTabs-tabs')
    expect(tablist()).toHaveClass('list')
    for (const element of screen.getAllByRole('tab')) {
      expect(element).toHaveClass('tab', 'MuiTab-textColorSecondary')
    }
    expect(panels()[0]).toHaveClass('panel', 'CmTabs-panel')
    expect(panels()[0]).toHaveAttribute('aria-live', 'polite')
  })

  it('adds the CmTabs-root, CmTabs-tabs and CmTabs-panel classes', () => {
    render(<Tabs aria-label="Project" items={items} data-testid="root" />)

    expect(root()).toHaveClass('CmTabs-root')
    expect(root().querySelector('.CmTabs-tabs')).toBe(tablist().closest('.MuiTabs-root'))
    expect(panels()[0]).toHaveClass('CmTabs-panel')
  })

  it('renders icons with the label', () => {
    render(
      <Tabs
        aria-label="Project"
        items={[{ id: 'a', label: 'Details', icon: <svg data-testid="icon" />, content: 'A' }]}
      />,
    )

    expect(tab('Details')).toContainElement(screen.getByTestId('icon'))
    expect(tab('Details')).toHaveClass('MuiTab-labelIcon')
  })

  describe('under the library theme', () => {
    it('colors a selected tab’s label primary.dark in light mode and primary.main in dark mode', () => {
      // A class selector puts both schemes on one page, which jsdom can't do
      // with the default `prefers-color-scheme` media query.
      renderThemed(
        <>
          <Tabs aria-label="Light" items={items} />
          <div className="dark">
            <Tabs aria-label="Dark" items={items} />
          </div>
        </>,
        { cssVariables: { colorSchemeSelector: 'class' } },
      )

      const [lightSelected, lightOther] = screen.getAllByRole('tab').slice(0, 2)
      const darkSelected = screen.getAllByRole('tab')[3]
      expect(lightSelected).toHaveStyle({ color: light.primary.dark })
      expect(lightOther).toHaveStyle({ color: light.text.secondary })
      expect(darkSelected).toHaveStyle({ color: dark.primary.main })
    })

    it('keeps MUI’s secondary.main for textColor="secondary"', () => {
      renderThemed(
        <Tabs aria-label="Project" items={items} slotProps={{ tabs: { textColor: 'secondary' } }} />,
      )

      expect(tab('Details')).toHaveStyle({ color: light.secondary.main })
    })

    it('draws a divider line under the row, and on its end side when vertical', () => {
      const { rerender } = renderThemed(<Tabs aria-label="Project" items={items} />)
      const row = () => document.querySelector('.CmTabs-tabs')!
      expect(row()).toHaveStyle({ borderBottomWidth: '1px', borderBottomColor: light.divider })

      rerender(
        <CmThemeProvider theme={libraryTheme}>
          <Tabs aria-label="Project" items={items} orientation="vertical" data-testid="root" />
        </CmThemeProvider>,
      )
      expect(row()).toHaveStyle({ borderRightWidth: '1px', borderRightColor: light.divider })
      expect(row()).not.toHaveStyle({ borderBottomWidth: '1px' })
      expect(root()).toHaveStyle({ display: 'flex' })
      expect(panels()[0]).toHaveStyle({ paddingLeft: '16px', paddingRight: '16px' })
    })

    it('pads the panel above and below', () => {
      renderThemed(<Tabs aria-label="Project" items={items} />)

      expect(panels()[0]).toHaveStyle({ paddingTop: '16px', paddingBottom: '16px' })
    })

    it('shows the focus ring on keyboard focus', async () => {
      renderThemed(<Tabs aria-label="Project" items={items} />)

      await userEvent.tab()

      expect(tab('Details')).toHaveFocus()
      expect(tab('Details')).toHaveClass('Mui-focusVisible')
      expect(tab('Details')).toHaveStyle({ outlineStyle: 'solid', outlineWidth: '2px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level CmTabs.defaultProps', () => {
      renderThemed(<Tabs aria-label="Project" items={items} />, {
        components: { CmTabs: { defaultProps: { variant: 'scrollable', keepMounted: true } } },
      })

      expect(document.querySelector('.MuiTabs-scrollableX')).toBeInTheDocument()
      expect(allPanels()).toHaveLength(3)
    })

    it('lets an instance prop override CmTabs.defaultProps', () => {
      renderThemed(<Tabs aria-label="Project" items={items} variant="standard" />, {
        components: { CmTabs: { defaultProps: { variant: 'scrollable' } } },
      })

      expect(document.querySelector('.MuiTabs-scrollableX')).not.toBeInTheDocument()
    })

    it('applies project-level CmTabs styleOverrides to each slot', () => {
      renderThemed(<Tabs aria-label="Project" items={items} data-testid="root" />, {
        components: {
          CmTabs: {
            styleOverrides: {
              root: { letterSpacing: '1px' },
              tabs: { minHeight: '40px' },
              panel: { padding: '3px' },
            },
          },
        },
      })

      expect(root()).toHaveStyle({ letterSpacing: '1px' })
      expect(document.querySelector('.CmTabs-tabs')).toHaveStyle({ minHeight: '40px' })
      expect(panels()[0]).toHaveStyle({ padding: '3px' })
    })

    it('applies project-level CmTabs variants to the root', () => {
      renderThemed(<Tabs aria-label="Project" items={items} data-testid="root" orientation="vertical" />, {
        components: {
          CmTabs: {
            variants: [{ props: { orientation: 'vertical' }, style: { gap: '5px' } }],
          },
        },
      })

      expect(root()).toHaveStyle({ gap: '5px' })
    })

    it('merges a project MuiTab styleOverrides.root object and keeps the library’s selected color', () => {
      renderThemed(<Tabs aria-label="Project" items={items} />, {
        components: { MuiTab: { styleOverrides: { root: { letterSpacing: '3px' } } } },
      })

      expect(tab('Details')).toHaveStyle({ letterSpacing: '3px', color: light.primary.dark })
      expect(tab('Activity')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Tabs aria-label="Project" items={items} data-testid="root" sx={{ letterSpacing: '2px' }} />,
        { components: { CmTabs: { styleOverrides: { root: { letterSpacing: '1px' } } } } },
      )

      expect(root()).toHaveStyle({ letterSpacing: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and its selected color', () => {
      const theme = createTheme({ palette: { primary: { main: '#00aa00', dark: '#005500' } } })

      render(
        <ThemeProvider theme={theme}>
          <Tabs aria-label="Project" items={items} />
        </ThemeProvider>,
      )

      expect(tab('Details')).toHaveStyle({ color: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const numbered = [
      { id: 1, label: 'One', content: 'A' },
      { id: 2, label: 'Two', href: '/two' },
    ]
    const pathname: string = '/a'
    const accepted = [
      <Tabs items={items} value="details" onChange={(_, id: string) => id} keepMounted />,
      // Inline ids are literals, and a `string` value still fits.
      <Tabs
        items={[
          { id: '/a', label: 'A', href: '/a' },
          { id: '/b', label: 'B', href: '/b' },
        ]}
        value={pathname}
      />,
      <Tabs items={numbered} defaultValue={2} onChange={(_, id: number) => id} />,
      <Tabs
        items={items}
        value={null}
        variant="scrollable"
        orientation="vertical"
        scrollButtons
        slotProps={{ tabs: { indicatorColor: 'secondary' }, tab: { iconPosition: 'start' } }}
      />,
    ]
    const rejected = [
      // @ts-expect-error: items is required
      <Tabs aria-label="x" />,
      // @ts-expect-error: a number value for string ids
      <Tabs items={items} value={1} />,
      // @ts-expect-error: onChange receives a number
      <Tabs items={numbered} onChange={(_, id: string) => id} />,
      // @ts-expect-error: an item can't have both content and href
      <Tabs items={[{ id: 'a', label: 'A', content: 'A', href: '/a' }]} />,
      // @ts-expect-error: the tab's value is set from the item
      <Tabs items={items} slotProps={{ tab: { value: 'x' } }} />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmTabs: {
            defaultProps: { keepMounted: true, variant: 'scrollable' },
            styleOverrides: { panel: { padding: 0 }, tabs: ({ theme }) => ({ gap: theme.spacing(1) }) },
          },
        },
      }),
      // @ts-expect-error: not a CmTabs slot
      createCmTheme({ components: { CmTabs: { styleOverrides: { indicator: { padding: 0 } } } } }),
      // @ts-expect-error: not a CmTabs prop
      createCmTheme({ components: { CmTabs: { defaultProps: { unknownProp: true } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(12)
  })
})
