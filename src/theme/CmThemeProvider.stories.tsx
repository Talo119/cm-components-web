import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from './CmThemeProvider.tsx'
import { createCmTheme } from './createCmTheme.ts'

function Sample() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography>Text in the default color.</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
      </Stack>
    </Stack>
  )
}

const meta = {
  component: CmThemeProvider,
  parameters: { withoutThemeProvider: true },
  args: { children: <Sample /> },
  argTypes: { children: { control: false }, theme: { control: false } },
} satisfies Meta<typeof CmThemeProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Baseline: Story = {
  args: { baseline: true },
}

/**
 * A top-level `palette` override applies to the light color scheme only.
 * To change dark mode, override `colorSchemes.dark` as well.
 */
export const ThemeOverride: Story = {
  args: {
    baseline: true,
    theme: createCmTheme({
      palette: { primary: { main: '#0b6e4f' } },
      colorSchemes: { dark: { palette: { primary: { main: '#7fd8b6' } } } },
      shape: { borderRadius: 4 },
    }),
  },
}
