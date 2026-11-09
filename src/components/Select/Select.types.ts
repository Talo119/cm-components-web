import type { MenuItemProps } from '@mui/material/MenuItem'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { TextFieldProps } from '@mui/material/TextField'
import type { ReactNode } from 'react'

export interface SelectOption<Value extends string | number = string> {
  /** Unique within `options`. Used as the React key and reported by `onChange`. */
  value: Value
  /** What the option shows, in the list and in the field once selected. */
  label: ReactNode
  /**
   * Shown but not selectable.
   * @default false
   */
  disabled?: boolean
}

type OmittedTextFieldProps =
  | 'select'
  | 'children'
  | 'type'
  | 'multiline'
  | 'rows'
  | 'minRows'
  | 'maxRows'
  | 'placeholder'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'slotProps'

interface SelectOwnProps<Value extends string | number> {
  /** The options, in display order. */
  options: readonly SelectOption<Value>[]
  /** Controlled value. `null` means nothing is selected. */
  value?: Value | null
  /**
   * Initial value when uncontrolled.
   * @default null
   */
  defaultValue?: Value | null
  /** Called when the user picks an option, with the option's value and its type. */
  onChange?: (event: SelectChangeEvent<Value>, value: Value) => void
}

/** Adds `slotProps.option`, kept per variant so `slotProps.input` matches `variant`. */
type WithOptionSlot<T> = T extends { slotProps?: infer SlotProps }
  ? {
      /**
       * TextField's slots, as in MUI, plus `option`, which reaches every
       * `MenuItem`. `select.multiple` and `select.native` are always `false`.
       */
      slotProps?: SlotProps & { option?: Partial<MenuItemProps> }
    }
  : never

/**
 * Applied to each member of TextField's union of variants, so `variant="filled"`
 * keeps the filled input's types.
 */
type SelectPropsFor<T, Value extends string | number> = T extends unknown
  ? Omit<T, OmittedTextFieldProps> & SelectOwnProps<Value> & WithOptionSlot<T>
  : never

/**
 * MUI's `TextFieldProps` without the props that only apply to typing text or
 * to MUI's own select, plus `options`, a typed `value` and `slotProps.option`.
 */
export type SelectProps<Value extends string | number = string> = SelectPropsFor<
  TextFieldProps,
  Value
>
