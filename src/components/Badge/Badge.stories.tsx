import MailIcon from '@mui/icons-material/Mail'
import NotificationsIcon from '@mui/icons-material/Notifications'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Button } from '../Button/index.ts'
import { Switch } from '../Switch/index.ts'
import { Badge } from './index.ts'

/**
 * MUI's `Badge`. Under the library theme, the default color is `error`, the
 * only theme color whose text meets 4.5:1 on both color schemes. The badge is
 * `aria-hidden`, so put its information in the child's accessible name.
 */
const meta = {
  component: Badge,
  args: { badgeContent: 4, children: <MailIcon /> },
  argTypes: {
    badgeContent: { control: 'number' },
    max: { control: 'number' },
    color: {
      control: 'select',
      options: ['error', 'primary', 'secondary', 'info', 'success', 'warning', 'default'],
    },
    variant: { control: 'inline-radio', options: ['standard', 'dot'] },
    overlap: { control: 'inline-radio', options: ['rectangular', 'circular'] },
    showZero: { control: 'boolean' },
    invisible: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Only `error` text meets 4.5:1 in both schemes. `primary` and `info` fall
 * below it, and `warning` does in dark mode. `default` draws the number with
 * no background.
 */
export const Colors: Story = {
  render: (args) => (
    <Stack direction="row" spacing={3}>
      {(['error', 'primary', 'secondary', 'info', 'success', 'warning', 'default'] as const).map(
        (color) => (
          <Badge {...args} key={color} color={color} />
        ),
      )}
    </Stack>
  ),
}

/** A count above `max`, 99 by default, shows as `${max}+`. Text isn't capped. */
export const Max: Story = {
  render: (args) => (
    <Stack direction="row" spacing={4}>
      <Badge {...args} badgeContent={99} />
      <Badge {...args} badgeContent={100} />
      <Badge {...args} badgeContent={1000} max={999} />
      <Badge {...args} badgeContent="New" />
    </Stack>
  ),
}

/**
 * A count of 0 hides the badge, unless `showZero` is set. `invisible` hides
 * it with a scale transition.
 */
export const ZeroAndInvisible: Story = {
  render: function Render(args) {
    const [invisible, setInvisible] = useState(false)
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={3}>
          <Badge {...args} badgeContent={0} />
          <Badge {...args} badgeContent={0} showZero />
          <Badge {...args} invisible={invisible} />
        </Stack>
        <Switch label="Hide the last badge" checked={invisible} onChange={(_, checked) => setInvisible(checked)} />
      </Stack>
    )
  },
}

export const Dot: Story = {
  args: { variant: 'dot' },
}

/** `anchorOrigin` moves the badge to another corner. */
export const AnchorOrigin: Story = {
  render: (args) => (
    <Stack direction="row" spacing={4}>
      <Badge {...args} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} />
      <Badge {...args} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} />
      <Badge {...args} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
      <Badge {...args} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} />
    </Stack>
  ),
}

/**
 * The badge goes inside the icon button, and the count goes in the button's
 * `aria-label`, because screen readers never read the badge. A count that
 * changes while the user is on the page isn't announced.
 */
export const OnIconButton: Story = {
  render: function Render() {
    const [unread, setUnread] = useState(4)
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <IconButton aria-label={`Messages, ${unread} unread`} onClick={() => setUnread(0)}>
          <Badge badgeContent={unread}>
            <MailIcon />
          </Badge>
        </IconButton>
        <IconButton aria-label="Notifications, 120 new">
          <Badge badgeContent={120}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Stack>
    )
  },
}

/** Pass `showZero` when zero is information, such as an empty cart. */
export const OnButton: Story = {
  render: () => (
    <Badge badgeContent={0} color="primary" showZero>
      <Button variant="outlined" aria-label="Cart, 0 items">
        Cart
      </Button>
    </Badge>
  ),
}

/**
 * `overlap="circular"` places the dot for a round child. The avatar's `alt`
 * says what the dot means.
 */
export const OnAvatar: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <Badge variant="dot" color="success" overlap="circular">
        <Avatar role="img" aria-label="Ana Ruiz, online">
          AR
        </Avatar>
      </Badge>
      <Badge
        variant="dot"
        color="success"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar role="img" aria-label="Jane Doe, online">
          JD
        </Avatar>
      </Badge>
    </Stack>
  ),
}

/**
 * A project changes the default color with `MuiBadge.defaultProps.color`, and
 * styles the badge with `styleOverrides.badge`.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiBadge: {
            defaultProps: { color: 'secondary' },
            styleOverrides: { badge: { fontWeight: 700 } },
          },
        },
      })}
    >
      <Badge {...args} />
    </CmThemeProvider>
  ),
}
