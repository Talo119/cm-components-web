import { ThemeProvider, createTheme, useColorScheme, useTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CmThemeProvider } from './CmThemeProvider.tsx'
import { createCmTheme } from './createCmTheme.ts'

function PrimaryColor() {
  const theme = useTheme()
  return <span data-testid="primary">{theme.palette.primary.main}</span>
}

function ColorMode() {
  const { mode } = useColorScheme()
  return <span data-testid="mode">{mode}</span>
}

const bodyMargin = () => getComputedStyle(document.body).margin

describe('CmThemeProvider', () => {
  it('renders its children', () => {
    render(
      <CmThemeProvider>
        <button>Save</button>
      </CmThemeProvider>,
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('uses the library theme when no theme is passed', () => {
    render(
      <CmThemeProvider>
        <PrimaryColor />
      </CmThemeProvider>,
    )

    expect(screen.getByTestId('primary')).toHaveTextContent(createCmTheme().palette.primary.main)
  })

  it('applies a project theme', () => {
    const theme = createCmTheme({ palette: { primary: { main: '#0b6e4f' } } })

    render(
      <CmThemeProvider theme={theme}>
        <PrimaryColor />
      </CmThemeProvider>,
    )

    expect(screen.getByTestId('primary')).toHaveTextContent('#0b6e4f')
  })

  it('passes other props to the MUI ThemeProvider', () => {
    render(
      <CmThemeProvider defaultMode="dark" noSsr>
        <ColorMode />
      </CmThemeProvider>,
    )

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })

  it('adds no global styles by default', () => {
    const before = bodyMargin()

    render(
      <CmThemeProvider>
        <span>content</span>
      </CmThemeProvider>,
    )

    expect(bodyMargin()).toBe(before)
  })

  it('adds CssBaseline when baseline is set', () => {
    render(
      <CmThemeProvider baseline>
        <span>content</span>
      </CmThemeProvider>,
    )

    expect(bodyMargin()).toBe('0px')
  })

  it('leaves another MUI theme in place when it is not used', () => {
    const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })

    render(
      <ThemeProvider theme={theme}>
        <PrimaryColor />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('primary')).toHaveTextContent('#aa0000')
  })
})
