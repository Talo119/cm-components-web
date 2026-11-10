import { ThemeProvider, createTheme, lighten } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { LinearProgress } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const progressbar = (name?: string) => screen.getByRole('progressbar', name ? { name } : undefined)
const part = (name: 'bar1' | 'bar2' | 'dashed') =>
  progressbar().querySelector<HTMLElement>(`.MuiLinearProgress-${name}`)!

describe('LinearProgress', () => {
  let error: MockInstance
  let warn: MockInstance

  beforeEach(() => {
    error = vi.spyOn(console, 'error')
    warn = vi.spyOn(console, 'warn')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a progressbar named by aria-label, with no value when indeterminate', () => {
    render(<LinearProgress aria-label="Loading orders" />)

    const bar = progressbar('Loading orders')
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('is named from visible text with aria-labelledby', () => {
    render(
      <>
        <span id="upload-label">Uploading report.pdf</span>
        <LinearProgress aria-labelledby="upload-label" variant="determinate" value={10} />
      </>,
    )

    expect(progressbar('Uploading report.pdf')).toBeInTheDocument()
  })

  it('sets the value and range when determinate', () => {
    render(
      <LinearProgress aria-label="Upload" variant="determinate" value={30} min={10} max={60} />,
    )

    expect(progressbar()).toHaveAttribute('aria-valuenow', '30')
    expect(progressbar()).toHaveAttribute('aria-valuemin', '10')
    expect(progressbar()).toHaveAttribute('aria-valuemax', '60')
    expect(error).not.toHaveBeenCalled()
  })

  it('passes aria-valuetext to the root', () => {
    render(
      <LinearProgress
        aria-label="Setup"
        variant="determinate"
        value={3}
        max={5}
        aria-valuetext="Step 3 of 5"
      />,
    )

    expect(progressbar()).toHaveAttribute('aria-valuetext', 'Step 3 of 5')
  })

  it.each([
    [0, 0, 100, 'translateX(-100%)'],
    [25, 0, 100, 'translateX(-75%)'],
    [3, 0, 5, 'translateX(-40%)'],
    [100, 0, 100, 'translateX(0%)'],
  ])('draws value %d between %d and %d as %s', (value, min, max, transform) => {
    render(
      <LinearProgress aria-label="Upload" variant="determinate" value={value} min={min} max={max} />,
    )

    expect(part('bar1').style.transform).toBe(transform)
  })

  it('passes ref, className, sx and other props to the root element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <LinearProgress
        ref={ref}
        aria-label="Loading"
        id="orders-progress"
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    expect(ref.current).toBe(progressbar())
    expect(progressbar()).toHaveAttribute('id', 'orders-progress')
    expect(progressbar()).toHaveAttribute('data-testid', 'root')
    expect(progressbar()).toHaveClass('custom')
    expect(progressbar()).toHaveStyle({ marginTop: '7px' })
  })

  describe('under the library theme', () => {
    it.each(['indeterminate', 'determinate', 'query'] as const)(
      'draws the %s track in divider',
      (variant) => {
        renderThemed(
          <LinearProgress
            aria-label="Loading"
            variant={variant}
            value={variant === 'determinate' ? 40 : undefined}
          />,
        )

        expect(progressbar()).toHaveStyle({ backgroundColor: light.divider })
        expect(part('bar1')).toHaveStyle({ backgroundColor: light.primary.main })
      },
    )

    it('draws the divider track for every color', () => {
      renderThemed(<LinearProgress aria-label="Loading" color="success" />)

      expect(progressbar()).toHaveStyle({ backgroundColor: light.divider })
    })

    it('keeps MUI’s colors for the buffer variant', () => {
      renderThemed(
        <LinearProgress aria-label="Loading" variant="buffer" value={30} valueBuffer={60} />,
      )

      expect(progressbar()).not.toHaveStyle({ backgroundColor: light.divider })
      expect(part('dashed')).toBeInTheDocument()
      expect(part('bar2').style.transform).toBe('translateX(-40%)')
    })
  })

  describe('with overrides', () => {
    it('applies a project-level styleOverrides.bar1 object and keeps the library’s track', () => {
      renderThemed(<LinearProgress aria-label="Loading" />, {
        components: { MuiLinearProgress: { styleOverrides: { bar1: { borderRadius: '3px' } } } },
      })

      expect(part('bar1')).toHaveStyle({ borderRadius: '3px' })
      expect(progressbar()).toHaveStyle({ backgroundColor: light.divider })
    })

    it('replaces the library’s track with a project-level root', () => {
      renderThemed(<LinearProgress aria-label="Loading" />, {
        components: { MuiLinearProgress: { styleOverrides: { root: { height: '8px' } } } },
      })

      expect(progressbar()).toHaveStyle({ height: '8px' })
      expect(progressbar()).not.toHaveStyle({ backgroundColor: light.divider })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <LinearProgress aria-label="Loading" sx={{ backgroundColor: 'rgb(170, 0, 0)' }} />,
      )

      expect(progressbar()).toHaveStyle({ backgroundColor: 'rgb(170, 0, 0)' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and its tinted track', () => {
      const theme = createTheme({ palette: { primary: { main: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <LinearProgress aria-label="Loading" />
        </ThemeProvider>,
      )

      expect(part('bar1')).toHaveStyle({ backgroundColor: '#00aa00' })
      expect(progressbar()).toHaveStyle({ backgroundColor: lighten('#00aa00', 0.62) })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <LinearProgress variant="buffer" value={10} valueBuffer={20} color="success" />,
      <LinearProgress variant="determinate" value={3} min={0} max={5} aria-valuetext="3 of 5" />,
    ]
    const rejected = [
      // @ts-expect-error: not a LinearProgress variant
      <LinearProgress variant="circular" />,
      // @ts-expect-error: size is CircularProgress's
      <LinearProgress size={20} />,
      // @ts-expect-error: MUI's LinearProgress has no slotProps
      <LinearProgress slotProps={{ bar1: {} }} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(5)
  })
})
