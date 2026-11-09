import type { FormHelperTextProps } from '@mui/material/FormHelperText'
import type { FormLabelProps } from '@mui/material/FormLabel'
import type { SliderProps as MuiSliderProps, SliderOwnProps } from '@mui/material/Slider'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ComponentProps } from 'react'
import type { FieldProps } from '../fieldProps.ts'

export interface SliderProps<Value extends number | readonly number[] = number | number[]>
  // A range input always has a value, so Slider has no `required`.
  extends Omit<FieldProps, 'required'>, // label, helperText, error, disabled
    Pick<
      SliderOwnProps<Value>,
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'onChangeCommitted'
      | 'min'
      | 'max'
      | 'step'
      | 'marks'
      | 'shiftStep'
      | 'scale'
      | 'orientation'
      | 'track'
      | 'valueLabelDisplay'
      | 'valueLabelFormat'
      | 'getAriaLabel'
      | 'getAriaValueText'
      | 'aria-valuetext'
      | 'disableSwap'
      | 'name'
      | 'color'
      | 'size'
    >,
    Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  /** Styles for the root `<div>`, the MUI `FormControl`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `FormLabel`, the label above the slider. Only rendered with `label`. */
    formLabel?: Partial<FormLabelProps>
    /**
     * MUI's `Slider`. Reaches its other props, such as `tabIndex`, and its own
     * `thumb`, `rail`, `track`, `mark`, `markLabel` and `valueLabel` slots.
     */
    control?: Partial<MuiSliderProps>
    /** Every thumb's `<input type="range">`. */
    htmlInput?: ComponentProps<'input'>
    /** MUI's `FormHelperText`. Only rendered with `helperText`. */
    formHelperText?: Partial<FormHelperTextProps>
  }
}
