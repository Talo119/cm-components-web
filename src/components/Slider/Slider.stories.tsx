import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Slider } from './index.ts'

const priceLabel = (index: number) => (index === 0 ? 'Minimum price' : 'Maximum price')

/**
 * MUI's `Slider` with `label`, `helperText` and `error` built in, for a value
 * where the position in a range matters more than the exact number. The root
 * is a MUI `FormControl` that fills its container. `aria-label`,
 * `aria-labelledby` and `aria-describedby` reach every thumb's `<input>`.
 * Under the library theme, the rail is `grey[500]`, which meets 3:1.
 */
const meta = {
  component: Slider,
  args: { label: 'Volume', defaultValue: 30 },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
    },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    valueLabelDisplay: { control: 'inline-radio', options: ['off', 'auto', 'on'] },
    track: { control: 'inline-radio', options: ['normal', 'inverted', false] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <Stack sx={{ maxWidth: 360, px: 2 }}>
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Two thumbs over the same rail. Name each one with `getAriaLabel`: the root
 * becomes a group named by the label, so screen readers announce "Price" and
 * then "Minimum price".
 */
export const Range: Story = {
  args: {
    label: 'Price',
    defaultValue: [100, 300],
    min: 0,
    max: 500,
    step: 10,
    getAriaLabel: priceLabel,
    getAriaValueText: (value: number) => `${value} dollars`,
  },
}

/** With `step={null}`, the values are limited to `marks`. */
export const Marks: Story = {
  args: {
    label: 'Zoom',
    defaultValue: 100,
    min: 50,
    max: 200,
    step: null,
    marks: [
      { value: 50, label: '50%' },
      { value: 100, label: '100%' },
      { value: 150, label: '150%' },
      { value: 200, label: '200%' },
    ],
    getAriaValueText: (value: number) => `${value} percent`,
  },
}

/** `marks={true}` adds one dot per step. Keep the steps few. */
export const MarksPerStep: Story = {
  args: { label: 'Rating', defaultValue: 3, min: 1, max: 5, marks: true },
}

/**
 * The value above the thumb, always, on hover and focus, or never. At `min`
 * and `max` the bubble can overflow its container, so leave room for it.
 */
export const ValueLabel: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <Slider {...args} label="On hover and focus" valueLabelDisplay="auto" />
      <Slider
        {...args}
        label="Always"
        valueLabelDisplay="on"
        valueLabelFormat={(value) => `${value}%`}
        sx={{ pt: 3 }}
      />
    </Stack>
  ),
}

export const States: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <Slider {...args} label="Default" />
      <Slider {...args} label="Disabled" disabled />
      <Slider label="Disabled range" defaultValue={[20, 60]} getAriaLabel={priceLabel} disabled />
    </Stack>
  ),
}

/**
 * The helper text sits below the slider, with no indent. `error` colors the
 * label and helper text, and the slider keeps its color.
 */
export const HelperTextAndError: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <Slider {...args} label="Brightness" helperText="Applies to every screen" />
      <Slider {...args} label="Brightness" error helperText="Could not save. Try again." />
    </Stack>
  ),
}

export const ColorsAndSizes: Story = {
  render: (args) => (
    <Stack spacing={1}>
      {(['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const).map((color) => (
        <Slider {...args} key={color} label={color} color={color} />
      ))}
      <Slider {...args} label="small" size="small" />
    </Stack>
  ),
}

/** The inverted rail is the colored part of the slider, so it keeps MUI's color. */
export const Track: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <Slider {...args} label="Normal" />
      <Slider {...args} label="Inverted" track="inverted" />
      <Slider {...args} label="No track" track={false} />
    </Stack>
  ),
}

/** A vertical slider needs a height from the consumer, set here on the root. */
export const Vertical: Story = {
  args: { label: 'Gain', orientation: 'vertical', sx: { height: 200 } },
}

/** A long label wraps above the slider. */
export const LongLabel: Story = {
  args: { label: 'Volume of notification sounds, alarms and incoming calls on this device' },
}

/**
 * Without `label`, only the slider renders, so give it `aria-label` or
 * `aria-labelledby`, or `getAriaLabel` for a range.
 */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Opacity', size: 'small' },
}

/**
 * A filter that searches when the user lets go of a thumb, or after a key
 * press. `onChange` only updates the shown range, so dragging doesn't send a
 * request on every step.
 */
export const PriceRangeFilter: Story = {
  render: function Render() {
    const [price, setPrice] = useState<number[]>([100, 300])
    const [searches, setSearches] = useState<string[]>([])

    return (
      <Stack spacing={1}>
        <Slider
          label="Price"
          value={price}
          onChange={(_, value) => setPrice(value)}
          onChangeCommitted={(_, value) =>
            setSearches((list) => [`$${value[0]} to $${value[1]}`, ...list].slice(0, 3))
          }
          min={0}
          max={500}
          step={10}
          valueLabelDisplay="auto"
          getAriaLabel={priceLabel}
          getAriaValueText={(value) => `${value} dollars`}
          helperText={`$${price[0]} to $${price[1]}. Prices include taxes.`}
        />
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {searches.length === 0 ? 'No searches yet' : `Searched: ${searches.join(', ')}`}
        </Typography>
      </Stack>
    )
  },
}

/**
 * The MUI keys reach every part: `MuiSlider`, `MuiFormControl`, `MuiFormLabel`
 * and `MuiFormHelperText`. A project's own `rail` in `MuiSlider.styleOverrides`
 * replaces the library's rail color, so keep it at 3:1 or more.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiSlider: {
            defaultProps: { color: 'secondary' },
            styleOverrides: { thumb: { borderRadius: 4 } },
          },
          MuiFormLabel: { styleOverrides: { root: { fontWeight: 600 } } },
        },
      })}
    >
      <Slider {...args} helperText="Styled by the project's theme" />
    </CmThemeProvider>
  ),
}
