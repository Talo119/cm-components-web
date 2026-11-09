'use client'

import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import MuiRadioGroup from '@mui/material/RadioGroup'
import { mergeSlotProps, useControlled } from '@mui/material/utils'
import { useId } from 'react'
import type { RadioGroupProps } from './RadioGroup.types.ts'

/**
 * MUI's `RadioGroup`, taking an `options` array, with the group label, helper
 * text and error state built in. The root is a MUI `FormControl`.
 */
export function RadioGroup<Value extends string = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  name,
  row = false,
  color,
  size,
  label,
  helperText,
  error = false,
  required = false,
  disabled = false,
  id,
  slotProps = {},
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rootProps
}: RadioGroupProps<Value>) {
  const {
    formLabel,
    radioGroup,
    formControlLabel,
    control: controlProps,
    formHelperText,
  } = slotProps
  const generatedId = useId()
  const idPrefix = id ?? generatedId
  const labelId = `${idPrefix}-label`
  const helperTextId = `${idPrefix}-helper-text`
  const hasLabel = label != null && label !== ''
  const hasHelperText = Boolean(helperText)
  const describedBy =
    [ariaDescribedBy, hasHelperText ? helperTextId : undefined].filter(Boolean).join(' ') ||
    undefined

  // Kept here rather than in MUI's `RadioGroup`, which compares values as
  // strings, so `null` would select an option whose value is `'null'`.
  const [selected, setSelected] = useControlled<Value | null>({
    controlled: value,
    default: defaultValue,
    name: 'RadioGroup',
    state: 'value',
  })

  // The label and helper text sit on either side of the group, so turning
  // `helperText` or `error` on and off doesn't remount the radios.
  return (
    <FormControl
      // MUI indents helper text inside an outlined or filled field.
      variant="standard"
      error={error}
      required={required}
      disabled={disabled}
      id={id}
      {...rootProps}
    >
      {hasLabel && (
        <FormLabel id={labelId} {...formLabel}>
          {label}
        </FormLabel>
      )}
      <MuiRadioGroup
        row={row}
        name={name}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (hasLabel ? labelId : undefined)}
        aria-describedby={describedBy}
        // MUI doesn't pass `error` or `required` to the group or the radios.
        aria-invalid={error || undefined}
        aria-required={required || undefined}
        {...radioGroup}
        value={selected}
        onChange={(event, newValue) => {
          setSelected(newValue as Value)
          onChange?.(event, newValue as Value)
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            disabled={disabled || option.disabled}
            {...formControlLabel}
            label={option.label}
            control={
              <Radio
                color={color}
                size={size}
                {...controlProps}
                value={option.value}
                checked={selected === option.value}
                slotProps={{
                  ...controlProps?.slotProps,
                  // On the `<input>` and not on `Radio`, because
                  // `FormControlLabel` shows an asterisk for a required control.
                  input: mergeSlotProps(controlProps?.slotProps?.input, {
                    required: required || undefined,
                  }),
                }}
              />
            }
          />
        ))}
      </MuiRadioGroup>
      {hasHelperText && (
        <FormHelperText id={helperTextId} {...formHelperText}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
