import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps, Ref } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Typography } from '../Typography/index.ts'
import { Link } from './index.ts'

/**
 * Stands in for a router's link, such as React Router's `Link`. It accepts
 * `ref` and spreads its props onto the `<a>`, which any component passed to
 * `component` must do. Clicks are logged instead of navigating.
 */
function RouterLink({
  to,
  ref,
  onClick,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string; ref?: Ref<HTMLAnchorElement> }) {
  return (
    <a
      ref={ref}
      href={to}
      onClick={(event) => {
        event.preventDefault()
        console.log(`Router navigates to ${to}`)
        onClick?.(event)
      }}
      {...props}
    />
  )
}

/** Maps `href` to the router's `to`, for a router set once in the theme. */
function LinkBehavior({ href, ref, ...props }: ComponentProps<'a'> & { ref?: Ref<HTMLAnchorElement> }) {
  return <RouterLink ref={ref} to={href ?? ''} {...props} />
}

/**
 * Under the library theme, `color="primary"` is `primary.dark` in light mode
 * and `primary.main` in dark mode, so links in body text pass 4.5:1 on both.
 * Other colors keep MUI's look.
 */
const meta = {
  component: Link,
  args: { href: '#', children: 'terms of service' },
  argTypes: {
    underline: { control: 'inline-radio', options: ['always', 'hover', 'none'] },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'inherit', 'textPrimary', 'textSecondary', 'error'],
    },
    variant: { control: 'select', options: ['inherit', 'body1', 'body2', 'caption', 'h6'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Inside text, keep `underline="always"`, the default. The link color reaches
 * only 2.85:1 against `text.primary` in light mode, so color alone doesn't
 * tell it apart (WCAG 1.4.1).
 */
export const InText: Story = {
  render: (args) => (
    <Typography>
      Read the <Link {...args} /> before you continue. Long URLs, such as{' '}
      <Link href="#" sx={{ overflowWrap: 'anywhere' }}>
        https://example.com/a/very/long/path/that/would/otherwise/overflow
      </Link>
      , wrap anywhere so they don't overflow narrow containers.
    </Typography>
  ),
}

/**
 * Use `hover` or `none` only where the link is clearly a link without the
 * underline, such as a list of links, not inside text.
 */
export const Underline: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Link {...args} underline="always">
        Always underlined
      </Link>
      <Link {...args} underline="hover">
        Underlined on hover
      </Link>
      <Link {...args} underline="none">
        Never underlined
      </Link>
    </Stack>
  ),
}

/**
 * Pass the router's link as `component`, with its own props such as `to`.
 * Router-only props, such as `replace` or `state`, need this form even when
 * the router is set in the theme.
 */
export const WithRouter: Story = {
  render: ({ children }) => (
    <Link component={RouterLink} to="/settings">
      {children}
    </Link>
  ),
  args: { children: 'Settings' },
}

/**
 * Renders a `<button>` with no `type`, so inside a form it submits the form.
 * Pass `type="button"`. For most actions, Button with `variant="text"` fits
 * better.
 */
export const AsButton: Story = {
  render: ({ children }) => (
    <Link component="button" type="button" variant="body2" onClick={() => console.log('Clicked')}>
      {children}
    </Link>
  ),
  args: { children: 'Show more' },
}

/**
 * A project sets its router once: `MuiLink.defaultProps.component` for Link
 * and `MuiButtonBase.defaultProps.LinkComponent` for Button with `href`. A
 * `styleOverrides.root` object merges with the library's link color. A
 * `root.variants` array or a `root` function replaces it.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiLink: {
            defaultProps: { component: LinkBehavior, underline: 'hover' },
            styleOverrides: { root: { fontWeight: 600 } },
          },
          MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } },
        },
      })}
    >
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Link {...args} href="/settings">
          Settings, through the theme's router
        </Link>
        <Button variant="contained" href="/settings">
          Settings
        </Button>
      </Stack>
    </CmThemeProvider>
  ),
}
