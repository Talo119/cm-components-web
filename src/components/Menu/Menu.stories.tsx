import ArchiveIcon from '@mui/icons-material/Archive'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Typography } from '../Typography/index.ts'
import { Menu } from './index.ts'
import type { MenuItemData } from './index.ts'

const exportItems: MenuItemData[] = [
  { id: 'csv', label: 'CSV' },
  { id: 'pdf', label: 'PDF' },
  { id: 'xlsx', label: 'Excel' },
]

/**
 * A menu of actions or links that opens from a `trigger` button. Menu keeps
 * the open state, puts `aria-haspopup`, `aria-expanded` and `aria-controls` on
 * the trigger, and closes after each choice. `ArrowDown` and `ArrowUp` on the
 * trigger open it on the first or last item. The theme key is
 * `components.CmMenu`, with the slots `root`, `paper` and `item`.
 */
const meta = {
  component: Menu,
  args: {
    trigger: <Button endIcon={<ExpandMoreIcon />}>Export</Button>,
    items: exportItems,
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    },
    dense: { control: 'boolean' },
    trigger: { control: false },
    items: { control: false },
  },
} satisfies Meta<typeof Menu>

export default meta

type Story = StoryObj<typeof meta>

export const ButtonTrigger: Story = {}

/** An icon-only trigger needs `aria-label`, which also names the menu. */
export const IconButtonTrigger: Story = {
  args: {
    trigger: (
      <IconButton aria-label="Options for Apollo">
        <MoreVertIcon />
      </IconButton>
    ),
    placement: 'bottom-end',
    items: [
      { id: 'edit', label: 'Edit', icon: <EditIcon /> },
      { id: 'duplicate', label: 'Duplicate', icon: <ContentCopyIcon /> },
      { id: 'archive', label: 'Archive', icon: <ArchiveIcon /> },
    ],
  },
  render: (args) => (
    <Stack direction="row" sx={{ justifyContent: 'flex-end', maxWidth: 400 }}>
      <Menu {...args} />
    </Stack>
  ),
}

/** `secondary` shows text at the end, such as a shortcut. `divider` separates groups. */
export const IconsShortcutsAndDividers: Story = {
  args: {
    trigger: <Button>Edit</Button>,
    items: [
      { id: 'cut', label: 'Cut', icon: <ContentCutIcon />, secondary: '⌘X' },
      { id: 'copy', label: 'Copy', icon: <ContentCopyIcon />, secondary: '⌘C' },
      { id: 'paste', label: 'Paste', icon: <ContentPasteIcon />, secondary: '⌘V', divider: true },
      { id: 'delete', label: 'Delete', icon: <DeleteIcon /> },
    ],
  },
}

/** Items with `href` render through the theme's `LinkComponent`, as Link does. */
export const Links: Story = {
  args: {
    trigger: <Button>Account</Button>,
    items: [
      { id: 'profile', label: 'Profile', href: '#profile' },
      { id: 'settings', label: 'Settings', href: '#settings' },
    ],
  },
}

/** A disabled item is shown but can't be chosen, and the arrow keys skip it. */
export const DisabledItem: Story = {
  args: {
    items: [
      { id: 'csv', label: 'CSV' },
      { id: 'pdf', label: 'PDF', disabled: true },
      { id: 'xlsx', label: 'Excel' },
    ],
  },
}

/** `open` and `onOpenChange`, so the menu can also open from code. */
export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    const [chosen, setChosen] = useState<string | number | null>(null)
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={2}>
          <Menu
            {...args}
            open={open}
            onOpenChange={(_, next) => setOpen(next)}
            onItemClick={(_, id) => setChosen(id)}
          />
          <Button variant="outlined" onClick={() => setOpen(true)}>
            Open from code
          </Button>
        </Stack>
        <Typography variant="body2">Chosen: {chosen ?? 'nothing yet'}</Typography>
      </Stack>
    )
  },
}

export const Dense: Story = {
  args: { dense: true },
}

/** A project theme opens every menu at the end, with a wider paper. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          CmMenu: {
            defaultProps: { placement: 'bottom-end' },
            styleOverrides: { paper: { minWidth: 200 }, item: { minHeight: 40 } },
          },
        },
      })}
    >
      <Stack direction="row" sx={{ justifyContent: 'flex-end', maxWidth: 400 }}>
        <Menu {...args} />
      </Stack>
    </CmThemeProvider>
  ),
}
