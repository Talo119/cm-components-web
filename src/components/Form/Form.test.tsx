import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Form } from './index.ts'
import type { FormField } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const textbox = (name: string | RegExp) => screen.getByRole('textbox', { name })
const submit = (name = 'Submit') => screen.getByRole('button', { name })
const form = () => document.querySelector('form')!
const cells = () => [...document.querySelectorAll<HTMLElement>('.CmForm-field')]

/** Every CSS rule Emotion inserted, as text. */
const insertedCss = () =>
  [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .join('\n')

interface Profile {
  name: string
  email: string
  role: string | null
  bio: string
  newsletter: boolean
}

const profileFields: FormField<Profile>[] = [
  { name: 'name', type: 'text', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', type: 'email', label: 'Email', required: true },
  {
    name: 'role',
    type: 'select',
    label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
    ],
  },
  { name: 'bio', type: 'textarea', label: 'Bio', maxLength: 280, span: 2 },
  { name: 'newsletter', type: 'switch', label: 'Send me the newsletter' },
]

const emptyProfile: Profile = { name: '', email: '', role: null, bio: '', newsletter: false }

describe('Form', () => {
  let warn: MockInstance
  let error: MockInstance

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn')
    error = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const expectNoWarnings = () => {
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  }

  it('renders a <form> with a field per definition, in order, labelled by its label', () => {
    render(
      <Form
        aria-label="Everything"
        onSubmit={() => {}}
        defaultValues={{
          text: '',
          email: '',
          password: '',
          tel: '',
          url: '',
          textarea: '',
          number: null as number | null,
          select: null as string | null,
          radio: null as string | null,
          autocomplete: null as string | null,
          tags: [] as string[],
          checkbox: false,
          switch: false,
          slider: 20,
          rating: null as number | null,
        }}
        fields={[
          { name: 'text', type: 'text', label: 'Text' },
          { name: 'email', type: 'email', label: 'Email' },
          { name: 'password', type: 'password', label: 'Password' },
          { name: 'tel', type: 'tel', label: 'Phone' },
          { name: 'url', type: 'url', label: 'Website' },
          { name: 'textarea', type: 'textarea', label: 'Notes', rows: 3 },
          { name: 'number', type: 'number', label: 'Age' },
          { name: 'select', type: 'select', label: 'Role', options: [{ value: 'a', label: 'A' }] },
          { name: 'radio', type: 'radio', label: 'Plan', options: [{ value: 'free', label: 'Free' }] },
          {
            name: 'autocomplete',
            type: 'autocomplete',
            label: 'Country',
            options: [{ value: 'mx', label: 'Mexico' }],
          },
          {
            name: 'tags',
            type: 'autocomplete',
            label: 'Tags',
            multiple: true,
            options: [{ value: 't', label: 'Tag' }],
          },
          { name: 'checkbox', type: 'checkbox', label: 'I agree' },
          { name: 'switch', type: 'switch', label: 'Notify me' },
          { name: 'slider', type: 'slider', label: 'Volume' },
          { name: 'rating', type: 'rating', label: 'Score' },
        ]}
      />,
    )

    expect(screen.getByRole('form', { name: 'Everything' })).toBe(form())
    expect(textbox('Text')).toHaveAttribute('type', 'text')
    expect(textbox('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(textbox('Phone')).toHaveAttribute('type', 'tel')
    expect(textbox('Website')).toHaveAttribute('type', 'url')
    expect(textbox('Notes').tagName).toBe('TEXTAREA')
    expect(screen.getByRole('spinbutton', { name: 'Age' })).toHaveAttribute('type', 'number')
    expect(screen.getAllByRole('combobox', { name: 'Role' })[0]).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'I agree' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Notify me' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveValue('20')
    expect(screen.getByRole('radiogroup', { name: 'Score' })).toBeInTheDocument()
    expect(cells()).toHaveLength(15)
    expectNoWarnings()
  })

  it('starts from defaultValues, or each field’s empty value, and reports changes', async () => {
    const onValuesChange = vi.fn()
    render(
      <Form<Profile>
        aria-label="Profile"
        fields={profileFields}
        defaultValues={{ ...emptyProfile, name: 'Ana' }}
        onValuesChange={onValuesChange}
        onSubmit={() => {}}
      />,
    )

    expect(textbox('Name')).toHaveValue('Ana')
    expect(textbox('Email')).toHaveValue('')

    await userEvent.type(textbox('Email'), 'a')
    expect(onValuesChange).toHaveBeenLastCalledWith({ ...emptyProfile, name: 'Ana', email: 'a' }, 'email')

    await userEvent.click(screen.getByRole('switch', { name: 'Send me the newsletter' }))
    expect(onValuesChange).toHaveBeenLastCalledWith(
      { ...emptyProfile, name: 'Ana', email: 'a', newsletter: true },
      'newsletter',
    )
    expectNoWarnings()
  })

  it('starts a field missing from defaultValues with its empty value', async () => {
    const onSubmit = vi.fn()
    render(
      <Form<{ name: string; count: number | null }>
        fields={[
          { name: 'name', type: 'text', label: 'Name' },
          { name: 'count', type: 'number', label: 'Count' },
        ]}
        onSubmit={onSubmit}
      />,
    )

    expect(textbox('Name')).toHaveValue('')
    await userEvent.type(textbox('Name'), 'x')
    await userEvent.click(submit())
    expect(onSubmit).toHaveBeenCalledWith({ name: 'x' }, expect.anything())
    expectNoWarnings()
  })

  it('works controlled, changing only when the consumer updates values', async () => {
    const onValuesChange = vi.fn()
    const { rerender } = render(
      <Form
        fields={[{ name: 'name', type: 'text', label: 'Name' }]}
        values={{ name: 'Ana' }}
        onValuesChange={onValuesChange}
        onSubmit={() => {}}
      />,
    )

    await userEvent.type(textbox('Name'), 'x')
    expect(onValuesChange).toHaveBeenCalledWith({ name: 'Anax' }, 'name')
    expect(textbox('Name')).toHaveValue('Ana')

    rerender(
      <Form fields={[{ name: 'name', type: 'text', label: 'Name' }]} values={{ name: 'Eva' }} onSubmit={() => {}} />,
    )
    expect(textbox('Name')).toHaveValue('Eva')
    expectNoWarnings()
  })

  it('calls onSubmit with the values and the event, without reloading the page', async () => {
    const onSubmit = vi.fn()
    render(<Form fields={profileFields} defaultValues={{ ...emptyProfile, name: 'Ana', email: 'ana@example.com' }} onSubmit={onSubmit} />)

    await userEvent.click(submit())

    expect(onSubmit).toHaveBeenCalledOnce()
    const [values, event] = onSubmit.mock.calls[0]
    expect(values).toEqual({ ...emptyProfile, name: 'Ana', email: 'ana@example.com' })
    expect(event.type).toBe('submit')
    expect(event.defaultPrevented).toBe(true)
  })

  it('submits with Enter in a single-line text field', async () => {
    const onSubmit = vi.fn()
    render(<Form fields={[{ name: 'name', type: 'text', label: 'Name' }]} defaultValues={{ name: '' }} onSubmit={onSubmit} />)

    await userEvent.type(textbox('Name'), 'Ana{Enter}')

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana' }, expect.anything())
  })

  describe('validation', () => {
    it('shows the required message, sets aria-invalid, focuses the first invalid field, and doesn’t submit', async () => {
      const onSubmit = vi.fn()
      render(<Form fields={profileFields} defaultValues={{ ...emptyProfile, name: 'Ana' }} onSubmit={onSubmit} />)

      await userEvent.click(submit())

      expect(onSubmit).not.toHaveBeenCalled()
      expect(textbox('Email')).toHaveAttribute('aria-invalid', 'true')
      expect(textbox('Email')).toHaveAccessibleDescription('This field is required')
      expect(textbox('Email')).toHaveFocus()
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'false')
    })

    it('passes required to each input', () => {
      render(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />)

      expect(textbox('Name')).toBeRequired()
      expect(form()).toHaveAttribute('novalidate')
    })

    it.each([
      ['minLength', { name: 'v', type: 'text', label: 'V', minLength: 3 }, 'ab', 'Enter at least 3 characters'],
      ['maxLength', { name: 'v', type: 'textarea', label: 'V', maxLength: 2 }, 'abc', 'Enter at most 2 characters'],
      ['email', { name: 'v', type: 'email', label: 'V' }, 'ana@', 'Enter a valid email address'],
      ['url', { name: 'v', type: 'url', label: 'V' }, 'example', 'Enter a valid URL'],
    ] as const)('gives the %s message', async (_, field, value, message) => {
      render(<Form fields={[field]} values={{ v: value as string }} onSubmit={() => {}} />)

      await userEvent.click(submit())

      expect(textbox('V')).toHaveAccessibleDescription(message)
    })

    it.each([
      ['min', 1, 'Enter 2 or more'],
      ['max', 9, 'Enter 5 or less'],
    ])('gives the %s message', async (_, value, message) => {
      render(
        <Form
          fields={[{ name: 'n', type: 'number', label: 'N', min: 2, max: 5 }]}
          values={{ n: value as number | null }}
          onSubmit={() => {}}
        />,
      )

      await userEvent.click(submit())

      expect(screen.getByRole('spinbutton', { name: 'N' })).toHaveAccessibleDescription(message)
    })

    it('accepts valid emails and URLs', async () => {
      const onSubmit = vi.fn()
      render(
        <Form
          fields={[
            { name: 'email', type: 'email', label: 'Email' },
            { name: 'url', type: 'url', label: 'Website' },
          ]}
          values={{ email: 'ana@example.com', url: 'https://example.com' }}
          onSubmit={onSubmit}
        />,
      )

      await userEvent.click(submit())

      expect(onSubmit).toHaveBeenCalled()
    })

    it('requires a checkbox to be checked', async () => {
      render(
        <Form
          fields={[{ name: 'agree', type: 'checkbox', label: 'I agree', required: true }]}
          defaultValues={{ agree: false }}
          onSubmit={() => {}}
        />,
      )

      await userEvent.click(submit())

      expect(screen.getByRole('checkbox', { name: 'I agree' })).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByRole('checkbox', { name: 'I agree' })).toHaveFocus()
    })

    it('runs validate after the built-in checks, with the value and every value', async () => {
      const validate = vi.fn((value: string, values: { password: string; confirm: string }) =>
        value === values.password ? undefined : 'Passwords don’t match',
      )
      render(
        <Form
          fields={[
            { name: 'password', type: 'password', label: 'Password' },
            { name: 'confirm', type: 'password', label: 'Confirm', required: true, validate },
          ]}
          defaultValues={{ password: 'secret', confirm: '' }}
          onSubmit={() => {}}
        />,
      )

      await userEvent.click(submit())
      expect(validate).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Confirm *')).toHaveAccessibleDescription('This field is required')

      await userEvent.type(screen.getByLabelText('Confirm *'), 'nope')
      expect(validate).toHaveBeenLastCalledWith('nope', { password: 'secret', confirm: 'nope' })
      expect(screen.getByLabelText('Confirm *')).toHaveAccessibleDescription('Passwords don’t match')
    })

    it('shows no error before the first submit with validateOn="submit"', async () => {
      render(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />)

      await userEvent.click(textbox('Name'))
      await userEvent.tab()

      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'false')
    })

    it('shows an error on blur with validateOn="blur"', async () => {
      render(<Form fields={profileFields} defaultValues={emptyProfile} validateOn="blur" onSubmit={() => {}} />)

      await userEvent.click(textbox('Name'))
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'false')
      await userEvent.tab()

      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'true')
      expect(textbox('Email')).toHaveFocus()
    })

    it('doesn’t validate a radio group when focus moves between its radios', async () => {
      render(
        <Form
          validateOn="blur"
          fields={[
            {
              name: 'plan',
              type: 'radio',
              label: 'Plan',
              required: true,
              options: [
                { value: 'free', label: 'Free' },
                { value: 'pro', label: 'Pro' },
              ],
            },
          ]}
          defaultValues={{ plan: null as string | null }}
          onSubmit={() => {}}
        />,
      )

      screen.getByRole('radio', { name: 'Free' }).focus()
      screen.getByRole('radio', { name: 'Pro' }).focus()
      expect(screen.getByRole('radiogroup', { name: 'Plan' })).not.toHaveAttribute('aria-invalid')

      await userEvent.click(submit())
      expect(screen.getByRole('radiogroup', { name: 'Plan' })).toHaveAttribute('aria-invalid', 'true')
    })

    it('shows an error on change with validateOn="change"', async () => {
      render(
        <Form
          fields={[{ name: 'name', type: 'text', label: 'Name', minLength: 3 }]}
          defaultValues={{ name: '' }}
          validateOn="change"
          onSubmit={() => {}}
        />,
      )

      await userEvent.type(textbox('Name'), 'a')

      expect(textbox('Name')).toHaveAccessibleDescription('Enter at least 3 characters')
    })

    it('removes an error as soon as the field is fixed', async () => {
      render(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />)

      await userEvent.click(submit())
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'true')

      await userEvent.type(textbox('Name'), 'A')
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'false')
      await userEvent.clear(textbox('Name'))
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'true')
    })

    it('keeps helperText until an error replaces it', async () => {
      render(
        <Form
          fields={[{ name: 'name', type: 'text', label: 'Name', required: true, helperText: 'As on your ID' }]}
          defaultValues={{ name: '' }}
          onSubmit={() => {}}
        />,
      )
      expect(textbox('Name')).toHaveAccessibleDescription('As on your ID')

      await userEvent.click(submit())
      expect(textbox('Name')).toHaveAccessibleDescription('This field is required')
    })

    it('treats a number the browser can’t parse as empty', async () => {
      const onValuesChange = vi.fn()
      render(
        <Form
          fields={[{ name: 'age', type: 'number', label: 'Age', required: true }]}
          defaultValues={{ age: null as number | null }}
          onValuesChange={onValuesChange}
          onSubmit={() => {}}
        />,
      )

      await userEvent.type(screen.getByRole('spinbutton', { name: 'Age' }), '42')
      expect(onValuesChange).toHaveBeenLastCalledWith({ age: 42 }, 'age')
      await userEvent.clear(screen.getByRole('spinbutton', { name: 'Age' }))
      expect(onValuesChange).toHaveBeenLastCalledWith({ age: null }, 'age')
    })
  })

  describe('external errors', () => {
    it('shows an entry in errors under its field, and the field’s own error wins', async () => {
      render(
        <Form
          fields={profileFields}
          defaultValues={{ ...emptyProfile, name: 'Ana' }}
          errors={{ name: 'This name is taken', email: 'Server says no' }}
          onSubmit={() => {}}
        />,
      )

      expect(textbox('Name')).toHaveAccessibleDescription('This name is taken')
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'true')
      expect(textbox('Email')).toHaveAccessibleDescription('Server says no')

      await userEvent.click(submit())
      expect(textbox('Email')).toHaveAccessibleDescription('This field is required')
    })
  })

  describe('submitting', () => {
    it('shows the loading state while the promise is pending, and ignores a second submit', async () => {
      let resolve!: () => void
      const onSubmit = vi.fn(() => new Promise<void>((done) => (resolve = done)))
      render(<Form fields={[{ name: 'name', type: 'text', label: 'Name' }]} defaultValues={{ name: '' }} onSubmit={onSubmit} />)

      await userEvent.click(submit())

      expect(form()).toHaveAttribute('aria-busy', 'true')
      expect(submit()).toBeDisabled()
      expect(submit()).toHaveClass('MuiButton-loading')
      await userEvent.type(textbox('Name'), '{Enter}')
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(textbox('Name')).toBeEnabled()

      await act(async () => resolve())
      expect(form()).not.toHaveAttribute('aria-busy')
      expect(submit()).toBeEnabled()
    })

    it('uses a controlled submitting state', async () => {
      const onSubmit = vi.fn(() => new Promise<void>(() => {}))
      const { rerender } = render(<Form fields={[]} onSubmit={onSubmit} submitting />)
      expect(form()).toHaveAttribute('aria-busy', 'true')
      expect(submit()).toBeDisabled()

      rerender(<Form fields={[]} onSubmit={onSubmit} submitting={false} />)
      await userEvent.click(submit())
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(form()).not.toHaveAttribute('aria-busy')
    })
  })

  it('disables every field and the submit button with disabled', () => {
    render(<Form fields={profileFields} defaultValues={emptyProfile} disabled onSubmit={() => {}} />)

    expect(textbox('Name')).toBeDisabled()
    expect(screen.getByRole('switch')).toBeDisabled()
    expect(submit()).toBeDisabled()
  })

  it('disables a field with its own disabled', () => {
    render(
      <Form fields={[{ name: 'name', type: 'text', label: 'Name', disabled: true }]} defaultValues={{ name: '' }} onSubmit={() => {}} />,
    )

    expect(textbox('Name')).toBeDisabled()
    expect(submit()).toBeEnabled()
  })

  it('renders submitLabel, and actions before the submit button', () => {
    render(
      <Form
        fields={[]}
        onSubmit={() => {}}
        submitLabel="Save"
        actions={<Button variant="text">Cancel</Button>}
      />,
    )

    const buttons = within(document.querySelector('.CmForm-actions')!).getAllByRole('button')
    expect(buttons.map((element) => element.textContent)).toEqual(['Cancel', 'Save'])
    expect(submit('Save')).toHaveAttribute('type', 'submit')
    expect(submit('Save')).toHaveClass('MuiButton-contained')
    expect(document.querySelector('.CmForm-fields')).not.toBeInTheDocument()
  })

  it('doesn’t render or validate a hidden field, and still submits its value', async () => {
    const onSubmit = vi.fn()
    render(
      <Form
        fields={[
          { name: 'hasCompany', type: 'checkbox', label: 'I’m buying for a company' },
          {
            name: 'company',
            type: 'text',
            label: 'Company',
            required: true,
            hidden: (values) => !values.hasCompany,
          },
        ]}
        defaultValues={{ hasCompany: true, company: 'Acme' }}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.clear(textbox('Company'))
    await userEvent.type(textbox('Company'), 'Initech')
    await userEvent.click(screen.getByRole('checkbox'))
    expect(screen.queryByRole('textbox', { name: 'Company' })).not.toBeInTheDocument()
    expect(cells()).toHaveLength(1)

    await userEvent.click(submit())
    expect(onSubmit).toHaveBeenCalledWith({ hasCompany: false, company: 'Initech' }, expect.anything())
  })

  it('lays fields out in columns from sm up, with span, and one column below', () => {
    renderThemed(<Form fields={profileFields} defaultValues={emptyProfile} columns={2} onSubmit={() => {}} />)

    const grid = document.querySelector('.CmForm-fields')!
    expect(grid).toHaveStyle({ display: 'grid', gap: '16px' })
    const css = insertedCss()
    expect(css).toMatch(/grid-template-columns: minmax\(0(px)?, 1fr\)/)
    expect(css).toMatch(/@media \(min-width: ?600px\)\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0(px)?, 1fr\)\)/)
    expect(css).toMatch(/@media \(min-width: ?600px\)\s*\{[^}]*grid-column: span 2/)
    expect(css).not.toMatch(/grid-column: span 3/)
  })

  it('caps span at columns', () => {
    renderThemed(
      <Form
        fields={[{ name: 'name', type: 'text', label: 'Name', span: 3 }]}
        defaultValues={{ name: '' }}
        columns={2}
        onSubmit={() => {}}
      />,
    )

    expect(insertedCss()).toMatch(/grid-column: span 2/)
    expect(insertedCss()).not.toMatch(/grid-column: span 3/)
  })

  describe('resetting', () => {
    it('resets uncontrolled values to defaultValues and clears the errors', async () => {
      const onValuesChange = vi.fn()
      const onReset = vi.fn()
      render(
        <Form
          fields={profileFields}
          defaultValues={{ ...emptyProfile, name: 'Ana' }}
          onValuesChange={onValuesChange}
          onReset={onReset}
          actions={<Button type="reset">Reset</Button>}
          onSubmit={() => {}}
        />,
      )

      await userEvent.clear(textbox('Name'))
      await userEvent.click(submit())
      expect(textbox('Email')).toHaveAttribute('aria-invalid', 'true')

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

      expect(textbox('Name')).toHaveValue('Ana')
      expect(textbox('Email')).toHaveAttribute('aria-invalid', 'false')
      expect(onValuesChange).toHaveBeenLastCalledWith({ ...emptyProfile, name: 'Ana' }, 'name')
      expect(onReset).toHaveBeenCalledOnce()
    })

    it('only clears the errors and calls onReset when controlled', async () => {
      const onReset = vi.fn()
      render(
        <Form
          fields={[{ name: 'name', type: 'text', label: 'Name', required: true }]}
          values={{ name: '' }}
          onReset={onReset}
          actions={<Button type="reset">Reset</Button>}
          onSubmit={() => {}}
        />,
      )
      await userEvent.click(submit())
      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'true')

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'false')
      expect(onReset).toHaveBeenCalledOnce()
    })
  })

  it('replaces the built-in messages with messages', async () => {
    render(
      <Form
        fields={[
          { name: 'name', type: 'text', label: 'Nombre', required: true },
          { name: 'bio', type: 'text', label: 'Bio', minLength: 5 },
        ]}
        values={{ name: '', bio: 'abc' }}
        messages={{ required: 'Campo obligatorio', minLength: (min) => `Mínimo ${min}` }}
        onSubmit={() => {}}
      />,
    )

    await userEvent.click(submit())

    expect(textbox('Nombre')).toHaveAccessibleDescription('Campo obligatorio')
    expect(textbox('Bio')).toHaveAccessibleDescription('Mínimo 5')
  })

  it('passes ref, className, sx, aria-label and other props to the <form>', () => {
    const ref = createRef<HTMLFormElement>()
    render(
      <Form
        ref={ref}
        fields={[]}
        onSubmit={() => {}}
        aria-label="Profile"
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    expect(ref.current).toBe(form())
    expect(form()).toHaveAttribute('data-testid', 'root')
    expect(form()).toHaveAccessibleName('Profile')
    expect(form()).toHaveClass('custom', 'CmForm-root')
    expect(form()).toHaveStyle({ marginTop: '7px' })
  })

  it('passes slotProps.fields, field, actions and submit, and each field’s props, to their elements', () => {
    render(
      <Form
        fields={[
          { name: 'name', type: 'text', label: 'Name', props: { className: 'name-field', slotProps: { htmlInput: { 'data-x': '1' } } } },
          { name: 'agree', type: 'switch', label: 'Agree', props: { className: 'agree-field' } },
        ]}
        defaultValues={{ name: '', agree: false }}
        slotProps={{
          fields: { className: 'grid' },
          field: { className: 'cell' },
          actions: { className: 'row' },
          submit: { className: 'submit', color: 'secondary' },
        }}
        onSubmit={() => {}}
      />,
    )

    expect(document.querySelector('.grid')).toHaveClass('CmForm-fields')
    expect(cells()[0]).toHaveClass('cell')
    expect(document.querySelector('.row')).toHaveClass('CmForm-actions')
    expect(submit()).toHaveClass('submit', 'MuiButton-colorSecondary')
    expect(document.querySelector('.name-field')).toContainElement(textbox('Name'))
    expect(textbox('Name')).toHaveAttribute('data-x', '1')
    expect(document.querySelector('.agree-field')).toContainElement(screen.getByRole('switch'))
  })

  it('adds the CmForm-root, CmForm-fields, CmForm-field and CmForm-actions classes', () => {
    render(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />)

    expect(form()).toHaveClass('CmForm-root')
    expect(form().querySelector('.CmForm-fields')).toBeInTheDocument()
    expect(cells()).toHaveLength(5)
    expect(form().querySelector('.CmForm-actions')).toBeInTheDocument()
  })

  it('works with the keyboard: Tab follows display order', async () => {
    render(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />)

    await userEvent.tab()
    expect(textbox('Name')).toHaveFocus()
    await userEvent.tab()
    expect(textbox('Email')).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveFocus()
    await userEvent.tab()
    expect(textbox('Bio')).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('switch')).toHaveFocus()
    await userEvent.tab()
    expect(submit()).toHaveFocus()
  })

  it('focuses a Select when it’s the first invalid field', async () => {
    render(
      <Form
        fields={[{ name: 'role', type: 'select', label: 'Role', required: true, options: [{ value: 'a', label: 'A' }] }]}
        defaultValues={{ role: null as string | null }}
        onSubmit={() => {}}
      />,
    )

    await userEvent.click(submit())

    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveFocus()
  })

  describe('with overrides', () => {
    it('applies a project-level CmForm.defaultProps.validateOn', async () => {
      renderThemed(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />, {
        components: { CmForm: { defaultProps: { validateOn: 'blur' } } },
      })

      await userEvent.click(textbox('Name'))
      await userEvent.tab()

      expect(textbox('Name')).toHaveAttribute('aria-invalid', 'true')
    })

    it('applies a project-level styleOverrides.actions object', () => {
      renderThemed(<Form fields={[]} onSubmit={() => {}} />, {
        components: { CmForm: { styleOverrides: { actions: { justifyContent: 'flex-start' } } } },
      })

      expect(document.querySelector('.CmForm-actions')).toHaveStyle({ justifyContent: 'flex-start' })
    })

    it('applies project-level styleOverrides to root, fields and field', () => {
      renderThemed(<Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />, {
        components: {
          CmForm: {
            styleOverrides: {
              root: { letterSpacing: '1px' },
              fields: { gap: '8px' },
              field: { letterSpacing: '2px' },
            },
          },
        },
      })

      expect(form()).toHaveStyle({ letterSpacing: '1px' })
      expect(document.querySelector('.CmForm-fields')).toHaveStyle({ gap: '8px' })
      expect(cells()[0]).toHaveStyle({ letterSpacing: '2px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<Form fields={[]} onSubmit={() => {}} sx={{ letterSpacing: '2px' }} />, {
        components: { CmForm: { styleOverrides: { root: { letterSpacing: '1px' } } } },
      })

      expect(form()).toHaveStyle({ letterSpacing: '2px' })
    })

    it('spaces the actions row 24px below the fields under the library theme', () => {
      renderThemed(<Form fields={[]} onSubmit={() => {}} />)

      expect(document.querySelector('.CmForm-actions')).toHaveStyle({ marginTop: '24px', justifyContent: 'flex-end' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ spacing: 4 })

      render(
        <ThemeProvider theme={theme}>
          <Form fields={profileFields} defaultValues={emptyProfile} onSubmit={() => {}} />
        </ThemeProvider>,
      )

      expect(document.querySelector('.CmForm-fields')).toHaveStyle({ gap: '8px' })
    })
  })

  it('keeps the controlled example from the docs working', async () => {
    function Controlled() {
      const [values, setValues] = useState({ name: '' })
      return (
        <Form
          fields={[{ name: 'name', type: 'text', label: 'Name' }]}
          values={values}
          onValuesChange={setValues}
          onSubmit={() => {}}
        />
      )
    }
    render(<Controlled />)

    await userEvent.type(textbox('Name'), 'Ana')

    expect(textbox('Name')).toHaveValue('Ana')
    expectNoWarnings()
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Form
        fields={profileFields}
        defaultValues={emptyProfile}
        onSubmit={(values) => {
          const profile: Profile = values
          return profile && undefined
        }}
      />,
      // `Values` is inferred from `defaultValues`, and `validate` receives it.
      <Form
        defaultValues={{ name: '', agree: false, count: 3, tags: [] as string[] }}
        fields={[
          { name: 'name', type: 'text', validate: (value, values) => (value.length > values.count ? 'Too long' : undefined) },
          { name: 'agree', type: 'checkbox', required: true },
          { name: 'count', type: 'slider', min: 1, max: 5 },
          { name: 'tags', type: 'autocomplete', multiple: true, options: [{ value: 'a', label: 'A' }] },
        ]}
        onSubmit={(values) => {
          const name: string = values.name
          const agree: boolean = values.agree
          return void [name, agree]
        }}
      />,
      <Form<{ plan: 'free' | 'pro' | null }>
        fields={[{ name: 'plan', type: 'radio', options: [{ value: 'free', label: 'Free' }] }]}
        onSubmit={async () => {}}
      />,
    ]
    const rejected = [
      // @ts-expect-error: a name that isn't a key
      <Form defaultValues={{ name: '' }} fields={[{ name: 'other', type: 'text' }]} onSubmit={() => {}} />,
      // @ts-expect-error: a switch field for a string value
      <Form defaultValues={{ name: '' }} fields={[{ name: 'name', type: 'switch' }]} onSubmit={() => {}} />,
      // @ts-expect-error: a text field for a boolean value
      <Form defaultValues={{ agree: false }} fields={[{ name: 'agree', type: 'text' }]} onSubmit={() => {}} />,
      // @ts-expect-error: a text field for a value limited to some strings
      <Form<{ plan: 'a' | 'b' }> fields={[{ name: 'plan', type: 'text' }]} onSubmit={() => {}} />,
      // @ts-expect-error: an option that isn't one of the value's strings
      <Form<{ plan: 'a' | 'b' }> fields={[{ name: 'plan', type: 'select', options: [{ value: 'c', label: 'C' }] }]} onSubmit={() => {}} />,
      // @ts-expect-error: a number field can be empty, so its value must allow null
      <Form<{ n: number }> fields={[{ name: 'n', type: 'number' }]} onSubmit={() => {}} />,
      // @ts-expect-error: onSubmit receives Values
      <Form defaultValues={{ name: '' }} fields={[]} onSubmit={(values: { other: number }) => values} />,
      // @ts-expect-error: type is set from the field's type
      <Form defaultValues={{ name: '' }} fields={[{ name: 'name', type: 'text', props: { type: 'date' } }]} onSubmit={() => {}} />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmForm: {
            defaultProps: { columns: 2 },
            styleOverrides: { fields: { gap: 8 } },
          },
        },
      }),
      // @ts-expect-error: not a CmForm slot
      createCmTheme({ components: { CmForm: { styleOverrides: { submit: { gap: 8 } } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(13)
  })
})
