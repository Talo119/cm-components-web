import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Chip } from '../Chip/index.ts'
import { Tooltip } from './index.ts'

const placements = [
  'top-start',
  'top',
  'top-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
] as const

/**
 * MUI's `Tooltip`, with no changes. It opens on hover, keyboard focus and long
 * press, and `Escape` closes it. Without `describeChild`, a string `title`
 * becomes the child's `aria-label`, which suits icon-only buttons. A child
 * with visible text needs `describeChild`, so it keeps its own name.
 */
const meta = {
  component: Tooltip,
  args: {
    title: 'Delete',
    children: (
      <IconButton>
        <DeleteIcon />
      </IconButton>
    ),
  },
  argTypes: {
    title: { control: 'text' },
    placement: { control: 'select', options: placements },
    arrow: { control: 'boolean' },
    describeChild: { control: 'boolean' },
    disableInteractive: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

/** An icon-only button, named by the tooltip's `title`. */
export const OnIconButton: Story = {}

/** Every placement. Each one flips when there's no room. */
export const Placements: Story = {
  render: (args) => (
    <Box
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 2, p: 6 }}
    >
      {placements.map((placement) => (
        <Tooltip {...args} key={placement} title={placement} placement={placement} describeChild>
          <Button variant="outlined">{placement}</Button>
        </Tooltip>
      ))}
    </Box>
  ),
}

export const Arrow: Story = {
  args: { arrow: true },
}

/**
 * A button with visible text keeps its name, and the tooltip is linked as its
 * description while it's open. Without `describeChild`, the button's name
 * would become the tooltip's text.
 */
export const DescribeChild: Story = {
  render: () => (
    <Tooltip title="Saves without publishing" describeChild>
      <Button>Save draft</Button>
    </Tooltip>
  ),
}

/**
 * A disabled button doesn't receive pointer events, so it's wrapped in a
 * `<span>`. Keyboard users still can't reach it, so a reason that matters
 * must also be shown somewhere visible.
 */
export const OnDisabledButton: Story = {
  render: () => (
    <Tooltip title="You don’t have permission to delete" describeChild>
      <span>
        <Button disabled>Delete</Button>
      </span>
    </Tooltip>
  ),
}

/** The full text of a Chip label that's cut off with an ellipsis. */
export const LongChipLabel: Story = {
  render: () => (
    <Tooltip title="ana.ruiz@example.com" placement="top" arrow describeChild>
      <Chip label="ana.ruiz@example.com" sx={{ maxWidth: 120 }} />
    </Tooltip>
  ),
}

/**
 * With `enterNextDelay`, moving between nearby buttons opens the next tooltip
 * without waiting again.
 */
export const Toolbar: Story = {
  render: () => (
    <Stack direction="row" role="toolbar" aria-label="Document">
      {[
        { title: 'Edit', icon: <EditIcon /> },
        { title: 'Share', icon: <ShareIcon /> },
        { title: 'Delete', icon: <DeleteIcon /> },
      ].map(({ title, icon }) => (
        <Tooltip key={title} title={title} enterNextDelay={0}>
          <IconButton>{icon}</IconButton>
        </Tooltip>
      ))}
    </Stack>
  ),
}

/** A project's theme can change the tooltip and its default props. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiTooltip: {
            defaultProps: { arrow: true, placement: 'top' },
            styleOverrides: { tooltip: ({ theme }) => ({ ...theme.typography.caption }) },
          },
        },
      })}
    >
      <Tooltip {...args} />
    </CmThemeProvider>
  ),
}
