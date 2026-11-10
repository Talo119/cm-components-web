import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Alert, AlertTitle } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette

const severities = ['success', 'info', 'warning', 'error'] as const

const alert = (testId = 'alert') => screen.getByTestId(testId)
const part = (root: HTMLElement, name: 'icon' | 'message' | 'action') =>
  root.querySelector<HTMLElement>(`.MuiAlert-${name}`)

const colorOf = (element: Element) => getComputedStyle(element).color

describe('Alert', () => {
  it('renders the message inside an element with role="alert"', () => {
    render(<Alert>Changes saved.</Alert>)

    expect(screen.getByRole('alert')).toHaveTextContent('Changes saved.')
  })

  it('replaces the role with role="status"', () => {
    render(<Alert role="status">Upload complete.</Alert>)

    expect(screen.getByRole('status')).toHaveTextContent('Upload complete.')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each([
    ['success', 'SuccessOutlinedIcon'],
    ['info', 'InfoOutlinedIcon'],
    ['warning', 'ReportProblemOutlinedIcon'],
    ['error', 'ErrorOutlineIcon'],
  ] as const)('shows the %s icon, hidden from screen readers', (severity, icon) => {
    render(
      <Alert data-testid="alert" severity={severity}>
        Message
      </Alert>,
    )

    const svg = part(alert(), 'icon')!.querySelector('svg')!
    expect(svg).toHaveAttribute('data-testid', icon)
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('hides the icon with icon={false}', () => {
    render(
      <Alert data-testid="alert" icon={false}>
        Message
      </Alert>,
    )

    expect(part(alert(), 'icon')).not.toBeInTheDocument()
  })

  it('renders AlertTitle above the message', () => {
    render(
      <Alert data-testid="alert" severity="error">
        <AlertTitle>Payment failed</AlertTitle>
        Your card was declined.
      </Alert>,
    )

    const message = part(alert(), 'message')!
    const title = message.firstElementChild!
    expect(title).toHaveClass('MuiAlertTitle-root')
    expect(title).toHaveTextContent('Payment failed')
    expect(message).toHaveTextContent('Payment failedYour card was declined.')
  })

  it('renders a close button named "Close" that calls onClose', async () => {
    const onClose = vi.fn()
    render(<Alert onClose={onClose}>Tip</Alert>)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renames the close button with closeText', () => {
    render(
      <Alert onClose={() => {}} closeText="Cerrar">
        Consejo
      </Alert>,
    )

    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('renders action in place of the close button', () => {
    render(
      <Alert
        data-testid="alert"
        onClose={() => {}}
        action={
          <Button color="inherit" size="small">
            Retry
          </Button>
        }
      >
        Payment failed.
      </Alert>,
    )

    expect(part(alert(), 'action')).toContainElement(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('reaches the close button and actions with Tab, without focusing the alert', async () => {
    render(
      <Alert
        action={
          <Button color="inherit" size="small">
            Retry
          </Button>
        }
      >
        Payment failed.
      </Alert>,
    )

    await userEvent.tab()

    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus()
    expect(screen.getByRole('alert')).not.toHaveAttribute('tabindex')
  })

  it('passes ref, className, sx and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Alert
        ref={ref}
        data-testid="alert"
        id="saved"
        className="custom"
        sx={{ marginTop: '7px' }}
      >
        Saved
      </Alert>,
    )

    expect(ref.current).toBe(alert())
    expect(alert()).toBe(screen.getByRole('alert'))
    expect(alert()).toHaveAttribute('id', 'saved')
    expect(alert()).toHaveClass('custom')
    expect(alert()).toHaveStyle({ marginTop: '7px' })
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <Alert
        data-testid="alert"
        onClose={() => {}}
        slotProps={{
          root: { className: 'root' },
          icon: { className: 'icon' },
          message: { className: 'message' },
          action: { className: 'action' },
          closeButton: { className: 'close-button' },
          closeIcon: { className: 'close-icon' },
        }}
      >
        Saved
      </Alert>,
    )

    expect(alert()).toHaveClass('root')
    expect(part(alert(), 'icon')).toHaveClass('icon')
    expect(part(alert(), 'message')).toHaveClass('message')
    expect(part(alert(), 'action')).toHaveClass('action')
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('close-button')
    expect(screen.getByRole('button').querySelector('svg')).toHaveClass('close-icon')
  })

  describe('under the library theme', () => {
    describe.each(['standard', 'outlined', undefined] as const)('variant %s', (variant) => {
      it.each(severities)(
        'draws the %s icon in the alert’s text color, on both schemes',
        (severity) => {
          // A class selector puts both schemes on one page, which jsdom can't do
          // with the default `prefers-color-scheme` media query.
          renderThemed(
            <>
              <Alert data-testid="light" severity={severity} variant={variant}>
                Light
              </Alert>
              <div className="dark">
                <Alert data-testid="dark" severity={severity} variant={variant}>
                  Dark
                </Alert>
              </div>
            </>,
            { cssVariables: { colorSchemeSelector: 'class' } },
          )

          for (const testId of ['light', 'dark']) {
            const root = alert(testId)
            expect(colorOf(root)).toBeTruthy()
            expect(colorOf(part(root, 'icon')!)).toBe(colorOf(root))
          }
          expect(colorOf(alert('light'))).not.toBe(colorOf(alert('dark')))
        },
      )
    })

    it('without the library theme, draws a standard icon in a color other than the text', () => {
      render(
        <Alert data-testid="alert" severity="warning">
          Warning
        </Alert>,
      )

      expect(colorOf(part(alert(), 'icon')!)).not.toBe(colorOf(alert()))
    })

    it.each(severities)('keeps MUI’s colors on a filled %s alert', (severity) => {
      renderThemed(
        <Alert data-testid="alert" severity={severity} variant="filled">
          Filled
        </Alert>,
      )

      expect(alert()).toHaveStyle({ backgroundColor: light[severity].main })
      expect(colorOf(part(alert(), 'icon')!)).toBe(colorOf(alert()))
    })

    it('has the theme’s 8px radius', () => {
      renderThemed(<Alert data-testid="alert">Saved</Alert>)

      expect(alert()).toHaveStyle({ borderRadius: '8px' })
    })

    it('shows the focus ring on keyboard focus on the close button', async () => {
      renderThemed(<Alert onClose={() => {}}>Saved</Alert>)

      await userEvent.tab()

      const close = screen.getByRole('button', { name: 'Close' })
      expect(close).toHaveFocus()
      expect(close).toHaveClass('Mui-focusVisible')
      expect(close).toHaveStyle({ outlineStyle: 'solid', outlineWidth: '2px' })
    })
  })

  describe('with overrides', () => {
    it('merges a project styleOverrides.root object and keeps the library’s icon color', () => {
      renderThemed(
        <Alert data-testid="alert" severity="warning">
          Warning
        </Alert>,
        { components: { MuiAlert: { styleOverrides: { root: { letterSpacing: '3px' } } } } },
      )

      expect(alert()).toHaveStyle({ letterSpacing: '3px' })
      expect(colorOf(part(alert(), 'icon')!)).toBe(colorOf(alert()))
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Alert
          data-testid="alert"
          severity="warning"
          sx={{ '& .MuiAlert-icon': { color: 'rgb(170, 0, 0)' } }}
        >
          Warning
        </Alert>,
      )

      expect(part(alert(), 'icon')).toHaveStyle({ color: 'rgb(170, 0, 0)' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { success: { main: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <Alert data-testid="alert" variant="filled">
            Saved
          </Alert>
        </ThemeProvider>,
      )

      expect(alert()).toHaveStyle({ backgroundColor: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Alert severity="error" variant="outlined" icon={false} onClose={() => {}} closeText="x" />,
      <Alert role="status" slotProps={{ message: { className: 'x' } }} action={<b>x</b>} />,
      <AlertTitle>x</AlertTitle>,
    ]
    const rejected = [
      // @ts-expect-error: not a severity
      <Alert severity="danger" />,
      // @ts-expect-error: not an Alert variant
      <Alert variant="contained" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(5)
  })
})
