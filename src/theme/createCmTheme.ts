import { createTheme } from '@mui/material/styles'
import type { Theme, ThemeOptions } from '@mui/material/styles'
import deepmerge from '@mui/utils/deepmerge'
import { defaultThemeOptions } from './defaultTheme.ts'

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
  return createTheme(deepmerge(defaultThemeOptions, overrides))
}
