---
'@cmotino/cm-web-components': minor
---

Add `Badge`, a re-export of MUI's `Badge` for a count or dot on the corner of another element. The badge is `aria-hidden`, so its information belongs in the child's accessible name. The default theme now sets `color="error"` on every MUI `Badge`, instead of MUI's `default`, which draws the number with no background. `error` is the only theme color whose text meets 4.5:1 on both color schemes. This also applies to MUI's own `Badge` under the library theme. A project changes it with `MuiBadge.defaultProps.color`.
