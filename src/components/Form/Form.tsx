'use client'

import { styled, useThemeProps } from '@mui/material/styles'
import { useState } from 'react'
import type { FocusEvent, FormEvent, ReactNode } from 'react'
import { Autocomplete } from '../Autocomplete/index.ts'
import { Button } from '../Button/index.ts'
import { Checkbox } from '../Checkbox/index.ts'
import { classNames } from '../classNames.ts'
import { RadioGroup } from '../RadioGroup/index.ts'
import { Rating } from '../Rating/index.ts'
import { Select } from '../Select/index.ts'
import { Slider } from '../Slider/index.ts'
import { Switch } from '../Switch/index.ts'
import { TextField } from '../TextField/index.ts'
import type { FormProps, FormValue, FormValues, FormValuesOf } from './Form.types.ts'
import { defaultMessages, validateField, valueOf } from './Form.utils.ts'
import type { AnyField } from './Form.utils.ts'

const FormRoot = styled('form', { name: 'CmForm', slot: 'root' })({})

const FormFields = styled('div', { name: 'CmForm', slot: 'fields' })<{
  ownerState: { columns: number }
}>(({ theme, ownerState }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'minmax(0, 1fr)',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: `repeat(${ownerState.columns}, minmax(0, 1fr))`,
  },
}))

const FormField = styled('div', { name: 'CmForm', slot: 'field' })<{
  ownerState: { span: number }
}>(({ theme, ownerState }) => ({
  minWidth: 0,
  [theme.breakpoints.up('sm')]: { gridColumn: `span ${ownerState.span}` },
}))

const FormActions = styled('div', { name: 'CmForm', slot: 'actions' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginTop: theme.spacing(3),
}))

/** The props every field component shares, from `fieldProps.ts`. */
interface CommonProps {
  name: string
  label: ReactNode
  helperText: ReactNode
  error: boolean
  required: boolean
  disabled: boolean
}

type FieldRenderer = (
  field: AnyField,
  value: FormValue,
  common: CommonProps,
  change: (value: FormValue) => void,
  blur: () => void,
) => ReactNode

/** Merges Form's `htmlInput` props into TextField's, from the field's `props`. */
function textFieldSlotProps(field: AnyField, htmlInput: Record<string, unknown>) {
  const slotProps = (field.props?.slotProps ?? {}) as Record<string, unknown>
  return { ...slotProps, htmlInput: { ...htmlInput, ...(slotProps.htmlInput as object) } }
}

const renderText: FieldRenderer = (field, value, common, change) => (
  <TextField
    fullWidth
    {...field.props}
    {...common}
    type={field.type === 'textarea' ? undefined : field.type}
    multiline={field.type === 'textarea'}
    rows={field.rows}
    placeholder={field.placeholder}
    autoComplete={field.autoComplete}
    value={value ?? ''}
    onChange={(event) => change(event.target.value)}
    slotProps={textFieldSlotProps(field, { minLength: field.minLength, maxLength: field.maxLength })}
  />
)

const renderNumber: FieldRenderer = (field, value, common, change) => (
  <TextField
    fullWidth
    {...field.props}
    {...common}
    type="number"
    placeholder={field.placeholder}
    value={value === null ? '' : String(value)}
    onChange={(event) => {
      // The browser gives `''` for an empty field and for one it can't parse.
      const parsed = event.target.value === '' ? Number.NaN : Number(event.target.value)
      change(Number.isNaN(parsed) ? null : parsed)
    }}
    slotProps={textFieldSlotProps(field, { min: field.min, max: field.max, step: field.step })}
  />
)

const renderers: Record<string, FieldRenderer> = {
  text: renderText,
  email: renderText,
  password: renderText,
  tel: renderText,
  url: renderText,
  textarea: renderText,
  number: renderNumber,
  select: (field, value, common, change, blur) => (
    <Select
      fullWidth
      {...field.props}
      {...common}
      options={field.options ?? []}
      value={value as string | number | null}
      onChange={(_, newValue) => change(newValue)}
      // MUI's Select only reports `blur` while its menu is closed, so opening
      // the menu doesn't validate the field.
      onBlur={blur}
    />
  ),
  radio: (field, value, common, change) => (
    <RadioGroup
      {...field.props}
      {...common}
      options={(field.options ?? []) as { value: string; label: ReactNode }[]}
      row={field.row}
      value={value as string | null}
      onChange={(_, newValue) => change(newValue)}
    />
  ),
  autocomplete: (field, value, common, change) => (
    <Autocomplete<string | number, boolean>
      fullWidth
      {...field.props}
      {...common}
      options={(field.options ?? []) as { value: string | number; label: string }[]}
      multiple={field.multiple ?? false}
      placeholder={field.placeholder}
      value={value as string | number | (string | number)[] | null}
      onChange={(_, newValue) => change(newValue as FormValue)}
    />
  ),
  checkbox: (field, value, common, change) => (
    <Checkbox {...field.props} {...common} checked={value === true} onChange={(_, checked) => change(checked)} />
  ),
  switch: (field, value, common, change) => (
    <Switch {...field.props} {...common} checked={value === true} onChange={(_, checked) => change(checked)} />
  ),
  slider: (field, value, common, change) => (
    <Slider<number>
      {...field.props}
      {...common}
      min={field.min}
      max={field.max}
      step={field.step}
      marks={field.marks as boolean | undefined}
      value={value as number}
      onChange={(_, newValue) => change(newValue)}
    />
  ),
  rating: (field, value, common, change) => (
    <Rating
      {...field.props}
      {...common}
      max={field.max}
      precision={field.precision}
      value={value as number | null}
      onChange={(_, newValue) => change(newValue)}
    />
  ),
}

/**
 * A `<form>` built from field definitions, using the library's field
 * components. Form keeps the values, validates them, shows each error under
 * its field, moves focus to the first invalid field, and calls `onSubmit`
 * with the values when they're valid.
 */
export function Form<Values extends FormValuesOf<Values>>(inProps: FormProps<Values>) {
  const {
    fields,
    onSubmit,
    values: valuesProp,
    defaultValues,
    onValuesChange,
    errors: externalErrors,
    validateOn = 'submit',
    submitLabel = 'Submit',
    actions,
    submitting: submittingProp,
    disabled = false,
    columns = 1,
    messages: messagesProp,
    slotProps = {},
    className,
    noValidate = true,
    onReset,
    ...rootProps
  } = useThemeProps({ props: inProps, name: 'CmForm' }) as FormProps<Values>
  const {
    fields: fieldsProps,
    field: fieldProps,
    actions: actionsProps,
    submit: submitProps,
  } = slotProps

  const fieldList = fields as readonly AnyField[]
  const messages = { ...defaultMessages, ...messagesProp }
  const external = (externalErrors ?? {}) as Partial<Record<string, string>>

  const [internalValues, setInternalValues] = useState<FormValues>(
    (defaultValues ?? {}) as FormValues,
  )
  const current = (valuesProp ?? internalValues) as FormValues
  const [ownErrors, setOwnErrors] = useState<Partial<Record<string, string>>>({})
  // Fields that have shown an error, which are revalidated on every change.
  const [shown, setShown] = useState<ReadonlySet<string>>(() => new Set())
  const [pending, setPending] = useState(false)
  const submitting = submittingProp ?? pending

  const visibleFields = fieldList.filter((field) => !field.hidden?.(current))

  const showResult = (name: string, error: string | undefined) => {
    setOwnErrors((previous) => ({ ...previous, [name]: error }))
    if (error !== undefined && !shown.has(name)) setShown(new Set(shown).add(name))
  }

  const change = (field: AnyField, value: FormValue) => {
    const next = { ...current, [field.name]: value }
    if (valuesProp === undefined) setInternalValues(next)
    onValuesChange?.(next as Values, field.name as keyof Values)
    if (validateOn === 'change' || shown.has(field.name)) {
      showResult(field.name, validateField(field, next, messages))
    }
  }

  const blur = (field: AnyField) => {
    if (validateOn === 'blur') showResult(field.name, validateField(field, current, messages))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const results = visibleFields.map((field) => validateField(field, current, messages))
    setOwnErrors(Object.fromEntries(visibleFields.map((field, index) => [field.name, results[index]])))
    const invalid = visibleFields.filter((_, index) => results[index] !== undefined)
    if (invalid.length > 0) {
      setShown(new Set([...shown, ...invalid.map((field) => field.name)]))
      // The cells are rendered in the order of the visible fields.
      const cell = event.currentTarget.querySelectorAll<HTMLElement>('.CmForm-field')[
        results.findIndex((result) => result !== undefined)
      ]
      focusableIn(cell)?.focus()
      return
    }

    const result = onSubmit(current as Values, event)
    if (submittingProp === undefined && result instanceof Promise) {
      setPending(true)
      // Not caught: a rejection still reaches the consumer's error handling.
      void result.finally(() => setPending(false))
    }
  }

  const handleReset = (event: FormEvent<HTMLFormElement>) => {
    setOwnErrors({})
    setShown(new Set())
    if (valuesProp === undefined) {
      const reset = (defaultValues ?? {}) as FormValues
      setInternalValues(reset)
      if (fieldList.length > 0) onValuesChange?.(reset as Values, fieldList[0].name as keyof Values)
    }
    onReset?.(event)
  }

  return (
    <FormRoot
      {...rootProps}
      className={classNames('CmForm-root', className)}
      noValidate={noValidate}
      aria-busy={submitting || undefined}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {visibleFields.length > 0 && (
        <FormFields
          {...fieldsProps}
          className={classNames('CmForm-fields', fieldsProps?.className)}
          ownerState={{ columns }}
        >
          {visibleFields.map((field) => {
            const error = ownErrors[field.name] ?? external[field.name]
            const render = renderers[field.type] ?? renderText
            return (
              <FormField
                key={field.name}
                {...fieldProps}
                className={classNames('CmForm-field', fieldProps?.className)}
                ownerState={{ span: Math.min(field.span ?? 1, columns) }}
                onBlur={(event: FocusEvent<HTMLDivElement>) => {
                  fieldProps?.onBlur?.(event)
                  // Select reports its own blur. Moving focus inside the
                  // field, such as between radios, isn't a blur.
                  if (field.type === 'select') return
                  if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
                  blur(field)
                }}
              >
                {render(
                  field,
                  valueOf(field, current),
                  {
                    name: field.name,
                    label: field.label,
                    helperText: error ?? field.helperText,
                    error: error !== undefined,
                    required: field.required ?? false,
                    disabled: disabled || (field.disabled ?? false),
                  },
                  (value) => change(field, value),
                  () => blur(field),
                )}
              </FormField>
            )
          })}
        </FormFields>
      )}
      <FormActions {...actionsProps} className={classNames('CmForm-actions', actionsProps?.className)}>
        {actions}
        <Button
          variant="contained"
          disabled={disabled}
          {...submitProps}
          type="submit"
          loading={submitting}
        >
          {submitLabel}
        </Button>
      </FormActions>
    </FormRoot>
  )
}

/** The element to focus in a field's cell: its input, or MUI's select button. */
function focusableIn(cell: HTMLElement | undefined) {
  return cell?.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([aria-hidden="true"]), textarea, [role="combobox"]',
  )
}
