---
'@cmotino/cm-web-components': minor
---

Add `Link`, MUI's `Link` with the library's type scale. The default theme now colors `color="primary"` links with `primary.dark` in light mode and `primary.main` in dark mode, so links in body text pass WCAG 2.2 AA contrast on both color schemes. This also applies to MUI's own `Link` used under the library theme. A project's `MuiLink.styleOverrides.root` object merges with this rule, but its own `root.variants` array or a `root` function replaces it. To use a router everywhere, set `MuiLink.defaultProps.component` and `MuiButtonBase.defaultProps.LinkComponent` in `createCmTheme`, as shown in the README.
