import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Checkbox } from './index.ts'

/**
 * MUI's `Checkbox` with `label`, `helperText` and `error` built in. The root is
 * a MUI `FormControl`. `aria-label`, `aria-labelledby` and `aria-describedby`
 * reach the `<input>`.
 */
const meta = {
  component: Checkbox,
  args: { label: 'Remember me' },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    labelPlacement: { control: 'inline-radio', options: ['end', 'start', 'top', 'bottom'] },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'default'],
    },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Indeterminate" indeterminate />
      <Checkbox {...args} label="Required" required />
      <Checkbox {...args} label="Disabled" disabled />
      <Checkbox {...args} label="Disabled and checked" disabled defaultChecked />
    </Stack>
  ),
}

/**
 * The helper text sits below the box and label, with no indent. `error`
 * colors the label and helper text, and the box keeps its color, as in MUI.
 */
export const HelperTextAndError: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <Checkbox {...args} label="Email me updates" helperText="About once a month" />
      <Checkbox
        {...args}
        label="I accept the terms"
        required
        error
        helperText="You must accept the terms"
      />
    </Stack>
  ),
}

/**
 * A long label wraps, and the box stays centered on the whole label, as in
 * MUI.
 */
export const LongLabel: Story = {
  render: (args) => (
    <Stack sx={{ maxWidth: 320 }}>
      <Checkbox
        {...args}
        label="Send me a weekly summary of new orders, refunds and messages from customers"
      />
    </Stack>
  ),
}

export const LabelPlacement: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <Checkbox {...args} label="End" labelPlacement="end" />
      <Checkbox {...args} label="Start" labelPlacement="start" />
      <Checkbox {...args} label="Top" labelPlacement="top" />
      <Checkbox {...args} label="Bottom" labelPlacement="bottom" />
    </Stack>
  ),
}

export const ColorsAndSizes: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Stack direction="row">
        {(['primary', 'secondary', 'success', 'error', 'default'] as const).map((color) => (
          <Checkbox {...args} key={color} label={color} color={color} defaultChecked />
        ))}
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {(['small', 'medium', 'large'] as const).map((size) => (
          <Checkbox {...args} key={size} label={size} size={size} defaultChecked />
        ))}
      </Stack>
    </Stack>
  ),
}

/**
 * Without `label`, only the box renders, so give it `aria-label` or
 * `aria-labelledby`. The root adds no margin or padding, so it fits a table
 * cell.
 */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Select row' },
}

/**
 * Several related checkboxes with a shared label are grouped in a
 * `FormControl` with a `FormLabel`, until a checkbox group exists.
 */
export const Group: Story = {
  render: function Render(args) {
    const [toppings, setToppings] = useState(['cheese'])
    const options = ['cheese', 'mushrooms', 'olives']
    const toggle = (option: string, checked: boolean) =>
      setToppings((current) =>
        checked ? [...current, option] : current.filter((item) => item !== option),
      )

    return (
      <FormControl component="fieldset">
        <FormLabel component="legend">Toppings</FormLabel>
        <FormGroup>
          <Checkbox
            {...args}
            label="All toppings"
            checked={toppings.length === options.length}
            indeterminate={toppings.length > 0 && toppings.length < options.length}
            onChange={(_, checked) => setToppings(checked ? options : [])}
          />
          {options.map((option) => (
            <Checkbox
              {...args}
              key={option}
              label={option}
              name="toppings"
              value={option}
              checked={toppings.includes(option)}
              onChange={(_, checked) => toggle(option, checked)}
              sx={{ pl: 3 }}
            />
          ))}
        </FormGroup>
      </FormControl>
    )
  },
}

/**
 * The MUI keys reach every part: `MuiCheckbox`, `MuiFormControlLabel`,
 * `MuiFormControl` and `MuiFormHelperText`.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiCheckbox: { defaultProps: { color: 'secondary' } },
          MuiFormControlLabel: { styleOverrides: { label: { fontWeight: 600 } } },
        },
      })}
    >
      <Checkbox {...args} defaultChecked helperText="Styled by the project's theme" />
    </CmThemeProvider>
  ),
}
