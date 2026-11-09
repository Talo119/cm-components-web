import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Rating } from './index.ts'

/**
 * MUI's `Rating` with `label`, `helperText`, `error` and `required` built in,
 * for a score on a small fixed scale. The root is a MUI `FormControl`. The
 * stars sit in an element with `role="radiogroup"`, named by the label, or
 * `role="img"` when `readOnly`. `aria-label`, `aria-labelledby` and
 * `aria-describedby` reach that element. Under the library theme, filled
 * stars are `warning.main` and empty stars `grey[500]`.
 */
const meta = {
  component: Rating,
  args: { label: 'How was your order?' },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    max: { control: { type: 'number', min: 1, max: 10 } },
    precision: { control: 'inline-radio', options: [0.5, 1] },
    readOnly: { control: 'boolean' },
    highlightSelectedOnly: { control: 'boolean' },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  args: { defaultValue: 4 },
}

/** With `precision={0.5}`, the stars fill by halves. */
export const HalfStars: Story = {
  args: { label: 'Quality', defaultValue: 2.5, precision: 0.5 },
}

/** Only the selected icon is filled, as for a scale where each value stands alone. */
export const HighlightSelectedOnly: Story = {
  args: { label: 'Difficulty', defaultValue: 3, highlightSelectedOnly: true },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack spacing={3}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <Rating {...args} key={size} label={size} size={size} defaultValue={3} />
      ))}
    </Stack>
  ),
}

/** `max` sets the number of stars. Values above 10 are out of scope. */
export const Max: Story = {
  args: { label: 'Out of 10', max: 10, defaultValue: 7 },
}

/**
 * Shows a score without inputs. The `img` is named by the label and the value,
 * so screen readers announce "Average rating, 4.5 Stars".
 */
export const ReadOnlyHalfStars: Story = {
  args: { label: 'Average rating', value: 4.5, precision: 0.5, readOnly: true, size: 'small' },
}

export const States: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <Rating {...args} label="No rating" defaultValue={null} />
      <Rating {...args} label="Required" required />
      <Rating {...args} label="Read-only" value={3} readOnly />
      <Rating {...args} label="Disabled" defaultValue={3} disabled />
    </Stack>
  ),
}

/**
 * The helper text sits below the stars, with no indent. `error` colors the
 * label and helper text, and sets `aria-invalid` on the group. The stars keep
 * their colors.
 */
export const HelperTextAndError: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <Rating {...args} label="Quality" helperText="Your review is public" />
      <Rating {...args} label="Quality" required error helperText="Choose a rating" />
    </Stack>
  ),
}

/** Without `label`, name the group with `aria-label` or `aria-labelledby`. */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Rate this answer', max: 3 },
}

/**
 * Controlled with `value` and `onChange`. Picking the current value again
 * clears it, so `onChange` reports `null`. `onChangeActive` reports the
 * hovered value, which this story shows as text.
 */
export const Controlled: Story = {
  render: function Render(args) {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']
    const [score, setScore] = useState<number | null>(3)
    const [hovered, setHovered] = useState(-1)
    const shown = hovered !== -1 ? hovered : score

    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
          <Rating
            label={args.label}
            size={args.size}
            value={score}
            onChange={(_, value) => setScore(value)}
            onChangeActive={(_, value) => setHovered(value)}
          />
          <Typography variant="body2" sx={{ minWidth: 80 }}>
            {shown == null ? 'No rating' : labels[shown]}
          </Typography>
        </Stack>
        <Button variant="outlined" onClick={() => setScore(null)}>
          Clear
        </Button>
      </Stack>
    )
  },
}

/**
 * `required` shows the asterisk and sets `aria-required`, but doesn't stop a
 * native submit, because MUI checks a hidden "Empty" radio when there's no
 * value. Validate the value yourself, as this form does. The value is
 * submitted under `name`.
 */
export const ReviewForm: Story = {
  render: function Render(args) {
    const [quality, setQuality] = useState<number | null>(null)
    const [attempted, setAttempted] = useState(false)
    const [submitted, setSubmitted] = useState<string | null>(null)
    const missing = attempted && quality == null
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setAttempted(true)
      if (quality == null) return
      setSubmitted(String(new FormData(event.currentTarget).get('quality')))
    }

    return (
      <Stack component="form" spacing={2} sx={{ alignItems: 'flex-start' }} onSubmit={handleSubmit}>
        <Rating
          {...args}
          label="Quality"
          name="quality"
          value={quality}
          onChange={(_, value) => setQuality(value)}
          required
          error={missing}
          helperText={missing ? 'Choose a rating' : ' '}
        />
        <Button type="submit" variant="contained">
          Submit review
        </Button>
        {submitted && <span>Submitted quality: {submitted}</span>}
      </Stack>
    )
  },
}

/**
 * The MUI keys reach every part: `MuiRating`, `MuiFormControl`,
 * `MuiFormLabel` and `MuiFormHelperText`. A project's own `root` or
 * `iconEmpty` replaces the library's star colors.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiRating: {
            defaultProps: { size: 'large' },
            styleOverrides: { root: ({ theme }) => ({ color: (theme.vars || theme).palette.primary.main }) },
          },
          MuiFormLabel: { styleOverrides: { root: { fontWeight: 600 } } },
        },
      })}
    >
      <Rating {...args} defaultValue={4} helperText="Styled by the project's theme" />
    </CmThemeProvider>
  ),
}
