import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptIcon from '@mui/icons-material/Receipt'
import SettingsIcon from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { AppBar } from '../AppBar/index.ts'
import { Avatar } from '../Avatar/index.ts'
import { Badge } from '../Badge/index.ts'
import { Typography } from '../Typography/index.ts'
import { Sidebar } from './index.ts'
import type { SidebarItem, SidebarSection } from './index.ts'

const flat: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: <HomeIcon />, href: '#overview' },
  { id: 'orders', label: 'Orders', icon: <ReceiptIcon />, href: '#orders' },
  { id: 'customers', label: 'Customers', icon: <PeopleIcon />, href: '#customers' },
]

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Overview', icon: <HomeIcon />, href: '#overview' },
      { id: 'orders', label: 'Orders', icon: <ReceiptIcon />, href: '#orders', end: 12 },
      {
        id: 'customers',
        label: 'Customers',
        icon: <PeopleIcon />,
        children: [
          { id: 'customers-list', label: 'All customers', href: '#customers' },
          { id: 'segments', label: 'Segments', href: '#segments' },
        ],
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    items: [{ id: 'settings', label: 'Settings', icon: <SettingsIcon />, href: '#settings' }],
  },
]

const header = (
  <Typography variant="h6" component="p">
    Acme
  </Typography>
)

const footer = (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
    <Avatar alt="">A</Avatar>
    <Typography variant="body2">Ana Torres</Typography>
  </Stack>
)

/**
 * An app's main navigation in a column at the side, built on MUI's `Drawer`
 * and the library's List. `responsive`, the default, is permanent from
 * `breakpoint` up and a temporary drawer below it, and both are rendered so
 * the server's HTML already matches the screen. Following a link in the
 * temporary drawer closes it. The button that opens it is the consumer's. The
 * theme key is `components.CmSidebar`, with the slots `root`, `paper`,
 * `header`, `nav` and `footer`. The drawer's paper is fixed to the window, so
 * these stories show it in a frame of their own.
 */
const meta = {
  component: Sidebar,
  args: { sections, value: 'orders', variant: 'permanent' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['responsive', 'permanent', 'temporary'] },
    breakpoint: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    anchor: { control: 'inline-radio', options: ['left', 'right'] },
    sections: { control: false },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

/** One section without a title. */
export const Items: StoryObj = {
  render: () => <Sidebar items={flat} value="overview" variant="permanent" />,
}

/** Section titles name their lists, and a divider separates sections. */
export const Sections: Story = {}

/** Parents expand and collapse. The parents of the current page start expanded. */
export const NestedItems: Story = {
  args: { value: 'segments' },
}

/** `end` shows non-interactive content, such as a count. */
export const CountsInEnd: Story = {
  args: {
    sections: [
      {
        id: 'mail',
        items: [
          { id: 'inbox', label: 'Inbox', href: '#inbox', end: <Badge badgeContent={4} sx={{ mr: 1 }} /> },
          { id: 'drafts', label: 'Drafts', href: '#drafts', end: 2 },
        ],
      },
    ],
    value: 'inbox',
  },
}

/** `header` and `footer` stay put while the `<nav>` scrolls between them. */
export const HeaderAndFooter: Story = {
  args: { header, footer },
}

/**
 * A layout with an AppBar in the content column. Narrow the viewport below
 * `md`: the sidebar becomes a temporary drawer, opened from the AppBar's button.
 */
export const Responsive: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState<string | number>('orders')
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          sections={sections}
          value={current}
          onItemClick={(_, id) => setCurrent(id)}
          open={open}
          onOpenChange={(_, next) => setOpen(next)}
          header={header}
          footer={footer}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <AppBar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="p">
              {String(current)}
            </Typography>
          </AppBar>
          <Box component="main" sx={{ p: 3 }}>
            <Typography variant="body2">The page’s content.</Typography>
          </Box>
        </Box>
      </Box>
    )
  },
}

/** The same layout on a phone-sized viewport. */
export const ResponsiveNarrow: StoryObj = {
  ...Responsive,
  globals: { viewport: { value: 'mobile1' } },
}

/** Always a temporary drawer, opened from a button. */
export const Temporary: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <Box sx={{ p: 2 }}>
        <IconButton aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Sidebar
          sections={sections}
          value="orders"
          variant="temporary"
          open={open}
          onOpenChange={(_, next) => setOpen(next)}
          header={header}
        />
      </Box>
    )
  },
}

/** On the right side. Place it last in the flex row. */
export const AnchorRight: Story = {
  args: { anchor: 'right' },
}

/** A project theme makes every sidebar wider, with a header in `primary` colors. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  args: { header },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          CmSidebar: {
            defaultProps: { width: 280 },
            styleOverrides: {
              header: ({ theme }) => ({
                backgroundColor: (theme.vars || theme).palette.primary.dark,
                color: (theme.vars || theme).palette.primary.contrastText,
              }),
            },
          },
        },
      })}
    >
      <Sidebar {...args} />
    </CmThemeProvider>
  ),
}
