'use client'

import MuiCheckbox from '@mui/material/Checkbox'
import { mergeSlotProps } from '@mui/material/utils'
import { ToggleField } from '../ToggleField.tsx'
import type { CheckboxProps } from './Checkbox.types.ts'

/**
 * MUI's `Checkbox` with its label, helper text and error state built in. The
 * root is a MUI `FormControl`.
 */
export function Checkbox({
  required = false,
  disabled = false,
  checked,
  defaultChecked,
  onChange,
  indeterminate,
  name,
  value,
  id,
  color,
  size,
  icon,
  checkedIcon,
  indeterminateIcon,
  autoFocus,
  disableRipple,
  onFocus,
  onBlur,
  slotProps = {},
  ...fieldProps
}: CheckboxProps) {
  const { control: controlProps, ...fieldSlotProps } = slotProps

  return (
    <ToggleField
      {...fieldProps}
      required={required}
      disabled={disabled}
      id={id}
      slotProps={fieldSlotProps}
      renderControl={(input) => (
        <MuiCheckbox
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          indeterminate={indeterminate}
          name={name}
          value={value}
          id={id}
          color={color}
          size={size}
          icon={icon}
          checkedIcon={checkedIcon}
          indeterminateIcon={indeterminateIcon}
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
