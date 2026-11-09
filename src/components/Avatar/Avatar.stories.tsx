import FolderIcon from '@mui/icons-material/Folder'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Typography } from '../Typography/index.ts'
import { Avatar } from './index.ts'

/** A stand-in photo, inline so the stories work offline. */
const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#6b8fb5"/><circle cx="40" cy="31" r="15" fill="#f1d3b8"/><path d="M12 80c3-18 15-26 28-26s25 8 28 26z" fill="#2f4a68"/></svg>',
)}`

/**
 * MUI's `Avatar`. Under the library theme, initials, icons and the fallback
 * are `common.white` on `grey[500]`, which meets 4.5:1 on both color schemes.
 * Avatars with a working image aren't affected.
 */
const meta = {
  component: Avatar,
  args: { children: 'JD' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['circular', 'rounded', 'square'] },
    children: { control: 'text' },
    src: { control: 'text' },
    alt: { control: 'text' },
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Initials stand alone here, so they get `role="img"` and an `aria-label`
 * with the full name. Otherwise screen readers read "J D".
 */
export const Default: Story = {
  args: { role: 'img', 'aria-label': 'Jane Doe' },
}

/** Pass `alt` with the person's name, or `alt=""` when the name is shown next to it. */
export const Image: Story = {
  args: { src: photo, alt: 'Ana Ruiz', children: undefined },
}

/**
 * An icon carries no name. Pass `role="img"` and `aria-label` if it means
 * something, as here.
 */
export const Contents: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Avatar src={photo} alt="Ana Ruiz" />
      <Avatar role="img" aria-label="Jane Doe">
        JD
      </Avatar>
      <Avatar role="img" aria-label="Folder">
        <FolderIcon />
      </Avatar>
      <Avatar />
    </Stack>
  ),
}

export const Variants: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <Avatar {...args} variant="circular" />
      <Avatar {...args} variant="rounded" />
      <Avatar {...args} variant="square" />
    </Stack>
  ),
}

/**
 * When the image fails, Avatar shows the children, then the first letter of
 * `alt`, then the person icon.
 */
export const FailingImage: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Avatar src="/does-not-exist.jpg" alt="Ana Ruiz">
        AR
      </Avatar>
      <Avatar src="/does-not-exist.jpg" alt="Ana Ruiz" />
      <Avatar src="/does-not-exist.jpg" />
    </Stack>
  ),
}

/**
 * Set `width` and `height` with `sx`, and `fontSize` too, because initials
 * keep their 20px font otherwise. Pass at most two letters.
 */
export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Avatar {...args} sx={{ width: 24, height: 24, fontSize: '0.75rem' }} />
      <Avatar {...args} />
      <Avatar {...args} sx={{ width: 56, height: 56, fontSize: '1.5rem' }} />
      <Avatar src={photo} alt="Ana Ruiz" sx={{ width: 56, height: 56 }} />
    </Stack>
  ),
}

/**
 * The name is shown next to the avatar, so the image gets `alt=""` and the
 * initials `aria-hidden`.
 */
export const InAList: Story = {
  render: () => (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar src={photo} alt="" />
        <Typography>Ana Ruiz</Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar aria-hidden>JD</Avatar>
        <Typography>Jane Doe</Typography>
      </Stack>
    </Stack>
  ),
}

/**
 * A color per person goes in `sx={{ bgcolor }}`, and must keep 4.5:1 with
 * the text. The library doesn't check it.
 */
export const CustomColor: Story = {
  args: { sx: { bgcolor: 'hsl(210, 100%, 30%)' } },
}

/**
 * A `styleOverrides.root` object merges with the library's fallback colors.
 * A project's own `colorDefault` replaces them, because style functions
 * don't merge, so it must keep 4.5:1 itself.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiAvatar: {
            defaultProps: { variant: 'rounded' },
            styleOverrides: {
              root: { fontWeight: 600 },
              colorDefault: ({ theme }) => ({
                color: (theme.vars || theme).palette.common.white,
                backgroundColor: (theme.vars || theme).palette.primary.dark,
              }),
            },
          },
        },
      })}
    >
      <Stack direction="row" spacing={2}>
        <Avatar {...args} />
        <Avatar src={photo} alt="Ana Ruiz" />
      </Stack>
    </CmThemeProvider>
  ),
}
