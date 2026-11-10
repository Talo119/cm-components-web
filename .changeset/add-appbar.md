---
'@cmotino/cm-web-components': minor
---

Add `AppBar`, MUI's `AppBar` with its `Toolbar` already inside, so its children get the bar's height and padding. `slotProps.toolbar` reaches the `Toolbar`. The default theme now gives every MUI `AppBar` `color="default"`, `elevation={0}` and `position="sticky"`, sets `palette.AppBar.defaultBg` to each color scheme's `background.paper`, and draws a 1px `divider` line at the bottom of `default` bars. This also applies to MUI's own `AppBar` under the library theme. MUI's default `primary` bar puts its text below 4.5:1, and a sticky bar needs no spacer. A project that wants MUI's bar sets `MuiAppBar.defaultProps` back, such as `{ color: 'primary', position: 'fixed' }`.
