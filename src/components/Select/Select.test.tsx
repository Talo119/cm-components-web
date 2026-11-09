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
import { Select } from './index.ts'
import type { SelectOption } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const combobox = (name?: string | RegExp) =>
  screen.getByRole('combobox', name ? { name } : undefined)

const listbox = () => screen.queryByRole('listbox')

// MUI fills an empty field with a zero-width space.
const shown = (field: HTMLElement) => field.textContent?.replace(/\u200b/g, '')

const outline = (field: HTMLElement) =>
  field.closest('.MuiOutlinedInput-root')!.querySelector('fieldset')!

const nativeInput = () => document.querySelector<HTMLInputElement>('input.MuiSelect-nativeInput')!

const open = async (field = combobox()) => {
  await userEvent.click(field)
  return screen.getByRole('listbox')
}

const waitForClose = () => waitFor(() => expect(listbox()).not.toBeInTheDocument())

const light = createCmTheme().colorSchemes.light!.palette

const sizes: SelectOption[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

describe('Select', () => {
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
    render(<Select label="Size" options={sizes} value={null} />)

    const field = combobox('Size')
    expect(field).toHaveAttribute('aria-haspopup', 'listbox')
    expect(field).toHaveAttribute('aria-expanded', 'false')
    expect(shown(field)).toBe('')
    expect(nativeInput()).toHaveValue('')
    expectNoWarnings()
  })

  it('shows the selected option’s label in the field', () => {
    render(<Select label="Size" options={sizes} value="md" />)

    expect(combobox()).toHaveTextContent('Medium')
  })

  it('lists one option per item, in order, named by its label', async () => {
    render(<Select label="Size" options={sizes} value="md" />)
    const field = combobox()

    const list = await open(field)

    const options = within(list).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual(['Small', 'Medium', 'Large'])
    expect(within(list).getByRole('option', { name: 'Medium' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(field).toHaveAttribute('aria-expanded', 'true')
    expect(field).toHaveAttribute('aria-controls', list.id)
  })

  it('calls onChange with the event and the option’s value, and closes the list', async () => {
    const onChange = vi.fn()
    render(<Select label="Size" name="size" options={sizes} value={null} onChange={onChange} />)

    await userEvent.click(within(await open()).getByRole('option', { name: 'Large' }))

    expect(onChange).toHaveBeenCalledOnce()
    const [event, value] = onChange.mock.calls[0]
    expect(value).toBe('lg')
    expect(event.target).toMatchObject({ name: 'size', value: 'lg' })
    await waitForClose()
  })

  it('reports number values as numbers', async () => {
    const onChange = vi.fn()
    render(
      <Select
        label="Rows per page"
        options={[10, 25, 50].map((n) => ({ value: n, label: String(n) }))}
        defaultValue={10}
        onChange={onChange}
      />,
    )

    await userEvent.click(within(await open()).getByRole('option', { name: '25' }))

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 25)
    expect(nativeInput()).toHaveValue('25')
  })

  it('works controlled, without warnings', async () => {
    function Controlled() {
      const [size, setSize] = useState<string | null>(null)
      return (
        <>
          <Select label="Size" options={sizes} value={size} onChange={(_, value) => setSize(value)} />
          <button type="button" onClick={() => setSize(null)}>
            Clear
          </button>
        </>
      )
    }
    render(<Controlled />)

    await userEvent.click(within(await open()).getByRole('option', { name: 'Medium' }))
    await waitForClose()
    expect(combobox()).toHaveTextContent('Medium')

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(shown(combobox())).toBe('')
    expectNoWarnings()
  })

  it('does not change a controlled value without onChange updating it', async () => {
    render(<Select label="Size" options={sizes} value="sm" onChange={() => {}} />)

    await userEvent.click(within(await open()).getByRole('option', { name: 'Large' }))
    await waitForClose()

    expect(combobox()).toHaveTextContent('Small')
  })

  it('works uncontrolled with defaultValue, without warnings', async () => {
    render(<Select label="Size" options={sizes} defaultValue="sm" />)
    expect(combobox()).toHaveTextContent('Small')

    await userEvent.click(within(await open()).getByRole('option', { name: 'Large' }))
    await waitForClose()

    expect(combobox()).toHaveTextContent('Large')
    expectNoWarnings()
  })

  it('works uncontrolled without defaultValue, without warnings', async () => {
    render(<Select label="Size" options={sizes} />)
    expect(shown(combobox())).toBe('')

    await userEvent.click(within(await open()).getByRole('option', { name: 'Medium' }))
    await waitForClose()

    expect(combobox()).toHaveTextContent('Medium')
    expectNoWarnings()
  })

  it('shows a "None" option as selected for null and for an empty string', async () => {
    const options = [{ value: '', label: 'None' }, ...sizes]
    const { rerender } = render(<Select label="Size" options={options} value={null} />)

    expect(within(await open()).getByRole('option', { name: 'None' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    rerender(<Select label="Size" options={options} value="" />)
    expect(screen.getByRole('option', { name: 'None' })).toHaveAttribute('aria-selected', 'true')
    expectNoWarnings()
  })

  it('shows a disabled option that can’t be picked', async () => {
    const onChange = vi.fn()
    render(
      <Select
        label="Size"
        options={[...sizes, { value: 'xl', label: 'Extra large', disabled: true }]}
        onChange={onChange}
      />,
    )

    const option = within(await open()).getByRole('option', { name: 'Extra large' })
    expect(option).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(option, { pointerEventsCheck: 0 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('links helperText with aria-describedby, and sets aria-invalid and aria-required', () => {
    render(<Select label="Size" options={sizes} helperText="Pick one" error required />)

    const field = combobox(/Size/)
    expect(field).toHaveAccessibleDescription('Pick one')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('aria-required', 'true')
    expect(screen.getByText('Pick one')).toHaveClass('Mui-error')
  })

  it('can’t be opened when disabled', async () => {
    render(<Select label="Size" options={sizes} disabled />)

    expect(combobox()).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(combobox(), { pointerEventsCheck: 0 })

    expect(listbox()).not.toBeInTheDocument()
  })

  it('names the combobox with aria-label when there is no label', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Select ref={ref} aria-label="Rows per page" options={sizes} />)

    expect(combobox('Rows per page')).toBeInTheDocument()
    expect(ref.current).not.toHaveAttribute('aria-label')
  })

  it('submits the selected value with a form through name', async () => {
    render(
      <form data-testid="form">
        <Select label="Size" name="size" options={sizes} required />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')

    expect(nativeInput()).toBeRequired()
    expect(form.checkValidity()).toBe(false)

    await userEvent.click(within(await open()).getByRole('option', { name: 'Medium' }))

    expect(new FormData(form).get('size')).toBe('md')
    expect(form.checkValidity()).toBe(true)
  })

  it('keeps the field and focus when error and helperText change', async () => {
    const { rerender } = render(<Select label="Size" options={sizes} />)
    const field = combobox()
    await userEvent.tab()
    expect(field).toHaveFocus()

    rerender(<Select label="Size" options={sizes} error helperText="Pick one" />)
    expect(combobox()).toBe(field)
    expect(field).toHaveFocus()

    rerender(<Select label="Size" options={sizes} />)
    expect(combobox()).toBe(field)
    expect(field).toHaveFocus()
  })

  it('passes ref, className, sx and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Select
        ref={ref}
        label="Size"
        options={sizes}
        className="custom"
        sx={{ marginTop: '7px' }}
        data-testid="size"
      />,
    )

    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current).toHaveClass('MuiFormControl-root', 'custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px' })
    expect(ref.current).toHaveAttribute('data-testid', 'size')
    expect(ref.current).toContainElement(combobox())
  })

  it('passes inputRef MUI’s handle, holding the hidden input', () => {
    const inputRef = createRef<{ node: HTMLInputElement; focus: () => void }>()
    render(<Select label="Size" options={sizes} inputRef={inputRef} />)

    expect(inputRef.current?.node).toBe(nativeInput())
    inputRef.current?.focus()
    expect(combobox()).toHaveFocus()
  })

  it('passes slotProps.option to every MenuItem and TextField’s slots to their elements', async () => {
    render(
      <Select
        label="Size"
        helperText="Pick one"
        options={sizes}
        slotProps={{
          option: { className: 'option', dense: true },
          inputLabel: { className: 'label' },
          formHelperText: { className: 'helper' },
          input: { className: 'input' },
          htmlInput: { 'data-testid': 'native' } as object,
          select: { MenuProps: { className: 'menu' } },
        }}
      />,
    )

    expect(document.querySelector('.MuiInputLabel-root')).toHaveClass('label')
    expect(screen.getByText('Pick one')).toHaveClass('helper')
    expect(combobox().closest('.MuiInputBase-root')).toHaveClass('input')
    expect(screen.getByTestId('native')).toBe(nativeInput())

    const list = await open()
    expect(list.closest('.MuiMenu-root')).toHaveClass('menu')
    for (const option of within(list).getAllByRole('option')) {
      expect(option).toHaveClass('option', 'MuiMenuItem-dense')
    }
  })

  it('keeps multiple and native false', async () => {
    const onChange = vi.fn()
    render(
      <Select
        label="Size"
        options={sizes}
        onChange={onChange}
        slotProps={{ select: { multiple: true, native: true } }}
      />,
    )

    const list = await open()
    expect(list).not.toHaveAttribute('aria-multiselectable')
    await userEvent.click(within(list).getByRole('option', { name: 'Small' }))

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 'sm')
  })

  it('renders an empty list for no options', async () => {
    render(<Select label="Size" options={[]} />)

    expect(within(await open()).queryAllByRole('option')).toEqual([])
  })

  describe('with the keyboard', () => {
    it('opens with ArrowDown on the first option, moves by typing, and picks with Enter', async () => {
      const onChange = vi.fn()
      render(<Select label="Size" options={sizes} onChange={onChange} />)

      await userEvent.tab()
      expect(combobox()).toHaveFocus()

      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('option', { name: 'Small' })).toHaveFocus()

      await userEvent.keyboard('m')
      expect(screen.getByRole('option', { name: 'Medium' })).toHaveFocus()

      await userEvent.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'md')
      await waitForClose()
      expect(combobox()).toHaveFocus()
      expect(combobox()).toHaveTextContent('Medium')
    })

    it.each(['{Enter}', ' ', '{ArrowUp}'])('opens with %s on the selected option', async (key) => {
      render(<Select label="Size" options={sizes} defaultValue="lg" />)

      await userEvent.tab()
      await userEvent.keyboard(key)

      expect(screen.getByRole('option', { name: 'Large' })).toHaveFocus()
    })

    it('moves with arrows, Home and End, skipping disabled options', async () => {
      render(
        <Select
          label="Size"
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium', disabled: true },
            { value: 'lg', label: 'Large' },
          ]}
        />,
      )
      const option = (name: string) => screen.getByRole('option', { name })

      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}')
      expect(option('Small')).toHaveFocus()

      await userEvent.keyboard('{ArrowDown}')
      expect(option('Large')).toHaveFocus()

      await userEvent.keyboard('{ArrowUp}')
      expect(option('Small')).toHaveFocus()

      await userEvent.keyboard('{End}')
      expect(option('Large')).toHaveFocus()

      await userEvent.keyboard('{Home}')
      expect(option('Small')).toHaveFocus()
    })

    it('picks with Space', async () => {
      const onChange = vi.fn()
      render(<Select label="Size" options={sizes} onChange={onChange} />)

      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}{ArrowDown} ')

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'md')
      await waitForClose()
      expect(combobox()).toHaveFocus()
    })

    it('closes with Escape without changing the value', async () => {
      const onChange = vi.fn()
      render(<Select label="Size" options={sizes} defaultValue="sm" onChange={onChange} />)

      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}')

      await waitForClose()
      expect(onChange).not.toHaveBeenCalled()
      expect(combobox()).toHaveTextContent('Small')
      expect(combobox()).toHaveFocus()
    })

    it('closes with Tab without changing the value', async () => {
      const onChange = vi.fn()
      render(<Select label="Size" options={sizes} defaultValue="sm" onChange={onChange} />)

      await userEvent.tab()
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Tab}')

      await waitForClose()
      expect(onChange).not.toHaveBeenCalled()
      expect(combobox()).toHaveTextContent('Small')
    })

    it('skips a disabled field', async () => {
      render(
        <>
          <Select label="Disabled" options={sizes} disabled />
          <Select label="Enabled" options={sizes} />
        </>,
      )

      await userEvent.tab()

      expect(combobox('Enabled')).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('gives the outlined border grey[500] at rest', () => {
      renderThemed(<Select label="Size" options={sizes} />)

      expect(outline(combobox())).toHaveStyle({ borderColor: light.grey[500] })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiMenuItem styleOverrides.root object to the options', async () => {
      renderThemed(<Select label="Size" options={sizes} />, {
        components: { MuiMenuItem: { styleOverrides: { root: { paddingTop: '3px' } } } },
      })

      for (const option of within(await open()).getAllByRole('option')) {
        expect(option).toHaveStyle({ paddingTop: '3px' })
      }
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<Select ref={ref} label="Size" options={sizes} sx={{ marginTop: '9px' }} />, {
        components: { MuiTextField: { styleOverrides: { root: { marginTop: '3px' } } } },
      })

      expect(ref.current).toHaveStyle({ marginTop: '9px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', async () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })
      render(
        <ThemeProvider theme={theme}>
          <Select label="Size" options={sizes} />
        </ThemeProvider>,
      )

      expect(outline(combobox())).toHaveStyle({ borderColor: 'rgba(0, 0, 0, 0.23)' })

      await userEvent.tab()
      expect(outline(combobox())).toHaveStyle({ borderColor: '#aa0000' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const numbers = [{ value: 10, label: '10' }]
    const accepted = [
      <Select options={sizes} value="sm" onChange={(_event, value: string) => value} />,
      <Select options={numbers} value={10} onChange={(_event, value: number) => value} />,
      <Select<number> options={numbers} value={null} defaultValue={null} />,
      <Select
        options={[{ value: 'a', label: 'A' }]}
        onChange={(_event, value) => {
          const narrowed: 'a' = value
          return narrowed
        }}
      />,
      <Select options={sizes} variant="filled" size="small" fullWidth name="size" />,
      <Select options={sizes} variant="filled" slotProps={{ input: { disableUnderline: true } }} />,
      <Select options={sizes} slotProps={{ option: { dense: true }, select: { MenuProps: {} } }} />,
    ]
    const rejected = [
      // @ts-expect-error: options is required
      <Select label="Size" />,
      // @ts-expect-error: a number value for string options
      <Select options={sizes} value={10} />,
      // @ts-expect-error: onChange receives a number
      <Select options={numbers} onChange={(_event, value: string) => value} />,
      // @ts-expect-error: values are strings or numbers
      <Select options={[{ value: true, label: 'Yes' }]} />,
      // @ts-expect-error: options replace children
      <Select options={sizes}>child</Select>,
      // @ts-expect-error: not part of SelectProps
      <Select options={sizes} multiline />,
      // @ts-expect-error: not part of SelectProps
      <Select options={sizes} placeholder="Pick one" />,
      // @ts-expect-error: not part of SelectProps
      <Select options={sizes} select />,
      // @ts-expect-error: disableUnderline isn't on the outlined input
      <Select options={sizes} variant="outlined" slotProps={{ input: { disableUnderline: true } }} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(16)
  })
})
