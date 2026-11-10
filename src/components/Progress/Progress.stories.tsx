import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Typography } from '../Typography/index.ts'
import { CircularProgress, LinearProgress } from './index.ts'

const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'inherit'] as const

/**
 * MUI's `LinearProgress` and `CircularProgress`. Neither has a name by default,
 * so every example passes `aria-label`, or `aria-labelledby` pointing at
 * visible text. Under the library theme, LinearProgress's track is `divider`,
 * so a determinate bar meets 3:1 against it. The `buffer` variant keeps MUI's
 * colors. A project's own `MuiLinearProgress.styleOverrides.root` replaces the
 * library's track, because style functions don't merge.
 */
const meta = {
  component: LinearProgress,
  args: { 'aria-label': 'Loading' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['indeterminate', 'determinate', 'buffer', 'query'],
    },
    value: { control: { type: 'range', min: 0, max: 100 } },
    valueBuffer: { control: { type: 'range', min: 0, max: 100 } },
    color: { control: 'select', options: colors },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 480 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof LinearProgress>

export default meta

type Story = StoryObj<typeof meta>

export const Linear: Story = {}

/** Every LinearProgress variant, with `primary`. */
export const LinearVariants: Story = {
  render: () => (
    <Stack spacing={3}>
      <LinearProgress aria-label="Indeterminate" />
      <LinearProgress aria-label="Determinate" variant="determinate" value={40} />
      <LinearProgress aria-label="Buffer" variant="buffer" value={40} valueBuffer={70} />
      <LinearProgress aria-label="Query" variant="query" />
    </Stack>
  ),
}

/**
 * Only `primary` and `secondary` meet 3:1 against the `divider` track on
 * both schemes. The other colors come from the palette.
 */
export const LinearColors: Story = {
  render: () => (
    <Stack spacing={3}>
      {colors.map((color) => (
        <LinearProgress
          key={color}
          aria-label={color}
          color={color}
          variant="determinate"
          value={60}
        />
      ))}
    </Stack>
  ),
}

/** Every CircularProgress variant, with and without the track. */
export const CircularVariants: Story = {
  render: () => (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <CircularProgress aria-label="Indeterminate" />
      <CircularProgress aria-label="Determinate" variant="determinate" value={65} />
      <CircularProgress
        aria-label="Determinate with track"
        variant="determinate"
        value={65}
        enableTrackSlot
      />
      <CircularProgress aria-label="Indeterminate with track" enableTrackSlot />
    </Stack>
  ),
}

export const CircularColors: Story = {
  render: () => (
    <Stack direction="row" spacing={3}>
      {colors.map((color) => (
        <CircularProgress
          key={color}
          aria-label={color}
          color={color}
          variant="determinate"
          value={70}
          enableTrackSlot
        />
      ))}
    </Stack>
  ),
}

export const CircularSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <CircularProgress aria-label="Small" size={20} />
      <CircularProgress aria-label="Medium" />
      <CircularProgress aria-label="Large" size="4rem" thickness={5} />
    </Stack>
  ),
}

/**
 * `min` and `max` set the range, and `aria-valuetext` says the value in
 * words when a percentage isn't meaningful. The visible label is linked with
 * `aria-labelledby`.
 */
export const MinAndMax: Story = {
  render: function Render() {
    const [step, setStep] = useState(2)
    return (
      <Stack spacing={2}>
        <Typography id="setup-label" variant="body2">
          Setup: step {step} of 5
        </Typography>
        <LinearProgress
          aria-labelledby="setup-label"
          aria-valuetext={`Step ${step} of 5`}
          variant="determinate"
          value={step}
          min={0}
          max={5}
        />
        <CircularProgress
          aria-labelledby="setup-label"
          aria-valuetext={`Step ${step} of 5`}
          variant="determinate"
          value={step}
          min={0}
          max={5}
          enableTrackSlot
        />
        <Stack direction="row" spacing={1}>
          <Button size="small" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
          <Button size="small" disabled={step === 5} onClick={() => setStep(step + 1)}>
            Next
          </Button>
        </Stack>
      </Stack>
    )
  },
}

/** A determinate bar that fills up, as an upload would. */
export const Upload: Story = {
  render: function Render() {
    const [uploaded, setUploaded] = useState(0)
    useEffect(() => {
      const timer = setInterval(() => setUploaded((value) => (value >= 100 ? 0 : value + 5)), 400)
      return () => clearInterval(timer)
    }, [])
    return <LinearProgress variant="determinate" value={uploaded} aria-label="Upload progress" />
  },
}

/**
 * A region that's loading sets `aria-busy` and points at its indicator with
 * `aria-describedby`. The library doesn't do this, because the region is the
 * consumer's.
 */
export const LoadingRegion: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(false)
    const load = () => {
      setLoading(true)
      setTimeout(() => setLoading(false), 2000)
    }
    return (
      <Stack spacing={2}>
        <Button onClick={load} disabled={loading} sx={{ alignSelf: 'start' }}>
          Reload orders
        </Button>
        <Box
          component="section"
          aria-label="Orders"
          aria-busy={loading}
          aria-describedby={loading ? 'orders-progress' : undefined}
          sx={{ minHeight: 48 }}
        >
          {loading ? (
            <LinearProgress id="orders-progress" aria-label="Loading orders" />
          ) : (
            <Typography variant="body2">12 orders</Typography>
          )}
        </Box>
      </Stack>
    )
  },
}

/**
 * A project's `root` object replaces the library's track, so this override
 * sets its own track color as well as the height.
 */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: () => (
    <CmThemeProvider
      baseline
      theme={createCmTheme({
        components: {
          MuiLinearProgress: {
            styleOverrides: {
              root: ({ theme }) => ({
                height: 8,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: (theme.vars || theme).palette.divider,
              }),
              bar1: ({ theme }) => ({ borderRadius: theme.shape.borderRadius }),
            },
          },
          MuiCircularProgress: {
            defaultProps: { thickness: 5 },
            styleOverrides: { circle: { strokeLinecap: 'round' } },
          },
        },
      })}
    >
      <Stack spacing={3}>
        <LinearProgress aria-label="Upload progress" variant="determinate" value={60} />
        <CircularProgress aria-label="Setup progress" variant="determinate" value={60} />
      </Stack>
    </CmThemeProvider>
  ),
}
