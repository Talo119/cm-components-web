import type { ReactNode } from 'react'
import type { FormMessages, FormValue, FormValues } from './Form.types.ts'

/**
 * Every field definition, with every prop optional. The public `FormField`
 * type checks each `type` against its value. At run time Form only needs to
 * read the props.
 */
export interface AnyField {
  name: string
  type: string
  label?: ReactNode
  helperText?: ReactNode
  required?: boolean
  disabled?: boolean
  validate?: (value: FormValue, values: FormValues) => string | undefined
  hidden?: (values: FormValues) => boolean
  span?: number
  placeholder?: string
  autoComplete?: string
  minLength?: number
  maxLength?: number
  rows?: number
  min?: number
  max?: number
  step?: number
  marks?: unknown
  options?: readonly { value: string | number; label: ReactNode; disabled?: boolean }[]
  multiple?: boolean
  row?: boolean
  precision?: number
  props?: Record<string, unknown>
}

export const defaultMessages: FormMessages = {
  required: 'This field is required',
  minLength: (min) => `Enter at least ${min} characters`,
  maxLength: (max) => `Enter at most ${max} characters`,
  min: (min) => `Enter ${min} or more`,
  max: (max) => `Enter ${max} or less`,
  email: 'Enter a valid email address',
  url: 'Enter a valid URL',
}

const textTypes = new Set(['text', 'email', 'password', 'tel', 'url', 'textarea'])

/** The value of a field that has none yet, as listed in the spec's table of fields. */
export function emptyValue(field: AnyField): FormValue {
  if (textTypes.has(field.type)) return ''
  switch (field.type) {
    case 'checkbox':
    case 'switch':
      return false
    case 'slider':
      return field.min ?? 0
    case 'autocomplete':
      return field.multiple ? [] : null
    default:
      return null
  }
}

/** A field's value, or its empty value when `values` doesn't have it. */
export function valueOf(field: AnyField, values: FormValues): FormValue {
  return values[field.name] ?? emptyValue(field)
}

function isEmpty(field: AnyField, value: FormValue) {
  if (field.type === 'checkbox' || field.type === 'switch') return value !== true
  return value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

// Loose on purpose: a missing `@` or dot is the common mistake. The server
// makes the final check.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Runs the built-in checks in order, then `validate`. Returns the first
 * error, or `undefined` when the value is valid.
 */
export function validateField(
  field: AnyField,
  values: FormValues,
  messages: FormMessages,
): string | undefined {
  const value = valueOf(field, values)
  const empty = isEmpty(field, value)
  if (field.required && empty) return messages.required

  if (!empty && typeof value === 'string' && textTypes.has(field.type)) {
    if (field.minLength !== undefined && value.length < field.minLength) {
      return messages.minLength(field.minLength)
    }
    if (field.maxLength !== undefined && value.length > field.maxLength) {
      return messages.maxLength(field.maxLength)
    }
  }
  if (typeof value === 'number' && field.type === 'number') {
    if (field.min !== undefined && value < field.min) return messages.min(field.min)
    if (field.max !== undefined && value > field.max) return messages.max(field.max)
  }
  if (!empty && typeof value === 'string') {
    if (field.type === 'email' && !emailPattern.test(value)) return messages.email
    if (field.type === 'url' && !isUrl(value)) return messages.url
  }

  return field.validate?.(value, values)
}
