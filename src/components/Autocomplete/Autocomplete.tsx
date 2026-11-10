'use client'

import MuiAutocomplete from '@mui/material/Autocomplete'
import type {
  AutocompleteProps as MuiAutocompleteProps,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { mergeSlotProps, useControlled } from '@mui/material/utils'
import type { ComponentType, Ref } from 'react'
import type { AutocompleteOption, AutocompleteProps } from './Autocomplete.types.ts'

// MUI's overloads can't resolve a generic `Value` and `Multiple`, so it's
// called with them widened. `AutocompleteProps` keeps the public types exact.
type AnyValue = string | number
type WidenedProps = MuiAutocompleteProps<AutocompleteOption<AnyValue>, boolean, boolean, false, 'div', AnyValue>
const WidenedAutocomplete = MuiAutocomplete as unknown as ComponentType<WidenedProps>

// Module-level, so MUI's lookups and its duplicate check aren't rebuilt each render.
const getOptionValue = (option: AutocompleteOption<AnyValue>) => option.value
const getOptionLabel = (option: AutocompleteOption<AnyValue>) => option.label
const getOptionDisabled = (option: AutocompleteOption<AnyValue>) => option.disabled ?? false

/**
 * MUI's `Autocomplete` with a TextField built in, taking the field props and
 * an `options` array. `value`, `defaultValue` and `onChange` use the options'
 * values, with their type. The root is MUI's `Autocomplete` root, a `<div>`.
 */
export function Autocomplete<
  Value extends string | number = string,
  Multiple extends boolean = false,
>({
  options,
  multiple,
  value: valueProp,
  defaultValue,
  onChange,
  name,
  placeholder,
  variant,
  label,
  helperText,
  error = false,
  required = false,
  disabled = false,
  slotProps = {},
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...autocompleteProps
}: AutocompleteProps<Value, Multiple>) {
  const { textField: textFieldProps = {}, ...muiSlotProps } = slotProps

  // Kept here even when uncontrolled, for the hidden inputs and `required`.
  const [value, setValue] = useControlled<Value | readonly Value[] | null>({
    controlled: valueProp,
    default: defaultValue ?? (multiple ? [] : null),
    name: 'Autocomplete',
    state: 'value',
  })
  const selected: readonly Value[] =
    value == null ? [] : Array.isArray(value) ? value : [value as Value]

  const renderInput = (params: AutocompleteRenderInputParams) => {
    const { slotProps: fieldSlotProps = {}, ...fieldProps } = textFieldProps
    const helperTextId = helperText ? `${params.id}-helper-text` : undefined
    const describedBy = [ariaDescribedBy, helperTextId].filter(Boolean).join(' ') || undefined

    const htmlInput = definedProps({
      ...params.slotProps.htmlInput,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      // Passed here, so it replaces TextField's own and keeps both ids.
      'aria-describedby': describedBy,
      'aria-required': required || undefined,
      // With values selected, the input's own text is empty with `multiple`,
      // and the browser would block the form.
      required: required && selected.length === 0,
    })

    return (
      <>
        <TextField
          {...(fieldProps as TextFieldProps)}
          id={params.id}
          disabled={params.disabled}
          fullWidth={params.fullWidth}
          size={params.size}
          label={label}
          helperText={helperText}
          error={error}
          required={required}
          placeholder={placeholder}
          variant={variant}
          slotProps={{
            ...fieldSlotProps,
            inputLabel: mergeSlotProps(fieldSlotProps.inputLabel, params.slotProps.inputLabel),
            input: withRef(
              mergeSlotProps(fieldSlotProps.input, params.slotProps.input),
              params.slotProps.input.ref,
            ),
            htmlInput: withRef(
              mergeSlotProps(fieldSlotProps.htmlInput, htmlInput),
              params.slotProps.htmlInput.ref,
            ),
          }}
        />
        {name != null &&
          selected.map((selectedValue) => (
            <input
              key={selectedValue}
              type="hidden"
              name={name}
              value={selectedValue}
              disabled={disabled}
            />
          ))}
      </>
    )
  }

  return (
    <WidenedAutocomplete
      {...(autocompleteProps as Partial<WidenedProps>)}
      options={options}
      multiple={multiple ?? false}
      value={value as AnyValue | AnyValue[] | null}
      onChange={(event, newValue, reason) => {
        setValue(newValue as Value | Value[] | null)
        onChange?.(event, newValue as Parameters<NonNullable<typeof onChange>>[1], reason)
      }}
      disabled={disabled}
      getOptionValue={getOptionValue}
      getOptionLabel={getOptionLabel}
      getOptionKey={getOptionValue}
      getOptionDisabled={getOptionDisabled}
      slotProps={muiSlotProps as WidenedProps['slotProps']}
      renderInput={renderInput}
    />
  )
}

type SlotPropsValue = object | ((ownerState: never) => object)

/** Puts MUI's `ref` back after merging, so a consumer's slot props can't drop it. */
function withRef<Props extends SlotPropsValue>(props: Props, ref: Ref<unknown> | undefined) {
  if (typeof props === 'function') {
    return ((ownerState: never) => ({ ...props(ownerState), ref })) as Props
  }
  return { ...props, ref } as Props
}

/** Leaves out `undefined` values, so they don't replace what MUI or TextField set. */
function definedProps<Props extends object>(props: Props): Partial<Props> {
  return Object.fromEntries(
    Object.entries(props).filter(([, propValue]) => propValue !== undefined),
  ) as Partial<Props>
}
