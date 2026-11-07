import { createTheme } from '@mui/material/styles'
import type { Shadows, Theme, ThemeOptions } from '@mui/material/styles'
import deepmerge from '@mui/utils/deepmerge'
import { defaultThemeOptions } from './defaultTheme.ts'
import { baseShadow } from './tokens.ts'

declare module '@mui/material/styles' {
  interface Palette {
    /** The shadow of `shadows[1]`, set per color scheme. */
    baseShadow: string
  }
  interface PaletteOptions {
    baseShadow?: string
  }
}

let muiShadows: Shadows | undefined

/**
 * MUI's shadows, with `shadows[1]` replaced by the color scheme's `baseShadow`.
 * Shadows can't differ between color schemes, so the CSS variable does that.
 */
function createShadows(options: ThemeOptions): Shadows {
  const { cssVariables } = options
  const prefix = typeof cssVariables === 'object' ? (cssVariables.cssVarPrefix ?? 'mui') : 'mui'
  const name = prefix ? `--${prefix}-palette-baseShadow` : '--palette-baseShadow'

  muiShadows ??= createTheme().shadows
  const shadows = muiShadows.slice() as Shadows
  shadows[1] = `var(${name}, ${baseShadow.light})`
  return shadows
}

/**
 * Creates a theme from the library defaults and a project's overrides.
 *
 * A top-level `palette` override applies to the default color scheme only,
 * which is light. To change dark mode, override `colorSchemes.dark`.
 *
 * The overrides must be merged before calling `createTheme`. With color
 * schemes defined, `createTheme(defaults, overrides)` silently ignores them.
 */
export function createCmTheme(overrides: ThemeOptions = {}): Theme {
  const options = deepmerge(defaultThemeOptions, overrides)
  options.shadows ??= createShadows(options)
  return createTheme(options)
}
