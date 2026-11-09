import type {} from '@mui/material/themeCssVarsAugmentation'
import { createTheme } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { createCmTheme } from './createCmTheme.ts'
import { defaultThemeOptions } from './defaultTheme.ts'
import { baseShadow, brand, gray } from './tokens.ts'

const libraryTheme = createCmTheme()
const defaultPrimaryLight = libraryTheme.colorSchemes?.light?.palette?.primary?.main
const defaultPrimaryDark = libraryTheme.colorSchemes?.dark?.palette?.primary?.main

describe('createCmTheme', () => {
  it('enables CSS variables and defines light and dark color schemes', () => {
    const theme = createCmTheme()

    expect(theme.vars).toBeDefined()
    expect(theme.colorSchemes?.light?.palette?.mode).toBe('light')
    expect(theme.colorSchemes?.dark?.palette?.mode).toBe('dark')
    expect(theme.defaultColorScheme).toBe('light')
  })

  it('uses the reference design tokens in both color schemes', () => {
    const light = libraryTheme.colorSchemes?.light?.palette
    const dark = libraryTheme.colorSchemes?.dark?.palette

    expect(light?.primary.main).toBe(brand[400])
    expect(light?.text.primary).toBe(gray[800])
    expect(light?.baseShadow).toBe(baseShadow.light)
    expect(dark?.primary.main).toBe(brand[400])
    expect(dark?.background.default).toBe(gray[900])
    expect(dark?.baseShadow).toBe(baseShadow.dark)
    expect(libraryTheme.typography.fontFamily).toBe('Inter, sans-serif')
    expect(libraryTheme.typography.h1.fontSize).toBe('3rem')
    expect(libraryTheme.shape.borderRadius).toBe(8)
  })

  it('takes shadows[1] from the color scheme and keeps the other MUI shadows', () => {
    const muiShadows = createTheme().shadows

    expect(libraryTheme.shadows[1]).toBe(`var(--mui-palette-baseShadow, ${baseShadow.light})`)
    expect(libraryTheme.vars?.shadows[1]).toMatch(/^var\(--mui-shadows-1\b/)
    expect(libraryTheme.vars?.palette.baseShadow).toMatch(/^var\(--mui-palette-baseShadow\b/)
    expect(libraryTheme.shadows.slice(2)).toEqual(muiShadows.slice(2))
  })

  it('generates a baseShadow CSS variable for each color scheme', () => {
    const css = JSON.stringify(libraryTheme.generateStyleSheets())

    expect(css).toContain(baseShadow.light)
    expect(css).toContain(baseShadow.dark)
  })

  it('follows a custom CSS variable prefix in shadows[1]', () => {
    const theme = createCmTheme({ cssVariables: { cssVarPrefix: 'acme' } })

    expect(theme.shadows[1]).toBe(`var(--acme-palette-baseShadow, ${baseShadow.light})`)
  })

  it('lets a project replace the shadows', () => {
    const shadows = createTheme().shadows

    expect(createCmTheme({ shadows }).shadows).toEqual(shadows)
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
    // `structuredClone` can't copy the style functions in the default options,
    // so this copies objects and arrays and keeps functions as they are.
    const clone = (value: unknown): unknown =>
      Array.isArray(value)
        ? value.map(clone)
        : value && typeof value === 'object'
          ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]))
          : value
    const before = clone(defaultThemeOptions)

    createCmTheme({ palette: { primary: { main: '#0b6e4f' } }, colorSchemes: { dark: false } })

    expect(defaultThemeOptions).toEqual(before)
  })
})
