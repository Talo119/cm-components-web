---
'@cmotino/cm-web-components': minor
---

Add `LinearProgress` and `CircularProgress`, re-exports of MUI's. Neither has an accessible name by default, so pass `aria-label` or `aria-labelledby`. The default theme now draws every MUI `LinearProgress` track in `divider`, instead of MUI's tint of the bar's color, which is below 3:1 against a `primary` bar on both color schemes. The `buffer` variant keeps MUI's colors. This also applies to MUI's own `LinearProgress` under the library theme. A project's own `MuiLinearProgress` `root` style override replaces this rule.
