import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Menu } from '../Menu/index.ts'
import { Typography } from '../Typography/index.ts'
import { Navbar } from './index.ts'
import type { NavbarItem } from './index.ts'

const links: NavbarItem[] = [
  { id: 'products', label: 'Products', href: '#products' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'customers', label: 'Customers', href: '#customers' },
]

const withGroups: NavbarItem[] = [
  { id: 'products', label: 'Products', href: '#products' },
  {
    id: 'resources',
    label: 'Resources',
    children: [
      { id: 'docs', label: 'Docs', href: '#docs' },
      { id: 'blog', label: 'Blog', href: '#blog' },
    ],
  },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
]

const brand = (
  <Typography variant="h6" component="span">
    Acme
  </Typography>
)

/**
 * The site's main navigation in an AppBar: the brand, the links, groups of
 * links in a Menu, the current page marked with `aria-current="page"` and a
 * line, and `actions` at the end. Below `collapseBelow`, `md` by default, the
 * links move into a Menu behind a button. Both layouts are rendered and CSS
 * hides one, so the server's HTML already matches the screen. The theme key is
 * `components.CmNavbar`, with the slots `root`, `brand`, `nav`, `item` and
 * `actions`.
 */
const meta = {
  component: Navbar,
  args: { items: links, value: 'products', brand, brandHref: '#', position: 'static' },
  argTypes: {
    collapseBelow: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl', false] },
    color: { control: 'inline-radio', options: ['default', 'primary', 'secondary', 'transparent'] },
    items: { control: false },
    brand: { control: false },
  },
} satisfies Meta<typeof Navbar>

export default meta

type Story = StoryObj<typeof meta>

export const LinksOnly: Story = {}

/** A group opens a Menu of its links. */
export const WithGroups: Story = {
  args: { items: withGroups },
}

/** `actions` stays visible on every screen size. */
export const WithAccountMenu: Story = {
  args: {
    items: withGroups,
    actions: (
      <>
        <IconButton color="inherit" aria-label="Search">
          <SearchIcon />
        </IconButton>
        <Menu
          trigger={
            <IconButton aria-label="Account">
              <Avatar alt="" sx={{ width: 32, height: 32 }}>
                A
              </Avatar>
            </IconButton>
          }
          placement="bottom-end"
          items={[
            { id: 'profile', label: 'Profile', href: '#profile' },
            { id: 'sign-out', label: 'Sign out' },
          ]}
        />
      </>
    ),
  },
}

/** Below `md`, the links move into a Menu, with each group's links between dividers. */
export const CollapsedOnANarrowViewport: Story = {
  args: { items: withGroups, value: 'docs' },
  globals: { viewport: { value: 'mobile1' } },
  render: (args) => (
    <Box sx={{ maxWidth: 375 }}>
      <Navbar {...args} />
    </Box>
  ),
}

/** The group holding the current page shows as current, and the page is marked in its Menu. */
export const CurrentItemInsideAGroup: Story = {
  args: { items: withGroups, value: 'blog' },
}

/** On a colored bar, links keep the bar's text color, and the line marks the current page. */
export const PrimaryColor: Story = {
  args: { items: withGroups, color: 'primary' },
}

/** A project theme collapses later, at `lg`, and spaces the brand further from the links. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  args: { items: withGroups },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          CmNavbar: {
            defaultProps: { collapseBelow: 'lg' },
            styleOverrides: { brand: { marginRight: 32 } },
          },
        },
      })}
    >
      <Navbar {...args} />
    </CmThemeProvider>
  ),
}
