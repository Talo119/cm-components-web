import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Button } from '../Button/index.ts'
import { Link } from '../Link/index.ts'
import { Typography } from '../Typography/index.ts'
import { Card } from './index.ts'

// A plain SVG data URL, so stories don't depend on the network.
const placeholder = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="hsl(${hue}, 45%, 70%)"/><circle cx="320" cy="180" r="90" fill="hsl(${hue}, 45%, 55%)"/></svg>`,
  )}`

/**
 * MUI's `Card`, built from props. The parts are always in this order: the
 * image, the header, the content and the actions. Each is only rendered when
 * its props are set. The title is a `<span>` unless `slotProps.title` sets a
 * heading, such as `{ component: 'h3' }`.
 */
const meta = {
  component: Card,
  args: {
    title: 'Revenue',
    subheader: 'This month',
    children: <Typography variant="h3">$24,300</Typography>,
    sx: { maxWidth: 320 },
  },
  argTypes: {
    title: { control: 'text' },
    subheader: { control: 'text' },
    variant: { control: 'inline-radio', options: ['elevation', 'outlined'] },
    raised: { control: 'boolean' },
    children: { control: false },
    actions: { control: false },
    avatar: { control: false },
    headerAction: { control: false },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The default `elevation`, `outlined`, and `raised`. */
export const Variants: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <Card {...args} subheader="Elevation" />
      <Card {...args} subheader="Outlined" variant="outlined" />
      <Card {...args} subheader="Raised" raised />
    </Stack>
  ),
}

/** Each part on its own, then all of them together. */
export const Parts: Story = {
  render: () => (
    <Box
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}
    >
      <Card title="Header only" subheader="With a subheader" />
      <Card>
        <Typography variant="body2">Content only.</Typography>
      </Card>
      <Card image={{ src: placeholder(200), alt: '', height: 120 }} title="Image and header" />
      <Card actions={<Button size="small">Action</Button>}>
        <Typography variant="body2">Content and actions.</Typography>
      </Card>
      <Card
        avatar={<Avatar aria-hidden>AR</Avatar>}
        title="Ana Ruiz"
        subheader="Designer"
        headerAction={
          <IconButton aria-label="Options for Ana Ruiz">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Card
        image={{ src: placeholder(30), alt: '', height: 120 }}
        avatar={<Avatar aria-hidden>JD</Avatar>}
        title="Every part"
        subheader="Image, header, content and actions"
        headerAction={
          <IconButton aria-label="Options">
            <MoreVertIcon />
          </IconButton>
        }
        actions={
          <>
            <Button size="small">Share</Button>
            <Button size="small">Open</Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          The parts are always in this order.
        </Typography>
      </Card>
      <Card variant="outlined">
        <Typography variant="body2" color="text.secondary">
          An empty card shows its message as children.
        </Typography>
      </Card>
    </Box>
  ),
}

/**
 * A product card in a list, as an `<article>` with its title as an `<h3>`
 * that links to the product. The repeated button names the product it's for.
 */
export const HeadingAndLink: Story = {
  render: () => (
    <Card
      component="article"
      image={{ src: placeholder(45), alt: '', height: 180 }}
      title={<Link href="#">Desk lamp</Link>}
      subheader="$49"
      slotProps={{ title: { component: 'h3' } }}
      actions={
        <Button size="small" aria-label="Add Desk lamp to cart">
          Add to cart
        </Button>
      }
      sx={{ maxWidth: 320 }}
    >
      <Typography variant="body2" color="text.secondary">
        A brass lamp with a warm light, for reading at night.
      </Typography>
    </Card>
  ),
}

const products = [
  { id: 1, name: 'Desk lamp', price: '$49', hue: 45, summary: 'A brass lamp with a warm light.' },
  { id: 2, name: 'Notebook', price: '$12', hue: 200, summary: 'Dotted pages, lay-flat binding.' },
  { id: 3, name: 'Pen set', price: '$24', hue: 340, summary: 'Three fine pens.' },
  {
    id: 4,
    name: 'Bookends',
    price: '$35',
    hue: 120,
    summary: 'Heavy enough for a full shelf of hardcovers and atlases.',
  },
]

/**
 * A grid with a fixed image `height`, so the layout doesn't move as images
 * load. Equal heights come from the grid and `height: 100%`.
 */
export const Grid: Story = {
  render: () => (
    <Box
      component="ul"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 2,
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {products.map((product) => (
        <li key={product.id}>
          <Card
            component="article"
            image={{ src: placeholder(product.hue), alt: '', height: 140 }}
            title={<Link href="#">{product.name}</Link>}
            subheader={product.price}
            slotProps={{ title: { component: 'h3' } }}
            actions={
              <Button size="small" aria-label={`Add ${product.name} to cart`}>
                Add to cart
              </Button>
            }
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Typography variant="body2" color="text.secondary">
              {product.summary}
            </Typography>
          </Card>
        </li>
      ))}
    </Box>
  ),
}

/** A project's theme reaches the box through `MuiCard` and each part through its own key. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiCard: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: { root: { borderRadius: 16 } },
          },
          MuiCardHeader: { styleOverrides: { title: { fontWeight: 700 } } },
        },
      })}
    >
      <Card {...args} actions={<Button size="small">Details</Button>} />
    </CmThemeProvider>
  ),
}
