import type { FormControlLabelProps } from '@mui/material/FormControlLabel'
import type { FormHelperTextProps } from '@mui/material/FormHelperText'
import type { SxProps, Theme } from '@mui/material/styles'
import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch'
import type { ComponentProps, Ref } from 'react'
import type { FieldProps } from '../fieldProps.ts'

export interface SwitchProps
  extends FieldProps, // label, helperText, error, required, disabled
    Pick<
      MuiSwitchProps,
      | 'checked'
      | 'defaultChecked'
      | 'onChange'
      | 'name'
      | 'value'
      | 'id'
      | 'color'
      | 'size'
      | 'autoFocus'
      | 'disableRipple'
      | 'onFocus'
      | 'onBlur'
    >,
    Omit<
      ComponentProps<'div'>,
      'onChange' | 'onFocus' | 'onBlur' | 'color' | 'defaultChecked' | 'defaultValue'
    > {
  /**
   * The `<input>`'s ref. `ref` reaches the root `<div>`.
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Where the label sits. Passed to `FormControlLabel`.
   * @default 'end'
   */
  labelPlacement?: FormControlLabelProps['labelPlacement']
  /** Styles for the root `<div>`, the MUI `FormControl`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /**
     * MUI's `Switch`. Reaches its other props, such as `edge`, and its own
     * `track`, `thumb` and `switchBase` slots.
     */
    control?: Partial<MuiSwitchProps>
    /** The `<input type="checkbox" role="switch">`. */
    htmlInput?: ComponentProps<'input'>
    /** MUI's `FormControlLabel`, the `<label>`. Only rendered with `label`. */
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label'>>
    /** MUI's `FormHelperText`. Only rendered with `helperText`. */
    formHelperText?: Partial<FormHelperTextProps>
  }
}
