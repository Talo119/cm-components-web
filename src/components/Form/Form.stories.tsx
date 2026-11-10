import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Typography } from '../Typography/index.ts'
import { Form } from './index.ts'
import type { FormField } from './index.ts'

interface Profile {
  name: string
  email: string
  role: string | null
  bio: string
  newsletter: boolean
}

const profileFields: FormField<Profile>[] = [
  { name: 'name', type: 'text', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', type: 'email', label: 'Email', required: true, autoComplete: 'email' },
  {
    name: 'role',
    type: 'select',
    label: 'Role',
    required: true,
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
    ],
  },
  { name: 'bio', type: 'textarea', label: 'Bio', maxLength: 280, rows: 3, span: 2 },
  { name: 'newsletter', type: 'switch', label: 'Send me the newsletter', span: 2 },
]

const emptyProfile: Profile = { name: '', email: '', role: null, bio: '', newsletter: false }

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * A form built from field definitions, using the library's field components.
 * Form keeps the values, validates them on submit, or also on blur or change,
 * shows each error under its field, moves focus to the first invalid field,
 * and calls `onSubmit` with the values. While the promise from `onSubmit` is
 * pending, the submit button shows a spinner. The theme key is
 * `components.CmForm`, with the slots `root`, `fields`, `field` and `actions`.
 */
const meta = {
  component: Form<Profile>,
  args: {
    'aria-label': 'Profile',
    fields: profileFields,
    defaultValues: emptyProfile,
    onSubmit: () => wait(1000),
  },
  argTypes: {
    validateOn: { control: 'inline-radio', options: ['submit', 'blur', 'change'] },
    columns: { control: { type: 'number', min: 1, max: 4 } },
    disabled: { control: 'boolean' },
    fields: { control: false },
  },
  decorators: [
    (Story) => (
      <Paper variant="outlined" sx={{ p: 3, maxWidth: 640 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof Form<Profile>>

export default meta

type Story = StoryObj<typeof meta>

/** One field of every type. */
export const EveryFieldType: StoryObj = {
  render: () => (
    <Form
      aria-label="Every field type"
      onSubmit={() => wait(1000)}
      defaultValues={{
        text: '',
        email: '',
        password: '',
        textarea: '',
        age: null as number | null,
        role: null as string | null,
        plan: null as string | null,
        country: null as string | null,
        tags: [] as string[],
        agree: false,
        notify: true,
        volume: 30,
        score: null as number | null,
      }}
      fields={[
        { name: 'text', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'password', type: 'password', label: 'Password', minLength: 8 },
        { name: 'textarea', type: 'textarea', label: 'Notes', rows: 3 },
        { name: 'age', type: 'number', label: 'Age', min: 18, max: 120 },
        {
          name: 'role',
          type: 'select',
          label: 'Role',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
          ],
        },
        {
          name: 'plan',
          type: 'radio',
          label: 'Plan',
          row: true,
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
          ],
        },
        {
          name: 'country',
          type: 'autocomplete',
          label: 'Country',
          options: [
            { value: 'mx', label: 'Mexico' },
            { value: 'es', label: 'Spain' },
          ],
        },
        {
          name: 'tags',
          type: 'autocomplete',
          label: 'Tags',
          multiple: true,
          options: [
            { value: 'design', label: 'Design' },
            { value: 'research', label: 'Research' },
          ],
        },
        { name: 'agree', type: 'checkbox', label: 'I accept the terms', required: true },
        { name: 'notify', type: 'switch', label: 'Email me updates' },
        { name: 'volume', type: 'slider', label: 'Volume' },
        { name: 'score', type: 'rating', label: 'Score' },
      ]}
    />
  ),
}

/** Two columns from `sm` up, with `span` for wider fields, and a Cancel button. */
export const TwoColumns: Story = {
  args: {
    columns: 2,
    submitLabel: 'Save',
    actions: <Button variant="text">Cancel</Button>,
  },
}

/** Errors from outside Form, such as the server's, shown under their fields. */
export const ExternalErrors: Story = {
  args: {
    defaultValues: { ...emptyProfile, name: 'Ana', email: 'ana@example.com', role: 'admin' },
    errors: { email: 'This email is already registered' },
  },
}

/** A controlled `submitting` state. */
export const Submitting: Story = {
  args: { submitting: true, submitLabel: 'Save' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/** `hidden` hides a field from the values, and a hidden field isn't validated. */
export const HiddenField: StoryObj = {
  render: () => (
    <Form
      aria-label="Billing"
      defaultValues={{ hasCompany: false, company: '' }}
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
      onSubmit={() => {}}
    />
  ),
}

/** `values` and `onValuesChange`, with the values shown beside the form. */
export const Controlled: StoryObj = {
  render: function Render() {
    const [values, setValues] = useState(emptyProfile)
    return (
      <Stack spacing={2}>
        <Form
          aria-label="Profile"
          fields={profileFields}
          values={values}
          onValuesChange={setValues}
          actions={<Button type="reset">Reset</Button>}
          onReset={() => setValues(emptyProfile)}
          onSubmit={() => {}}
        />
        <Typography variant="body2" component="pre" sx={{ m: 0 }}>
          {JSON.stringify(values, null, 2)}
        </Typography>
      </Stack>
    )
  },
}

/** A project theme validates on blur and starts the actions row at the start. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          CmForm: {
            defaultProps: { validateOn: 'blur', messages: { required: 'Campo obligatorio' } },
            styleOverrides: { actions: { justifyContent: 'flex-start' } },
          },
        },
      })}
    >
      <Form {...args} />
    </CmThemeProvider>
  ),
}
