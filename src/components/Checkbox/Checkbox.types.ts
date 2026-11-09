import type { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox'
import type { FormControlLabelProps } from '@mui/material/FormControlLabel'
import type { FormHelperTextProps } from '@mui/material/FormHelperText'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ComponentProps, Ref } from 'react'
import type { FieldProps } from '../fieldProps.ts'

export interface CheckboxProps
  extends FieldProps, // label, helperText, error, required, disabled
    Pick<
      MuiCheckboxProps,
      | 'checked'
      | 'defaultChecked'
      | 'onChange'
      | 'indeterminate'
      | 'name'
      | 'value'
      | 'id'
      | 'color'
      | 'size'
      | 'icon'
      | 'checkedIcon'
      | 'indeterminateIcon'
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
    /** MUI's `Checkbox`. Reaches its other props, such as `edge` and `readOnly`. */
    control?: Partial<MuiCheckboxProps>
    /** The `<input type="checkbox">`. */
    htmlInput?: ComponentProps<'input'>
    /** MUI's `FormControlLabel`, the `<label>`. Only rendered with `label`. */
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label'>>
    /** MUI's `FormHelperText`. Only rendered with `helperText`. */
    formHelperText?: Partial<FormHelperTextProps>
  }
}
