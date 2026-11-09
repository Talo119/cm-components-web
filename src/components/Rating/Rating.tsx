'use client'

import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import MuiRating from '@mui/material/Rating'
import { useId } from 'react'
import type { RatingProps } from './Rating.types.ts'

/**
 * MUI's `Rating`, for collecting or showing a score on a small fixed scale,
 * with its label, helper text and error state built in. The root is a MUI
 * `FormControl`.
 */
export function Rating({
  value,
  defaultValue,
  onChange,
  onChangeActive,
  max,
  precision,
  readOnly = false,
  highlightSelectedOnly,
  name,
  size,
  icon,
  emptyIcon,
  getLabelText,
  emptyLabelText,
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
}: RatingProps) {
  const { formLabel, control: controlProps, formHelperText } = slotProps
  const generatedId = useId()
  const idPrefix = id ?? generatedId
  const labelId = `${idPrefix}-label`
  const helperTextId = `${idPrefix}-helper-text`
  const controlId = controlProps?.id ?? `${idPrefix}-rating`
  const hasLabel = label != null && label !== ''
  const hasHelperText = Boolean(helperText)
  const describedBy =
    [ariaDescribedBy, hasHelperText ? helperTextId : undefined].filter(Boolean).join(' ') ||
    undefined

  // MUI's root has no role unless `readOnly`, when it's an `img` named by
  // `getLabelText(value)`. Naming it by the label and by itself gives
  // "Average rating, 4.5 Stars". MUI lets these props replace its own, so
  // only the ones that are set are passed, or `undefined` would remove MUI's.
  const groupProps = definedProps(
    readOnly
      ? {
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy ?? (hasLabel ? `${labelId} ${controlId}` : undefined),
          'aria-describedby': describedBy,
        }
      : {
          role: 'radiogroup',
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy ?? (hasLabel ? labelId : undefined),
          'aria-describedby': describedBy,
          // MUI's `Rating` doesn't read `error` or `required` from the `FormControl`.
          'aria-invalid': error || undefined,
          'aria-required': required || undefined,
        },
  )

  // The label and helper text sit on either side of the stars, so turning
  // `helperText` or `error` on and off doesn't remount the inputs.
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
      <MuiRating
        value={value}
        // MUI's own default is `null`, though its type doesn't allow one.
        defaultValue={defaultValue ?? undefined}
        onChange={onChange}
        onChangeActive={onChangeActive}
        max={max}
        precision={precision}
        readOnly={readOnly}
        highlightSelectedOnly={highlightSelectedOnly}
        name={name}
        size={size}
        icon={icon}
        emptyIcon={emptyIcon}
        getLabelText={getLabelText}
        emptyLabelText={emptyLabelText}
        // MUI's `Rating` doesn't read `disabled` from the `FormControl`.
        disabled={disabled}
        {...groupProps}
        {...controlProps}
        id={controlId}
      />
      {hasHelperText && (
        <FormHelperText id={helperTextId} {...formHelperText}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}

function definedProps<Props extends object>(props: Props): Partial<Props> {
  return Object.fromEntries(
    Object.entries(props).filter(([, propValue]) => propValue !== undefined),
  ) as Partial<Props>
}
