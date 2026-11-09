'use client'

import MuiSwitch from '@mui/material/Switch'
import { mergeSlotProps } from '@mui/material/utils'
import { ToggleField } from '../ToggleField.tsx'
import type { SwitchProps } from './Switch.types.ts'

/**
 * MUI's `Switch` with its label, helper text and error state built in, for a
 * setting that applies as soon as it changes. The root is a MUI `FormControl`.
 */
export function Switch({
  required = false,
  disabled = false,
  checked,
  defaultChecked,
  onChange,
  name,
  value,
  id,
  color,
  size,
  autoFocus,
  disableRipple,
  onFocus,
  onBlur,
  slotProps = {},
  ...fieldProps
}: SwitchProps) {
  const { control: controlProps, ...fieldSlotProps } = slotProps

  return (
    <ToggleField
      {...fieldProps}
      required={required}
      disabled={disabled}
      id={id}
      slotProps={fieldSlotProps}
      renderControl={(input) => (
        <MuiSwitch
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          name={name}
          value={value}
          id={id}
          color={color}
          size={size}
          autoFocus={autoFocus}
          disableRipple={disableRipple}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          {...controlProps}
          slotProps={{
            ...controlProps?.slotProps,
            input: mergeSlotProps(controlProps?.slotProps?.input, input),
          }}
        />
      )}
    />
  )
}
