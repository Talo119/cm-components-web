import { alpha } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { baseShadow, brand, gray, green, orange, red } from './tokens.ts'

// Font sizes are in rem, as MUI's `pxToRem` gives them at its default 14px font size.
export const defaultThemeOptions: ThemeOptions = {
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: brand[200],
          main: brand[400],
          dark: brand[700],
          contrastText: brand[50],
        },
        info: {
          light: brand[100],
          main: brand[300],
          dark: brand[600],
          contrastText: gray[50],
        },
        warning: { light: orange[300], main: orange[400], dark: orange[800] },
        error: { light: red[300], main: red[400], dark: red[800] },
        success: { light: green[300], main: green[400], dark: green[800] },
        grey: { ...gray },
        divider: alpha(gray[300], 0.4),
        background: { default: 'hsl(0, 0%, 99%)', paper: 'hsl(220, 35%, 97%)' },
        text: { primary: gray[800], secondary: gray[600] },
        action: { hover: alpha(gray[200], 0.2), selected: alpha(gray[200], 0.3) },
        baseShadow: baseShadow.light,
      },
    },
    dark: {
      palette: {
        primary: {
          light: brand[300],
          main: brand[400],
          dark: brand[700],
          contrastText: brand[50],
        },
        info: {
          light: brand[500],
          main: brand[700],
          dark: brand[900],
          contrastText: brand[300],
        },
        warning: { light: orange[400], main: orange[500], dark: orange[700] },
        error: { light: red[400], main: red[500], dark: red[700] },
        success: { light: green[400], main: green[500], dark: green[700] },
        grey: { ...gray },
        divider: alpha(gray[700], 0.6),
        background: { default: gray[900], paper: 'hsl(220, 30%, 7%)' },
        text: { primary: 'hsl(0, 0%, 100%)', secondary: gray[400] },
        action: { hover: alpha(gray[600], 0.2), selected: alpha(gray[600], 0.3) },
        baseShadow: baseShadow.dark,
      },
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontSize: '3rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
    h2: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
    h3: { fontSize: '1.875rem', lineHeight: 1.2 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.5 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    subtitle1: { fontSize: '1.125rem' },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
    // Matches Button's label. Also reaches other components that use this
    // style, such as Tab and ToggleButton.
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  focusVisible: true,
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none' } },
    },
    // A group passes its own `disableElevation` to its buttons, which beats
    // `MuiButton.defaultProps`, so the group needs the same default.
    MuiButtonGroup: {
      defaultProps: { disableElevation: true },
    },
    // MUI maps subtitles to `<h6>`, which puts them in the heading outline.
    // Variants not listed here keep MUI's mapping.
    MuiTypography: {
      defaultProps: {
        variantMapping: { subtitle1: 'p', subtitle2: 'p' },
      },
    },
  },
}
