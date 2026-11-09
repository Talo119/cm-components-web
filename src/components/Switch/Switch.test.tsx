import { ThemeProvider, alpha, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Switch } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const switchInput = (name?: string) =>
  screen.getByRole<HTMLInputElement>('switch', name ? { name } : undefined)

const root = (input: HTMLElement) => input.closest<HTMLElement>('.MuiSwitch-root')!
const switchBase = (input: HTMLElement) => input.closest<HTMLElement>('.MuiSwitch-switchBase')!
const track = (input: HTMLElement) => root(input).querySelector<HTMLElement>('.MuiSwitch-track')!
const thumb = (input: HTMLElement) => root(input).querySelector<HTMLElement>('.MuiSwitch-thumb')!

const light = createCmTheme().colorSchemes.light!.palette

describe('Switch', () => {
  it('renders a switch named by its label, inside a <label>', () => {
    render(<Switch label="Email notifications" />)

    const input = switchInput('Email notifications')
    expect(input).toHaveAttribute('type', 'checkbox')
    expect(input.closest('label')).toHaveTextContent('Email notifications')
  })

  it('names the input with aria-label when there is no label', () => {
    const { container } = render(<Switch aria-label="Enable rule" />)

    expect(switchInput('Enable rule')).toBeInTheDocument()
    expect(container.querySelector('label')).toBeNull()
    expect(root(switchInput())).not.toHaveAttribute('aria-label')
  })

  it('names the input with aria-labelledby', () => {
    render(
      <>
        <span id="rule-name">Archive old orders</span>
        <Switch aria-labelledby="rule-name" />
      </>,
    )

    expect(switchInput('Archive old orders')).toBeInTheDocument()
  })

  it('links helperText to the input, joined with the consumer’s aria-describedby', () => {
    render(
      <>
        <span id="hint">Applies to this device</span>
        <Switch label="Dark mode" helperText="Follows the system" aria-describedby="hint" />
      </>,
    )

    expect(switchInput()).toHaveAccessibleDescription('Applies to this device Follows the system')
  })

  it('builds the helper text id from id', () => {
    render(<Switch id="dark" label="Dark mode" helperText="Follows the system" />)

    expect(switchInput()).toHaveAttribute('id', 'dark')
    expect(screen.getByText('Follows the system')).toHaveAttribute('id', 'dark-helper-text')
    expect(switchInput()).toHaveAttribute('aria-describedby', 'dark-helper-text')
  })

  it('has no aria-describedby or aria-invalid by default', () => {
    render(<Switch label="Dark mode" />)

    expect(switchInput()).not.toHaveAttribute('aria-describedby')
    expect(switchInput()).not.toHaveAttribute('aria-invalid')
  })

  it('sets aria-invalid on the input and Mui-error on the label and helper text for error', () => {
    render(<Switch label="Public profile" error helperText="Could not save" />)

    expect(switchInput()).toHaveAttribute('aria-invalid', 'true')
    expect(switchInput().closest('label')).toHaveClass('Mui-error')
    expect(screen.getByText('Could not save')).toHaveClass('Mui-error')
  })

  it('sets required on the input and shows an asterisk after the label', () => {
    render(<Switch label="Terms" required />)

    expect(switchInput()).toBeRequired()
    const asterisk = switchInput().closest('label')!.querySelector('.MuiFormControlLabel-asterisk')
    expect(asterisk).toHaveTextContent('*')
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('disables the input and dims the label', () => {
    render(<Switch label="Dark mode" disabled />)

    expect(switchInput()).toBeDisabled()
    expect(switchInput().closest('label')).toHaveClass('Mui-disabled')
    expect(screen.getByText('Dark mode')).toHaveClass('Mui-disabled')
  })

  it('works uncontrolled with defaultChecked', async () => {
    render(<Switch label="Email notifications" defaultChecked />)

    expect(switchInput()).toBeChecked()
    await userEvent.click(switchInput())

    expect(switchInput()).not.toBeChecked()
  })

  it('works controlled, passing the event and the new checked value to onChange', async () => {
    const onChange = vi.fn()
    function Controlled() {
      const [on, setOn] = useState(false)
      return (
        <Switch
          label="Dark mode"
          checked={on}
          onChange={(event, checked) => {
            onChange(event.target, checked)
            setOn(checked)
          }}
        />
      )
    }
    render(<Controlled />)

    await userEvent.click(screen.getByText('Dark mode'))

    expect(onChange).toHaveBeenCalledWith(switchInput(), true)
    expect(switchInput()).toBeChecked()
  })

  it('does not change a controlled value without onChange updating it', async () => {
    render(<Switch label="Dark mode" checked={false} onChange={() => {}} />)

    await userEvent.click(switchInput())

    expect(switchInput()).not.toBeChecked()
  })

  it('keeps the input, its state and focus when error and helperText change', async () => {
    const { rerender } = render(<Switch label="Dark mode" />)
    const input = switchInput()
    await userEvent.click(input)
    expect(input).toHaveFocus()

    rerender(<Switch label="Dark mode" error helperText="Something is wrong" />)
    expect(switchInput()).toBe(input)
    expect(input).toBeChecked()
    expect(input).toHaveFocus()

    rerender(<Switch label="Dark mode" />)
    expect(switchInput()).toBe(input)
    expect(input).toBeChecked()
    expect(input).toHaveFocus()
  })

  it('sends name and value with a submitted form when on', async () => {
    render(
      <form data-testid="form">
        <Switch label="Newsletter" name="newsletter" value="yes" />
        <Switch label="Remember" name="remember" />
      </form>,
    )

    const form = () => new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(form().has('newsletter')).toBe(false)

    await userEvent.click(switchInput('Newsletter'))
    await userEvent.click(switchInput('Remember'))

    expect(form().get('newsletter')).toBe('yes')
    expect(form().get('remember')).toBe('on')
  })

  it('passes ref to the root element and inputRef to the input', () => {
    const ref = createRef<HTMLDivElement>()
    const inputRef = createRef<HTMLInputElement>()
    const htmlInputRef = createRef<HTMLInputElement>()
    render(
      <Switch
        ref={ref}
        inputRef={inputRef}
        label="Dark mode"
        slotProps={{ htmlInput: { ref: htmlInputRef } }}
      />,
    )

    expect(ref.current).toHaveClass('MuiFormControl-root')
    expect(ref.current?.tagName).toBe('DIV')
    expect(inputRef.current).toBe(switchInput())
    expect(htmlInputRef.current).toBe(switchInput())
  })

  it('passes className, sx, style and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Switch
        ref={ref}
        label="Dark mode"
        className="custom"
        sx={{ marginTop: '7px' }}
        style={{ paddingLeft: '5px' }}
        data-testid="dark"
      />,
    )

    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px', paddingLeft: '5px' })
    expect(ref.current).toHaveAttribute('data-testid', 'dark')
    expect(switchInput()).not.toHaveAttribute('data-testid')
  })

  it.each(['start', 'top', 'bottom'] as const)(
    'passes labelPlacement="%s" to FormControlLabel',
    (labelPlacement) => {
      render(<Switch label="Dark mode" labelPlacement={labelPlacement} />)

      const className = `MuiFormControlLabel-labelPlacement${labelPlacement[0].toUpperCase()}${labelPlacement.slice(1)}`
      expect(switchInput().closest('label')).toHaveClass(className)
    },
  )

  it('passes each slot in slotProps to its element', () => {
    render(
      <Switch
        label="Dark mode"
        helperText="Follows the system"
        slotProps={{
          control: {
            edge: 'start',
            className: 'control',
            slotProps: { track: { className: 'track' }, thumb: { className: 'thumb' } },
          },
          htmlInput: { 'data-testid': 'input' } as object,
          formControlLabel: { className: 'label' },
          formHelperText: { className: 'helper' },
        }}
      />,
    )

    expect(root(switchInput())).toHaveClass('control', 'MuiSwitch-edgeStart')
    expect(track(switchInput())).toHaveClass('track')
    expect(thumb(switchInput())).toHaveClass('thumb')
    expect(screen.getByTestId('input')).toBe(switchInput())
    expect(switchInput().closest('label')).toHaveClass('label')
    expect(screen.getByText('Follows the system')).toHaveClass('helper')
  })

  it('passes MUI Switch props to the switch and input', () => {
    render(<Switch label="Dark mode" color="secondary" size="small" disableRipple />)

    expect(root(switchInput())).toHaveClass('MuiSwitch-sizeSmall')
    expect(switchBase(switchInput())).toHaveClass('MuiSwitch-colorSecondary')
  })

  describe('with the keyboard', () => {
    it('takes focus with Tab, toggles with Space and not with Enter', async () => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      render(<Switch label="Dark mode" onFocus={onFocus} onBlur={onBlur} />)

      await userEvent.tab()
      expect(switchInput()).toHaveFocus()
      expect(onFocus).toHaveBeenCalledOnce()

      await userEvent.keyboard('{Enter}')
      expect(switchInput()).not.toBeChecked()

      await userEvent.keyboard(' ')
      expect(switchInput()).toBeChecked()

      await userEvent.keyboard(' ')
      expect(switchInput()).not.toBeChecked()

      await userEvent.tab()
      expect(onBlur).toHaveBeenCalledOnce()
    })

    it('skips a disabled switch', async () => {
      render(
        <>
          <Switch label="Disabled" disabled />
          <Switch label="Enabled" />
        </>,
      )

      await userEvent.tab()

      expect(switchInput('Enabled')).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('gives the off track grey[500] with opacity 1', () => {
      renderThemed(<Switch label="Dark mode" />)

      expect(track(switchInput())).toHaveStyle({ backgroundColor: light.grey[500], opacity: '1' })
    })

    it('keeps MUI’s colors for the on and disabled tracks', () => {
      renderThemed(
        <>
          <Switch label="On" defaultChecked />
          <Switch label="Disabled" disabled />
        </>,
      )

      expect(track(switchInput('On'))).toHaveStyle({
        backgroundColor: alpha(light.primary.main, 0.5),
      })
      expect(track(switchInput('Disabled'))).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      })
    })

    it('keeps the off track opaque under a project theme with focusVisible: false', () => {
      renderThemed(
        <>
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
        </>,
        { focusVisible: false },
      )

      expect(track(switchInput('Off'))).toHaveStyle({
        backgroundColor: light.grey[500],
        opacity: '1',
      })
      expect(track(switchInput('On'))).toHaveStyle({ opacity: '0.5' })
    })

    it('shows the focus ring around the track on keyboard focus', async () => {
      renderThemed(<Switch label="Dark mode" />)

      await userEvent.tab()

      expect(switchBase(switchInput())).toHaveClass('Mui-focusVisible')
      expect(track(switchInput())).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })

    it('puts the helper text below the switch with no left indent', () => {
      renderThemed(<Switch label="Dark mode" helperText="Follows the system" />)

      const helperText = screen.getByText('Follows the system')
      expect(helperText).not.toHaveClass('MuiFormHelperText-contained')
      expect(helperText).toHaveStyle({ marginLeft: '0px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiSwitch styleOverrides.thumb object', () => {
      renderThemed(<Switch label="Dark mode" />, {
        components: { MuiSwitch: { styleOverrides: { thumb: { width: '13px' } } } },
      })

      expect(thumb(switchInput())).toHaveStyle({ width: '13px' })
    })

    it('replaces the library track rule with a project-level track', () => {
      renderThemed(<Switch label="Dark mode" />, {
        components: {
          MuiSwitch: { styleOverrides: { track: { backgroundColor: 'rgb(170, 0, 0)' } } },
        },
      })

      expect(track(switchInput())).toHaveStyle({ backgroundColor: 'rgb(170, 0, 0)' })
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<Switch ref={ref} label="Dark mode" sx={{ marginTop: '9px' }} />, {
        components: { MuiFormControl: { styleOverrides: { root: { marginTop: '3px' } } } },
      })

      expect(ref.current).toHaveStyle({ marginTop: '9px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and its translucent track', async () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })
      render(
        <ThemeProvider theme={theme}>
          <Switch label="Dark mode" defaultChecked />
        </ThemeProvider>,
      )

      expect(switchBase(switchInput())).toHaveStyle({ color: '#aa0000' })
      expect(track(switchInput())).not.toHaveStyle({ opacity: '1' })

      await userEvent.tab()
      expect(switchBase(switchInput())).toHaveClass('Mui-focusVisible')
      expect(track(switchInput())).not.toHaveStyle({ outlineStyle: 'solid' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Switch label="Dark mode" checked onChange={(_event, checked: boolean) => checked} />,
      <Switch aria-label="Rule" name="rule" value="42" size="small" color="secondary" />,
      <Switch label="Dark mode" labelPlacement="start" sx={{ mt: 1 }} />,
      <Switch slotProps={{ control: { edge: 'end', slotProps: { track: { className: 'x' } } } }} />,
    ]
    const rejected = [
      // @ts-expect-error: not a Switch prop
      <Switch unknownProp />,
      // @ts-expect-error: reached through slotProps.control
      <Switch edge="start" />,
      // @ts-expect-error: reached through slotProps.control
      <Switch icon={<span />} />,
      // @ts-expect-error: Checkbox only
      <Switch indeterminate />,
      // @ts-expect-error: not a labelPlacement value
      <Switch labelPlacement="left" />,
      // @ts-expect-error: control and label are set by Switch
      <Switch slotProps={{ formControlLabel: { label: 'x' } }} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(10)
  })
})
