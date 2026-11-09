'use client'

import MenuItem from '@mui/material/MenuItem'
import type { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { mergeSlotProps } from '@mui/material/utils'
import type { SelectProps } from './Select.types.ts'

// Set after the consumer's `slotProps.select`, so they always apply.
const singleSelect = { multiple: false, native: false } as const

/**
 * MUI's `TextField` with `select`, taking an `options` array. `onChange`
 * reports the option's value with its type, and `null` means nothing is
 * selected. The root is a MUI `FormControl`.
 */
export function Select<Value extends string | number = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  slotProps = {},
  'aria-label': ariaLabel,
  ...textFieldProps
}: SelectProps<Value>) {
  const { option: optionProps, select: selectProps, htmlInput, ...otherSlotProps } = slotProps

  // MUI shows no selection for `''`. Passing `''` rather than `undefined` when
  // uncontrolled avoids MUI's out-of-range warning, and React's warning when
  // the value changes.
  const controlled = value !== undefined

  return (
    <TextField
      {...(textFieldProps as TextFieldProps)}
      select
      value={controlled ? (value ?? '') : undefined}
      defaultValue={controlled ? undefined : (defaultValue ?? '')}
      onChange={
        onChange &&
        ((event) => {
          const selectEvent = event as SelectChangeEvent<Value>
          onChange(selectEvent, selectEvent.target.value as Value)
        })
      }
      slotProps={{
        ...otherSlotProps,
        // SelectInput reads `aria-label` from these props and sets it on the
        // combobox. On the root, it wouldn't name anything.
        htmlInput: mergeSlotProps(htmlInput, { 'aria-label': ariaLabel }),
        select:
          typeof selectProps === 'function'
            ? (ownerState) => ({ ...selectProps(ownerState), ...singleSelect })
            : { ...selectProps, ...singleSelect },
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          {...optionProps}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
