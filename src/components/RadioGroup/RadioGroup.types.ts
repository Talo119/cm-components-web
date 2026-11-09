import type { FormControlLabelProps } from '@mui/material/FormControlLabel'
import type { FormHelperTextProps } from '@mui/material/FormHelperText'
import type { FormLabelProps } from '@mui/material/FormLabel'
import type { RadioProps } from '@mui/material/Radio'
import type { RadioGroupProps as MuiRadioGroupProps } from '@mui/material/RadioGroup'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ChangeEvent, ComponentProps, ReactNode } from 'react'
import type { FieldProps } from '../fieldProps.ts'

export interface RadioOption<Value extends string = string> {
  /** Unique within `options`. Used as the React key, the input's `value` and the value `onChange` reports. */
  value: Value
  /** The visible label of this option, which is also its accessible name. */
  label: ReactNode
  /**
   * Shown but not selectable.
   * @default false
   */
  disabled?: boolean
}

export interface RadioGroupProps<Value extends string = string>
  extends FieldProps, // label, helperText, error, required, disabled
    Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  /** The options, in display order. `Value` is inferred from them. */
  options: readonly RadioOption<Value>[]
  /** Controlled value. `null` means nothing is selected. */
  value?: NoInfer<Value> | null
  /**
   * Initial value when uncontrolled.
   * @default null
   */
  defaultValue?: NoInfer<Value> | null
  /** Called when the user picks an option, with the option's value. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: NoInfer<Value>) => void
  /**
   * The `name` shared by the radio inputs, which a submitted form uses.
   * Generated when not set.
   */
  name?: string
  /**
   * Lays the options out in a row, wrapping when there isn't room.
   * @default false
   */
  row?: boolean
  /**
   * Passed to every `Radio`.
   * @default 'primary'
   */
  color?: RadioProps['color']
  /**
   * Passed to every `Radio`.
   * @default 'medium'
   */
  size?: RadioProps['size']
  /** Styles for the root `<div>`, the MUI `FormControl`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `FormLabel`, the group label. Only rendered with `label`. */
    formLabel?: Partial<FormLabelProps>
    /** MUI's `RadioGroup`, the element with `role="radiogroup"`. */
    radioGroup?: Partial<MuiRadioGroupProps>
    /** Every option's MUI `FormControlLabel`, the `<label>`. */
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label' | 'value'>>
    /** Every MUI `Radio`. */
    control?: Partial<RadioProps>
    /** MUI's `FormHelperText`. Only rendered with `helperText`. */
    formHelperText?: Partial<FormHelperTextProps>
  }
}
