import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Autocomplete } from './index.ts'
import type { AutocompleteOption } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const combobox = (name?: string | RegExp) =>
  screen.getByRole<HTMLInputElement>('combobox', name ? { name } : undefined)
const listbox = () => screen.queryByRole('listbox')
const optionNames = () => screen.getAllByRole('option').map((option) => option.textContent)
const chips = (root: HTMLElement = document.body) =>
  [...root.querySelectorAll<HTMLElement>('.MuiChip-root')]
const root = () => screen.getByTestId('root')
const waitForClose = () => waitFor(() => expect(listbox()).not.toBeInTheDocument())

const countries: AutocompleteOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
]

const withDisabled: AutocompleteOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France', disabled: true },
  { value: 'mx', label: 'Mexico' },
]

const priorities: AutocompleteOption<number>[] = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
]

describe('Autocomplete', () => {
  let warn: MockInstance
  let error: MockInstance

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn')
    error = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const expectNoWarnings = () => {
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  }

  it('renders a combobox named by its label, showing nothing for null', () => {
    render(<Autocomplete label="Country" options={countries} value={null} />)

    const input = combobox('Country')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('')
    expectNoWarnings()
  })

  it('lists one option per item, in order, and filters them by label as the user types', async () => {
    render(<Autocomplete label="Country" options={countries} />)

    await userEvent.click(combobox())
    expect(optionNames()).toEqual(['Spain', 'Mexico', 'United States'])
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    expect(combobox()).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)

    await userEvent.type(combobox(), 'n')
    expect(optionNames()).toEqual(['Spain', 'United States'])

    await userEvent.type(combobox(), 'ITED')
    expect(optionNames()).toEqual(['United States'])
  })

  it('calls onChange with the event, the value and the reason, and shows the label', async () => {
    const onChange = vi.fn()
    render(<Autocomplete label="Country" options={countries} onChange={onChange} />)

    await userEvent.click(combobox())
    await userEvent.click(screen.getByRole('option', { name: 'Mexico' }))

    expect(onChange).toHaveBeenCalledOnce()
    const [event, value, reason] = onChange.mock.calls[0]
    expect(event).toHaveProperty('type', 'click')
    expect(value).toBe('mx')
    expect(reason).toBe('selectOption')
    expect(combobox()).toHaveValue('Mexico')
    await waitForClose()
    expectNoWarnings()
  })

  it('calls onChange with null and "clear" when the clear button is used', async () => {
    const onChange = vi.fn()
    render(<Autocomplete label="Country" options={countries} defaultValue="es" onChange={onChange} />)

    // The clear button is hidden until hover, which jsdom doesn't apply.
    await userEvent
      .setup({ pointerEventsCheck: 0 })
      .click(document.querySelector<HTMLElement>('.MuiAutocomplete-clearIndicator')!)

    expect(onChange).toHaveBeenCalledWith(expect.anything(), null, 'clear')
    expect(combobox()).toHaveValue('')
  })

  describe('with multiple', () => {
    it('calls onChange with an array of values and shows each one as a chip', async () => {
      const onChange = vi.fn()
      render(<Autocomplete label="Countries" multiple options={countries} onChange={onChange} />)

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Spain' }))
      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'United States' }))

      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), ['es', 'us'], 'selectOption')
      expect(chips().map((chip) => chip.textContent)).toEqual(['Spain', 'United States'])
      expect(combobox()).toHaveValue('')
      expectNoWarnings()
    })

    it('marks the listbox as multiselectable and the chosen options as selected', async () => {
      render(<Autocomplete label="Countries" multiple options={countries} defaultValue={['mx']} />)

      await userEvent.click(combobox())

      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
      expect(screen.getByRole('option', { name: 'Mexico' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('option', { name: 'Spain' })).toHaveAttribute('aria-selected', 'false')
    })

    it('removes a value when its chip’s delete icon is clicked', async () => {
      const onChange = vi.fn()
      render(
        <Autocomplete
          label="Countries"
          multiple
          options={countries}
          defaultValue={['es', 'mx']}
          onChange={onChange}
        />,
      )

      await userEvent.click(chips()[0].querySelector('.MuiChip-deleteIcon')!)

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['mx'], 'removeOption')
      expect(chips().map((chip) => chip.textContent)).toEqual(['Mexico'])
    })

    it('removes the last value with Backspace in the empty input', async () => {
      const onChange = vi.fn()
      render(
        <Autocomplete
          label="Countries"
          multiple
          options={countries}
          defaultValue={['es', 'mx']}
          onChange={onChange}
        />,
      )

      await userEvent.click(combobox())
      await userEvent.keyboard('{Escape}{Backspace}')

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['es'], 'removeOption')
      expect(combobox()).toHaveFocus()
    })

    it('moves between chips with the arrow keys and removes the focused one with Delete', async () => {
      const onChange = vi.fn()
      render(
        <Autocomplete
          label="Countries"
          multiple
          options={countries}
          defaultValue={['es', 'mx', 'us']}
          onChange={onChange}
        />,
      )

      await userEvent.click(combobox())
      await userEvent.keyboard('{Escape}{ArrowLeft}')
      expect(chips()[2]).toHaveFocus()
      await userEvent.keyboard('{ArrowLeft}')
      expect(chips()[1]).toHaveFocus()
      await userEvent.keyboard('{Delete}')

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['es', 'us'], 'removeOption')
    })

    it('keeps chips out of the tab order', async () => {
      render(
        <>
          <Autocomplete label="Countries" multiple options={countries} defaultValue={['es', 'mx']} />
          <button type="button">Next</button>
        </>,
      )

      await userEvent.tab()
      expect(combobox()).toHaveFocus()
      await userEvent.tab()

      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
      for (const chip of chips()) expect(chip).toHaveAttribute('tabindex', '-1')
    })
  })

  it('reports number values as numbers', async () => {
    const onChange = vi.fn()
    render(<Autocomplete label="Priority" options={priorities} onChange={onChange} />)

    await userEvent.click(combobox())
    await userEvent.click(screen.getByRole('option', { name: 'High' }))

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 3, 'selectOption')
    expect(combobox()).toHaveValue('High')
  })

  describe('state', () => {
    it('works controlled', async () => {
      function Controlled() {
        const [value, setValue] = useState<string | null>('es')
        return (
          <>
            <Autocomplete
              label="Country"
              options={countries}
              value={value}
              onChange={(_, next) => setValue(next)}
            />
            <output>{String(value)}</output>
            <button type="button" onClick={() => setValue(null)}>
              Reset
            </button>
          </>
        )
      }
      render(<Controlled />)
      expect(combobox()).toHaveValue('Spain')

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Mexico' }))
      expect(screen.getByRole('status')).toHaveTextContent('mx')
      expect(combobox()).toHaveValue('Mexico')

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      expect(combobox()).toHaveValue('')
      expectNoWarnings()
    })

    it('keeps a controlled value that onChange doesn’t update, restoring its label on blur', async () => {
      const onChange = vi.fn()
      render(<Autocomplete label="Country" options={countries} value="es" onChange={onChange} />)

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Mexico' }))
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'mx', 'selectOption')
      // As in MUI, the picked label stays as typed text while the input has focus.
      expect(combobox()).toHaveValue('Mexico')

      await userEvent.tab()
      expect(combobox()).toHaveValue('Spain')
    })

    it('works controlled with multiple', async () => {
      function Controlled() {
        const [value, setValue] = useState<readonly string[]>(['es'])
        return (
          <Autocomplete
            label="Countries"
            multiple
            options={countries}
            value={value}
            onChange={(_, next) => setValue(next)}
          />
        )
      }
      render(<Controlled />)

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Mexico' }))

      expect(chips().map((chip) => chip.textContent)).toEqual(['Spain', 'Mexico'])
      expectNoWarnings()
    })

    it.each([
      ['without defaultValue', undefined, ''],
      ['with defaultValue', 'us', 'United States'],
    ])('works uncontrolled %s', async (_, defaultValue, shown) => {
      render(<Autocomplete label="Country" options={countries} defaultValue={defaultValue} />)
      expect(combobox()).toHaveValue(shown)

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Spain' }))

      expect(combobox()).toHaveValue('Spain')
      expectNoWarnings()
    })

    it.each([
      ['without defaultValue', undefined, []],
      ['with defaultValue', ['us'], ['United States']],
    ])('works uncontrolled with multiple %s', async (_, defaultValue, shown) => {
      render(
        <Autocomplete label="Countries" multiple options={countries} defaultValue={defaultValue} />,
      )
      expect(chips().map((chip) => chip.textContent)).toEqual(shown)

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Spain' }))

      expect(chips().map((chip) => chip.textContent)).toEqual([...shown, 'Spain'])
      expectNoWarnings()
    })
  })

  describe('disabled options', () => {
    it('are skipped by the arrow keys', async () => {
      render(<Autocomplete label="Country" options={withDisabled} />)

      await userEvent.click(combobox())
      const france = screen.getByRole('option', { name: 'France' })
      expect(france).toHaveAttribute('aria-disabled', 'true')

      await userEvent.keyboard('{ArrowDown}')
      const spain = screen.getByRole('option', { name: 'Spain' })
      expect(combobox()).toHaveAttribute('aria-activedescendant', spain.id)
      await userEvent.keyboard('{ArrowDown}')
      const mexico = screen.getByRole('option', { name: 'Mexico' })
      expect(combobox()).toHaveAttribute('aria-activedescendant', mexico.id)
    })

    it('can’t be picked with the pointer or the keyboard', async () => {
      const onChange = vi.fn()
      render(<Autocomplete label="Country" options={withDisabled} onChange={onChange} />)

      await userEvent.click(combobox())
      const france = screen.getByRole('option', { name: 'France' })
      // MUI blocks clicks with `pointer-events: none`, so userEvent refuses to click it.
      expect(france).toHaveStyle({ pointerEvents: 'none' })
      await expect(userEvent.click(france)).rejects.toThrow(/pointer-events/)

      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'mx', 'selectOption')
      expect(onChange).toHaveBeenCalledOnce()
    })
  })

  describe('popup messages', () => {
    it('shows loadingText in a status element while loading with no options', async () => {
      render(<Autocomplete label="Customer" options={[]} loading loadingText="Searching…" />)

      await userEvent.click(combobox())

      expect(screen.getByRole('status')).toHaveTextContent('Searching…')
    })

    it('shows noOptionsText in a status element when nothing matches', async () => {
      render(<Autocomplete label="Country" options={countries} noOptionsText="No countries" />)

      await userEvent.type(combobox(), 'zzz')

      expect(screen.getByRole('status')).toHaveTextContent('No countries')
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('field props', () => {
    it('links helperText with aria-describedby, joined with the consumer’s own', () => {
      render(
        <>
          <span id="hint">Where you live</span>
          <Autocomplete
            label="Country"
            options={countries}
            helperText="Used for shipping"
            aria-describedby="hint"
          />
        </>,
      )

      expect(combobox()).toHaveAccessibleDescription('Where you live Used for shipping')
    })

    it('links helperText alone with aria-describedby', () => {
      render(<Autocomplete label="Country" options={countries} helperText="Used for shipping" />)

      expect(combobox()).toHaveAccessibleDescription('Used for shipping')
    })

    it('sets aria-invalid with error', () => {
      render(<Autocomplete label="Country" options={countries} error helperText="Pick one" />)

      expect(combobox()).toHaveAttribute('aria-invalid', 'true')
    })

    it('sets aria-required and shows an asterisk with required', () => {
      render(<Autocomplete label="Country" options={countries} required />)

      expect(combobox()).toHaveAttribute('aria-required', 'true')
      expect(combobox()).toBeRequired()
      expect(document.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument()
    })

    it('blocks a required multiple field with no values, and submits one with values', async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
      function Form() {
        const [tags, setTags] = useState<readonly string[]>([])
        return (
          <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
            <Autocomplete
              label="Countries"
              multiple
              required
              options={countries}
              value={tags}
              onChange={(_, next) => setTags(next)}
            />
            <button type="submit">Send</button>
          </form>
        )
      }
      render(<Form />)
      const form = screen.getByRole('button', { name: 'Send' }).closest('form')!

      expect(form.checkValidity()).toBe(false)
      await userEvent.click(screen.getByRole('button', { name: 'Send' }))
      expect(onSubmit).not.toHaveBeenCalled()

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Spain' }))

      // `toBeRequired` also passes on `aria-required`, so the attribute is checked.
      expect(combobox()).not.toHaveAttribute('required')
      expect(combobox()).toHaveAttribute('aria-required', 'true')
      expect(form.checkValidity()).toBe(true)
      await userEvent.click(screen.getByRole('button', { name: 'Send' }))
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('prevents typing and opening when disabled', async () => {
      render(<Autocomplete label="Country" options={countries} disabled />)

      expect(combobox()).toBeDisabled()
      await userEvent.click(combobox())
      await userEvent.type(combobox(), 'Sp')

      expect(listbox()).not.toBeInTheDocument()
      expect(combobox()).toHaveValue('')
    })

    it('names the combobox with aria-label when there’s no label', () => {
      render(<Autocomplete aria-label="Search countries" options={countries} data-testid="root" />)

      expect(combobox('Search countries')).toBeInTheDocument()
      expect(root()).not.toHaveAttribute('aria-label')
    })

    it('names the combobox with aria-labelledby', () => {
      render(
        <>
          <h2 id="heading">Shipping country</h2>
          <Autocomplete aria-labelledby="heading" options={countries} data-testid="root" />
        </>,
      )

      expect(combobox('Shipping country')).toBeInTheDocument()
      expect(root()).not.toHaveAttribute('aria-labelledby')
    })

    it('doesn’t remount the input when error and helperText change', () => {
      const { rerender } = render(<Autocomplete label="Country" options={countries} />)
      const input = combobox()

      rerender(<Autocomplete label="Country" options={countries} error helperText="Pick one" />)
      expect(combobox()).toBe(input)

      rerender(<Autocomplete label="Country" options={countries} />)
      expect(combobox()).toBe(input)
    })

    it('is read only with readOnly', async () => {
      render(<Autocomplete label="Country" options={countries} defaultValue="es" readOnly />)

      await userEvent.click(combobox())

      expect(combobox()).toHaveAttribute('readonly')
      expect(listbox()).not.toBeInTheDocument()
    })
  })

  describe('forms', () => {
    const submitted = (form: HTMLFormElement, name: string) => new FormData(form).getAll(name)

    it('submits the selected value, not its label, under name', async () => {
      render(
        <form data-testid="form">
          <Autocomplete label="Country" options={countries} name="country" />
        </form>,
      )
      const form = screen.getByTestId<HTMLFormElement>('form')
      expect(submitted(form, 'country')).toEqual([])

      await userEvent.click(combobox())
      await userEvent.click(screen.getByRole('option', { name: 'Mexico' }))

      expect(submitted(form, 'country')).toEqual(['mx'])
      expect(combobox()).not.toHaveAttribute('name')
    })

    it('submits each value of a multiple field under the same name', () => {
      render(
        <form data-testid="form">
          <Autocomplete
            label="Priorities"
            multiple
            options={priorities}
            defaultValue={[1, 3]}
            name="priority"
          />
        </form>,
      )

      expect(submitted(screen.getByTestId('form'), 'priority')).toEqual(['1', '3'])
    })

    it('submits nothing when disabled, as native fields do', () => {
      render(
        <form data-testid="form">
          <Autocomplete label="Country" options={countries} defaultValue="es" name="country" disabled />
        </form>,
      )

      expect(submitted(screen.getByTestId('form'), 'country')).toEqual([])
    })

    it('renders no hidden inputs without name', () => {
      render(<Autocomplete label="Country" options={countries} defaultValue="es" data-testid="root" />)

      expect(root().querySelector('input[type="hidden"]')).not.toBeInTheDocument()
    })
  })

  describe('values that aren’t in options', () => {
    it('shows an empty input', () => {
      render(<Autocomplete label="Country" options={countries} value="de" />)

      expect(combobox()).toHaveValue('')
    })

    it('logs an error for duplicate values', () => {
      error.mockImplementation(() => {})
      render(
        <Autocomplete
          label="Country"
          options={[
            { value: 'es', label: 'Spain' },
            { value: 'es', label: 'España' },
          ]}
        />,
      )

      expect(error).toHaveBeenCalledWith(expect.stringContaining('es'))
    })
  })

  it('passes ref, className, sx and other props to the root <div>', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Autocomplete
        ref={ref}
        label="Country"
        options={countries}
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    expect(ref.current).toBe(root())
    expect(root().tagName).toBe('DIV')
    expect(root()).toHaveClass('MuiAutocomplete-root', 'custom')
    expect(root()).toHaveStyle({ marginTop: '7px' })
    expect(root()).toContainElement(combobox())
  })

  describe('slotProps', () => {
    it('passes textField to the TextField, including its own slotProps', async () => {
      const onFocus = vi.fn()
      render(
        <Autocomplete
          label="Country"
          options={countries}
          openOnFocus
          slotProps={{
            textField: {
              className: 'field',
              slotProps: {
                htmlInput: { 'data-testid': 'input', onFocus },
                inputLabel: { className: 'label' },
                input: { className: 'input-root' },
              },
            },
          }}
        />,
      )

      expect(combobox().closest('.MuiTextField-root')).toHaveClass('field')
      expect(screen.getByTestId('input')).toBe(combobox())
      expect(document.querySelector('label')).toHaveClass('label')
      expect(combobox().closest('.MuiInputBase-root')).toHaveClass('input-root')

      // The consumer’s handler runs alongside MUI’s, which still opens the list.
      await userEvent.click(combobox())
      expect(onFocus).toHaveBeenCalled()
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('passes MUI’s slots, such as chip and listbox, to their elements', async () => {
      render(
        <Autocomplete
          label="Countries"
          multiple
          options={countries}
          defaultValue={['es']}
          slotProps={{
            chip: { className: 'chip', size: 'small' },
            listbox: { className: 'listbox' },
            paper: { className: 'paper' },
            popper: { className: 'popper' },
          }}
        />,
      )

      expect(chips()[0]).toHaveClass('chip', 'MuiChip-sizeSmall')
      await userEvent.click(combobox())
      const list = screen.getByRole('listbox')
      expect(list).toHaveClass('listbox')
      expect(list.closest('.MuiAutocomplete-paper')).toHaveClass('paper')
      expect(list.closest('.MuiAutocomplete-popper')).toHaveClass('popper')
    })

    it('passes placeholder and variant to the TextField', () => {
      render(
        <Autocomplete
          label="Country"
          options={countries}
          placeholder="Search"
          variant="filled"
        />,
      )

      expect(combobox()).toHaveAttribute('placeholder', 'Search')
      expect(combobox().closest('.MuiFilledInput-root')).toBeInTheDocument()
    })
  })

  describe('keyboard', () => {
    it('opens with ArrowDown, picks with Enter, and closes', async () => {
      const onChange = vi.fn()
      render(<Autocomplete label="Country" options={countries} onChange={onChange} />)

      await userEvent.tab()
      expect(combobox()).toHaveFocus()
      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'mx', 'selectOption')
      await waitForClose()
      expect(combobox()).toHaveFocus()
    })

    it('moves to the last and first option with End and Home', async () => {
      render(<Autocomplete label="Country" options={countries} />)

      await userEvent.click(combobox())
      await userEvent.keyboard('{End}')
      expect(combobox()).toHaveAttribute(
        'aria-activedescendant',
        screen.getByRole('option', { name: 'United States' }).id,
      )
      await userEvent.keyboard('{Home}')
      expect(combobox()).toHaveAttribute(
        'aria-activedescendant',
        screen.getByRole('option', { name: 'Spain' }).id,
      )
    })

    it('closes the list with Escape, and clears with a second Escape with clearOnEscape', async () => {
      const onChange = vi.fn()
      render(
        <Autocomplete
          label="Country"
          options={countries}
          defaultValue="es"
          clearOnEscape
          onChange={onChange}
        />,
      )

      await userEvent.click(combobox())
      await userEvent.keyboard('{Escape}')
      await waitForClose()
      expect(combobox()).toHaveValue('Spain')

      await userEvent.keyboard('{Escape}')
      expect(onChange).toHaveBeenCalledWith(expect.anything(), null, 'clear')
    })

    it('keeps the clear and arrow buttons out of the tab order', async () => {
      render(
        <>
          <Autocomplete label="Country" options={countries} defaultValue="es" />
          <button type="button">Next</button>
        </>,
      )

      await userEvent.tab()
      await userEvent.tab()

      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('has the grey[500] border from 0005', () => {
      renderThemed(<Autocomplete label="Country" options={countries} />)

      const outline = combobox().closest('.MuiOutlinedInput-root')!.querySelector('fieldset')!
      expect(outline).toHaveStyle({ borderColor: light.grey[500] })
    })

    it('gives chips the delete icon color from 0013', () => {
      renderThemed(
        <Autocomplete label="Countries" multiple options={countries} defaultValue={['es']} />,
      )

      expect(chips()[0].querySelector('.MuiChip-deleteIcon')).toHaveStyle({
        color: light.text.secondary,
      })
    })

    it('shows the focus ring on an option highlighted with the keyboard', async () => {
      renderThemed(<Autocomplete label="Country" options={countries} />)

      await userEvent.click(combobox())
      await userEvent.keyboard('{ArrowDown}')

      const option = screen.getByRole('option', { name: 'Spain' })
      expect(option).toHaveClass('Mui-focusVisible')
      expect(option).toHaveStyle({ outlineStyle: 'solid', outlineWidth: '2px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiAutocomplete styleOverrides.listbox object', async () => {
      renderThemed(<Autocomplete label="Country" options={countries} />, {
        components: { MuiAutocomplete: { styleOverrides: { listbox: { letterSpacing: '3px' } } } },
      })

      await userEvent.click(combobox())

      expect(screen.getByRole('listbox')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Autocomplete label="Country" options={countries} data-testid="root" sx={{ width: '123px' }} />,
        { components: { MuiAutocomplete: { styleOverrides: { root: { width: '300px' } } } } },
      )

      expect(root()).toHaveStyle({ width: '123px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', async () => {
      const theme = createTheme({ palette: { primary: { main: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <Autocomplete label="Countries" multiple options={countries} defaultValue={['es']} slotProps={{ chip: { color: 'primary' } }} />
        </ThemeProvider>,
      )

      expect(chips()[0]).toHaveStyle({ backgroundColor: '#00aa00' })
      expect(within(chips()[0]).getByText('Spain')).toBeInTheDocument()
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const code: string = 'es'
    const accepted = [
      <Autocomplete options={countries} value="es" onChange={(_, value: string | null) => value} />,
      // Inline values are literals, and a `string` value still fits.
      <Autocomplete options={[{ value: 'es', label: 'Spain' }]} value={code} />,
      <Autocomplete
        options={priorities}
        multiple
        value={[1, 2]}
        onChange={(_, value: number[]) => value}
      />,
      <Autocomplete<number> options={[]} defaultValue={null} loading filterOptions={(o) => o} />,
      <Autocomplete
        options={countries}
        label="x"
        helperText="x"
        error
        required
        variant="standard"
        size="small"
        slotProps={{ textField: { fullWidth: true }, listbox: { className: 'x' } }}
      />,
    ]
    const rejected = [
      // @ts-expect-error: options is required
      <Autocomplete label="x" />,
      // @ts-expect-error: a number value for string options
      <Autocomplete options={countries} value={1} />,
      // @ts-expect-error: multiple takes an array
      <Autocomplete options={countries} multiple value="es" />,
      // @ts-expect-error: onChange receives an array with multiple
      <Autocomplete options={countries} multiple onChange={(_, value: string | null) => value} />,
      // @ts-expect-error: onChange receives numbers
      <Autocomplete options={priorities} onChange={(_, value: string | null) => value} />,
      // @ts-expect-error: labels are strings
      <Autocomplete options={[{ value: 'a', label: <b>A</b> }]} />,
      // @ts-expect-error: renderInput is built in
      <Autocomplete options={countries} renderInput={() => null} />,
      // @ts-expect-error: freeSolo is out of scope
      <Autocomplete options={countries} freeSolo />,
      // @ts-expect-error: groupBy is out of scope
      <Autocomplete options={countries} groupBy={() => 'x'} />,
      // @ts-expect-error: getOptionLabel is set by the library
      <Autocomplete options={countries} getOptionLabel={(option) => option.label} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(15)
  })
})
