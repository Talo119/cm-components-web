---
'@cmotino/cm-web-components': minor
---

Add `Alert` and `AlertTitle`, re-exports of MUI's. The default theme now draws the severity icon of every standard and outlined MUI `Alert` in the alert's text color, instead of the severity's `main` color, which is below 3:1 for most severities on both color schemes. Filled alerts keep MUI's colors. This also applies to MUI's own `Alert` under the library theme. A project's `MuiAlert.styleOverrides.root` object merges with this rule, and a `root` function replaces it. Pass `role="status"` for messages that aren't urgent, because the default `role="alert"` interrupts screen readers.
