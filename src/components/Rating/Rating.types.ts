import type { FormHelperTextProps } from '@mui/material/FormHelperText'
import type { FormLabelProps } from '@mui/material/FormLabel'
import type { RatingProps as MuiRatingProps, RatingOwnProps } from '@mui/material/Rating'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ComponentProps } from 'react'
import type { FieldProps } from '../fieldProps.ts'

export interface RatingProps
  extends FieldProps, // label, helperText, error, required, disabled
    Pick<
      RatingOwnProps,
      | 'value'
      | 'onChange'
      | 'onChangeActive'
      | 'max'
      | 'precision'
      | 'readOnly'
      | 'highlightSelectedOnly'
      | 'name'
      | 'size'
      | 'icon'
      | 'emptyIcon'
      | 'getLabelText'
      | 'emptyLabelText'
    >,
    Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  /**
   * Initial value when uncontrolled. `null` means no rating. MUI types it as
   * a `number` only, though it defaults to `null`.
   * @default null
   */
  defaultValue?: number | null
  /** Styles for the root `<div>`, the MUI `FormControl`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `FormLabel`, the label above the stars. Only rendered with `label`. */
    formLabel?: Partial<FormLabelProps>
    /**
     * MUI's `Rating`, the element with `role="radiogroup"`, or `role="img"`
     * when `readOnly`. Reaches its other props, such as `component`, and its
     * own `label`, `icon` and `decimal` slots.
     */
    control?: Partial<MuiRatingProps>
    /** MUI's `FormHelperText`. Only rendered with `helperText`. */
    formHelperText?: Partial<FormHelperTextProps>
  }
}
