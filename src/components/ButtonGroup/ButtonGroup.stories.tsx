import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { ButtonGroup } from './index.ts'

const buttons = [
  <Button key="copy">Copy</Button>,
  <Button key="cut">Cut</Button>,
  <Button key="paste">Paste</Button>,
]

/**
 * Give every group an `aria-label` or `aria-labelledby`. Pass buttons as
 * direct children or as an array, not inside a fragment. Inside a group, the
 * group's `variant`, `size`, `color` and `disableElevation` replace any
 * `MuiButton.defaultProps` for those props, so set them on `MuiButtonGroup` too.
 */
const meta = {
  component: ButtonGroup,
  args: { 'aria-label': 'Clipboard actions', children: buttons },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'outlined', 'contained'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
    },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof ButtonGroup>

export default meta

type Story = StoryObj<typeof meta>

/** MUI's default variant for a group is `outlined`, while Button's is `text`. */
export const Outlined: Story = {}

export const Contained: Story = {
  args: { variant: 'contained' },
}

export const Text: Story = {
  args: { variant: 'text' },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <ButtonGroup {...args} size="small" aria-label="Small clipboard actions" />
      <ButtonGroup {...args} size="medium" aria-label="Medium clipboard actions" />
      <ButtonGroup {...args} size="large" aria-label="Large clipboard actions" />
    </Stack>
  ),
  args: { variant: 'contained' },
}

export const Colors: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      {(['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const).map((color) => (
        <ButtonGroup key={color} {...args} color={color} aria-label={`${color} actions`} />
      ))}
    </Stack>
  ),
  args: { variant: 'contained' },
}

export const Vertical: Story = {
  args: { orientation: 'vertical', 'aria-label': 'Row actions' },
}

export const FullWidth: Story = {
  args: { fullWidth: true, variant: 'contained' },
}

/** Press Tab to see the focus ring, painted above the neighboring buttons. */
export const Focusable: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <ButtonGroup {...args} variant="contained" aria-label="Contained actions" />
      <ButtonGroup {...args} variant="outlined" aria-label="Outlined actions" />
      <ButtonGroup {...args} variant="text" aria-label="Text actions" />
    </Stack>
  ),
}

/** A Button's own `disabled={false}` keeps it enabled inside a disabled group. */
export const Disabled: Story = {
  args: {
    disabled: true,
    orientation: 'vertical',
    'aria-label': 'Row actions',
    children: [
      <Button key="up">Move up</Button>,
      <Button key="down">Move down</Button>,
      <Button key="unlock" disabled={false}>
        Unlock
      </Button>,
    ],
  },
}

/** Loading applies per button. The group has no loading state. */
export const WithLoadingButton: Story = {
  args: {
    variant: 'contained',
    'aria-label': 'Pagination',
    children: [
      <Button key="previous">Previous</Button>,
      <Button key="next" loading>
        Next
      </Button>,
    ],
  },
}

/**
 * The group passes its own `disableElevation`, which beats `MuiButton`'s
 * default, so set it on `MuiButtonGroup` to change grouped buttons. Use
 * `styleOverrides.grouped` to style every button in a group.
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
        components: {
          MuiButtonGroup: {
            defaultProps: { disableElevation: false },
            styleOverrides: { grouped: { fontWeight: 700 } },
          },
        },
      })}
    >
      <ButtonGroup {...args} />
    </CmThemeProvider>
  ),
  args: { variant: 'contained' },
}
