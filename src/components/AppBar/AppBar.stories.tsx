import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Typography } from '../Typography/index.ts'
import { AppBar } from './index.ts'

const content = (
  <>
    <IconButton edge="start" color="inherit" aria-label="Open navigation">
      <MenuIcon />
    </IconButton>
    <Typography variant="h6" component="p" sx={{ flexGrow: 1 }}>
      Dashboard
    </Typography>
    <IconButton color="inherit" aria-label="Notifications">
      <NotificationsIcon />
    </IconButton>
  </>
)

/**
 * MUI's `AppBar` with its `Toolbar` already inside. Under the library theme
 * the bar is sticky, on `background.paper`, with a `divider` line instead of a
 * shadow. Navbar is the data-driven bar built on it. The theme keys are
 * `MuiAppBar` and `MuiToolbar`. `color="primary"` is below 4.5:1 for normal
 * text, so keep its title large.
 */
const meta = {
  component: AppBar,
  args: { children: content, position: 'static' },
  argTypes: {
    position: { control: 'inline-radio', options: ['sticky', 'static', 'fixed', 'absolute', 'relative'] },
    color: {
      control: 'inline-radio',
      options: ['default', 'inherit', 'primary', 'secondary', 'transparent'],
    },
    children: { control: false },
  },
} satisfies Meta<typeof AppBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `default`, and MUI's palette colors. */
export const Colors: Story = {
  render: (args) => (
    <Stack spacing={2}>
      {(['default', 'inherit', 'primary', 'secondary', 'transparent'] as const).map((color) => (
        <AppBar key={color} {...args} color={color} component="div">
          {content}
        </AppBar>
      ))}
    </Stack>
  ),
}

/** MUI's 48px bar. */
export const Dense: Story = {
  args: { slotProps: { toolbar: { variant: 'dense' } } },
}

/** The top bar of a dialog or a section: `static`, as a `<div>`, so it isn't a banner. */
export const StaticInsideADialog: Story = {
  render: () => (
    <Paper elevation={8} sx={{ maxWidth: 420, overflow: 'hidden' }}>
      <AppBar position="static" component="div">
        <Typography variant="h6" component="h2">
          Edit project
        </Typography>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Typography variant="body2">The dialog’s content.</Typography>
      </Box>
    </Paper>
  ),
}

/** Scroll the box: the sticky bar stays at its top, with no spacer. */
export const Sticky: Story = {
  args: { position: 'sticky' },
  render: (args) => (
    <Box sx={{ height: 320, overflow: 'auto', border: 1, borderColor: 'divider' }}>
      <AppBar {...args} />
      <Box sx={{ p: 3 }}>
        {Array.from({ length: 30 }, (_, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            Line {index + 1} of a long page.
          </Typography>
        ))}
      </Box>
    </Box>
  ),
}

/** A project theme brings back a colored bar with a shadow. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          MuiAppBar: { defaultProps: { color: 'primary', elevation: 2 } },
        },
      })}
    >
      <AppBar {...args} />
    </CmThemeProvider>
  ),
}
