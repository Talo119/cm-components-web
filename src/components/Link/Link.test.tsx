import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Link } from './index.ts'

/** Stands in for a router's link: `to` is required and isn't a DOM attribute. */
function RouterLink({
  to,
  ref,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string; ref?: Ref<HTMLAnchorElement> }) {
  return <a ref={ref} href={to} data-router-link {...props} />
}

/** Maps `href` to the router's `to`, as a project sets it in its theme. */
function LinkBehavior({
  href,
  ref,
  ...props
}: ComponentProps<'a'> & { ref?: Ref<HTMLAnchorElement> }) {
  return <RouterLink ref={ref} to={href ?? ''} {...props} />
}

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const link = (name?: string) => screen.getByRole('link', name ? { name } : undefined)

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette
const dark = libraryTheme.colorSchemes.dark!.palette

describe('Link', () => {
  it('renders an anchor with the given href, named by its children', () => {
    render(<Link href="/terms">terms of service</Link>)

    const anchor = link('terms of service')
    expect(anchor.tagName).toBe('A')
    expect(anchor).toHaveAttribute('href', '/terms')
  })

  it('passes ref to the DOM element', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Link ref={ref} href="/terms">
        Terms
      </Link>,
    )

    expect(ref.current).toBe(link())
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <Link
        href="https://mui.com"
        className="custom"
        sx={{ marginTop: '7px' }}
        target="_blank"
        rel="noopener"
        data-testid="docs"
        aria-describedby="hint"
      >
        MUI docs
      </Link>,
    )

    const anchor = link()
    expect(anchor).toHaveClass('custom')
    expect(anchor).toHaveStyle({ marginTop: '7px' })
    expect(anchor).toHaveAttribute('target', '_blank')
    expect(anchor).toHaveAttribute('rel', 'noopener')
    expect(anchor).toHaveAttribute('data-testid', 'docs')
    expect(anchor).toHaveAttribute('aria-describedby', 'hint')
  })

  it('is always underlined by default and takes the parent’s font size', () => {
    renderThemed(
      <div style={{ fontSize: '27px' }}>
        <Link href="/terms">Terms</Link>
      </div>,
    )

    const anchor = link()
    expect(anchor).toHaveClass('MuiLink-underlineAlways')
    expect(anchor).toHaveStyle({ fontSize: '27px' })
  })

  it.each([
    ['hover', 'MuiLink-underlineHover'],
    ['none', 'MuiLink-underlineNone'],
  ] as const)('adds its class for underline="%s"', (underline, className) => {
    render(
      <Link href="/help" underline={underline}>
        Help
      </Link>,
    )

    const anchor = link()
    expect(anchor).toHaveClass(className)
    expect(anchor).not.toHaveClass('MuiLink-underlineAlways')
  })

  it('renders the given component and passes it its own props', () => {
    render(
      <Link component={RouterLink} to="/settings">
        Settings
      </Link>,
    )

    const anchor = link('Settings')
    expect(anchor).toHaveAttribute('data-router-link')
    expect(anchor).toHaveAttribute('href', '/settings')
    expect(anchor).not.toHaveAttribute('to')
  })

  describe('with component="button"', () => {
    const renderForm = (ui: ReactElement) => {
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
      render(<form onSubmit={onSubmit}>{ui}</form>)
      return onSubmit
    }

    it('renders a button with no type, which submits a surrounding form', async () => {
      const onSubmit = renderForm(<Link component="button">Show more</Link>)

      const button = screen.getByRole('button', { name: 'Show more' })
      expect(button.tagName).toBe('BUTTON')
      expect(button).not.toHaveAttribute('type')
      await userEvent.click(button)

      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('does not submit a surrounding form with type="button"', async () => {
      const onSubmit = renderForm(
        <Link component="button" type="button">
          Show more
        </Link>,
      )

      await userEvent.click(screen.getByRole('button'))

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('with the keyboard', () => {
    it('moves focus to the link with Tab and skips an anchor without href', async () => {
      render(
        <>
          <Link>Unavailable</Link>
          <Link href="/terms">Terms</Link>
        </>,
      )

      await userEvent.tab()

      expect(link('Terms')).toHaveFocus()
    })

    it('follows the link with Enter but not with Space', async () => {
      const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
      render(
        <Link href="/terms" onClick={onClick}>
          Terms
        </Link>,
      )

      await userEvent.tab()
      await userEvent.keyboard(' ')
      expect(onClick).not.toHaveBeenCalled()

      await userEvent.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledOnce()
    })
  })

  describe('under the library theme', () => {
    it('colors a primary link primary.dark in light mode and primary.main in dark mode', () => {
      // A class selector puts both schemes on one page, which jsdom can't do
      // with the default `prefers-color-scheme` media query.
      renderThemed(
        <>
          <Link href="/a">Light</Link>
          <div className="dark">
            <Link href="/b">Dark</Link>
          </div>
        </>,
        { cssVariables: { colorSchemeSelector: 'class' } },
      )

      expect(link('Light')).toHaveStyle({ color: light.primary.dark })
      expect(link('Dark')).toHaveStyle({ color: dark.primary.main })
    })

    it('switches the primary link color in a prefers-color-scheme: dark rule by default', () => {
      renderThemed(<Link href="/a">Terms</Link>)

      const css = [...document.querySelectorAll('style')].map((style) => style.textContent).join('')
      const darkRule = css.match(
        /@media \(prefers-color-scheme: dark\)\{\.css-[\w-]+-MuiLink-root\{color:([^;}]+)/,
      )
      expect(darkRule?.[1]).toBe('var(--mui-palette-primary-main)')
      expect(link()).toHaveStyle({ color: light.primary.dark })
    })

    it('keeps MUI’s secondary.main for color="secondary"', () => {
      renderThemed(
        <Link href="/a" color="secondary">
          Terms
        </Link>,
      )

      expect(link()).toHaveStyle({ color: light.secondary.main })
    })

    it('shows a solid outline on keyboard focus', async () => {
      renderThemed(<Link href="/terms">Terms</Link>)

      await userEvent.tab()

      const anchor = link()
      expect(anchor).toHaveFocus()
      expect(anchor).toHaveClass('Mui-focusVisible')
      expect(anchor).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })
  })

  describe('with overrides', () => {
    it('renders a project-level MuiLink.defaultProps.component for href', () => {
      renderThemed(<Link href="/settings">Settings</Link>, {
        components: { MuiLink: { defaultProps: { component: LinkBehavior } } },
      })

      const anchor = link('Settings')
      expect(anchor).toHaveAttribute('data-router-link')
      expect(anchor).toHaveAttribute('href', '/settings')
    })

    it('renders a project-level MuiButtonBase.defaultProps.LinkComponent for Button href', () => {
      renderThemed(<Button href="/settings">Settings</Button>, {
        components: { MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } } },
      })

      const anchor = link('Settings')
      expect(anchor).toHaveAttribute('data-router-link')
      expect(anchor).toHaveAttribute('href', '/settings')
    })

    it('merges a project styleOverrides.root object and keeps the library’s link color', () => {
      renderThemed(<Link href="/a">Terms</Link>, {
        components: { MuiLink: { styleOverrides: { root: { letterSpacing: '3px' } } } },
      })

      expect(link()).toHaveStyle({ letterSpacing: '3px', color: light.primary.dark })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Link href="/a" sx={{ color: 'rgb(170, 0, 0)' }}>
          Terms
        </Link>,
      )

      expect(link()).toHaveStyle({ color: 'rgb(170, 0, 0)' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme’s primary.main', () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000', dark: '#550000' } } })

      render(
        <ThemeProvider theme={theme}>
          <Link href="/a">Terms</Link>
        </ThemeProvider>,
      )

      expect(link()).toHaveStyle({ color: '#aa0000' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Link component={RouterLink} to="/x" />,
      <Link href="/x" target="_blank" underline="hover" variant="body2" />,
      <Link component="button" type="button" />,
    ]
    const rejected = [
      // @ts-expect-error: not a Link prop
      <Link unknownProp />,
      // @ts-expect-error: RouterLink requires `to`
      <Link component={RouterLink} />,
      // @ts-expect-error: MUI's Link has no slotProps
      <Link slotProps={{}} />,
      // @ts-expect-error: not an underline value
      <Link underline="never" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(7)
  })
})
