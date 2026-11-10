import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Alert, AlertTitle } from './index.ts'

const severities = ['success', 'info', 'warning', 'error'] as const
const variants = ['standard', 'outlined', 'filled'] as const

/**
 * MUI's `Alert` and `AlertTitle`. Under the library theme, the icon of
 * standard and outlined alerts is drawn in the text color, because MUI's
 * severity colors are below 3:1 there. A project's `root` object in
 * `MuiAlert.styleOverrides` merges with that rule, and a function replaces it.
 *
 * The default `role="alert"` interrupts screen readers. Pass `role="status"`
 * for messages that aren't urgent, and `role="none"` for permanent notes.
 */
const meta = {
  component: Alert,
  args: { children: 'Changes saved.' },
  argTypes: {
    severity: { control: 'inline-radio', options: severities },
    variant: { control: 'inline-radio', options: variants },
    children: { control: 'text' },
    role: { control: 'inline-radio', options: ['alert', 'status', 'none'] },
  },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every variant and severity. The words say what happened, not only the color. */
export const VariantsAndSeverities: Story = {
  render: () => (
    <Stack spacing={3}>
      {variants.map((variant) => (
        <Stack spacing={1} key={variant}>
          {severities.map((severity) => (
            <Alert key={severity} variant={variant} severity={severity} role="none">
              A {variant} {severity} alert.
            </Alert>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
}

export const WithTitle: Story = {
  render: () => (
    <Alert severity="error">
      <AlertTitle>Payment failed</AlertTitle>
      Your card was declined. Try another card or contact your bank.
    </Alert>
  ),
}

/** An action takes the place of the close button. */
export const WithAction: Story = {
  render: () => (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={() => console.log('Retry')}>
          Retry
        </Button>
      }
    >
      Couldn’t load the report.
    </Alert>
  ),
}

/**
 * Alert reports `onClose` and the consumer removes it. Focus is lost after
 * closing unless the consumer moves it.
 */
export const WithCloseButton: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    return open ? (
      <Alert severity="info" variant="outlined" onClose={() => setOpen(false)}>
        You can drag rows to reorder them.
      </Alert>
    ) : (
      <Button onClick={() => setOpen(true)}>Show the tip again</Button>
    )
  },
}

export const WithoutIcon: Story = {
  args: { icon: false, severity: 'info', children: 'A note without an icon.' },
}

/**
 * A polite live region that's already on the page. Its children change after
 * the action, so screen readers announce "Upload complete" without
 * interrupting.
 */
export const LiveStatus: Story = {
  render: function Render() {
    const [state, setState] = useState<'idle' | 'uploading' | 'done'>('idle')
    const upload = () => {
      setState('uploading')
      setTimeout(() => setState('done'), 1500)
    }
    return (
      <Stack spacing={2}>
        <Button onClick={upload} loading={state === 'uploading'} sx={{ alignSelf: 'start' }}>
          Upload
        </Button>
        <Box role="status">
          {state === 'done' && (
            <Alert severity="success" role="none" onClose={() => setState('idle')}>
              Upload complete.
            </Alert>
          )}
        </Box>
      </Stack>
    )
  },
}

/**
 * A `root` object merges with the library's icon color, so the icon keeps
 * the text color here.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: () => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiAlert: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: { root: { borderRadius: 2, borderWidth: 2 } },
          },
          MuiAlertTitle: { styleOverrides: { root: { fontWeight: 700 } } },
        },
      })}
    >
      <Stack spacing={1}>
        {severities.map((severity) => (
          <Alert key={severity} severity={severity} role="none">
            <AlertTitle>{severity}</AlertTitle>
            The project’s alert.
          </Alert>
        ))}
      </Stack>
    </CmThemeProvider>
  ),
}
