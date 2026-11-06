import type {} from '@mui/material/themeCssVarsAugmentation'
import { createTheme } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { createCmTheme } from './createCmTheme.ts'
import { defaultThemeOptions } from './defaultTheme.ts'

const defaultPrimaryLight = createTheme().palette.primary.main
const defaultPrimaryDark = createTheme({ palette: { mode: 'dark' } }).palette.primary.main

describe('createCmTheme', () => {
  it('enables CSS variables and defines light and dark color schemes', () => {
    const theme = createCmTheme()

    expect(theme.vars).toBeDefined()
    expect(theme.colorSchemes?.light?.palette?.mode).toBe('light')
    expect(theme.colorSchemes?.dark?.palette?.mode).toBe('dark')
    expect(theme.defaultColorScheme).toBe('light')
  })

  it('applies a palette override to the light scheme and leaves dark alone', () => {
    const theme = createCmTheme({ palette: { primary: { main: '#0b6e4f' } } })

    expect(theme.palette.primary.main).toBe('#0b6e4f')
    expect(theme.colorSchemes?.light?.palette?.primary?.main).toBe('#0b6e4f')
    expect(theme.colorSchemes?.dark?.palette?.primary?.main).toBe(defaultPrimaryDark)
  })

  it('changes dark mode through colorSchemes.dark and leaves light alone', () => {
    const theme = createCmTheme({
      colorSchemes: { dark: { palette: { primary: { main: '#7fd8b6' } } } },
    })

    expect(theme.colorSchemes?.dark?.palette?.primary?.main).toBe('#7fd8b6')
    expect(theme.colorSchemes?.light?.palette?.primary?.main).toBe(defaultPrimaryLight)
  })

  it('keeps sibling default values when overriding shape and components', () => {
    const base = createCmTheme()
    const theme = createCmTheme({
      shape: { borderRadius: 4 },
      components: { MuiButton: { defaultProps: { disableElevation: true } } },
    })

    expect(theme.shape.borderRadius).toBe(4)
    expect(theme.components?.MuiButton?.defaultProps?.disableElevation).toBe(true)
    expect(theme.spacing(2)).toBe(base.spacing(2))
    expect(theme.typography.fontFamily).toBe(base.typography.fontFamily)
    expect(theme.vars).toBeDefined()
  })

  it('lets a project replace cssVariables to set a color scheme selector', () => {
    const theme = createCmTheme({ cssVariables: { colorSchemeSelector: 'class' } })

    expect(theme.vars).toBeDefined()
    expect(theme.getColorSchemeSelector('dark')).toBe('.dark &')
  })

  it('does not change the default options', () => {
    const before = structuredClone(defaultThemeOptions)

    createCmTheme({ palette: { primary: { main: '#0b6e4f' } }, colorSchemes: { dark: false } })

    expect(defaultThemeOptions).toEqual(before)
  })
})
