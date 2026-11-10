import { alertClasses } from '@mui/material/Alert'
import { outlinedInputClasses } from '@mui/material/OutlinedInput'
import { tabClasses } from '@mui/material/Tab'
import { alpha } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { baseShadow, brand, gray, green, orange, red } from './tokens.ts'

// Each scheme's `background.paper`, also used as the default AppBar's color.
const paper = { light: 'hsl(220, 35%, 97%)', dark: 'hsl(220, 30%, 7%)' }

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
        background: { default: 'hsl(0, 0%, 99%)', paper: paper.light },
        text: { primary: gray[800], secondary: gray[600] },
        action: { hover: alpha(gray[200], 0.2), selected: alpha(gray[200], 0.3) },
        baseShadow: baseShadow.light,
        // MUI's `color="default"` bar reads this, which is `grey[100]` by default.
        AppBar: { defaultBg: paper.light },
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
        background: { default: gray[900], paper: paper.dark },
        text: { primary: 'hsl(0, 0%, 100%)', secondary: gray[400] },
        action: { hover: alpha(gray[600], 0.2), selected: alpha(gray[600], 0.3) },
        baseShadow: baseShadow.dark,
        AppBar: { defaultBg: paper.dark },
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
    // MUI's default `primary` bar puts `contrastText` on `primary.main` at
    // 3.65:1, below 4.5:1 for the bar's title. A bar on the paper color, with
    // a line instead of a shadow, matches the library's flat surfaces. Sticky,
    // so it needs no spacer. Kept as an object, so a project's `root` object
    // merges with it.
    MuiAppBar: {
      defaultProps: { color: 'default', elevation: 0, position: 'sticky' },
      styleOverrides: {
        root: {
          variants: [
            {
              props: { color: 'default' },
              style: ({ theme }) => ({
                borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
              }),
            },
          ],
        },
      },
    },
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
    // `primary.main` is below 4.5:1 on the light backgrounds, so light-mode
    // links use `primary.dark`. In dark mode `primary.dark` fails instead.
    // Kept as an object, so a project's `root` object merges with it.
    MuiLink: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { color: 'primary' },
              style: ({ theme }) => ({
                color: (theme.vars || theme).palette.primary.dark,
                ...theme.applyStyles('dark', { color: (theme.vars || theme).palette.primary.main }),
              }),
            },
          ],
        },
      },
    },
    // MUI's translucent border is below the 3:1 that WCAG 2.2 AA asks for the
    // edge of a control on both schemes. `grey[500]` passes on both, so one
    // value covers light and dark. Hover, focus, error and disabled borders
    // use more specific selectors and keep MUI's colors.
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: ({ theme }) => ({
          borderColor: (theme.vars || theme).palette.grey[500],
        }),
        root: ({ theme }) => ({
          // MUI resets the hover border on touch screens to its translucent color.
          '@media (hover: none)': {
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: (theme.vars || theme).palette.grey[500],
            },
          },
        }),
      },
    },
    // MUI's off track is below 3:1 against the background, and the light
    // thumb is below 3:1 against it. `grey[500]` passes on both schemes.
    // `opacity: 1` keeps it opaque when a project turns `focusVisible` off and
    // MUI goes back to drawing the track with opacity. The on and disabled
    // tracks use more specific selectors and keep MUI's colors.
    MuiSwitch: {
      styleOverrides: {
        track: ({ theme }) => ({
          backgroundColor: (theme.vars || theme).palette.grey[500],
          opacity: 1,
        }),
      },
    },
    // MUI's rail is the slider's color at 38% opacity, which is below 3:1
    // against the background on both schemes. `grey[500]` passes on both. A
    // disabled slider is exempt, and the inverted rail is the colored part of
    // the slider, so both keep MUI's styles.
    MuiSlider: {
      styleOverrides: {
        rail: ({ theme, ownerState }) =>
          ownerState.disabled || ownerState.track === 'inverted'
            ? {}
            : { backgroundColor: (theme.vars || theme).palette.grey[500], opacity: 1 },
      },
    },
    // MUI hard-codes `#faaf00` for filled stars, which isn't from the theme,
    // and gives empty stars `action.disabled`, which is below 3:1 against the
    // background on both schemes. `grey[500]` passes on both. Filled stars are
    // solid and empty ones outlined, so the value doesn't rely on color alone.
    MuiRating: {
      styleOverrides: {
        root: ({ theme }) => ({ color: (theme.vars || theme).palette.warning.main }),
        iconEmpty: ({ theme }) => ({ color: (theme.vars || theme).palette.grey[500] }),
      },
    },
    // MUI draws initials and the fallback icon in `background.default` on
    // `grey[400]` or `grey[600]`, which is below 4.5:1 on both schemes. White
    // on `grey[500]` passes on both, and `grey[500]` stays visible against
    // the background. `colorDefault` only applies without a working image.
    MuiAvatar: {
      styleOverrides: {
        colorDefault: ({ theme }) => ({
          color: (theme.vars || theme).palette.common.white,
          backgroundColor: (theme.vars || theme).palette.grey[500],
        }),
      },
    },
    // MUI's `default` color draws the count with no background. `error` is
    // the only theme color whose text meets 4.5:1 on both schemes.
    MuiBadge: {
      defaultProps: { color: 'error' },
    },
    // On default chips, MUI's translucent delete icon is below 3:1, and its
    // avatar text, `grey[700]` or `grey[300]`, is below 4.5:1 on the avatar's
    // `grey[500]`. Colored chips take both from their palette color.
    // MUI only disables `ButtonBase` on clickable chips, so a disabled chip
    // with just `onDelete` keeps `tabindex="0"` and `Backspace` deletes it.
    // `skipFocusWhenDisabled` takes it out of the tab order.
    MuiChip: {
      defaultProps: { skipFocusWhenDisabled: true },
      styleOverrides: {
        deleteIcon: ({ theme, ownerState }) =>
          ownerState.color === 'default'
            ? {
                color: (theme.vars || theme).palette.text.secondary,
                '&:hover': { color: (theme.vars || theme).palette.text.primary },
              }
            : {},
        avatar: ({ theme, ownerState }) =>
          ownerState.color === 'default'
            ? { color: (theme.vars || theme).palette.common.white }
            : {},
      },
    },
    // MUI's track is a light tint of the bar's color, and `primary.main` is
    // below 3:1 against it on both schemes. `divider` is translucent and close
    // to the page, so the bar stands out from it on both. The buffer variant
    // draws its own track from the buffer bar and keeps MUI's colors.
    // A project's own `root` replaces this, because functions don't merge.
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme, ownerState }) =>
          ownerState.variant === 'buffer'
            ? {}
            : { backgroundColor: (theme.vars || theme).palette.divider },
      },
    },
    // MUI draws the severity icon in the severity's `main` color, which is
    // below 3:1 on standard and outlined alerts for most severities. The text
    // color passes on both schemes, so the icon inherits it. Filled alerts
    // already draw the icon in their text color. Kept as an object, so a
    // project's `root` object merges with it.
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { variant: 'standard' },
              style: { [`& .${alertClasses.icon}`]: { color: 'inherit' } },
            },
            {
              props: { variant: 'outlined' },
              style: { [`& .${alertClasses.icon}`]: { color: 'inherit' } },
            },
          ],
        },
      },
    },
    // `primary.main` is below 4.5:1 on the light backgrounds, so a selected
    // tab's label uses `primary.dark` in light mode, as Link does. In dark mode
    // `primary.dark` fails instead. Kept as an object, so a project's `root`
    // object merges with it.
    MuiTab: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { textColor: 'primary' },
              style: ({ theme }) => ({
                [`&.${tabClasses.selected}`]: {
                  color: (theme.vars || theme).palette.primary.dark,
                  ...theme.applyStyles('dark', {
                    color: (theme.vars || theme).palette.primary.main,
                  }),
                },
              }),
            },
          ],
        },
      },
    },
  },
}
