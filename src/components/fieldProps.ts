import type { ReactNode } from 'react'

/**
 * The field props that Checkbox, Select, Radio group and Switch share with
 * TextField, with the same names and meaning. Private: each component's props
 * type extends it, and it isn't exported from `src/index.ts`.
 */
export interface FieldProps {
  /** The visible label. It's also the accessible name. */
  label?: ReactNode
  /** Text below the field, linked to the input with `aria-describedby`. */
  helperText?: ReactNode
  /**
   * If `true`, shows the label and helper text in the error color, and sets
   * `aria-invalid="true"` on the input.
   * @default false
   */
  error?: boolean
  /**
   * If `true`, shows an asterisk after the label, and makes the input required
   * for native form validation.
   * @default false
   */
  required?: boolean
  /**
   * If `true`, disables the field and dims the label.
   * @default false
   */
  disabled?: boolean
}
