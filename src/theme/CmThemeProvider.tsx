'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { Theme, ThemeProviderProps } from '@mui/material/styles'
import { createCmTheme } from './createCmTheme.ts'

export interface CmThemeProviderProps extends Omit<ThemeProviderProps<Theme>, 'theme'> {
  /**
   * The theme to apply. Build one with `createCmTheme`.
   * @default the library theme
   */
  theme?: ThemeProviderProps<Theme>['theme']
  /**
   * If `true`, adds MUI's `CssBaseline` global styles.
   * @default false
   */
  baseline?: boolean
}

const libraryTheme = createCmTheme()

export function CmThemeProvider({
  theme = libraryTheme,
  baseline = false,
  children,
  ...other
}: CmThemeProviderProps) {
  return (
    <ThemeProvider theme={theme} {...other}>
      {baseline ? <CssBaseline /> : null}
      {children}
    </ThemeProvider>
  )
}
