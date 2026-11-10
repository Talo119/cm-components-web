import type {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SxProps,
  Theme,
} from '@mui/material/styles'
import type { SliderProps as MuiSliderProps } from '@mui/material/Slider'
import type { ComponentProps, FormEvent, ReactNode } from 'react'
import type { AutocompleteOption, AutocompleteProps } from '../Autocomplete/index.ts'
import type { ButtonProps } from '../Button/index.ts'
import type { CheckboxProps } from '../Checkbox/index.ts'
import type { RadioGroupProps, RadioOption } from '../RadioGroup/index.ts'
import type { RatingProps } from '../Rating/index.ts'
import type { SelectOption, SelectProps } from '../Select/index.ts'
import type { SliderProps } from '../Slider/index.ts'
import type { SwitchProps } from '../Switch/index.ts'
import type { TextFieldProps } from '../TextField/index.ts'

/** A value that a field of Form can edit. */
export type FormValue = string | number | boolean | null | readonly (string | number)[]

/** The values of a Form, by field name. */
export type FormValues = Record<string, FormValue>

/**
 * The constraint on a Form's values. Looser than `FormValues`, so an
 * `interface`, which has no index signature, also fits, and so inferring from
 * `defaultValues={{ agree: false }}` gives `boolean` rather than `false`. A
 * value that isn't a `FormValue` has no field type that fits it.
 */
export type FormValuesOf<Values> = { [Name in keyof Values]: unknown }

type FieldKey<Values> = Extract<keyof Values, string>

interface FieldBase<Name extends string, Value, Values> {
  /** The value the field edits. Also the input's `name` and the React key. */
  name: Name
  /** The visible label and accessible name. */
  label?: ReactNode
  /** Text under the field. An error replaces it while shown. */
  helperText?: ReactNode
  /**
   * The field must have a value that isn't empty. For `checkbox` and
   * `switch`, it must be `true`.
   * @default false
   */
  required?: boolean
  /**
   * Disables the field.
   * @default false
   */
  disabled?: boolean
  /**
   * A custom check, run after the built-in ones. Returns the error, or
   * `undefined` when valid.
   */
  validate?: (value: Value, values: Values) => string | undefined
  /** Hides the field. A hidden field isn't validated, and keeps its value. */
  hidden?: (values: Values) => boolean
  /**
   * How many columns the field takes. Capped at the Form's `columns`.
   * @default 1
   */
  span?: number
}

/** The props Form sets on every field, which `props` can't replace. */
type ControlledProps = 'name' | 'value' | 'defaultValue' | 'onChange' | 'error' | 'checked' | 'defaultChecked'

interface TextFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'text' | 'email' | 'password' | 'tel' | 'url'
  placeholder?: string
  autoComplete?: string
  minLength?: number
  maxLength?: number
  /** Any other prop of TextField. */
  props?: Partial<Omit<TextFieldProps, ControlledProps | 'type' | 'multiline'>>
}

interface TextareaFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'textarea'
  placeholder?: string
  minLength?: number
  maxLength?: number
  /** The number of lines shown. */
  rows?: number
  /** Any other prop of TextField. */
  props?: Partial<Omit<TextFieldProps, ControlledProps | 'type' | 'multiline'>>
}

interface NumberFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'number'
  placeholder?: string
  min?: number
  max?: number
  step?: number
  /** Any other prop of TextField. */
  props?: Partial<Omit<TextFieldProps, ControlledProps | 'type' | 'multiline'>>
}

interface SelectFormField<Name extends string, Value, Values, Option extends string | number>
  extends FieldBase<Name, Value, Values> {
  type: 'select'
  options: readonly SelectOption<Option>[]
  /** Any other prop of Select. */
  props?: Partial<Omit<SelectProps<Option>, ControlledProps | 'options'>>
}

interface RadioFormField<Name extends string, Value, Values, Option extends string>
  extends FieldBase<Name, Value, Values> {
  type: 'radio'
  options: readonly RadioOption<Option>[]
  /**
   * Lays the options out in a row.
   * @default false
   */
  row?: boolean
  /** Any other prop of Radio group. */
  props?: Partial<Omit<RadioGroupProps<Option>, ControlledProps | 'options' | 'row'>>
}

interface AutocompleteFormField<Name extends string, Value, Values, Option extends string | number>
  extends FieldBase<Name, Value, Values> {
  type: 'autocomplete'
  options: readonly AutocompleteOption<Option>[]
  multiple?: false
  placeholder?: string
  /** Any other prop of Autocomplete. */
  props?: Partial<Omit<AutocompleteProps<Option, false>, ControlledProps | 'options' | 'multiple'>>
}

interface MultipleAutocompleteFormField<Name extends string, Value, Values, Option extends string | number>
  extends FieldBase<Name, Value, Values> {
  type: 'autocomplete'
  options: readonly AutocompleteOption<Option>[]
  /** The user picks several values, shown as chips. */
  multiple: true
  placeholder?: string
  /** Any other prop of Autocomplete. */
  props?: Partial<Omit<AutocompleteProps<Option, true>, ControlledProps | 'options' | 'multiple'>>
}

interface CheckboxFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'checkbox'
  /** Any other prop of Checkbox. */
  props?: Partial<Omit<CheckboxProps, ControlledProps>>
}

interface SwitchFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'switch'
  /** Any other prop of Switch. */
  props?: Partial<Omit<SwitchProps, ControlledProps>>
}

interface SliderFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'slider'
  /** @default 0 */
  min?: number
  /** @default 100 */
  max?: number
  /** @default 1 */
  step?: number
  marks?: MuiSliderProps['marks']
  /** Any other prop of Slider. */
  props?: Partial<Omit<SliderProps<number>, ControlledProps | 'min' | 'max' | 'step' | 'marks'>>
}

interface RatingFormField<Name extends string, Value, Values> extends FieldBase<Name, Value, Values> {
  type: 'rating'
  /** @default 5 */
  max?: number
  /** @default 1 */
  precision?: number
  /** Any other prop of Rating. */
  props?: Partial<Omit<RatingProps, ControlledProps | 'max' | 'precision'>>
}

// Checks on a value's type, wrapped in tuples so unions aren't distributed.
// A field fits when what it produces fits the value, and the value's non-null
// part is something it can show.
type Is<A, B> = [A] extends [B] ? true : false
type Base<Value> = Exclude<Value, null | undefined>
type IsText<Value> = Is<Base<Value>, string> extends true ? Is<string, Base<Value>> : false
type IsNullableNumber<Value> =
  Is<Base<Value>, number> extends true ? Is<number | null, Value> : false
type IsNumber<Value> = Is<Base<Value>, number> extends true ? Is<number, Value> : false
type IsBoolean<Value> = Is<Value, boolean> extends true ? Is<boolean, Value> : false
type ElementOf<Value> = Base<Value> extends readonly (infer Element)[] ? Element : never

/** The fields that fit a value, as listed in the spec's table of fields. */
type FieldFor<Name extends string, Value, Values> =
  | (IsText<Value> extends true
      ? TextFormField<Name, Value, Values> | TextareaFormField<Name, Value, Values>
      : never)
  | (IsNullableNumber<Value> extends true
      ? NumberFormField<Name, Value, Values> | RatingFormField<Name, Value, Values>
      : never)
  | (IsNumber<Value> extends true ? SliderFormField<Name, Value, Values> : never)
  | (Base<Value> extends never
      ? never
      : Is<Base<Value>, string | number> extends true
        ? | SelectFormField<Name, Value, Values, Base<Value> & (string | number)>
          | AutocompleteFormField<Name, Value, Values, Base<Value> & (string | number)>
        : never)
  | (Base<Value> extends never
      ? never
      : Is<Base<Value>, string> extends true
        ? RadioFormField<Name, Value, Values, Base<Value> & string>
        : never)
  | (Is<Base<Value>, readonly (string | number)[]> extends true
      ? MultipleAutocompleteFormField<Name, Value, Values, ElementOf<Value> & (string | number)>
      : never)
  | (IsBoolean<Value> extends true
      ? CheckboxFormField<Name, Value, Values> | SwitchFormField<Name, Value, Values>
      : never)

/** One field definition. The `type` must fit the type of `Values[name]`. */
export type FormField<Values extends FormValuesOf<Values>> = {
  [Name in FieldKey<Values>]: FieldFor<Name, Values[Name], Values>
}[FieldKey<Values>]

/** The text of the built-in validation errors. */
export interface FormMessages {
  required: string
  minLength: (min: number) => string
  maxLength: (max: number) => string
  min: (min: number) => string
  max: (max: number) => string
  email: string
  url: string
}

export interface FormProps<Values extends FormValuesOf<Values>>
  extends Omit<ComponentProps<'form'>, 'onSubmit' | 'onChange' | 'children' | 'defaultValue'> {
  /** The fields, in display order. */
  fields: readonly FormField<Values>[]
  /**
   * Called with the values when every visible field is valid. Replaces the
   * HTML `onSubmit`. While the promise it returns is pending, Form is
   * submitting.
   */
  onSubmit: (values: Values, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  /** Controlled values. */
  values?: Values
  /**
   * Initial values when uncontrolled.
   * @default Each field's empty value
   */
  defaultValues?: Values
  /** Called when the user changes a field, with every value and the field's name. */
  onValuesChange?: (values: Values, name: keyof Values) => void
  /** Errors from outside Form, such as the server's. Shown under their fields. */
  errors?: Partial<Record<keyof Values, string>>
  /**
   * When a field is first validated: on submit, also on blur, or also on
   * every change. After a field has shown an error, it's revalidated on
   * every change.
   * @default 'submit'
   */
  validateOn?: 'submit' | 'blur' | 'change'
  /**
   * The submit button's text.
   * @default 'Submit'
   */
  submitLabel?: ReactNode
  /** More buttons before the submit button, such as Cancel. */
  actions?: ReactNode
  /**
   * Controlled submitting state. Without it, Form is submitting while the
   * promise from `onSubmit` is pending.
   */
  submitting?: boolean
  /**
   * Disables every field and the submit button.
   * @default false
   */
  disabled?: boolean
  /**
   * The number of columns from the `sm` breakpoint up. Below it, there's always one.
   * @default 1
   */
  columns?: number
  /**
   * The text of the built-in validation errors.
   * @default English messages
   */
  messages?: Partial<FormMessages>
  /** Styles for the root `<form>`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /** The grid `<div>` around the fields. */
    fields?: ComponentProps<'div'>
    /** Every field's wrapper `<div>`, the grid cell. */
    field?: ComponentProps<'div'>
    /** The row of buttons. */
    actions?: ComponentProps<'div'>
    /** The submit Button. */
    submit?: Partial<Omit<ButtonProps, 'type' | 'loading'>>
  }
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmForm: FormProps<FormValues>
  }
  interface ComponentNameToClassKey {
    CmForm: 'root' | 'fields' | 'field' | 'actions'
  }
  interface Components<Theme = unknown> {
    CmForm?: {
      defaultProps?: ComponentsProps['CmForm']
      styleOverrides?: ComponentsOverrides<Theme>['CmForm']
      variants?: ComponentsVariants<Theme>['CmForm']
    }
  }
}
