import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { RadioGroup } from './index.ts'
import type { RadioOption } from './index.ts'

const plans: RadioOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
]

/**
 * Picks one value from a few options that stay visible. Takes an `options`
 * array and puts MUI's `FormControl`, `FormLabel`, `RadioGroup`,
 * `FormControlLabel`, `Radio` and `FormHelperText` together. The root is the
 * `FormControl`. `aria-label`, `aria-labelledby` and `aria-describedby` reach
 * the element with `role="radiogroup"`.
 */
const meta = {
  component: RadioGroup,
  args: { label: 'Plan', options: plans },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'default'],
    },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    row: { control: 'boolean' },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: { defaultValue: 'pro' },
}

/** Options side by side, wrapping onto more lines when they don't fit. */
export const Row: Story = {
  args: { row: true, defaultValue: 'free' },
}

export const States: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <RadioGroup {...args} label="Nothing selected" />
      <RadioGroup {...args} label="Required" required />
      <RadioGroup {...args} label="Disabled" disabled defaultValue="pro" />
      <RadioGroup
        {...args}
        label="Disabled option"
        options={[...plans.slice(0, 2), { value: 'team', label: 'Team', disabled: true }]}
      />
    </Stack>
  ),
}

/**
 * The helper text sits below the options, with no indent. `error` colors the
 * group label and helper text, and sets `aria-invalid` on the group.
 */
export const HelperTextAndError: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <RadioGroup {...args} label="Delivery" helperText="Express costs €5 more" />
      <RadioGroup {...args} label="Plan" required error helperText="Pick a plan" />
    </Stack>
  ),
}

export const ColorsAndSizes: Story = {
  render: (args) => (
    <Stack spacing={3}>
      {(['primary', 'secondary', 'success', 'error'] as const).map((color) => (
        <RadioGroup {...args} key={color} label={color} color={color} row defaultValue="pro" />
      ))}
      {(['small', 'medium'] as const).map((size) => (
        <RadioGroup {...args} key={size} label={size} size={size} row defaultValue="pro" />
      ))}
    </Stack>
  ),
}

/**
 * A long label wraps, and the radio stays centered on it, as in MUI. With
 * `row`, a long label takes a line of its own when it wraps.
 */
export const LongLabels: Story = {
  args: {
    label: 'Notification frequency',
    options: [
      { value: 'instant', label: 'Instantly, every time someone mentions you or replies to you' },
      { value: 'daily', label: 'Once a day, in a summary sent every morning' },
      { value: 'never', label: 'Never' },
    ],
  },
  render: (args) => (
    <Stack spacing={3} sx={{ maxWidth: 320 }}>
      <RadioGroup {...args} />
      <RadioGroup {...args} row />
    </Stack>
  ),
}

/** Without `label`, name the group with `aria-label` or `aria-labelledby`. */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Plan', row: true },
}

/**
 * Controlled with `value` and `onChange`. `Value` is inferred from `options`,
 * so `onChange` reports `'free' | 'pro' | 'team'`. Only the look comes from
 * the controls, because their `value` is any string.
 */
export const Controlled: Story = {
  render: function Render(args) {
    const options = [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'team', label: 'Team' },
    ] as const
    const [plan, setPlan] = useState<(typeof options)[number]['value'] | null>(null)

    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <RadioGroup
          label={args.label}
          row={args.row}
          color={args.color}
          size={args.size}
          options={options}
          value={plan}
          onChange={(_, value) => setPlan(value)}
        />
        <span>Selected: {plan ?? 'nothing'}</span>
        <Button variant="outlined" onClick={() => setPlan(null)}>
          Clear
        </Button>
      </Stack>
    )
  },
}

/**
 * Inside a form, the selected value is submitted under `name`, and `required`
 * makes the browser's validation stop on a group with nothing selected.
 */
export const InsideAForm: Story = {
  render: function Render(args) {
    const [submitted, setSubmitted] = useState<string | null>(null)
    const deliveryOptions: RadioOption[] = [
      { value: 'standard', label: 'Standard' },
      { value: 'express', label: 'Express' },
    ]
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitted(String(new FormData(event.currentTarget).get('delivery')))
    }

    return (
      <Stack component="form" spacing={2} sx={{ alignItems: 'flex-start' }} onSubmit={handleSubmit}>
        <RadioGroup
          {...args}
          label="Delivery"
          name="delivery"
          options={deliveryOptions}
          required
          helperText="Express costs €5 more"
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
        {submitted && <span>Submitted delivery: {submitted}</span>}
      </Stack>
    )
  },
}

/**
 * The MUI keys reach every part: `MuiFormControl`, `MuiFormLabel`,
 * `MuiRadioGroup`, `MuiFormGroup`, `MuiFormControlLabel`, `MuiRadio` and
 * `MuiFormHelperText`.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiRadio: { defaultProps: { color: 'secondary' } },
          MuiFormLabel: { styleOverrides: { root: { fontWeight: 600 } } },
        },
      })}
    >
      <RadioGroup {...args} defaultValue="pro" helperText="Styled by the project's theme" />
    </CmThemeProvider>
  ),
}
