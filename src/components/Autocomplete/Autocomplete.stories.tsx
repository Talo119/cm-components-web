import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Typography } from '../Typography/index.ts'
import { Autocomplete } from './index.ts'
import type { AutocompleteOption } from './index.ts'

const countries: AutocompleteOption[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
]

/**
 * MUI's `Autocomplete` with the TextField built in. It takes the field props
 * and an `options` array shaped like Select's, and `onChange` reports the
 * values with their type. With `name`, a hidden input per value submits the
 * values with a form.
 */
const meta = {
  component: Autocomplete,
  args: { label: 'Country', options: countries, sx: { width: 320 } },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    placeholder: { control: 'text' },
    variant: { control: 'inline-radio', options: ['outlined', 'filled', 'standard'] },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    options: { control: false },
  },
} satisfies Meta<typeof Autocomplete>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VariantsAndSizes: Story = {
  render: (args) => (
    <Stack spacing={2}>
      {(['outlined', 'filled', 'standard'] as const).map((variant) => (
        <Stack direction="row" spacing={2} key={variant}>
          <Autocomplete {...args} variant={variant} label={`${variant}`} defaultValue="es" />
          <Autocomplete
            {...args}
            variant={variant}
            size="small"
            label={`${variant}, small`}
            defaultValue="es"
          />
        </Stack>
      ))}
    </Stack>
  ),
}

/** Empty, selected, helper text, error, required, disabled and read only. */
export const States: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <Autocomplete {...args} label="Empty" placeholder="Search countries" />
      <Autocomplete {...args} label="Selected" defaultValue="mx" />
      <Autocomplete {...args} label="With helper text" helperText="Used for shipping" />
      <Autocomplete {...args} label="Error" error helperText="Choose a country" />
      <Autocomplete {...args} label="Required" required />
      <Autocomplete {...args} label="Disabled" disabled defaultValue="es" />
      <Autocomplete {...args} label="Read only" readOnly defaultValue="es" />
      <Autocomplete
        {...args}
        label="With a disabled option"
        options={countries.map((option) => ({ ...option, disabled: option.value === 'fr' }))}
        helperText="France isn’t available"
      />
    </Stack>
  ),
}

/**
 * Each value is a Chip. `Backspace` in the empty input removes the last one,
 * and the arrow keys move between them. The helper text says so, because the
 * chips' delete icons can't take focus.
 */
export const Multiple: Story = {
  render: function Render() {
    const [tags, setTags] = useState<readonly string[]>(['es', 'mx'])
    return (
      <Autocomplete
        options={countries}
        label="Countries"
        multiple
        value={tags}
        onChange={(_, value) => setTags(value)}
        helperText="Press Backspace to remove the last country"
        sx={{ width: 400 }}
      />
    )
  },
}

/** `limitTags` keeps the field short while it doesn't have focus. */
export const LimitTags: Story = {
  render: () => (
    <Autocomplete
      options={countries}
      label="Countries"
      multiple
      limitTags={2}
      defaultValue={['ar', 'br', 'ca', 'de']}
      sx={{ width: 400 }}
    />
  ),
}

const priorities: AutocompleteOption<number>[] = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
  { value: 4, label: 'Urgent' },
]

/** `onChange` reports numbers as numbers. */
export const NumberValues: Story = {
  render: function Render() {
    const [priority, setPriority] = useState<number | null>(2)
    return (
      <Stack spacing={1}>
        <Autocomplete
          label="Priority"
          options={priorities}
          value={priority}
          onChange={(_, value) => setPriority(value)}
          sx={{ width: 320 }}
        />
        <Typography variant="body2">
          Value: {priority === null ? 'null' : `${priority} (${typeof priority})`}
        </Typography>
      </Stack>
    )
  },
}

const customers = Array.from({ length: 200 }, (_, index) => ({
  value: index + 1,
  label: `Customer ${String(index + 1).padStart(3, '0')}`,
}))

function searchCustomers(text: string) {
  return new Promise<AutocompleteOption<number>[]>((resolve) =>
    setTimeout(
      () =>
        resolve(
          customers
            .filter((customer) => customer.label.toLowerCase().includes(text.toLowerCase()))
            .slice(0, 10),
        ),
      600,
    ),
  )
}

/**
 * Searching a fake server. `filterOptions` returns the results as they are,
 * and the selected option stays in `options`, so its label still shows when
 * it isn't in the latest results.
 */
export const ServerSearch: Story = {
  render: function Render() {
    const [text, setText] = useState('')
    const [results, setResults] = useState<AutocompleteOption<number>[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<AutocompleteOption<number> | null>(null)

    useEffect(() => {
      let current = true
      setLoading(true)
      searchCustomers(text).then((found) => {
        if (current) {
          setResults(found)
          setLoading(false)
        }
      })
      return () => {
        current = false
      }
    }, [text])

    const options = selected
      ? [selected, ...results.filter((option) => option.value !== selected.value)]
      : results

    return (
      <Autocomplete
        label="Customer"
        options={options}
        value={selected?.value ?? null}
        onChange={(_, value) =>
          setSelected(options.find((option) => option.value === value) ?? null)
        }
        onInputChange={(_, value) => setText(value)}
        filterOptions={(found) => found}
        loading={loading}
        loadingText="Searching…"
        noOptionsText="No customers found"
        sx={{ width: 320 }}
      />
    )
  },
}

const cities = Array.from({ length: 2000 }, (_, index) => ({
  value: `city-${index}`,
  label: `City ${index + 1}`,
}))

/** 2,000 options. The list scrolls and isn't virtualized. */
export const ManyOptions: Story = {
  args: { label: 'City', options: cities },
}

/**
 * With `name`, the form submits the values, not the labels. `required` with
 * `multiple` passes once a value is selected.
 */
export const InsideAForm: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string>()
    return (
      <Stack
        component="form"
        spacing={2}
        sx={{ width: 400 }}
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setSubmitted(
            JSON.stringify({ country: data.get('country'), visited: data.getAll('visited') }),
          )
        }}
      >
        <Autocomplete label="Country" options={countries} name="country" required />
        <Autocomplete
          label="Countries visited"
          options={countries}
          name="visited"
          multiple
          required
          helperText="Press Backspace to remove the last country"
        />
        <Button type="submit" sx={{ alignSelf: 'start' }}>
          Submit
        </Button>
        {submitted && <Typography variant="body2">Submitted: {submitted}</Typography>}
      </Stack>
    )
  },
}

/** The MUI keys reach every part: the list, the chips and the field. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiAutocomplete: {
            defaultProps: { autoHighlight: true },
            styleOverrides: {
              listbox: ({ theme }) => ({ padding: theme.spacing(1) }),
              option: ({ theme }) => ({ borderRadius: theme.shape.borderRadius }),
            },
          },
          MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
        },
      })}
    >
      <Stack spacing={2}>
        <Autocomplete {...args} />
        <Autocomplete
          options={countries}
          label="Countries"
          multiple
          defaultValue={['es', 'mx']}
          sx={{ width: 320 }}
        />
      </Stack>
    </CmThemeProvider>
  ),
}
