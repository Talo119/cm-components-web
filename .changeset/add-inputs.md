---
'@cmotino/cm-web-components': minor
---

Add `TextField` and `Checkbox`. `TextField` is MUI's `TextField`. `Checkbox` adds `label`, `helperText`, `error`, `required` and `disabled` to MUI's `Checkbox`, with its root a MUI `FormControl`: `ref`, `sx` and other props reach that root, while `inputRef`, `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<input>`. The default theme now gives outlined inputs a `grey[500]` border, which meets WCAG 2.2 AA's 3:1 for the edge of a control on both color schemes. This also applies to MUI's own outlined inputs, such as `Select` and `Autocomplete`, under the library theme. A project's own `MuiOutlinedInput` `notchedOutline` or `root` style override replaces this rule.
