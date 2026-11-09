import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Checkbox } from '../Checkbox/index.ts'
import { TextField } from './index.ts'

/**
 * MUI's `TextField`. Under the library theme, the outlined border is
 * `grey[500]`, which meets 3:1 against both backgrounds in both schemes.
 * Hover, focus, error and disabled borders keep MUI's colors.
 */
const meta = {
  component: TextField,
  args: { label: 'Email', helperText: '' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'filled', 'standard'] },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search'] },
    label: { control: 'text' },
    helperText: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    multiline: { control: 'boolean' },
  },
} satisfies Meta<typeof TextField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * `filled` and `standard` keep MUI's underline color, which isn't changed for
 * contrast.
 */
export const Variants: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <TextField {...args} variant="outlined" label="Outlined" />
      <TextField {...args} variant="filled" label="Filled" />
      <TextField {...args} variant="standard" label="Standard" />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <TextField {...args} size="small" label="Small" />
      <TextField {...args} size="medium" label="Medium" />
    </Stack>
  ),
}

/**
 * Pass `helperText=" "` to reserve the helper text's space, so the layout
 * doesn't move when an error appears.
 */
export const States: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ maxWidth: 320 }}>
      <TextField {...args} label="With helper text" helperText="We never share your email" />
      <TextField {...args} label="Required" required helperText=" " />
      <TextField {...args} label="Error" error defaultValue="ada@" helperText="Enter a full email" />
      <TextField {...args} label="Disabled" disabled defaultValue="ada@example.com" />
    </Stack>
  ),
}

export const Types: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ maxWidth: 320 }}>
      <TextField {...args} label="Email" type="email" />
      <TextField {...args} label="Password" type="password" autoComplete="current-password" />
      <TextField {...args} label="Search" type="search" />
      <TextField
        {...args}
        label="Quantity"
        helperText="A text field with a numeric keyboard, without the browser's spinner"
        slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
      />
    </Stack>
  ),
}

export const Multiline: Story = {
  args: { label: 'Notes', multiline: true, minRows: 3, fullWidth: true },
}

/**
 * The fields show the errors the form computes. Errors appear after the first
 * submit, and the helper text keeps its space with `" "`.
 */
export const FormValidation: Story = {
  render: function Render() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [accepted, setAccepted] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const errors = {
      name: !name.trim() ? 'Enter your name' : '',
      email: !/^\S+@\S+\.\S+$/.test(email) ? 'Enter an email such as ada@example.com' : '',
      accepted: !accepted ? 'You must accept the terms' : '',
    }
    const show = (field: keyof typeof errors) => submitted && Boolean(errors[field])

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitted(true)
      if (!Object.values(errors).some(Boolean)) console.log('Submitted', { name, email })
    }

    return (
      <Stack component="form" noValidate spacing={1} sx={{ maxWidth: 360 }} onSubmit={handleSubmit}>
        <TextField
          label="Name"
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={show('name')}
          helperText={show('name') ? errors.name : ' '}
        />
        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={show('email')}
          helperText={show('email') ? errors.email : ' '}
        />
        <Checkbox
          label="I accept the terms"
          required
          checked={accepted}
          onChange={(_, checked) => setAccepted(checked)}
          error={show('accepted')}
          helperText={show('accepted') ? errors.accepted : ' '}
        />
        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
          Create account
        </Button>
      </Stack>
    )
  },
}

/**
 * A project's `notchedOutline` or `root` in `MuiOutlinedInput.styleOverrides`
 * replaces the library's border rule, because functions don't merge. Set the
 * touch-screen hover border too when replacing `root`.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiTextField: { defaultProps: { size: 'small' } },
          MuiOutlinedInput: {
            styleOverrides: {
              notchedOutline: ({ theme }) => ({
                borderColor: (theme.vars || theme).palette.primary.dark,
              }),
            },
          },
        },
      })}
    >
      <TextField {...args} label="Project border" />
    </CmThemeProvider>
  ),
}
