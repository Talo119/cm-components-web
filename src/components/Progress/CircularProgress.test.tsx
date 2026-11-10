import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { CircularProgress } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const progressbar = (name?: string) => screen.getByRole('progressbar', name ? { name } : undefined)
const part = (name: 'svg' | 'track' | 'circle') =>
  progressbar().querySelector<SVGElement>(`.MuiCircularProgress-${name}`)!

// MUI's SVG is 44 units wide, with a radius of (44 - thickness) / 2.
const circumference = (thickness = 3.6) => 2 * Math.PI * ((44 - thickness) / 2)

describe('CircularProgress', () => {
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
    render(<CircularProgress aria-label="Loading comments" />)

    expect(progressbar('Loading comments')).not.toHaveAttribute('aria-valuenow')
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('is named from visible text with aria-labelledby', () => {
    render(
      <>
        <span id="comments-label">Loading comments</span>
        <CircularProgress aria-labelledby="comments-label" />
      </>,
    )

    expect(progressbar('Loading comments')).toBeInTheDocument()
  })

  it('sets the value and range when determinate', () => {
    render(
      <CircularProgress aria-label="Setup" variant="determinate" value={2} min={0} max={5} />,
    )

    expect(progressbar()).toHaveAttribute('aria-valuenow', '2')
    expect(progressbar()).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar()).toHaveAttribute('aria-valuemax', '5')
    expect(error).not.toHaveBeenCalled()
  })

  it('passes aria-valuetext to the root', () => {
    render(
      <CircularProgress
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
    [0, 0, 100, 1],
    [25, 0, 100, 0.75],
    [2, 0, 5, 0.6],
    [100, 0, 100, 0],
  ])('draws value %d between %d and %d with %d of the arc hidden', (value, min, max, hidden) => {
    render(
      <CircularProgress
        aria-label="Setup"
        variant="determinate"
        value={value}
        min={min}
        max={max}
      />,
    )

    const circle = part('circle')
    // jsdom drops trailing zeros, so the lengths are compared as numbers.
    expect(parseFloat(circle.style.strokeDasharray)).toBeCloseTo(circumference(), 2)
    expect(circle.style.strokeDashoffset).toMatch(/px$/)
    expect(parseFloat(circle.style.strokeDashoffset)).toBeCloseTo(hidden * circumference(), 2)
  })

  it('draws a track behind the arc with enableTrackSlot', () => {
    render(
      <CircularProgress aria-label="Setup" variant="determinate" value={40} enableTrackSlot />,
    )

    expect(part('track')).toBeInTheDocument()
  })

  it('passes ref, className, sx and other props to the root element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <CircularProgress
        ref={ref}
        aria-label="Loading"
        id="comments-progress"
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    expect(ref.current).toBe(progressbar())
    expect(progressbar()).toHaveAttribute('id', 'comments-progress')
    expect(progressbar()).toHaveAttribute('data-testid', 'root')
    expect(progressbar()).toHaveClass('custom')
    expect(progressbar()).toHaveStyle({ marginTop: '7px' })
  })

  it('still renders Button’s loading indicator, labelled by the button', () => {
    renderThemed(<Button loading>Save</Button>)

    expect(progressbar('Save')).toHaveClass('MuiCircularProgress-root')
  })

  describe('under the library theme', () => {
    it('keeps MUI’s colors and size', () => {
      renderThemed(<CircularProgress aria-label="Loading" />)

      expect(progressbar()).toHaveStyle({ color: light.primary.main, width: '40px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level styleOverrides.circle object', () => {
      renderThemed(<CircularProgress aria-label="Loading" />, {
        components: {
          MuiCircularProgress: { styleOverrides: { circle: { strokeLinecap: 'round' } } },
        },
      })

      expect(part('circle')).toHaveStyle({ strokeLinecap: 'round' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<CircularProgress aria-label="Loading" sx={{ color: 'rgb(170, 0, 0)' }} />)

      expect(progressbar()).toHaveStyle({ color: 'rgb(170, 0, 0)' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { primary: { main: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <CircularProgress aria-label="Loading" />
        </ThemeProvider>,
      )

      expect(progressbar()).toHaveStyle({ color: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <CircularProgress variant="determinate" value={10} size="3rem" thickness={5} />,
      <CircularProgress enableTrackSlot color="inherit" size={16} />,
    ]
    const rejected = [
      // @ts-expect-error: buffer is LinearProgress's
      <CircularProgress variant="buffer" />,
      // @ts-expect-error: valueBuffer is LinearProgress's
      <CircularProgress valueBuffer={20} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(4)
  })
})
