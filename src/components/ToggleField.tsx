'use client'

import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { FormControlLabelProps } from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import type { FormHelperTextProps } from '@mui/material/FormHelperText'
import type { SxProps, Theme } from '@mui/material/styles'
import { useForkRef } from '@mui/material/utils'
import { useId } from 'react'
import type { ComponentProps, ReactElement, Ref } from 'react'
import type { FieldProps } from './fieldProps.ts'

/** The props that `ToggleField` sets on the control's `<input>`. */
export type ToggleInputProps = ComponentProps<'input'> & { ref: Ref<HTMLInputElement> }

export interface ToggleFieldProps
  extends FieldProps,
    Omit<
      ComponentProps<'div'>,
      'onChange' | 'onFocus' | 'onBlur' | 'color' | 'defaultChecked' | 'defaultValue' | 'id'
    > {
  /** The `<input>`'s id. The helper text's id is built from it when set. */
  id?: string
  inputRef?: Ref<HTMLInputElement>
  labelPlacement?: FormControlLabelProps['labelPlacement']
  sx?: SxProps<Theme>
  slotProps?: {
    htmlInput?: ComponentProps<'input'>
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label'>>
    formHelperText?: Partial<FormHelperTextProps>
  }
  /**
   * Renders the MUI control, such as `Checkbox` or `Switch`, with `id`,
   * `disabled` and `required` from these props, and merges `input` into its
   * `slotProps.input`.
   */
  renderControl: (input: ToggleInputProps) => ReactElement
}

/**
 * The structure that Checkbox and Switch share: a `FormControl` root, the
 * control inside a `FormControlLabel` when there's a `label`, and the helper
 * text below it, linked to the `<input>`. Private: not exported from
 * `src/index.ts`.
 */
export function ToggleField({
  label,
  helperText,
  error = false,
  required = false,
  disabled = false,
  id,
  inputRef,
  labelPlacement,
  slotProps = {},
  renderControl,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rootProps
}: ToggleFieldProps) {
  const { htmlInput, formControlLabel, formHelperText } = slotProps
  const generatedId = useId()
  const helperTextId = id ? `${id}-helper-text` : generatedId
  const hasHelperText = Boolean(helperText)
  const describedBy =
    [ariaDescribedBy, hasHelperText ? helperTextId : undefined].filter(Boolean).join(' ') ||
    undefined
  const htmlInputRef = useForkRef(inputRef, htmlInput?.ref)

  const control = renderControl({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': describedBy,
    'aria-invalid': error || undefined,
    ...htmlInput,
    ref: htmlInputRef,
  })

  // Only `label` changes the structure. The control stays the first child, so
  // turning `helperText` or `error` on and off doesn't remount the `<input>`.
  return (
    <FormControl
      // MUI indents helper text inside an outlined or filled field.
      variant="standard"
      error={error}
      required={required}
      disabled={disabled}
      {...rootProps}
    >
      {label != null && label !== '' ? (
        <FormControlLabel
          labelPlacement={labelPlacement}
          {...formControlLabel}
          control={control}
          label={label}
        />
      ) : (
        control
      )}
      {hasHelperText && (
        <FormHelperText id={helperTextId} {...formHelperText}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
