import type {
  AutocompleteChangeReason,
  AutocompleteProps as MuiAutocompleteProps,
} from '@mui/material/Autocomplete'
import type { ChipTypeMap } from '@mui/material/Chip'
import type { TextFieldProps } from '@mui/material/TextField'
import type { SyntheticEvent } from 'react'
import type { FieldProps } from '../fieldProps.ts'

export interface AutocompleteOption<Value extends string | number = string> {
  /** Unique within `options`. Used as the React key and reported by `onChange`. */
  value: Value
  /** What the option shows in the list, in the input once selected, and in chips. */
  label: string
  /**
   * Shown but not selectable.
   * @default false
   */
  disabled?: boolean
}

/** MUI's `Autocomplete` props for these options, matched by their `value`. */
type MuiProps<Value extends string | number, Multiple extends boolean> = MuiAutocompleteProps<
  AutocompleteOption<Value>,
  Multiple,
  boolean,
  false,
  ChipTypeMap['defaultComponent'],
  Value
>

type Omitted =
  | 'options'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'multiple'
  | 'renderInput'
  | 'getOptionLabel'
  | 'getOptionValue'
  | 'getOptionKey'
  | 'getOptionDisabled'
  | 'isOptionEqualToValue'
  | 'freeSolo'
  | 'groupBy'
  | 'renderGroup'
  | 'renderValue'
  | 'slotProps'

/** The selection: an array with `multiple`, or one value or `null` without it. */
type AutocompleteValue<Value, Multiple extends boolean> = Multiple extends true
  ? Value[]
  : Value | null

export interface AutocompleteProps<
  Value extends string | number = string,
  Multiple extends boolean = false,
> extends FieldProps, // label, helperText, error, required, disabled
    Omit<MuiProps<Value, Multiple>, Omitted> {
  /** The options, in display order. */
  options: readonly AutocompleteOption<Value>[]
  /**
   * If `true`, the user picks several values, shown as chips.
   * @default false
   */
  multiple?: Multiple
  /** Controlled value. `null` or `[]` means nothing is selected. */
  value?: Multiple extends true ? readonly Value[] : Value | null
  /**
   * Initial value when uncontrolled.
   * @default null, or [] with `multiple`
   */
  defaultValue?: Multiple extends true ? readonly Value[] : Value | null
  /**
   * Called when the user picks, removes or clears a value. `reason` is MUI's,
   * such as `'selectOption'`, `'removeOption'` or `'clear'`.
   */
  onChange?: (
    event: SyntheticEvent,
    value: AutocompleteValue<NoInfer<Value>, Multiple>,
    reason: AutocompleteChangeReason,
  ) => void
  /**
   * Renders a hidden `<input>` for each selected value, so a form submits the
   * values, not the labels.
   */
  name?: string
  /** Shown in the empty input. */
  placeholder?: string
  /**
   * TextField's variant.
   * @default 'outlined'
   */
  variant?: TextFieldProps['variant']
  /**
   * MUI's `Autocomplete` slots, such as `chip`, `listbox`, `paper` and
   * `popper`, plus `textField`, which reaches the TextField, including its
   * own `slotProps`.
   */
  slotProps?: MuiProps<Value, Multiple>['slotProps'] & {
    textField?: Partial<TextFieldProps>
  }
}
