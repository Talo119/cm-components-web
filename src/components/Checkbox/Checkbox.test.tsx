import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Checkbox } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const checkbox = (name?: string) =>
  screen.getByRole<HTMLInputElement>('checkbox', name ? { name } : undefined)

const box = (input: HTMLElement) => input.closest<HTMLElement>('.MuiCheckbox-root')!

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette

describe('Checkbox', () => {
  it('renders a checkbox named by its label, inside a <label>', () => {
    render(<Checkbox label="Remember me" />)

    const input = checkbox('Remember me')
    expect(input).toHaveAttribute('type', 'checkbox')
    expect(input.closest('label')).toHaveTextContent('Remember me')
  })

  it('names the input with aria-label when there is no label', () => {
    const { container } = render(<Checkbox aria-label="Select row" />)

    expect(checkbox('Select row')).toBeInTheDocument()
    expect(container.querySelector('label')).toBeNull()
    expect(box(checkbox())).not.toHaveAttribute('aria-label')
  })

  it('names the input with aria-labelledby', () => {
    render(
      <>
        <span id="row-name">Order 42</span>
        <Checkbox aria-labelledby="row-name" />
      </>,
    )

    expect(checkbox('Order 42')).toBeInTheDocument()
  })

  it('links helperText to the input, joined with the consumer’s aria-describedby', () => {
    render(
      <>
        <span id="hint">Applies to this device</span>
        <Checkbox label="Remember me" helperText="For 30 days" aria-describedby="hint" />
      </>,
    )

    expect(checkbox()).toHaveAccessibleDescription('Applies to this device For 30 days')
  })

  it('builds the helper text id from id', () => {
    render(<Checkbox id="terms" label="Terms" helperText="Required" />)

    expect(checkbox()).toHaveAttribute('id', 'terms')
    expect(screen.getByText('Required')).toHaveAttribute('id', 'terms-helper-text')
    expect(checkbox()).toHaveAttribute('aria-describedby', 'terms-helper-text')
  })

  it('has no aria-describedby or aria-invalid by default', () => {
    render(<Checkbox label="Remember me" />)

    expect(checkbox()).not.toHaveAttribute('aria-describedby')
    expect(checkbox()).not.toHaveAttribute('aria-invalid')
  })

  it('sets aria-invalid on the input and Mui-error on the label and helper text for error', () => {
    render(<Checkbox label="Terms" error helperText="You must accept the terms" />)

    expect(checkbox()).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox().closest('label')).toHaveClass('Mui-error')
    expect(screen.getByText('You must accept the terms')).toHaveClass('Mui-error')
  })

  it('sets required on the input and shows an asterisk after the label', () => {
    render(<Checkbox label="Terms" required />)

    expect(checkbox()).toBeRequired()
    const asterisk = checkbox().closest('label')!.querySelector('.MuiFormControlLabel-asterisk')
    expect(asterisk).toHaveTextContent('*')
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('disables the input and dims the label', () => {
    render(<Checkbox label="Terms" disabled />)

    expect(checkbox()).toBeDisabled()
    expect(checkbox().closest('label')).toHaveClass('Mui-disabled')
    expect(screen.getByText('Terms')).toHaveClass('Mui-disabled')
  })

  it('works uncontrolled with defaultChecked', async () => {
    render(<Checkbox label="Remember me" defaultChecked />)

    expect(checkbox()).toBeChecked()
    await userEvent.click(checkbox())

    expect(checkbox()).not.toBeChecked()
  })

  it('works controlled, passing the event and the new checked value to onChange', async () => {
    const onChange = vi.fn()
    function Controlled() {
      const [accepted, setAccepted] = useState(false)
      return (
        <Checkbox
          label="Terms"
          checked={accepted}
          onChange={(event, checked) => {
            onChange(event.target, checked)
            setAccepted(checked)
          }}
        />
      )
    }
    render(<Controlled />)

    await userEvent.click(screen.getByText('Terms'))

    expect(onChange).toHaveBeenCalledWith(checkbox(), true)
    expect(checkbox()).toBeChecked()
  })

  it('does not change a controlled value without onChange updating it', async () => {
    render(<Checkbox label="Terms" checked={false} onChange={() => {}} />)

    await userEvent.click(checkbox())

    expect(checkbox()).not.toBeChecked()
  })

  it('keeps the input, its state and focus when error and helperText change', async () => {
    const { rerender } = render(<Checkbox label="Terms" />)
    const input = checkbox()
    await userEvent.click(input)
    expect(input).toHaveFocus()

    rerender(<Checkbox label="Terms" error helperText="Something is wrong" />)
    expect(checkbox()).toBe(input)
    expect(input).toBeChecked()
    expect(input).toHaveFocus()

    rerender(<Checkbox label="Terms" />)
    expect(checkbox()).toBe(input)
    expect(input).toBeChecked()
    expect(input).toHaveFocus()
  })

  it('sets the input’s indeterminate property', () => {
    const { rerender } = render(<Checkbox label="All" indeterminate />)

    expect(checkbox().indeterminate).toBe(true)
    expect(checkbox()).toBePartiallyChecked()

    rerender(<Checkbox label="All" />)
    expect(checkbox().indeterminate).toBe(false)
  })

  it('sends name and value with a submitted form when checked', async () => {
    render(
      <form data-testid="form">
        <Checkbox label="Newsletter" name="newsletter" value="yes" />
        <Checkbox label="Remember" name="remember" />
      </form>,
    )

    const form = () => new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(form().has('newsletter')).toBe(false)

    await userEvent.click(checkbox('Newsletter'))
    await userEvent.click(checkbox('Remember'))

    expect(form().get('newsletter')).toBe('yes')
    expect(form().get('remember')).toBe('on')
  })

  it('passes ref to the root element and inputRef to the input', () => {
    const ref = createRef<HTMLDivElement>()
    const inputRef = createRef<HTMLInputElement>()
    const htmlInputRef = createRef<HTMLInputElement>()
    render(
      <Checkbox
        ref={ref}
        inputRef={inputRef}
        label="Terms"
        slotProps={{ htmlInput: { ref: htmlInputRef } }}
      />,
    )

    expect(ref.current).toHaveClass('MuiFormControl-root')
    expect(ref.current?.tagName).toBe('DIV')
    expect(inputRef.current).toBe(checkbox())
    expect(htmlInputRef.current).toBe(checkbox())
  })

  it('passes className, sx, style and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Checkbox
        ref={ref}
        label="Terms"
        className="custom"
        sx={{ marginTop: '7px' }}
        style={{ paddingLeft: '5px' }}
        data-testid="terms"
      />,
    )

    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px', paddingLeft: '5px' })
    expect(ref.current).toHaveAttribute('data-testid', 'terms')
    expect(checkbox()).not.toHaveAttribute('data-testid')
  })

  it.each(['start', 'top', 'bottom'] as const)(
    'passes labelPlacement="%s" to FormControlLabel',
    (labelPlacement) => {
      render(<Checkbox label="Terms" labelPlacement={labelPlacement} />)

      const className = `MuiFormControlLabel-labelPlacement${labelPlacement[0].toUpperCase()}${labelPlacement.slice(1)}`
      expect(checkbox().closest('label')).toHaveClass(className)
    },
  )

  it('passes each slot in slotProps to its element', () => {
    render(
      <Checkbox
        label="Terms"
        helperText="Required"
        slotProps={{
          control: { edge: 'start', className: 'control' },
          htmlInput: { 'data-testid': 'input' } as object,
          formControlLabel: { className: 'label' },
          formHelperText: { className: 'helper' },
        }}
      />,
    )

    expect(box(checkbox())).toHaveClass('control', 'PrivateSwitchBase-edgeStart')
    expect(screen.getByTestId('input')).toBe(checkbox())
    expect(checkbox().closest('label')).toHaveClass('label')
    expect(screen.getByText('Required')).toHaveClass('helper')
  })

  it('passes MUI Checkbox props to the box and input', () => {
    render(
      <Checkbox
        label="Terms"
        color="secondary"
        size="small"
        icon={<svg data-testid="icon" />}
        disableRipple
      />,
    )

    expect(box(checkbox())).toHaveClass('MuiCheckbox-colorSecondary', 'MuiCheckbox-sizeSmall')
    expect(box(checkbox())).toContainElement(screen.getByTestId('icon'))
  })

  describe('with the keyboard', () => {
    it('takes focus with Tab, toggles with Space and not with Enter', async () => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      render(<Checkbox label="Terms" onFocus={onFocus} onBlur={onBlur} />)

      await userEvent.tab()
      expect(checkbox()).toHaveFocus()
      expect(onFocus).toHaveBeenCalledOnce()

      await userEvent.keyboard('{Enter}')
      expect(checkbox()).not.toBeChecked()

      await userEvent.keyboard(' ')
      expect(checkbox()).toBeChecked()

      await userEvent.tab()
      expect(onBlur).toHaveBeenCalledOnce()
    })

    it('skips a disabled checkbox', async () => {
      render(
        <>
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Enabled" />
        </>,
      )

      await userEvent.tab()

      expect(checkbox('Enabled')).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('gives the box Mui-focusVisible and a solid outline on keyboard focus', async () => {
      renderThemed(<Checkbox label="Terms" />)

      await userEvent.tab()

      expect(box(checkbox())).toHaveClass('Mui-focusVisible')
      expect(box(checkbox()).querySelector('svg')).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })

    it('puts the helper text below the box with no left indent', () => {
      renderThemed(<Checkbox label="Terms" helperText="Required" />)

      const helperText = screen.getByText('Required')
      expect(helperText).not.toHaveClass('MuiFormHelperText-contained')
      expect(helperText).toHaveStyle({ marginLeft: '0px' })
    })

    it('adds no margin or padding to the root without a label', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<Checkbox ref={ref} aria-label="Select row" />)

      expect(ref.current).toHaveStyle({
        display: 'inline-flex',
        margin: '0px',
        padding: '0px',
      })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiCheckbox styleOverrides.root object', () => {
      renderThemed(<Checkbox label="Terms" />, {
        components: { MuiCheckbox: { styleOverrides: { root: { padding: '3px' } } } },
      })

      expect(box(checkbox())).toHaveStyle({ padding: '3px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<Checkbox ref={ref} label="Terms" sx={{ marginTop: '9px' }} />, {
        components: { MuiFormControl: { styleOverrides: { root: { marginTop: '3px' } } } },
      })

      expect(ref.current).toHaveStyle({ marginTop: '9px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', async () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })
      render(
        <ThemeProvider theme={theme}>
          <Checkbox label="Terms" defaultChecked />
        </ThemeProvider>,
      )

      expect(box(checkbox())).toHaveStyle({ color: '#aa0000' })

      await userEvent.tab()
      expect(box(checkbox())).toHaveClass('Mui-focusVisible')
      expect(box(checkbox()).querySelector('svg')).not.toHaveStyle({ outlineStyle: 'solid' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Checkbox label="Terms" checked onChange={(_event, checked: boolean) => checked} />,
      <Checkbox aria-label="Row" name="row" value="42" size="small" color="secondary" />,
      <Checkbox label="All" indeterminate labelPlacement="start" sx={{ mt: 1 }} />,
      <Checkbox slotProps={{ control: { edge: 'end', readOnly: true } }} />,
    ]
    const rejected = [
      // @ts-expect-error: not a Checkbox prop
      <Checkbox unknownProp />,
      // @ts-expect-error: reached through slotProps.control
      <Checkbox edge="start" />,
      // @ts-expect-error: reached through slotProps.control
      <Checkbox readOnly />,
      // @ts-expect-error: not a labelPlacement value
      <Checkbox labelPlacement="left" />,
      // @ts-expect-error: control and label are set by Checkbox
      <Checkbox slotProps={{ formControlLabel: { label: 'x' } }} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(9)
  })
})
