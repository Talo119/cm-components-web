import CreditCardIcon from '@mui/icons-material/CreditCard'
import DeleteIcon from '@mui/icons-material/Delete'
import InboxIcon from '@mui/icons-material/Inbox'
import PersonIcon from '@mui/icons-material/Person'
import SendIcon from '@mui/icons-material/Send'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Typography } from '../Typography/index.ts'
import { List } from './index.ts'
import type { ListItemData } from './index.ts'

const people: ListItemData[] = [
  { id: 'ana', primary: 'Ana Torres', secondary: 'Designer' },
  { id: 'luis', primary: 'Luis Pérez', secondary: 'Engineer' },
  { id: 'eva', primary: 'Eva Díaz', secondary: 'Product manager' },
]

const settings: ListItemData[] = [
  { id: 'profile', primary: 'Profile', icon: <PersonIcon />, href: '#profile' },
  {
    id: 'billing',
    primary: 'Billing',
    icon: <CreditCardIcon />,
    children: [
      { id: 'invoices', primary: 'Invoices', href: '#invoices' },
      { id: 'plans', primary: 'Plans', href: '#plans' },
    ],
  },
]

/**
 * A list built from an `items` array. Items can be static, links, buttons or
 * parents with nested items. With `value` or `defaultValue`, the List tracks a
 * selected item, shown with a bar on the start edge and `aria-current`. Name
 * the list with `aria-label` or a `subheader`. The theme key is
 * `components.CmList`, with the slots `root`, `item`, `itemButton` and `nested`.
 */
const meta = {
  component: List,
  args: { 'aria-label': 'Team', items: people },
  argTypes: {
    dense: { control: 'boolean' },
    disablePadding: { control: 'boolean' },
    items: { control: false },
  },
  decorators: [
    (Story) => (
      <Paper variant="outlined" sx={{ maxWidth: 360 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof List>

export default meta

type Story = StoryObj<typeof meta>

/** Static rows, with no buttons or links. */
export const Static: Story = {}

/** Items with `href` render through the theme's `LinkComponent`, as Link does. */
export const Links: Story = {
  args: {
    'aria-label': 'Sections',
    items: [
      { id: 'inbox', primary: 'Inbox', icon: <InboxIcon />, href: '#inbox' },
      { id: 'sent', primary: 'Sent', icon: <SendIcon />, href: '#sent' },
    ],
    value: 'inbox',
  },
}

/** A master-detail list: picking an item selects it and calls `onChange`. */
export const Selectable: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<string | number | null>('luis')
    return (
      <List
        {...args}
        aria-label="Conversations"
        items={[
          { id: 'ana', primary: 'Design review', secondary: 'Can we move it to 3pm?', end: '9:30' },
          { id: 'luis', primary: 'Release notes', secondary: 'Draft is ready for you', end: '8:12' },
          { id: 'eva', primary: 'Roadmap', secondary: 'Next quarter’s priorities', end: 'Mon' },
        ]}
        value={selected}
        onChange={(_, id) => setSelected(id)}
      />
    )
  },
}

/** Parents expand and collapse. The parents of the selected item start expanded. */
export const Nested: Story = {
  args: { 'aria-label': undefined, subheader: 'Settings', items: settings, value: 'plans' },
}

export const Dense: Story = {
  args: { dense: true, items: settings, value: 'profile' },
}

/** `avatar` goes before the text and `action` at the end, outside the item's button. */
export const WithAvatarsAndActions: Story = {
  args: {
    items: people.map((person) => ({
      ...person,
      avatar: <Avatar alt="">{String(person.primary).charAt(0)}</Avatar>,
      action: (
        <IconButton edge="end" aria-label={`Remove ${person.primary}`}>
          <DeleteIcon />
        </IconButton>
      ),
    })),
  },
}

/** The subheader names the list when `aria-label` isn't set. */
export const WithSubheader: Story = {
  args: { 'aria-label': undefined, subheader: 'Members', items: people },
}

export const Empty: Story = {
  args: { 'aria-label': undefined, subheader: 'Members', items: [] },
  render: (args) => (
    <Stack>
      <List {...args} />
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        No members yet.
      </Typography>
    </Stack>
  ),
}

/** A project theme sets dense lists and a rounded item button. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          CmList: {
            defaultProps: { dense: true },
            styleOverrides: {
              itemButton: ({ theme }) => ({ borderRadius: theme.shape.borderRadius, margin: theme.spacing(0, 1) }),
            },
          },
        },
      })}
    >
      <List {...args} items={settings} value="profile" />
    </CmThemeProvider>
  ),
}
