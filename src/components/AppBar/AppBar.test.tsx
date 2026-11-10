import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { AppBar } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette
const dark = libraryTheme.colorSchemes.dark!.palette

const banner = () => screen.getByRole('banner')
const toolbar = () => banner().querySelector('.MuiToolbar-root')!

describe('AppBar', () => {
  let warn: MockInstance
  let error: MockInstance

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn')
    error = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a banner landmark with its children inside a Toolbar', () => {
    render(
      <AppBar>
        <p>Dashboard</p>
      </AppBar>,
    )

    expect(banner().tagName).toBe('HEADER')
    expect(toolbar()).toContainElement(screen.getByText('Dashboard'))
    expect(toolbar().parentElement).toBe(banner())
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  describe('under the library theme', () => {
    it('is sticky, without a shadow, on background.paper with text.primary and a divider line', () => {
      renderThemed(<AppBar>Dashboard</AppBar>)

      expect(banner()).toHaveClass('MuiAppBar-positionSticky', 'MuiAppBar-colorDefault', 'MuiPaper-elevation0')
      expect(banner()).toHaveStyle({
        position: 'sticky',
        backgroundColor: light.background.paper,
        color: light.text.primary,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: light.divider,
      })
    })

    it('uses each scheme’s paper color, so dark mode is on dark paper too', () => {
      expect(light.AppBar.defaultBg).toBe(light.background.paper)
      expect(dark.AppBar.defaultBg).toBe(dark.background.paper)
    })

    it('uses the dark scheme’s colors in dark mode', () => {
      renderThemed(
        <div className="dark">
          <AppBar>Dashboard</AppBar>
        </div>,
        { cssVariables: { colorSchemeSelector: 'class' } },
      )

      expect(banner()).toHaveStyle({
        backgroundColor: dark.background.paper,
        color: dark.text.primary,
        borderBottomColor: dark.divider,
      })
    })

    it('has no bottom line on other colors', () => {
      renderThemed(<AppBar color="primary">Dashboard</AppBar>)

      expect(banner()).not.toHaveStyle({ borderBottomWidth: '1px' })
      expect(banner()).toHaveStyle({ backgroundColor: light.primary.main })
    })
  })

  it('passes position, color, elevation and component to MUI’s AppBar, over the theme', () => {
    renderThemed(
      <AppBar position="static" color="secondary" elevation={4} component="div" data-testid="bar">
        Edit
      </AppBar>,
    )

    const bar = screen.getByTestId('bar')
    expect(bar.tagName).toBe('DIV')
    expect(bar).toHaveClass('MuiAppBar-positionStatic', 'MuiAppBar-colorSecondary', 'MuiPaper-elevation4')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('passes slotProps.toolbar to the Toolbar, and dense makes it 48px high', () => {
    renderThemed(<AppBar slotProps={{ toolbar: { variant: 'dense', className: 'row' } }}>Edit</AppBar>)

    expect(toolbar()).toHaveClass('row', 'MuiToolbar-dense')
    expect(toolbar()).toHaveStyle({ minHeight: '48px' })
  })

  it('passes ref, className, sx and other props to the root', () => {
    const ref = createRef<HTMLElement>()
    render(
      <AppBar ref={ref} className="custom" data-testid="bar" sx={{ marginTop: '7px' }}>
        Dashboard
      </AppBar>,
    )

    expect(ref.current).toBe(banner())
    expect(banner()).toHaveClass('custom')
    expect(banner()).toHaveAttribute('data-testid', 'bar')
    expect(banner()).toHaveStyle({ marginTop: '7px' })
  })

  it('reaches its children with Tab, in order', async () => {
    render(
      <AppBar>
        <button type="button">Menu</button>
        <button type="button">Notifications</button>
      </AppBar>,
    )

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Notifications' })).toHaveFocus()
  })

  describe('with overrides', () => {
    it('applies a project-level MuiAppBar.defaultProps.color', () => {
      renderThemed(<AppBar>Dashboard</AppBar>, {
        components: { MuiAppBar: { defaultProps: { color: 'primary' } } },
      })

      expect(banner()).toHaveClass('MuiAppBar-colorPrimary')
    })

    it('merges a project MuiAppBar styleOverrides.root object and keeps the bottom line', () => {
      renderThemed(<AppBar>Dashboard</AppBar>, {
        components: { MuiAppBar: { styleOverrides: { root: { letterSpacing: '3px' } } } },
      })

      expect(banner()).toHaveStyle({ letterSpacing: '3px', borderBottomWidth: '1px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<AppBar sx={{ borderBottomWidth: '0px' }}>Dashboard</AppBar>)

      expect(banner()).toHaveStyle({ borderBottomWidth: '0px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme’s defaults', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <AppBar>Dashboard</AppBar>
        </ThemeProvider>,
      )

      expect(banner()).toHaveClass('MuiAppBar-positionFixed', 'MuiAppBar-colorPrimary')
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <AppBar position="static" color="transparent" enableColorOnDark slotProps={{ toolbar: { disableGutters: true } }} />,
      <AppBar component="div">Title</AppBar>,
    ]
    const rejected = [
      // @ts-expect-error: not a position
      <AppBar position="top" />,
      // @ts-expect-error: not a toolbar variant
      <AppBar slotProps={{ toolbar: { variant: 'tall' } }} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(4)
  })
})
