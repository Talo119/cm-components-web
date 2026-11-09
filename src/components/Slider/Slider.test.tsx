import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Slider } from './index.ts'
import type { SliderProps } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const slider = (name?: string) => screen.getByRole<HTMLInputElement>('slider', name ? { name } : undefined)
const sliders = () => screen.getAllByRole<HTMLInputElement>('slider')
const sliderRoot = (input: HTMLElement) => input.closest<HTMLElement>('.MuiSlider-root')!
const thumb = (input: HTMLElement) => input.closest<HTMLElement>('.MuiSlider-thumb')!
const rail = (input: HTMLElement) => sliderRoot(input).querySelector<HTMLElement>('.MuiSlider-rail')!

const light = createCmTheme().colorSchemes.light!.palette

const priceLabel = (index: number) => (index === 0 ? 'Minimum price' : 'Maximum price')

describe('Slider', () => {
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

  it('renders a slider named by its label', () => {
    render(<Slider label="Volume" defaultValue={30} />)

    expect(slider('Volume')).toHaveAttribute('type', 'range')
    expect(slider()).toHaveAttribute('aria-valuenow', '30')
    expect(screen.getByText('Volume').tagName).toBe('LABEL')
    expectNoWarnings()
  })

  it('names the slider with aria-label when there is no label', () => {
    const { container } = render(<Slider aria-label="Opacity" />)

    expect(slider('Opacity')).toBeInTheDocument()
    expect(slider()).not.toHaveAttribute('aria-labelledby')
    expect(container.querySelector('.MuiFormLabel-root')).toBeNull()
    expect(container.firstElementChild).not.toHaveAttribute('aria-label')
    expect(container.firstElementChild).not.toHaveAttribute('role')
  })

  it('names the slider with aria-labelledby', () => {
    render(
      <>
        <h2 id="zoom-heading">Zoom level</h2>
        <Slider aria-labelledby="zoom-heading" />
      </>,
    )

    expect(slider('Zoom level')).toBeInTheDocument()
  })

  it('names each thumb with getAriaLabel and the root group with the label', () => {
    const { container } = render(
      <Slider label="Price" defaultValue={[20, 80]} getAriaLabel={priceLabel} />,
    )

    expect(sliders()).toEqual([slider('Minimum price'), slider('Maximum price')])
    for (const input of sliders()) {
      expect(input).not.toHaveAttribute('aria-labelledby')
    }
    expect(screen.getByRole('group', { name: 'Price' })).toBe(container.firstElementChild)
    expectNoWarnings()
  })

  it('names the root group with a consumer’s aria-labelledby when getAriaLabel is set', () => {
    render(
      <>
        <h2 id="price-heading">Price</h2>
        <Slider aria-labelledby="price-heading" defaultValue={[20, 80]} getAriaLabel={priceLabel} />
      </>,
    )

    expect(screen.getByRole('group', { name: 'Price' })).toBeInTheDocument()
    expect(slider('Minimum price')).not.toHaveAttribute('aria-labelledby')
  })

  it('has no group role with getAriaLabel and nothing to name the group', () => {
    const { container } = render(<Slider defaultValue={[20, 80]} getAriaLabel={priceLabel} />)

    expect(container.firstElementChild).not.toHaveAttribute('role')
    expect(slider('Maximum price')).toBeInTheDocument()
  })

  it('calls onChange with the event, the new value and the active thumb', () => {
    const onChange = vi.fn()
    render(<Slider label="Price" defaultValue={[20, 80]} getAriaLabel={priceLabel} onChange={onChange} />)

    fireEvent.change(slider('Maximum price'), { target: { value: 90 } })

    expect(onChange).toHaveBeenCalledOnce()
    const [event, value, activeThumb] = onChange.mock.calls[0]
    expect(event).toBeInstanceOf(Event)
    expect(value).toEqual([20, 90])
    expect(activeThumb).toBe(1)
  })

  it('works uncontrolled with defaultValue', async () => {
    render(<Slider label="Volume" defaultValue={30} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(slider()).toHaveAttribute('aria-valuenow', '31')
    expectNoWarnings()
  })

  it('works controlled with value and onChange, for one thumb and for a range', async () => {
    function Controlled() {
      const [volume, setVolume] = useState(30)
      const [price, setPrice] = useState([20, 80])
      return (
        <>
          <Slider label="Volume" value={volume} onChange={(_, value) => setVolume(value)} />
          <Slider
            label="Price"
            value={price}
            onChange={(_, value) => setPrice(value)}
            getAriaLabel={priceLabel}
          />
          <output data-testid="values">{`${volume} ${price.join('-')}`}</output>
        </>
      )
    }
    render(<Controlled />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.tab()
    await userEvent.keyboard('{End}')

    // The first thumb passes the second, so they swap.
    expect(slider('Minimum price')).toHaveAttribute('aria-valuenow', '80')
    expect(slider('Maximum price')).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByTestId('values')).toHaveTextContent('31 80-100')
    expectNoWarnings()
  })

  it('does not change a controlled value without onChange updating it', async () => {
    render(<Slider label="Volume" value={30} onChange={() => {}} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(slider()).toHaveAttribute('aria-valuenow', '30')
  })

  it('calls onChangeCommitted once after a key press', async () => {
    const onChange = vi.fn()
    const onChangeCommitted = vi.fn()
    render(
      <Slider
        label="Volume"
        defaultValue={30}
        onChange={(_, value) => onChange(value)}
        onChangeCommitted={(_, value) => onChangeCommitted(value)}
      />,
    )

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(onChange).toHaveBeenCalledExactlyOnceWith(31)
    expect(onChangeCommitted).toHaveBeenCalledExactlyOnceWith(31)
  })

  it('passes min, max, step and marks to the slider, and getAriaValueText to aria-valuetext', async () => {
    const { container } = render(
      <Slider
        label="Zoom"
        defaultValue={100}
        min={50}
        max={200}
        step={null}
        marks={[
          { value: 50, label: '50%' },
          { value: 100, label: '100%' },
          { value: 200, label: '200%' },
        ]}
        getAriaValueText={(value) => `${value} percent`}
      />,
    )

    expect(slider()).toHaveAttribute('aria-valuemin', '50')
    expect(slider()).toHaveAttribute('aria-valuemax', '200')
    expect(slider()).toHaveAttribute('aria-valuetext', '100 percent')
    expect(container.querySelectorAll('.MuiSlider-mark')).toHaveLength(3)
    expect(screen.getByText('200%')).toHaveAttribute('aria-hidden', 'true')

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(slider()).toHaveAttribute('aria-valuenow', '200')
    expect(slider()).toHaveAttribute('aria-valuetext', '200 percent')
  })

  it('passes aria-valuetext to a single thumb', () => {
    render(<Slider label="Volume" defaultValue={30} aria-valuetext="Quiet" />)

    expect(slider()).toHaveAttribute('aria-valuetext', 'Quiet')
  })

  it('links helperText to every thumb, joined with the consumer’s aria-describedby', () => {
    render(
      <>
        <span id="hint">In dollars</span>
        <Slider
          label="Price"
          defaultValue={[20, 80]}
          getAriaLabel={priceLabel}
          helperText="Prices include taxes"
          aria-describedby="hint"
        />
      </>,
    )

    for (const input of sliders()) {
      expect(input).toHaveAccessibleDescription('In dollars Prices include taxes')
    }
  })

  it('builds the label and helper text ids from id, and keeps id on the root', () => {
    const { container } = render(<Slider id="volume" label="Volume" helperText="Up to 100" />)

    expect(container.firstElementChild).toHaveAttribute('id', 'volume')
    expect(screen.getByText('Volume')).toHaveAttribute('id', 'volume-label')
    expect(screen.getByText('Up to 100')).toHaveAttribute('id', 'volume-helper-text')
    expect(slider()).toHaveAttribute('aria-labelledby', 'volume-label')
    expect(slider()).toHaveAttribute('aria-describedby', 'volume-helper-text')
  })

  it('has no aria-describedby or aria-invalid by default', () => {
    render(<Slider label="Volume" />)

    expect(slider()).not.toHaveAttribute('aria-describedby')
    expect(slider()).not.toHaveAttribute('aria-invalid')
  })

  it('sets aria-invalid on every thumb and Mui-error on the label and helper text for error', () => {
    render(
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        getAriaLabel={priceLabel}
        error
        helperText="Pick a smaller range"
      />,
    )

    for (const input of sliders()) {
      expect(input).toHaveAttribute('aria-invalid', 'true')
    }
    expect(screen.getByText('Price')).toHaveClass('Mui-error')
    expect(screen.getByText('Pick a smaller range')).toHaveClass('Mui-error')
  })

  it('disables the inputs and dims the label for disabled', () => {
    render(<Slider label="Price" defaultValue={[20, 80]} getAriaLabel={priceLabel} disabled />)

    for (const input of sliders()) {
      expect(input).toBeDisabled()
    }
    expect(sliderRoot(slider('Minimum price'))).toHaveClass('Mui-disabled')
    expect(screen.getByText('Price')).toHaveClass('Mui-disabled')
  })

  it('keeps the inputs, their value and focus when error and helperText change', async () => {
    const { rerender } = render(<Slider label="Volume" defaultValue={30} />)
    const input = slider()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(input).toHaveFocus()

    rerender(<Slider label="Volume" defaultValue={30} error helperText="Too loud" />)
    expect(slider()).toBe(input)
    expect(input).toHaveAttribute('aria-valuenow', '31')
    expect(input).toHaveFocus()

    rerender(<Slider label="Volume" defaultValue={30} />)
    expect(slider()).toBe(input)
    expect(input).toHaveAttribute('aria-valuenow', '31')
    expect(input).toHaveFocus()
  })

  it('submits each thumb’s value under name', () => {
    render(
      <form data-testid="form">
        <Slider label="Volume" name="volume" defaultValue={30} />
        <Slider label="Price" name="price" defaultValue={[20, 80]} getAriaLabel={priceLabel} />
      </form>,
    )

    const form = new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(form.getAll('volume')).toEqual(['30'])
    expect(form.getAll('price')).toEqual(['20', '80'])
  })

  it('passes color, size and orientation to the slider', () => {
    render(<Slider label="Volume" color="secondary" size="small" orientation="vertical" />)

    expect(sliderRoot(slider())).toHaveClass(
      'MuiSlider-colorSecondary',
      'MuiSlider-sizeSmall',
      'MuiSlider-vertical',
    )
    expect(slider()).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('passes ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Slider ref={ref} label="Volume" />)

    expect(ref.current).toHaveClass('MuiFormControl-root', 'MuiFormControl-fullWidth')
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current).toContainElement(slider())
  })

  it('passes className, sx, style and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Slider
        ref={ref}
        label="Volume"
        className="custom"
        sx={{ marginTop: '7px' }}
        style={{ paddingLeft: '5px' }}
        data-testid="volume"
      />,
    )

    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px', paddingLeft: '5px' })
    expect(ref.current).toHaveAttribute('data-testid', 'volume')
    expect(slider()).not.toHaveAttribute('data-testid')
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <Slider
        label="Volume"
        helperText="Up to 100"
        slotProps={{
          formLabel: { className: 'label' },
          control: { className: 'control', slotProps: { thumb: { className: 'thumb' } } },
          htmlInput: { className: 'input', 'aria-describedby': 'other' },
          formHelperText: { className: 'helper' },
        }}
      />,
    )

    expect(screen.getByText('Volume')).toHaveClass('label')
    expect(sliderRoot(slider())).toHaveClass('control')
    expect(thumb(slider())).toHaveClass('thumb')
    expect(slider()).toHaveClass('input')
    expect(slider()).toHaveAttribute('aria-describedby', 'other')
    expect(screen.getByText('Up to 100')).toHaveClass('helper')
  })

  it('keeps its input props when slotProps.control sets input props', () => {
    render(
      <Slider
        label="Volume"
        error
        slotProps={{
          control: { slotProps: { input: { className: 'from-control' } } },
          htmlInput: { className: 'from-html-input' },
        }}
      />,
    )

    expect(slider('Volume')).toHaveClass('from-control', 'from-html-input')
    expect(slider()).toHaveAttribute('aria-invalid', 'true')
  })

  describe('with the keyboard', () => {
    it('moves focus to each thumb in turn with Tab', async () => {
      render(
        <>
          <Slider label="Price" defaultValue={[20, 80]} getAriaLabel={priceLabel} />
          <button type="button">Search</button>
        </>,
      )

      await userEvent.tab()
      expect(slider('Minimum price')).toHaveFocus()
      await userEvent.tab()
      expect(slider('Maximum price')).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus()
    })

    it('changes the value with the arrows, Shift, Page Up, Page Down, Home and End', async () => {
      const onChange = vi.fn()
      render(
        <Slider
          label="Volume"
          defaultValue={50}
          step={2}
          shiftStep={20}
          onChange={(event, value, activeThumb) => onChange(event.type, value, activeThumb)}
        />,
      )
      const now = () => Number(slider().getAttribute('aria-valuenow'))

      await userEvent.tab()
      await userEvent.keyboard('{ArrowRight}')
      expect(now()).toBe(52)
      await userEvent.keyboard('{ArrowUp}')
      expect(now()).toBe(54)
      await userEvent.keyboard('{ArrowLeft}')
      expect(now()).toBe(52)
      await userEvent.keyboard('{ArrowDown}')
      expect(now()).toBe(50)
      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
      expect(now()).toBe(70)
      await userEvent.keyboard('{PageDown}')
      expect(now()).toBe(50)
      await userEvent.keyboard('{PageUp}')
      expect(now()).toBe(70)
      await userEvent.keyboard('{Home}')
      expect(now()).toBe(0)
      await userEvent.keyboard('{End}')
      expect(now()).toBe(100)

      expect(onChange).toHaveBeenLastCalledWith(expect.any(String), 100, 0)
    })

    it('can’t focus a disabled slider', async () => {
      render(
        <>
          <Slider label="Volume" disabled />
          <button type="button">Next</button>
        </>,
      )

      await userEvent.tab()

      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('gives the rail grey[500] with opacity 1', () => {
      renderThemed(<Slider label="Volume" />)

      expect(rail(slider())).toHaveStyle({ backgroundColor: light.grey[500], opacity: '1' })
    })

    it('keeps MUI’s styles for the disabled and inverted rails', () => {
      renderThemed(
        <>
          <Slider label="Disabled" disabled />
          <Slider label="Inverted" track="inverted" />
        </>,
      )

      expect(rail(slider('Disabled'))).toHaveStyle({ opacity: '0.38' })
      expect(rail(slider('Disabled'))).not.toHaveStyle({ backgroundColor: light.grey[500] })
      expect(rail(slider('Inverted'))).toHaveStyle({ opacity: '1' })
      expect(rail(slider('Inverted'))).not.toHaveStyle({ backgroundColor: light.grey[500] })
    })

    it('shows the focus ring around the thumb on keyboard focus', async () => {
      renderThemed(<Slider label="Volume" />)

      await userEvent.tab()

      expect(thumb(slider())).toHaveClass('Mui-focusVisible')
      expect(thumb(slider())).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })

    it('puts the helper text below the slider with no left indent', () => {
      renderThemed(<Slider label="Volume" helperText="Up to 100" />)

      const helperText = screen.getByText('Up to 100')
      expect(helperText).not.toHaveClass('MuiFormHelperText-contained')
      expect(helperText).toHaveStyle({ marginLeft: '0px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiSlider styleOverrides.thumb object', () => {
      renderThemed(<Slider label="Volume" />, {
        components: { MuiSlider: { styleOverrides: { thumb: { width: '13px' } } } },
      })

      expect(thumb(slider())).toHaveStyle({ width: '13px' })
    })

    it('replaces the library rail rule with a project-level rail', () => {
      renderThemed(<Slider label="Volume" />, {
        components: {
          MuiSlider: { styleOverrides: { rail: { backgroundColor: 'rgb(170, 0, 0)' } } },
        },
      })

      expect(rail(slider())).toHaveStyle({ backgroundColor: 'rgb(170, 0, 0)', opacity: '0.38' })
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<Slider ref={ref} label="Volume" sx={{ marginTop: '9px' }} />, {
        components: { MuiFormControl: { styleOverrides: { root: { marginTop: '3px' } } } },
      })

      expect(ref.current).toHaveStyle({ marginTop: '9px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and its translucent rail', async () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })
      render(
        <ThemeProvider theme={theme}>
          <Slider label="Volume" />
        </ThemeProvider>,
      )

      expect(sliderRoot(slider())).toHaveStyle({ color: '#aa0000' })
      expect(rail(slider())).toHaveStyle({ opacity: '0.38' })

      await userEvent.tab()
      expect(thumb(slider())).toHaveClass('Mui-focusVisible')
      expect(thumb(slider())).not.toHaveStyle({ outlineStyle: 'solid' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const range: readonly number[] = [1, 2]
    const accepted = [
      <Slider defaultValue={30} onChange={(_event, value: number) => value} />,
      <Slider defaultValue={30} onChange={(_event, value) => value === 40} />,
      <Slider defaultValue={[20, 80]} onChange={(_event, value: number[]) => value} />,
      <Slider value={range} onChange={(_event, value: readonly number[]) => value} />,
      <Slider onChange={(_event, value: number | number[]) => value} />,
      <Slider<number> value={1} step={null} marks track={false} valueLabelDisplay="auto" />,
      <Slider slotProps={{ control: { tabIndex: -1, slotProps: { rail: { className: 'x' } } } }} />,
    ]
    const rejected = [
      // @ts-expect-error: a number defaultValue gives onChange a number
      <Slider defaultValue={30} onChange={(_event, value: number[]) => value} />,
      // @ts-expect-error: an array defaultValue gives onChange an array
      <Slider defaultValue={[20, 80]} onChange={(_event, value: number) => value} />,
      // @ts-expect-error: Slider has no required
      <Slider required />,
      // @ts-expect-error: values are numbers
      <Slider value="30" />,
    ]
    const props: SliderProps<number> = { value: 1, onChange: (_event, value: number) => value }

    expect([...accepted, ...rejected, props]).toHaveLength(12)
  })
})
