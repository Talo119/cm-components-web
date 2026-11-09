import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Switch } from './index.ts'

/**
 * MUI's `Switch` with `label`, `helperText` and `error` built in, for a setting
 * that applies as soon as it changes. The root is a MUI `FormControl`.
 * `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<input>`.
 * Under the library theme, the off track is `grey[500]`, which meets 3:1.
 */
const meta = {
  component: Switch,
  args: { label: 'Email notifications' },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    labelPlacement: { control: 'inline-radio', options: ['end', 'start', 'top', 'bottom'] },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'default'],
    },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Switch {...args} label="Off" />
      <Switch {...args} label="On" defaultChecked />
      <Switch {...args} label="Required" required />
      <Switch {...args} label="Disabled" disabled />
      <Switch {...args} label="Disabled and on" disabled defaultChecked />
    </Stack>
  ),
}

/**
 * The helper text sits below the switch and label, with no indent. `error`
 * colors the label and helper text, and the track keeps its color.
 */
export const HelperTextAndError: Story = {
  render: (args) => (
    <Stack spacing={2}>
      <Switch {...args} label="Public profile" helperText="Anyone with the link can see your profile" />
      <Switch {...args} label="Public profile" error helperText="Could not save. Try again." />
    </Stack>
  ),
}

export const LabelPlacement: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <Switch {...args} label="End" labelPlacement="end" />
      <Switch {...args} label="Start" labelPlacement="start" />
      <Switch {...args} label="Top" labelPlacement="top" />
      <Switch {...args} label="Bottom" labelPlacement="bottom" />
    </Stack>
  ),
}

export const ColorsAndSizes: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Stack direction="row">
        {(['primary', 'secondary', 'success', 'error', 'default'] as const).map((color) => (
          <Switch {...args} key={color} label={color} color={color} defaultChecked />
        ))}
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {(['small', 'medium'] as const).map((size) => (
          <Switch {...args} key={size} label={size} size={size} defaultChecked />
        ))}
      </Stack>
    </Stack>
  ),
}

/** A long label wraps, and the switch stays centered on it, as in MUI. */
export const LongLabel: Story = {
  render: (args) => (
    <Stack sx={{ maxWidth: 320 }}>
      <Switch
        {...args}
        label="Show archived items in search results, lists and the activity feed"
      />
    </Stack>
  ),
}

/**
 * Without `label`, only the switch renders, so give it `aria-label` or
 * `aria-labelledby`. Name the setting, not its state.
 */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Enable rule', size: 'small' },
}

/**
 * A setting that saves on change. The switch is disabled while saving. Here,
 * every other save fails: the switch goes back and shows the error.
 */
export const SavesAndCanFail: Story = {
  render: function Render(args) {
    const [isPublic, setIsPublic] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveFailed, setSaveFailed] = useState(false)
    const [attempts, setAttempts] = useState(0)

    const save = (checked: boolean) => {
      setIsPublic(checked)
      setIsSaving(true)
      setSaveFailed(false)
      setAttempts((count) => count + 1)
      const fails = attempts % 2 === 1
      setTimeout(() => {
        setIsSaving(false)
        if (fails) {
          setIsPublic(!checked)
          setSaveFailed(true)
        }
      }, 800)
    }

    return (
      <Switch
        {...args}
        label="Public profile"
        checked={isPublic}
        onChange={(_, checked) => save(checked)}
        disabled={isSaving}
        error={saveFailed}
        helperText={
          saveFailed
            ? 'Could not save. Try again.'
            : isSaving
              ? 'Saving…'
              : 'Anyone with the link can see your profile'
        }
      />
    )
  },
}

/**
 * The MUI keys reach every part: `MuiSwitch`, `MuiFormControlLabel`,
 * `MuiFormControl` and `MuiFormHelperText`. A project's own `track` in
 * `MuiSwitch.styleOverrides` replaces the library's off track color.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiSwitch: {
            defaultProps: { color: 'secondary' },
            styleOverrides: { thumb: { boxShadow: 'none' } },
          },
          MuiFormControlLabel: { styleOverrides: { label: { fontWeight: 600 } } },
        },
      })}
    >
      <Switch {...args} defaultChecked helperText="Styled by the project's theme" />
    </CmThemeProvider>
  ),
}
