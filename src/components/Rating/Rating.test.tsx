import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Rating } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const group = (name?: string) => screen.getByRole('radiogroup', name ? { name } : undefined)
const radio = (name: string) => screen.getByRole<HTMLInputElement>('radio', { name })
const radios = () => screen.queryAllByRole<HTMLInputElement>('radio')
const ratingRoot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.MuiRating-root')!
const icon = (input: HTMLInputElement) =>
  input.labels![0].querySelector<HTMLElement>('.MuiRating-icon')!
// A pointer click. user-event moves the pointer first, and MUI turns that into
// a hovered value from the root's size, which is zero in jsdom. MUI also
// ignores a click at (0, 0), which is what a click from a key press reports,
// so this one needs coordinates to clear the value.
const clickStar = (input: HTMLInputElement) =>
  fireEvent.click(input, { clientX: 1, clientY: 1 })

const light = createCmTheme().colorSchemes.light!.palette

const starNames = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars', 'Empty']

describe('Rating', () => {
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

  it('renders a radiogroup named by its label, with a named radio per value and an "Empty" one', () => {
    render(<Rating label="Quality" />)

    const radiogroup = group('Quality')
    const inputs = within(radiogroup).getAllByRole('radio')
    expect(inputs.map((input) => input.getAttribute('value'))).toEqual(['1', '2', '3', '4', '5', ''])
    expect(starNames.map((name) => radio(name))).toEqual(inputs)
    expect(radio('Empty')).toBeChecked()
    expect(screen.getByText('Quality').tagName).toBe('LABEL')
    expectNoWarnings()
  })

  it('names the group with aria-label when there is no label', () => {
    const { container } = render(<Rating aria-label="Rate this answer" />)

    expect(group('Rate this answer')).toBeInTheDocument()
    expect(group()).not.toHaveAttribute('aria-labelledby')
    expect(container.querySelector('.MuiFormLabel-root')).toBeNull()
    expect(container.firstElementChild).not.toHaveAttribute('aria-label')
  })

  it('names the group with aria-labelledby', () => {
    render(
      <>
        <h2 id="rating-heading">Rate your order</h2>
        <Rating aria-labelledby="rating-heading" />
      </>,
    )

    expect(group('Rate your order')).toBeInTheDocument()
  })

  it('calls onChange with the event and the value of a clicked star', () => {
    const onChange = vi.fn()
    render(<Rating label="Quality" onChange={(event, value) => onChange(event.target, value)} />)

    clickStar(radio('3 Stars'))

    expect(onChange).toHaveBeenCalledExactlyOnceWith(radio('3 Stars'), 3)
    expect(radio('3 Stars')).toBeChecked()
    expectNoWarnings()
  })

  it('calls onChange with null when the current value is picked again', () => {
    const onChange = vi.fn()
    render(<Rating label="Quality" defaultValue={3} onChange={(_, value) => onChange(value)} />)

    clickStar(radio('3 Stars'))

    expect(onChange).toHaveBeenCalledExactlyOnceWith(null)
    expect(radio('Empty')).toBeChecked()
  })

  it('works uncontrolled with defaultValue', () => {
    render(<Rating label="Quality" defaultValue={2} />)

    expect(radio('2 Stars')).toBeChecked()
    clickStar(radio('4 Stars'))

    expect(radio('4 Stars')).toBeChecked()
    expect(radio('2 Stars')).not.toBeChecked()
    expectNoWarnings()
  })

  it('starts with no rating for defaultValue={null}', () => {
    render(<Rating label="Quality" defaultValue={null} />)

    expect(radio('Empty')).toBeChecked()
    expectNoWarnings()
  })

  it('works controlled with value and onChange', () => {
    function Controlled() {
      const [quality, setQuality] = useState<number | null>(1)
      return <Rating label="Quality" value={quality} onChange={(_, value) => setQuality(value)} />
    }
    render(<Controlled />)

    expect(radio('1 Star')).toBeChecked()
    clickStar(radio('5 Stars'))
    expect(radio('5 Stars')).toBeChecked()

    clickStar(radio('5 Stars'))
    expect(radio('Empty')).toBeChecked()
    expectNoWarnings()
  })

  it('does not change a controlled value without onChange updating it', () => {
    render(<Rating label="Quality" value={2} onChange={() => {}} />)

    clickStar(radio('4 Stars'))

    expect(radio('2 Stars')).toBeChecked()
  })

  it('renders an input per value for max and precision, named by getLabelText', () => {
    render(
      <Rating
        label="Quality"
        max={3}
        precision={0.5}
        getLabelText={(value) => `${value} out of 3`}
        emptyLabelText="No rating"
      />,
    )

    expect(radios().map((input) => input.value)).toEqual(['0.5', '1', '1.5', '2', '2.5', '3', ''])
    expect(radio('1.5 out of 3')).toHaveAttribute('value', '1.5')
    expect(radio('No rating')).toHaveAttribute('value', '')
  })

  it('fills the stars up to a decimal value rounded to precision, without changing it', () => {
    const { container, rerender } = render(<Rating label="Quality" value={3.7} readOnly />)
    const filled = () => container.querySelectorAll('.MuiRating-iconFilled').length

    expect(filled()).toBe(4)
    expect(screen.getByRole('img')).toHaveAccessibleName('Quality 4 Stars')

    // Two halves per star, filled up to 3.5.
    rerender(<Rating label="Quality" value={3.7} precision={0.5} readOnly />)
    expect(filled()).toBe(7)
    expect(container.querySelectorAll('.MuiRating-decimal')).toHaveLength(5)
    expect(screen.getByRole('img')).toHaveAccessibleName('Quality 3.5 Stars')
  })

  it('fills only the selected star with highlightSelectedOnly', () => {
    const { container } = render(<Rating label="Mood" defaultValue={3} highlightSelectedOnly />)

    const filled = container.querySelectorAll('.MuiRating-iconFilled')
    expect(filled).toHaveLength(1)
    expect(filled[0]).toBe(icon(radio('3 Stars')))
  })

  describe('when readOnly', () => {
    it('renders no inputs and an img named by the label and the value', () => {
      const { container } = render(<Rating label="Average rating" value={4.5} precision={0.5} readOnly />)

      expect(radios()).toEqual([])
      expect(screen.queryByRole('radiogroup')).toBeNull()
      const img = screen.getByRole('img')
      expect(img).toBe(ratingRoot(container))
      expect(img).toHaveAccessibleName('Average rating 4.5 Stars')
      expect(img).not.toHaveAttribute('aria-invalid')
      expect(img).not.toHaveAttribute('aria-required')
    })

    it('is named by getLabelText only without a label', () => {
      render(<Rating value={4} readOnly getLabelText={(value) => `Rated ${value} out of 5`} />)

      expect(screen.getByRole('img')).toHaveAccessibleName('Rated 4 out of 5')
    })

    it('is named by aria-label when one is passed', () => {
      render(<Rating value={4} readOnly aria-label="Average rating: 4 of 5" />)

      expect(screen.getByRole('img')).toHaveAccessibleName('Average rating: 4 of 5')
    })

    it('links helperText to the img', () => {
      render(<Rating label="Average rating" value={4} readOnly helperText="From 120 reviews" />)

      expect(screen.getByRole('img')).toHaveAccessibleDescription('From 120 reviews')
    })

    it('can’t take focus', async () => {
      render(
        <>
          <Rating label="Average rating" value={4} readOnly />
          <button type="button">Next</button>
        </>,
      )

      await userEvent.tab()

      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    })
  })

  it('links helperText to the group, joined with the consumer’s aria-describedby', () => {
    render(
      <>
        <span id="hint">Your review is public</span>
        <Rating label="Quality" helperText="Pick 1 to 5 stars" aria-describedby="hint" />
      </>,
    )

    expect(group()).toHaveAccessibleDescription('Your review is public Pick 1 to 5 stars')
  })

  it('builds the label and helper text ids from id, and keeps id on the root', () => {
    const { container } = render(<Rating id="quality" label="Quality" helperText="Pick one" />)

    expect(container.firstElementChild).toHaveAttribute('id', 'quality')
    expect(screen.getByText('Quality')).toHaveAttribute('id', 'quality-label')
    expect(screen.getByText('Pick one')).toHaveAttribute('id', 'quality-helper-text')
    expect(group()).toHaveAttribute('aria-labelledby', 'quality-label')
    expect(group()).toHaveAttribute('aria-describedby', 'quality-helper-text')
  })

  it('has no aria-describedby, aria-invalid or aria-required by default', () => {
    render(<Rating label="Quality" />)

    expect(group()).not.toHaveAttribute('aria-describedby')
    expect(group()).not.toHaveAttribute('aria-invalid')
    expect(group()).not.toHaveAttribute('aria-required')
  })

  it('sets aria-invalid on the group and Mui-error on the label and helper text for error', () => {
    render(<Rating label="Quality" error helperText="Choose a rating" />)

    expect(group()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Quality')).toHaveClass('Mui-error')
    expect(screen.getByText('Choose a rating')).toHaveClass('Mui-error')
  })

  it('sets aria-required on the group and shows one asterisk for required', () => {
    const { container } = render(<Rating label="Quality" required />)

    expect(group()).toHaveAttribute('aria-required', 'true')
    const asterisks = container.querySelectorAll('[class*="asterisk"]')
    expect(asterisks).toHaveLength(1)
    expect(asterisks[0]).toHaveClass('MuiFormLabel-asterisk')
    expect(asterisks[0]).toHaveTextContent('*')
  })

  it('doesn’t block a native form submit for required, as the "Empty" radio is checked', () => {
    render(
      <form data-testid="form">
        <Rating label="Quality" name="quality" required />
      </form>,
    )

    expect(screen.getByTestId<HTMLFormElement>('form').checkValidity()).toBe(true)
  })

  it('disables every input, drops the "Empty" one and dims the stars and the label for disabled', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <Rating label="Quality" defaultValue={2} disabled onChange={onChange} />,
    )

    expect(radios()).toHaveLength(5)
    expect(radios().every((input) => input.disabled)).toBe(true)
    expect(screen.queryByRole('radio', { name: 'Empty' })).toBeNull()
    expect(ratingRoot(container)).toHaveClass('Mui-disabled')
    expect(screen.getByText('Quality')).toHaveClass('Mui-disabled')

    await userEvent.tab()
    expect(document.body).toHaveFocus()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the inputs, their state and focus when error and helperText change', () => {
    const { rerender } = render(<Rating label="Quality" />)
    const inputs = radios()
    clickStar(radio('3 Stars'))
    radio('3 Stars').focus()

    rerender(<Rating label="Quality" error helperText="Something is wrong" />)
    expect(radios()).toEqual(inputs)
    expect(radio('3 Stars')).toBeChecked()
    expect(radio('3 Stars')).toHaveFocus()

    rerender(<Rating label="Quality" />)
    expect(radios()).toEqual(inputs)
    expect(radio('3 Stars')).toBeChecked()
    expect(radio('3 Stars')).toHaveFocus()
  })

  it('shares a generated name between its inputs, different from another rating’s', () => {
    render(
      <>
        <Rating label="Quality" />
        <Rating label="Price" />
      </>,
    )

    const names = radios().map((input) => input.name)
    expect(names[0]).not.toBe('')
    expect(new Set(names.slice(0, 6)).size).toBe(1)
    expect(names[6]).not.toBe(names[0])
  })

  it('submits the selected value under name, and an empty string with no rating', () => {
    render(
      <form data-testid="form">
        <Rating label="Quality" name="quality" />
      </form>,
    )

    const form = () => new FormData(screen.getByTestId<HTMLFormElement>('form'))
    expect(radios().every((input) => input.name === 'quality')).toBe(true)
    expect(form().get('quality')).toBe('')

    clickStar(radio('4 Stars'))

    expect(form().get('quality')).toBe('4')
  })

  it('calls onChangeActive with the hovered value, and -1 when the pointer leaves', () => {
    const onChangeActive = vi.fn()
    const { container } = render(
      <Rating label="Quality" onChangeActive={(_, value) => onChangeActive(value)} />,
    )
    const root = ratingRoot(container)
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 24 }),
    )

    fireEvent.mouseMove(root, { clientX: 50 })
    expect(onChangeActive).toHaveBeenLastCalledWith(3)
    expect(icon(radio('3 Stars'))).toHaveClass('MuiRating-iconHover', 'MuiRating-iconActive')

    fireEvent.mouseLeave(root)
    expect(onChangeActive).toHaveBeenLastCalledWith(-1)
  })

  it('passes ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Rating ref={ref} label="Quality" />)

    expect(ref.current).toHaveClass('MuiFormControl-root')
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current).toContainElement(group())
  })

  it('passes className, sx, style and other props to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Rating
        ref={ref}
        label="Quality"
        className="custom"
        sx={{ marginTop: '7px' }}
        style={{ paddingLeft: '5px' }}
        data-testid="quality"
      />,
    )

    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveStyle({ marginTop: '7px', paddingLeft: '5px' })
    expect(ref.current).toHaveAttribute('data-testid', 'quality')
    expect(group()).not.toHaveAttribute('data-testid')
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <Rating
        label="Quality"
        helperText="Pick one"
        slotProps={{
          formLabel: { className: 'label' },
          control: {
            className: 'control',
            slotProps: { icon: { className: 'star' } },
          },
          formHelperText: { className: 'helper' },
        }}
      />,
    )

    expect(screen.getByText('Quality')).toHaveClass('label')
    expect(group()).toHaveClass('control', 'MuiRating-root')
    expect(icon(radio('2 Stars'))).toHaveClass('star')
    expect(screen.getByText('Pick one')).toHaveClass('helper')
  })

  it('keeps naming a readOnly rating when slotProps.control sets its id', () => {
    render(
      <Rating
        label="Average rating"
        value={4}
        readOnly
        slotProps={{ control: { id: 'average' } }}
      />,
    )

    expect(screen.getByRole('img')).toHaveAttribute('id', 'average')
    expect(screen.getByRole('img')).toHaveAccessibleName('Average rating 4 Stars')
  })

  describe('with the keyboard', () => {
    it('lands on the selected value with Tab, selects with the arrows and leaves with Tab', async () => {
      const onChange = vi.fn()
      render(
        <>
          <Rating label="Quality" defaultValue={3} onChange={(_, value) => onChange(value)} />
          <button type="button">Next</button>
        </>,
      )

      await userEvent.tab()
      expect(radio('3 Stars')).toHaveFocus()

      await userEvent.keyboard('{ArrowRight}')
      expect(radio('4 Stars')).toHaveFocus()
      expect(radio('4 Stars')).toBeChecked()
      expect(onChange).toHaveBeenCalledExactlyOnceWith(4)

      await userEvent.keyboard('{ArrowLeft}')
      expect(radio('3 Stars')).toHaveFocus()
      expect(radio('3 Stars')).toBeChecked()
      expect(onChange).toHaveBeenLastCalledWith(3)

      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    })

    it('lands on the "Empty" input with Tab when there is no rating', async () => {
      render(<Rating label="Quality" />)

      await userEvent.tab()

      expect(radio('Empty')).toHaveFocus()
    })

    it('selects the focused value with Space', async () => {
      const onChange = vi.fn()
      render(<Rating label="Quality" onChange={(_, value) => onChange(value)} />)

      radio('2 Stars').focus()
      await userEvent.keyboard(' ')

      expect(radio('2 Stars')).toBeChecked()
      expect(onChange).toHaveBeenCalledExactlyOnceWith(2)
    })
  })

  describe('under the library theme', () => {
    it('colors filled stars warning.main and empty stars grey[500]', () => {
      const { container } = renderThemed(<Rating label="Quality" defaultValue={2} />)

      expect(ratingRoot(container)).toHaveStyle({ color: light.warning.main })
      expect(icon(radio('2 Stars'))).toHaveClass('MuiRating-iconFilled')
      expect(icon(radio('2 Stars'))).not.toHaveStyle({ color: light.grey[500] })
      expect(icon(radio('3 Stars'))).toHaveClass('MuiRating-iconEmpty')
      expect(icon(radio('3 Stars'))).toHaveStyle({ color: light.grey[500] })
    })

    it('shows the focus ring around the active star on keyboard focus', async () => {
      const { container } = renderThemed(<Rating label="Quality" defaultValue={3} />)

      await userEvent.tab()

      expect(ratingRoot(container)).toHaveClass('Mui-focusVisible')
      expect(icon(radio('3 Stars'))).toHaveClass('MuiRating-iconActive')
      expect(icon(radio('3 Stars'))).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })

    it('puts the helper text below the stars with no left indent', () => {
      renderThemed(<Rating label="Quality" helperText="Pick one" />)

      const helperText = screen.getByText('Pick one')
      expect(helperText).not.toHaveClass('MuiFormHelperText-contained')
      expect(helperText).toHaveStyle({ marginLeft: '0px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiRating styleOverrides.icon object to the icons', () => {
      renderThemed(<Rating label="Quality" />, {
        components: { MuiRating: { styleOverrides: { icon: { padding: '3px' } } } },
      })

      for (const input of radios().slice(0, 5)) {
        expect(icon(input)).toHaveStyle({ padding: '3px' })
      }
    })

    it('replaces the library empty-star rule with a project-level iconEmpty', () => {
      renderThemed(<Rating label="Quality" />, {
        components: {
          MuiRating: { styleOverrides: { iconEmpty: { color: 'rgb(170, 0, 0)' } } },
        },
      })

      expect(icon(radio('1 Star'))).toHaveStyle({ color: 'rgb(170, 0, 0)' })
    })

    it('lets an instance-level sx value override the theme', () => {
      const ref = createRef<HTMLDivElement>()
      renderThemed(<Rating ref={ref} label="Quality" sx={{ marginTop: '9px' }} />, {
        components: { MuiFormControl: { styleOverrides: { root: { marginTop: '3px' } } } },
      })

      expect(ref.current).toHaveStyle({ marginTop: '9px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and MUI’s colors', async () => {
      const { container } = render(
        <ThemeProvider theme={createTheme()}>
          <Rating label="Quality" defaultValue={3} />
        </ThemeProvider>,
      )

      expect(ratingRoot(container)).toHaveStyle({ color: '#faaf00' })
      expect(icon(radio('4 Stars'))).not.toHaveStyle({ color: light.grey[500] })

      await userEvent.tab()
      expect(ratingRoot(container)).toHaveClass('Mui-focusVisible')
      // MUI's own outline when the theme has no `focusVisible` ring.
      expect(icon(radio('3 Stars'))).toHaveStyle({ outlineWidth: '1px' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Rating label="Quality" defaultValue={null} name="quality" />,
      <Rating value={null} onChange={(_event, value: number | null) => value} />,
      <Rating value={4.5} precision={0.5} readOnly size="small" />,
      <Rating max={3} onChangeActive={(_event, value: number) => value} />,
      <Rating slotProps={{ control: { component: 'div', slotProps: { icon: { className: 'x' } } } }} />,
    ]
    const rejected = [
      // @ts-expect-error: onChange can report null
      <Rating onChange={(_event, value: number) => value} />,
      // @ts-expect-error: value is a number
      <Rating value="4" />,
      // @ts-expect-error: component isn't part of RatingProps
      <Rating component="div" />,
      // @ts-expect-error: MUI's sizes only
      <Rating size="huge" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(9)
  })
})
