import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { TextField } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const textbox = (name?: string) => screen.getByRole('textbox', name ? { name } : undefined)

const label = () => document.querySelector<HTMLLabelElement>('label.MuiInputLabel-root')!

const outline = (input: HTMLElement) =>
  input.closest('.MuiOutlinedInput-root')!.querySelector('fieldset')!

const css = () =>
  [...document.querySelectorAll('style')].map((style) => style.textContent).join('')

const light = createCmTheme().colorSchemes.light!.palette

describe('TextField', () => {
  it('renders a textbox named by its label, linked by for and id', () => {
    render(<TextField label="Email" type="email" />)

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('type', 'email')
    expect(label()).toHaveAttribute('for', input.id)
  })

  it('links helperText to the input with aria-describedby', () => {
    render(<TextField label="Email" helperText="We never share it" />)

    expect(textbox()).toHaveAccessibleDescription('We never share it')
  })

  it('sets aria-invalid on the input and Mui-error on the label for error', () => {
    render(<TextField label="Email" error helperText="Enter an email" />)

    expect(textbox()).toHaveAttribute('aria-invalid', 'true')
    expect(label()).toHaveClass('Mui-error')
    expect(screen.getByText('Enter an email')).toHaveClass('Mui-error')
  })

  it('sets required on the input and shows an asterisk', () => {
    render(<TextField label="Email" required />)

    const input = screen.getByRole('textbox', { name: /Email/ })
    expect(input).toBeRequired()
    expect(label().querySelector('.MuiFormLabel-asterisk')).toHaveTextContent('*')
  })

  it('passes ref to the root element and slotProps.htmlInput to the input', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <TextField ref={ref} label="Code" slotProps={{ htmlInput: { inputMode: 'numeric' } }} />,
    )

    expect(ref.current).toHaveClass('MuiFormControl-root')
    expect(ref.current).toContainElement(textbox())
    expect(textbox()).toHaveAttribute('inputmode', 'numeric')
  })

  it('passes className, sx and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <TextField
        ref={ref}
        label="Name"
        className="custom"
        sx={{ marginTop: '7px' }}
        data-testid="name"
      />,
    )

    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px' })
    expect(ref.current).toHaveAttribute('data-testid', 'name')
  })

  it('calls onChange while typing and updates a controlled value', async () => {
    const onChange = vi.fn()
    function Controlled() {
      const [name, setName] = useState('')
      return (
        <TextField
          label="Name"
          value={name}
          onChange={(event) => {
            onChange(event.target.value)
            setName(event.target.value)
          }}
        />
      )
    }
    render(<Controlled />)

    await userEvent.type(textbox(), 'Ada')

    expect(onChange).toHaveBeenLastCalledWith('Ada')
    expect(textbox()).toHaveValue('Ada')
  })

  it('renders a textarea for multiline', () => {
    render(<TextField label="Notes" multiline minRows={3} />)

    expect(textbox('Notes').tagName).toBe('TEXTAREA')
  })

  describe('with the keyboard', () => {
    it('takes focus with Tab and edits the text by typing', async () => {
      render(<TextField label="Name" />)

      await userEvent.tab()
      expect(textbox()).toHaveFocus()

      await userEvent.keyboard('Grace')
      expect(textbox()).toHaveValue('Grace')
    })

    it('skips a disabled field', async () => {
      render(
        <>
          <TextField label="Disabled" disabled />
          <TextField label="Enabled" />
        </>,
      )

      await userEvent.tab()

      expect(textbox('Enabled')).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('gives the outlined border grey[500] at rest', () => {
      renderThemed(<TextField label="Name" />)

      expect(outline(textbox())).toHaveStyle({ borderColor: light.grey[500] })
    })

    it('keeps grey[500] on hover on touch screens', () => {
      renderThemed(<TextField label="Name" />)

      const touchRules = [...css().matchAll(/@media \(hover: none\)\{([^}]+)\}/g)].map(
        (match) => match[1],
      )
      expect(touchRules.at(-1)).toMatch(
        /&?:hover \.MuiOutlinedInput-notchedOutline\{border-color:var\(--mui-palette-grey-500\)/,
      )
    })

    it('keeps MUI’s border on hover', () => {
      renderThemed(<TextField label="Name" />)

      expect(css()).toMatch(
        /MuiOutlinedInput-root:hover \.MuiOutlinedInput-notchedOutline\{border-color:var\(--mui-palette-text-primary\)/,
      )
    })

    it('keeps MUI’s focus, error and disabled borders', async () => {
      renderThemed(
        <>
          <TextField label="Focused" />
          <TextField label="Error" error />
          <TextField label="Disabled" disabled />
        </>,
      )

      await userEvent.click(textbox('Focused'))

      expect(outline(textbox('Focused'))).toHaveStyle({
        borderColor: light.primary.main,
        borderWidth: '2px',
      })
      expect(outline(textbox('Error'))).toHaveStyle({ borderColor: light.error.main })
      expect(outline(textbox('Disabled'))).toHaveStyle({ borderColor: light.action.disabled })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiOutlinedInput notchedOutline override', () => {
      renderThemed(<TextField label="Name" />, {
        components: {
          MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: 'rgb(170, 0, 0)' } } },
        },
      })

      expect(outline(textbox())).toHaveStyle({ borderColor: 'rgb(170, 0, 0)' })
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<TextField ref={ref} label="Name" sx={{ marginTop: '9px' }} />, {
        components: { MuiTextField: { styleOverrides: { root: { marginTop: '3px' } } } },
      })

      expect(ref.current).toHaveStyle({ marginTop: '9px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and its translucent border', async () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })
      render(
        <ThemeProvider theme={theme}>
          <TextField label="Name" />
        </ThemeProvider>,
      )

      expect(outline(textbox())).toHaveStyle({ borderColor: 'rgba(0, 0, 0, 0.23)' })

      await userEvent.click(textbox())
      expect(outline(textbox())).toHaveStyle({ borderColor: '#aa0000' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <TextField label="Name" variant="filled" size="small" fullWidth />,
      <TextField slotProps={{ htmlInput: { inputMode: 'numeric' }, inputLabel: { shrink: true } }} />,
    ]
    const rejected = [
      // @ts-expect-error: not a TextField prop
      <TextField unknownProp />,
      // @ts-expect-error: MUI 9 removed inputProps
      <TextField inputProps={{}} />,
      // @ts-expect-error: not a variant
      <TextField variant="underlined" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(5)
  })
})
