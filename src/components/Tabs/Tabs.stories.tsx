import FavoriteIcon from '@mui/icons-material/Favorite'
import HistoryIcon from '@mui/icons-material/History'
import SettingsIcon from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { TextField } from '../TextField/index.ts'
import { Typography } from '../Typography/index.ts'
import { Tabs } from './index.ts'
import type { TabItem } from './index.ts'

const items: TabItem[] = [
  {
    id: 'details',
    label: 'Details',
    content: <Typography variant="body2">The project’s name, owner and dates.</Typography>,
  },
  {
    id: 'activity',
    label: 'Activity',
    content: <Typography variant="body2">Recent changes to the project.</Typography>,
  },
  {
    id: 'settings',
    label: 'Settings',
    content: <Typography variant="body2">Who can see and edit the project.</Typography>,
  },
]

/**
 * Tabs built from an `items` array. Each item's `content` is shown in a panel
 * linked to its tab, and only the selected panel is rendered unless
 * `keepMounted` is set. Every example names the tab list with `aria-label`.
 * The theme key is `components.CmTabs`, with the slots `root`, `tabs` and
 * `panel`.
 */
const meta = {
  component: Tabs,
  args: { 'aria-label': 'Project', items },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'scrollable', 'fullWidth'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    centered: { control: 'boolean' },
    keepMounted: { control: 'boolean' },
    selectionFollowsFocus: { control: 'boolean' },
    items: { control: false },
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `standard`, `fullWidth` and `centered`. */
export const Variants: Story = {
  render: (args) => (
    <Stack spacing={4}>
      <Tabs {...args} aria-label="Standard" variant="standard" />
      <Tabs {...args} aria-label="Full width" variant="fullWidth" />
      <Tabs {...args} aria-label="Centered" centered />
    </Stack>
  ),
}

/** A column at the start, with the panel beside it. `ArrowDown` and `ArrowUp` move focus. */
export const Vertical: Story = {
  args: { orientation: 'vertical', sx: { minHeight: 200 } },
}

/** Icons go above the label by default, or before it with `iconPosition="start"`. */
export const WithIcons: Story = {
  render: () => {
    const withIcons: TabItem[] = [
      { ...items[0], icon: <FavoriteIcon /> },
      { ...items[1], icon: <HistoryIcon /> },
      { ...items[2], icon: <SettingsIcon /> },
    ] as TabItem[]
    return (
      <Stack spacing={4}>
        <Tabs aria-label="Icons above" items={withIcons} />
        <Tabs
          aria-label="Icons at the start"
          items={withIcons}
          slotProps={{ tab: { iconPosition: 'start' } }}
        />
      </Stack>
    )
  },
}

/** A disabled tab can't be selected and is skipped by the arrow keys. */
export const DisabledTab: Story = {
  args: {
    items: [items[0], { ...items[1], disabled: true }, items[2]] as TabItem[],
  },
}

/**
 * With `keepMounted`, every panel stays in the DOM, so the text typed in a
 * field is kept when switching tabs.
 */
export const KeepMounted: Story = {
  render: () => (
    <Tabs
      aria-label="Profile"
      keepMounted
      items={[
        {
          id: 'name',
          label: 'Name',
          content: <TextField label="Display name" />,
        },
        {
          id: 'bio',
          label: 'Bio',
          content: <TextField label="Bio" multiline minRows={3} />,
        },
      ]}
    />
  ),
}

/**
 * Tabs as links. A project sets its router once, in
 * `MuiButtonBase.defaultProps.LinkComponent`, and passes the current route as
 * `value`. The selected tab has `aria-current="page"`. Wrap them in a named
 * `<nav>`.
 */
export const LinkTabs: Story = {
  render: function Render() {
    const [pathname, setPathname] = useState('/settings/profile')
    return (
      <Box component="nav" aria-label="Settings">
        <Tabs
          items={[
            { id: '/settings/profile', label: 'Profile', href: '#profile' },
            { id: '/settings/billing', label: 'Billing', href: '#billing' },
            { id: '/settings/team', label: 'Team', href: '#team' },
          ]}
          value={pathname}
          // Stands in for the router, which would update the route.
          onChange={(_, id) => setPathname(id)}
        />
      </Box>
    )
  },
}

/**
 * Many tabs scroll sideways with `variant="scrollable"`, with arrow buttons
 * at the ends when the row overflows.
 */
export const Scrollable: Story = {
  args: {
    variant: 'scrollable',
    items: Array.from({ length: 12 }, (_, index) => ({
      id: `month-${index}`,
      label: new Date(2026, index).toLocaleString('en', { month: 'long' }),
      content: <Typography variant="body2">Report {index + 1}</Typography>,
    })),
    sx: { maxWidth: 480 },
  },
}

/** `value={null}` selects no tab and shows no panel. */
export const NoSelection: Story = {
  args: { value: null },
}

/**
 * `components.CmTabs` sets default props and styles each slot. `MuiTab` and
 * `MuiTabs` still reach the tabs and the row. A `root` object in
 * `MuiTab.styleOverrides` merges with the library's selected color.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          CmTabs: {
            defaultProps: { variant: 'scrollable' },
            styleOverrides: {
              panel: ({ theme }) => ({ padding: theme.spacing(3) }),
              tabs: { borderBottom: 0 },
            },
          },
          MuiTab: { styleOverrides: { root: { fontWeight: 600 } } },
          MuiTabs: { defaultProps: { indicatorColor: 'secondary' } },
        },
      })}
    >
      <Tabs {...args} />
    </CmThemeProvider>
  ),
}
