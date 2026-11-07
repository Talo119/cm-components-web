import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Typography } from './index.ts'

const variants = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'overline',
  'button',
] as const

const colors = [
  'textPrimary',
  'textSecondary',
  'textDisabled',
  'primary',
  'secondary',
  'success',
  'error',
  'info',
  'warning',
] as const

/**
 * Choose the heading level from the page outline and the look from the
 * design: `<Typography variant="h4" component="h2">`. Subtitles render `<p>`
 * under the library theme, so they aren't headings.
 *
 * Use `color="textSecondary"`, not `color="text.secondary"`, which compiles
 * but has no effect in MUI 9.
 */
const meta = {
  component: Typography,
  args: { children: 'The quick brown fox jumps over the lazy dog' },
  argTypes: {
    variant: { control: 'select', options: [...variants, 'inherit'] },
    color: { control: 'select', options: colors },
    align: { control: 'inline-radio', options: ['inherit', 'left', 'center', 'right', 'justify'] },
    gutterBottom: { control: 'boolean' },
    noWrap: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Typography>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Each variant renders its default element, so the headings run from `<h1>` to `<h6>` in order. */
export const Variants: Story = {
  render: (args) => (
    <Stack spacing={2}>
      {variants.map((variant) => (
        <Typography key={variant} {...args} variant={variant}>
          {variant}: {args.children}
        </Typography>
      ))}
    </Stack>
  ),
}

/**
 * Inherited text, `textPrimary`, `textSecondary` and `secondary` are safe for
 * any text. `primary` is for large text only. `error` fails in dark mode,
 * `warning` in light mode, and `success` and `info` in both, so the a11y panel
 * reports their contrast here.
 */
export const Colors: Story = {
  render: (args) => (
    <Stack spacing={1}>
      {colors.map((color) => (
        <Typography key={color} {...args} color={color}>
          {color}: {args.children}
        </Typography>
      ))}
    </Stack>
  ),
}

/**
 * `noWrap` needs a block with a width. `caption`, `overline` and `button`
 * render `<span>`, so they also need `display: 'block'`.
 */
export const NoWrap: Story = {
  render: (args) => (
    <Stack spacing={1} sx={{ width: 200 }}>
      <Typography {...args} noWrap />
      <Typography {...args} variant="caption" noWrap sx={{ display: 'block' }}>
        quarterly-report-final-version-2.pdf
      </Typography>
    </Stack>
  ),
}

/** A top-level heading with the `h4` look, so the size doesn't set the level. */
export const HeadingLevel: Story = {
  render: (args) => (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Recent orders
      </Typography>
      <Typography {...args} />
      <Typography variant="body2" color="textSecondary">
        Updated 5 minutes ago
      </Typography>
    </>
  ),
}

/**
 * A project's `typography` options merge with the library's, so `h1` keeps
 * its weight when only its size changes. A project restores MUI's `<h6>`
 * subtitles through `MuiTypography.defaultProps.variantMapping`.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        typography: {
          fontFamily: 'Georgia, serif',
          h1: { fontSize: '2.5rem' },
          button: { textTransform: 'uppercase' },
        },
        components: {
          MuiTypography: {
            styleOverrides: { root: { letterSpacing: '0.01em' } },
          },
        },
      })}
    >
      <Stack spacing={2}>
        <Typography variant="h1">Dashboard</Typography>
        <Typography {...args} />
        <Typography variant="button">Uppercase button text</Typography>
      </Stack>
    </CmThemeProvider>
  ),
}
