import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { TextField } from '../TextField/index.ts'
import { Select } from './index.ts'
import type { SelectOption } from './index.ts'

const countries: SelectOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
  { value: 'ar', label: 'Argentina' },
  { value: 'co', label: 'Colombia' },
]

/**
 * MUI's `TextField` with `select`, taking an `options` array. `onChange`
 * receives the option's value with its type, as `(event, value)`, and `null`
 * means nothing is selected. The root is a MUI `FormControl`, and
 * `aria-label` reaches the combobox.
 */
const meta = {
  component: Select,
  args: { label: 'Country', options: countries, helperText: '', sx: { minWidth: 220 } },
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'filled', 'standard'] },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    label: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof Select<string>>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <Select {...args} variant="outlined" label="Outlined" />
      <Select {...args} variant="filled" label="Filled" />
      <Select {...args} variant="standard" label="Standard" />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Select {...args} size="small" label="Small" defaultValue="es" />
      <Select {...args} size="medium" label="Medium" defaultValue="es" />
    </Stack>
  ),
}

/**
 * Pass `helperText=" "` to reserve the helper text's space, so the layout
 * doesn't move when an error appears.
 */
export const States: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ maxWidth: 320 }}>
      <Select {...args} label="Empty" />
      <Select {...args} label="Selected" defaultValue="mx" />
      <Select {...args} label="With helper text" helperText="Where you live" />
      <Select {...args} label="Required" required helperText=" " />
      <Select {...args} label="Error" error helperText="Choose a country" />
      <Select {...args} label="Disabled" disabled defaultValue="es" />
    </Stack>
  ),
}

/** Disabled options are dimmed, skipped by the arrow keys and can't be picked. */
export const DisabledOptions: Story = {
  args: {
    label: 'Shipping',
    options: [
      { value: 'standard', label: 'Standard, 5 to 7 days' },
      { value: 'express', label: 'Express, 2 days' },
      { value: 'overnight', label: 'Overnight, sold out', disabled: true },
    ],
    defaultValue: 'standard',
  },
}

/**
 * An option with `value: ''` lets the user clear the selection. `null` and
 * `''` both show it as selected.
 */
export const WithNoneOption: Story = {
  render: function Render() {
    const [status, setStatus] = useState<string | null>(null)
    return (
      <Select
        label="Status"
        options={[
          { value: '', label: <em>Any</em> },
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]}
        value={status}
        onChange={(_, value) => setStatus(value)}
        helperText={`Value: ${JSON.stringify(status)}`}
        sx={{ minWidth: 220 }}
      />
    )
  },
}

/**
 * `onChange` reports numbers as numbers. `Value` is inferred from `options`,
 * or set with `<Select<number>>`.
 */
export const NumberValues: Story = {
  render: function Render() {
    const [pageSize, setPageSize] = useState(25)
    return (
      <Select<number>
        label="Rows per page"
        size="small"
        options={[10, 25, 50, 100].map((n) => ({ value: n, label: String(n) }))}
        value={pageSize}
        onChange={(_, value) => setPageSize(value)}
        helperText={`typeof value: ${typeof pageSize}`}
        sx={{ minWidth: 160 }}
      />
    )
  },
}

/**
 * The list scrolls, with a height limited by the window. It isn't
 * virtualized, so use Autocomplete above a few hundred options.
 */
export const ManyOptions: Story = {
  args: {
    label: 'Time',
    options: Array.from({ length: 96 }, (_, index) => {
      const time = `${String(Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`
      return { value: time, label: time }
    }),
    defaultValue: '09:00',
  },
}

/** The selected label is cut off with an ellipsis. The list grows wider instead. */
export const LongLabels: Story = {
  args: {
    label: 'Plan',
    options: [
      { value: 'basic', label: 'Basic, for individuals who need a single workspace' },
      { value: 'team', label: 'Team, for groups of up to 25 people with shared billing' },
    ],
    defaultValue: 'team',
    sx: { width: 240 },
  },
}

/** Without `label`, pass `aria-label`, which names the combobox. */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Country', defaultValue: 'es', size: 'small' },
}

/**
 * `name` reaches the hidden `<input>`, so the form submits the selected value
 * as text. The fields show the errors the form computes after the first submit.
 */
export const InsideAForm: Story = {
  render: function Render() {
    const [country, setCountry] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState('')
    const showError = submitted && !country

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitted(true)
      if (country) {
        setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))))
      }
    }

    return (
      <Stack component="form" noValidate spacing={1} sx={{ maxWidth: 360 }} onSubmit={handleSubmit}>
        <TextField label="City" name="city" fullWidth helperText=" " />
        <Select
          label="Country"
          name="country"
          options={countries}
          value={country}
          onChange={(_, value) => setCountry(value)}
          required
          fullWidth
          error={showError}
          helperText={showError ? 'Choose a country' : ' '}
        />
        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
          Save
        </Button>
        {result && <output>Submitted: {result}</output>}
      </Stack>
    )
  },
}

/**
 * The MUI keys reach every part: `MuiTextField`, `MuiSelect`, the input keys,
 * `MuiMenu`, `MuiMenuItem` and `MuiPopover`. `slotProps.option` reaches every
 * `MenuItem` of one instance.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiTextField: { defaultProps: { size: 'small' } },
          MuiMenuItem: {
            styleOverrides: {
              root: ({ theme }) => ({
                '&.Mui-selected': { fontWeight: theme.typography.fontWeightBold },
              }),
            },
          },
        },
      })}
    >
      <Select {...args} defaultValue="es" slotProps={{ option: { dense: true } }} />
    </CmThemeProvider>
  ),
}
