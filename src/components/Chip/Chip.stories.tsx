import DoneIcon from '@mui/icons-material/Done'
import FaceIcon from '@mui/icons-material/Face'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Typography } from '../Typography/index.ts'
import { Chip } from './index.ts'

const colors = ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'] as const

/**
 * MUI's `Chip`. Under the library theme, the delete icon of a default chip is
 * `text.secondary`, which meets 3:1, and initials in its avatar are
 * `common.white`. Colored chips keep MUI's colors.
 */
const meta = {
  component: Chip,
  args: { label: 'Draft' },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'inline-radio', options: ['filled', 'outlined'] },
    color: { control: 'select', options: colors },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    clickable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Chip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The palette sets the contrast of colored chips. Filled `primary` and `info`
 * labels are below 4.5:1, and outlined `success`, `info` and dark-mode
 * `error` labels are below 3:1 against the background.
 */
export const VariantsAndColors: Story = {
  render: (args) => (
    <Stack spacing={1}>
      {(['filled', 'outlined'] as const).map((variant) => (
        <Stack direction="row" spacing={1} key={variant}>
          {colors.map((color) => (
            <Chip {...args} key={color} label={color} color={color} variant={variant} />
          ))}
        </Stack>
      ))}
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Chip {...args} size="small" label="Small" />
      <Chip {...args} size="medium" label="Medium" />
    </Stack>
  ),
}

/**
 * `icon` and `avatar` must be elements. An avatar beside the label gets
 * `alt=""`, or `aria-hidden` for initials, because the label names the person.
 */
export const IconAndAvatar: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Chip {...args} icon={<FaceIcon />} label="With icon" />
      <Chip {...args} avatar={<Avatar aria-hidden>AR</Avatar>} label="Ana Ruiz" />
      <Chip {...args} avatar={<Avatar aria-hidden>JD</Avatar>} label="Jane Doe" variant="outlined" />
    </Stack>
  ),
}

/**
 * Clickable and deletable chips are buttons that `Tab` reaches, with the
 * theme's focus ring. `Enter` and `Space` call `onClick`, and `Backspace`
 * and `Delete` call `onDelete`. Clicking the delete icon only calls
 * `onDelete`.
 */
export const ClickableAndDeletable: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Chip {...args} label="Clickable" onClick={() => console.log('Clicked')} />
      <Chip {...args} label="Deletable" onDelete={() => console.log('Deleted')} />
      <Chip
        {...args}
        label="Both"
        onClick={() => console.log('Clicked')}
        onDelete={() => console.log('Deleted')}
      />
      <Chip
        {...args}
        label="Custom delete icon"
        onDelete={() => console.log('Deleted')}
        deleteIcon={<DoneIcon />}
      />
    </Stack>
  ),
}

/**
 * Disabled chips are dimmed, can't be clicked and are out of the tab order.
 * The library theme sets `skipFocusWhenDisabled`, because MUI leaves a chip
 * with only `onDelete` focusable, where `Backspace` would still delete it.
 */
export const Disabled: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1}>
      <Chip {...args} label="Static" disabled />
      <Chip {...args} label="Clickable" disabled onClick={() => console.log('Clicked')} />
      <Chip {...args} label="Deletable" disabled onDelete={() => console.log('Deleted')} />
      <Chip
        {...args}
        label="Clickable and deletable"
        disabled
        onClick={() => console.log('Clicked')}
        onDelete={() => console.log('Deleted')}
      />
    </Stack>
  ),
}

/**
 * The label is cut off with an ellipsis at the container's width, or at a
 * `maxWidth` set with `sx`. Give the full text another way.
 */
export const LongLabel: Story = {
  args: {
    label: 'A label long enough to be cut off at the edge of its container',
    sx: { maxWidth: 240 },
  },
}

/** `component="a"` with `href` and `clickable` renders a link. */
export const AsLink: Story = {
  render: () => <Chip label="Docs" component="a" href="#" clickable />,
}

/**
 * Filters that turn on and off. `aria-pressed` tells screen readers the
 * state, and the icon and variant show it without relying on color.
 */
export const FilterChips: Story = {
  render: function Render() {
    const [filters, setFilters] = useState<Record<string, boolean>>({
      'Only open': true,
      Assigned: false,
      'High priority': false,
    })
    return (
      <Stack direction="row" spacing={1} role="group" aria-label="Filters">
        {Object.entries(filters).map(([label, on]) => (
          <Chip
            key={label}
            label={label}
            icon={on ? <DoneIcon /> : undefined}
            variant={on ? 'filled' : 'outlined'}
            onClick={() => setFilters({ ...filters, [label]: !on })}
            aria-pressed={on}
          />
        ))}
      </Stack>
    )
  },
}

/**
 * Chip reports `onDelete` and doesn't remove itself. Focus is lost after a
 * delete unless the consumer moves it. The helper text tells keyboard users
 * how to remove a chip, because the delete icon isn't announced.
 */
export const RemovableRecipients: Story = {
  render: function Render() {
    const [recipients, setRecipients] = useState([
      { id: 1, name: 'Ana Ruiz', initials: 'AR' },
      { id: 2, name: 'Jane Doe', initials: 'JD' },
      { id: 3, name: 'Li Wei', initials: 'LW' },
    ])
    return (
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {recipients.map((recipient) => (
            <Chip
              key={recipient.id}
              label={recipient.name}
              avatar={<Avatar aria-hidden>{recipient.initials}</Avatar>}
              onDelete={() => setRecipients(recipients.filter(({ id }) => id !== recipient.id))}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Press Backspace or Delete on a recipient to remove it.
        </Typography>
      </Stack>
    )
  },
}

/**
 * A `styleOverrides.root` object merges with the library's delete icon and
 * avatar colors. A project's own `deleteIcon` or `avatar` replaces them,
 * because style functions don't merge.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiChip: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } },
          },
        },
      })}
    >
      <Stack direction="row" spacing={1}>
        <Chip {...args} />
        <Chip
          {...args}
          label="Ana Ruiz"
          avatar={<Avatar aria-hidden>AR</Avatar>}
          onDelete={() => console.log('Deleted')}
        />
      </Stack>
    </CmThemeProvider>
  ),
}
