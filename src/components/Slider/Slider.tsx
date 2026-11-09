'use client'

import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import MuiSlider from '@mui/material/Slider'
import type { SliderComponent, SliderProps as MuiSliderProps } from '@mui/material/Slider'
import { mergeSlotProps } from '@mui/material/utils'
import { useId } from 'react'
import type { SliderProps } from './Slider.types.ts'

// `Value` is inferred as `30` from `defaultValue={30}`, because its constraint
// includes `number`. Widening it gives `onChange` a `number`.
type Widen<Value> = Value extends number ? number : Value

/**
 * MUI's `Slider`, for a number or a range of numbers, with its label, helper
 * text and error state built in. The root is a MUI `FormControl`.
 */
export function Slider<Value extends number | readonly number[] = number | number[]>({
  value,
  defaultValue,
  onChange,
  onChangeCommitted,
  min,
  max,
  step,
  marks,
  shiftStep,
  scale,
  orientation,
  track,
  valueLabelDisplay,
  valueLabelFormat,
  getAriaLabel,
  getAriaValueText,
  'aria-valuetext': ariaValueText,
  disableSwap,
  name,
  color,
  size,
  label,
  helperText,
  error = false,
  disabled = false,
  id,
  slotProps = {},
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rootProps
}: SliderProps<Widen<Value>>) {
  const { formLabel, control, htmlInput, formHelperText } = slotProps
  const generatedId = useId()
  const idPrefix = id ?? generatedId
  const labelId = `${idPrefix}-label`
  const helperTextId = `${idPrefix}-helper-text`
  const hasLabel = label != null && label !== ''
  const hasHelperText = Boolean(helperText)
  const describedBy =
    [ariaDescribedBy, hasHelperText ? helperTextId : undefined].filter(Boolean).join(' ') ||
    undefined
  const labelledBy = ariaLabelledBy ?? (hasLabel ? labelId : undefined)
  // `aria-labelledby` beats `aria-label` in the accessible name, so with
  // `getAriaLabel` it would give every thumb the same name. It names the root
  // instead, and screen readers announce it before the thumb's own name.
  const namesGroup = getAriaLabel != null && labelledBy != null

  // MUI's `Slider` is typed as overloads for each kind of value, which a
  // generic `Value` doesn't match.
  const TypedSlider = MuiSlider as SliderComponent<Widen<Value>>
  const controlProps = control as Partial<MuiSliderProps<'span', object, Widen<Value>>> | undefined

  // The label and helper text sit on either side of the slider, so turning
  // `helperText` or `error` on and off doesn't remount the inputs.
  return (
    <FormControl
      // A horizontal slider fills its container.
      fullWidth
      // MUI indents helper text inside an outlined or filled field.
      variant="standard"
      error={error}
      disabled={disabled}
      id={id}
      role={namesGroup ? 'group' : undefined}
      aria-labelledby={namesGroup ? labelledBy : undefined}
      {...rootProps}
    >
      {hasLabel && (
        <FormLabel id={labelId} {...formLabel}>
          {label}
        </FormLabel>
      )}
      <TypedSlider
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onChangeCommitted={onChangeCommitted}
        min={min}
        max={max}
        step={step}
        marks={marks}
        shiftStep={shiftStep}
        scale={scale}
        orientation={orientation}
        track={track}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={valueLabelFormat}
        getAriaLabel={getAriaLabel}
        getAriaValueText={getAriaValueText}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        disableSwap={disableSwap}
        name={name}
        color={color}
        size={size}
        // MUI's `Slider` doesn't read `disabled` from the `FormControl`.
        disabled={disabled}
        {...controlProps}
        slotProps={{
          ...controlProps?.slotProps,
          // MUI spreads `slotProps.input` last on every thumb's `<input>`.
          input: mergeSlotProps(
            htmlInput,
            mergeSlotProps(controlProps?.slotProps?.input, {
              'aria-labelledby': namesGroup ? undefined : labelledBy,
              'aria-describedby': describedBy,
              // MUI doesn't pass `error` to the inputs.
              'aria-invalid': error || undefined,
            }),
          ),
        }}
      />
      {hasHelperText && (
        <FormHelperText id={helperTextId} {...formHelperText}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
