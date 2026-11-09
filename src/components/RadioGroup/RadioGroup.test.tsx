import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { RadioGroup } from './index.ts'
import type { RadioOption } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const group = (name?: string) => screen.getByRole('radiogroup', name ? { name } : undefined)
const radio = (name: string) => screen.getByRole<HTMLInputElement>('radio', { name })
const radios = () => screen.getAllByRole<HTMLInputElement>('radio')
const radioRoot = (input: HTMLElement) => input.closest<HTMLElement>('.MuiRadio-root')!

const light = createCmTheme().colorSchemes.light!.palette

const plans = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
] as const satisfies readonly RadioOption[]

describe('RadioGroup', () => {
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

  it('renders a radiogroup named by its label, with one named radio per option, in order', () => {
    render(<RadioGroup label="Plan" options={plans} />)

    const radiogroup = group('Plan')
    const inputs = within(radiogroup).getAllByRole('radio')
    expect(inputs.map((input) => input.getAttribute('value'))).toEqual(['free', 'pro', 'team'])
    expect(radio('Free')).toBe(inputs[0])
    expect(radio('Pro')).toBe(inputs[1])
    expect(radio('Team')).toBe(inputs[2])
    expect(screen.getByText('Plan').tagName).toBe('LABEL')
    expectNoWarnings()
  })

  it('names the group with aria-label when there is no label', () => {
    const { container } = render(<RadioGroup aria-label="Plan" options={plans} />)

    expect(group('Plan')).toBeInTheDocument()
    expect(group()).not.toHaveAttribute('aria-labelledby')
    expect(container.querySelector('.MuiFormLabel-root')).toBeNull()
    expect(container.firstElementChild).not.toHaveAttribute('aria-label')
  })

  it('names the group with aria-labelledby', () => {
    render(
      <>
        <h2 id="plan-heading">Choose a plan</h2>
        <RadioGroup aria-labelledby="plan-heading" options={plans} />
      </>,
    )

    expect(group('Choose a plan')).toBeInTheDocument()
  })

  it('calls onChange with the event and the option’s value', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup
        label="Plan"
        options={plans}
        onChange={(event, value) => onChange(event.target, value)}
      />,
    )

    await userEvent.click(radio('Pro'))

    expect(onChange).toHaveBeenCalledExactlyOnceWith(radio('Pro'), 'pro')
  })

  it('works controlled with value and onChange', async () => {
    function Controlled() {
      const [plan, setPlan] = useState<(typeof plans)[number]['value']>('free')
      return (
        <RadioGroup label="Plan" options={plans} value={plan} onChange={(_, value) => setPlan(value)} />
      )
    }
    render(<Controlled />)

    expect(radio('Free')).toBeChecked()
    await userEvent.click(radio('Team'))

    expect(radio('Team')).toBeChecked()
    expect(radio('Free')).not.toBeChecked()
    expectNoWarnings()
  })

  it('does not change a controlled value without onChange updating it', async () => {
    render(<RadioGroup label="Plan" options={plans} value="free" onChange={() => {}} />)

    await userEvent.click(radio('Pro'))

    expect(radio('Free')).toBeChecked()
    expect(radio('Pro')).not.toBeChecked()
  })

  it('works uncontrolled with defaultValue', async () => {
    render(<RadioGroup label="Plan" options={plans} defaultValue="pro" />)

    expect(radio('Pro')).toBeChecked()
    await userEvent.click(radio('Team'))

    expect(radio('Team')).toBeChecked()
    expect(radio('Pro')).not.toBeChecked()
    expectNoWarnings()
  })

  it('starts with nothing selected when uncontrolled without defaultValue', async () => {
    render(<RadioGroup label="Plan" options={plans} />)

    expect(radios().filter((input) => input.checked)).toEqual([])
    await userEvent.click(radio('Free'))

    expect(radio('Free')).toBeChecked()
    expectNoWarnings()
  })

  it('selects nothing for value={null}, without warnings', () => {
    const { rerender } = render(<RadioGroup label="Plan" options={plans} value="pro" onChange={() => {}} />)

    rerender(<RadioGroup label="Plan" options={plans} value={null} onChange={() => {}} />)

    expect(radios().filter((input) => input.checked)).toEqual([])
    expectNoWarnings()
  })

  it('does not select an option whose value is the text "null" for value={null}', () => {
    render(
      <RadioGroup
        label="Answer"
        options={[
          { value: 'null', label: 'Null' },
          { value: '', label: 'Empty' },
        ]}
        value={null}
        onChange={() => {}}
      />,
    )

    expect(radios().filter((input) => input.checked)).toEqual([])
  })

  it('selects no radio for a value that is not in options', () => {
    render(<RadioGroup label="Plan" options={plans} value={'gold' as 'free'} onChange={() => {}} />)

    expect(radios().filter((input) => input.checked)).toEqual([])
    expectNoWarnings()
  })

  it('shares a generated name between its radios, different from another group’s', () => {
    render(
      <>
        <RadioGroup label="Plan" options={plans} />
        <RadioGroup label="Billing" options={[{ value: 'monthly', label: 'Monthly' }]} />
      </>,
    )

    const names = radios().map((input) => input.name)
    expect(names[0]).not.toBe('')
    expect(new Set(names.slice(0, 3)).size).toBe(1)
    expect(names[3]).not.toBe(names[0])
  })

  it('submits the selected value under name', async () => {
    render(
      <form data-testid="form">
        <RadioGroup label="Plan" name="plan" options={plans} />
      </form>,
    )

    const form = () => new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(radios().every((input) => input.name === 'plan')).toBe(true)
    expect(form().has('plan')).toBe(false)

    await userEvent.click(radio('Team'))

    expect(form().get('plan')).toBe('team')
  })

  it('makes a disabled option impossible to pick', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup
        label="Plan"
        options={[...plans.slice(0, 2), { value: 'team', label: 'Team', disabled: true }]}
        onChange={onChange}
      />,
    )

    expect(radio('Team')).toBeDisabled()
    expect(radio('Free')).toBeEnabled()
    expect(screen.getByText('Team')).toHaveClass('Mui-disabled')
    await userEvent.click(screen.getByText('Team'))

    expect(radio('Team')).not.toBeChecked()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables every radio for disabled on the group', () => {
    render(<RadioGroup label="Plan" options={plans} disabled />)

    expect(radios().every((input) => input.disabled)).toBe(true)
    expect(screen.getByText('Plan')).toHaveClass('Mui-disabled')
  })

  it('links helperText to the group, joined with the consumer’s aria-describedby', () => {
    render(
      <>
        <span id="hint">Billed monthly</span>
        <RadioGroup
          label="Plan"
          options={plans}
          helperText="You can change it later"
          aria-describedby="hint"
        />
      </>,
    )

    expect(group()).toHaveAccessibleDescription('Billed monthly You can change it later')
  })

  it('builds the label and helper text ids from id, and keeps id on the root', () => {
    const { container } = render(
      <RadioGroup id="plan" label="Plan" options={plans} helperText="Pick one" />,
    )

    expect(container.firstElementChild).toHaveAttribute('id', 'plan')
    expect(screen.getByText('Plan')).toHaveAttribute('id', 'plan-label')
    expect(screen.getByText('Pick one')).toHaveAttribute('id', 'plan-helper-text')
    expect(group()).toHaveAttribute('aria-labelledby', 'plan-label')
    expect(group()).toHaveAttribute('aria-describedby', 'plan-helper-text')
  })

  it('has no aria-describedby, aria-invalid or aria-required by default', () => {
    render(<RadioGroup label="Plan" options={plans} />)

    expect(group()).not.toHaveAttribute('aria-describedby')
    expect(group()).not.toHaveAttribute('aria-invalid')
    expect(group()).not.toHaveAttribute('aria-required')
  })

  it('sets aria-invalid on the group and Mui-error on the label and helper text for error', () => {
    render(<RadioGroup label="Plan" options={plans} error helperText="Pick a plan" />)

    expect(group()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Plan')).toHaveClass('Mui-error')
    expect(screen.getByText('Pick a plan')).toHaveClass('Mui-error')
  })

  it('sets aria-required on the group and required on every radio, with one asterisk', () => {
    const { container } = render(<RadioGroup label="Plan" options={plans} required />)

    expect(group()).toHaveAttribute('aria-required', 'true')
    expect(radios().every((input) => input.required)).toBe(true)
    const asterisks = container.querySelectorAll('[class*="asterisk"]')
    expect(asterisks).toHaveLength(1)
    expect(asterisks[0]).toHaveClass('MuiFormLabel-asterisk')
    expect(asterisks[0]).toHaveTextContent('*')
  })

  it('stops native form validation on a required group with nothing selected', async () => {
    render(
      <form data-testid="form">
        <RadioGroup label="Plan" name="plan" options={plans} required />
      </form>,
    )
    const form = screen.getByTestId<HTMLFormElement>('form')

    expect(form.checkValidity()).toBe(false)
    await userEvent.click(radio('Pro'))

    expect(form.checkValidity()).toBe(true)
  })

  it('adds MUI’s row class to the group for row', () => {
    const { rerender } = render(<RadioGroup label="Plan" options={plans} />)
    expect(group()).not.toHaveClass('MuiFormGroup-row')

    rerender(<RadioGroup label="Plan" options={plans} row />)
    expect(group()).toHaveClass('MuiFormGroup-row')
  })

  it('passes color and size to every Radio', () => {
    render(<RadioGroup label="Plan" options={plans} color="secondary" size="small" />)

    for (const input of radios()) {
      expect(radioRoot(input)).toHaveClass('MuiRadio-colorSecondary', 'MuiRadio-sizeSmall')
    }
  })

  it('keeps the radios, their state and focus when error and helperText change', async () => {
    const { rerender } = render(<RadioGroup label="Plan" options={plans} />)
    const inputs = radios()
    await userEvent.click(radio('Pro'))
    expect(radio('Pro')).toHaveFocus()

    rerender(<RadioGroup label="Plan" options={plans} error helperText="Something is wrong" />)
    expect(radios()).toEqual(inputs)
    expect(radio('Pro')).toBeChecked()
    expect(radio('Pro')).toHaveFocus()

    rerender(<RadioGroup label="Plan" options={plans} />)
    expect(radios()).toEqual(inputs)
    expect(radio('Pro')).toBeChecked()
    expect(radio('Pro')).toHaveFocus()
  })

  it('renders the label, an empty group and the helper text with no options', () => {
    render(<RadioGroup label="Plan" options={[]} helperText="No plans available" />)

    expect(group('Plan')).toBeEmptyDOMElement()
    expect(screen.getByText('No plans available')).toBeInTheDocument()
  })

  it('passes ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<RadioGroup ref={ref} label="Plan" options={plans} />)

    expect(ref.current).toHaveClass('MuiFormControl-root')
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current).toContainElement(group())
  })

  it('passes className, sx, style and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <RadioGroup
        ref={ref}
        label="Plan"
        options={plans}
        className="custom"
        sx={{ marginTop: '7px' }}
        style={{ paddingLeft: '5px' }}
        data-testid="plan"
      />,
    )

    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px', paddingLeft: '5px' })
    expect(ref.current).toHaveAttribute('data-testid', 'plan')
    expect(group()).not.toHaveAttribute('data-testid')
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <RadioGroup
        label="Plan"
        options={plans}
        helperText="Pick one"
        slotProps={{
          formLabel: { className: 'group-label' },
          radioGroup: { className: 'group' },
          formControlLabel: { className: 'option' },
          control: { className: 'control', disableRipple: true },
          formHelperText: { className: 'helper' },
        }}
      />,
    )

    expect(screen.getByText('Plan')).toHaveClass('group-label')
    expect(group()).toHaveClass('group')
    for (const input of radios()) {
      expect(input.closest('label')).toHaveClass('option')
      expect(radioRoot(input)).toHaveClass('control')
    }
    expect(screen.getByText('Pick one')).toHaveClass('helper')
  })

  it('keeps required on the inputs when slotProps.control sets input props', () => {
    render(
      <RadioGroup
        label="Plan"
        options={plans}
        required
        slotProps={{ control: { slotProps: { input: { className: 'input' } } } }}
      />,
    )

    for (const input of radios()) {
      expect(input).toHaveClass('input')
      expect(input).toBeRequired()
    }
  })

  describe('with the keyboard', () => {
    it('lands on the selected radio with Tab, moves with the arrows and leaves with Tab', async () => {
      const onChange = vi.fn()
      render(
        <>
          <RadioGroup
            label="Plan"
            options={[
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro', disabled: true },
              { value: 'team', label: 'Team' },
            ]}
            defaultValue="free"
            onChange={(_, value) => onChange(value)}
          />
          <button type="button">Next</button>
        </>,
      )

      await userEvent.tab()
      expect(radio('Free')).toHaveFocus()

      await userEvent.keyboard('{ArrowDown}')
      expect(radio('Team')).toHaveFocus()
      expect(radio('Team')).toBeChecked()
      expect(onChange).toHaveBeenCalledExactlyOnceWith('team')

      await userEvent.keyboard('{ArrowUp}')
      expect(radio('Free')).toHaveFocus()
      expect(radio('Free')).toBeChecked()

      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    })

    it('lands on the first enabled radio with Tab when nothing is selected', async () => {
      render(
        <RadioGroup
          label="Plan"
          options={[{ value: 'free', label: 'Free', disabled: true }, ...plans.slice(1)]}
        />,
      )

      await userEvent.tab()

      expect(radio('Pro')).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('gives the focused radio Mui-focusVisible and a solid outline on keyboard focus', async () => {
      renderThemed(<RadioGroup label="Plan" options={plans} defaultValue="pro" />)

      await userEvent.tab()

      expect(radioRoot(radio('Pro'))).toHaveClass('Mui-focusVisible')
      expect(radioRoot(radio('Pro')).querySelector('svg')).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })

    it('puts the helper text below the options with no left indent', () => {
      renderThemed(<RadioGroup label="Plan" options={plans} helperText="Pick one" />)

      const helperText = screen.getByText('Pick one')
      expect(helperText).not.toHaveClass('MuiFormHelperText-contained')
      expect(helperText).toHaveStyle({ marginLeft: '0px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiRadio styleOverrides.root object to every radio', () => {
      renderThemed(<RadioGroup label="Plan" options={plans} />, {
        components: { MuiRadio: { styleOverrides: { root: { padding: '3px' } } } },
      })

      for (const input of radios()) {
        expect(radioRoot(input)).toHaveStyle({ padding: '3px' })
      }
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<RadioGroup ref={ref} label="Plan" options={plans} sx={{ marginTop: '9px' }} />, {
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
          <RadioGroup label="Plan" options={plans} defaultValue="free" />
        </ThemeProvider>,
      )

      expect(radioRoot(radio('Free'))).toHaveStyle({ color: '#aa0000' })

      await userEvent.tab()
      expect(radioRoot(radio('Free'))).toHaveClass('Mui-focusVisible')
      expect(radioRoot(radio('Free')).querySelector('svg')).not.toHaveStyle({
        outlineStyle: 'solid',
      })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const strings: RadioOption[] = [{ value: 'a', label: 'A' }]
    const accepted = [
      <RadioGroup
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
        value="pro"
        onChange={(_event, value: 'free' | 'pro') => value}
      />,
      <RadioGroup options={plans} defaultValue={null} onChange={(_event, value: string) => value} />,
      <RadioGroup options={strings} value="anything" row color="secondary" size="small" />,
      <RadioGroup<'a' | 'b'> options={[{ value: 'a', label: 'A' }]} value="b" />,
      <RadioGroup
        options={plans}
        slotProps={{
          radioGroup: { className: 'x' },
          control: { disableRipple: true },
          formLabel: { focused: false },
        }}
      />,
    ]
    const rejected = [
      // @ts-expect-error: options is required
      <RadioGroup label="Plan" />,
      // @ts-expect-error: a value outside the options' values
      <RadioGroup options={plans} value="gold" />,
      // @ts-expect-error: a defaultValue outside the options' values
      <RadioGroup options={plans} defaultValue="gold" />,
      // @ts-expect-error: onChange receives one of the options' values
      <RadioGroup options={plans} onChange={(_event, value: 'gold') => value} />,
      // @ts-expect-error: values are strings
      <RadioGroup options={[{ value: 1, label: 'One' }]} />,
      // @ts-expect-error: control, label and value are set by RadioGroup
      <RadioGroup options={plans} slotProps={{ formControlLabel: { value: 'x' } }} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(11)
  })
})
