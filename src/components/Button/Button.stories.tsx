import AddIcon from '@mui/icons-material/Add'
import SendIcon from '@mui/icons-material/Send'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from './index.ts'

const meta = {
  component: Button,
  args: { children: 'Save' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'outlined', 'contained'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: { variant: 'text' },
}

export const Contained: Story = {
  args: { variant: 'contained' },
}

export const Outlined: Story = {
  args: { variant: 'outlined' },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Button {...args} size="small">
        Small
      </Button>
      <Button {...args} size="medium">
        Medium
      </Button>
      <Button {...args} size="large">
        Large
      </Button>
    </Stack>
  ),
  args: { variant: 'contained' },
}

export const Colors: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Button {...args} color="primary">
        Primary
      </Button>
      <Button {...args} color="secondary">
        Secondary
      </Button>
      <Button {...args} color="success">
        Success
      </Button>
      <Button {...args} color="error">
        Error
      </Button>
      <Button {...args} color="info">
        Info
      </Button>
      <Button {...args} color="warning">
        Warning
      </Button>
    </Stack>
  ),
  args: { variant: 'contained' },
}

export const WithIcons: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Button {...args} startIcon={<AddIcon />}>
        Add user
      </Button>
      <Button {...args} endIcon={<SendIcon />}>
        Send
      </Button>
    </Stack>
  ),
  args: { variant: 'outlined' },
}

/** Press Tab to see the focus ring. */
export const Focusable: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Button {...args} variant="contained">
        Contained
      </Button>
      <Button {...args} variant="outlined">
        Outlined
      </Button>
      <Button {...args} variant="text">
        Text
      </Button>
    </Stack>
  ),
}

export const Disabled: Story = {
  args: { variant: 'contained', disabled: true },
}

/**
 * Pass `true` or `false` from the first render, not `undefined`. A custom
 * `loadingIndicator` must contain an element with `role="progressbar"` and an
 * accessible name.
 */
export const Loading: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Button {...args} loadingPosition="center">
        Center
      </Button>
      <Button {...args} loadingPosition="start" startIcon={<AddIcon />}>
        Start
      </Button>
      <Button {...args} loadingPosition="end" endIcon={<SendIcon />}>
        End
      </Button>
    </Stack>
  ),
  args: { variant: 'contained', loading: true },
}

/**
 * Renders an `<a>`. A disabled link keeps its `href`, so remove it as well if
 * navigation must be impossible. For a router link, pass the router's component
 * as `component`. It must forward `ref` and spread its props onto the DOM element.
 */
export const AsLink: Story = {
  render: ({ variant, children }) => (
    <Button variant={variant} href="https://mui.com" target="_blank">
      {children}
    </Button>
  ),
  args: { variant: 'contained', children: 'Read the docs' },
}

/**
 * An object in `styleOverrides.root` merges with the library defaults. A
 * function replaces them, so the label goes back to uppercase unless the
 * function sets `textTransform` itself.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        palette: { primary: { main: '#0b6e4f' } },
        colorSchemes: { dark: { palette: { primary: { main: '#7fd8b6' } } } },
        shape: { borderRadius: 4 },
        focusVisible: { outlineColor: '#d97706' },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: false },
            styleOverrides: { root: { fontWeight: 700 } },
          },
        },
      })}
    >
      <Button {...args} />
    </CmThemeProvider>
  ),
  args: { variant: 'contained' },
}
