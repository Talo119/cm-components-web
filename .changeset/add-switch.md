---
'@cmotino/cm-web-components': minor
---

Add `Switch`, MUI's `Switch` with `label`, `helperText`, `error`, `required` and `disabled` built in, in the same way as `Checkbox`. The default theme now gives every MUI `Switch` an opaque `grey[500]` track when off, which meets WCAG 2.2 AA's 3:1 for the parts of a control on both color schemes. This also applies to MUI's own `Switch` under the library theme. A project's own `MuiSwitch` `track` style override replaces this rule.
