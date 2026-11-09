---
'@cmotino/cm-web-components': minor
---

Add `Slider`, MUI's `Slider` with `label`, `helperText`, `error` and `disabled` built in, for one value or a range. The root is a MUI `FormControl` that fills its container. `aria-label`, `aria-labelledby` and `aria-describedby` reach every thumb's `<input>`, and with `getAriaLabel` the root becomes a group named by the label. `onChange` gets a number for a number value and an array for an array. The default theme now gives every MUI `Slider` an opaque `grey[500]` rail, which meets WCAG 2.2 AA's 3:1 for the parts of a control on both color schemes. Disabled and inverted rails keep MUI's styles. This also applies to MUI's own `Slider` under the library theme. A project's own `MuiSlider` `rail` style override replaces this rule.
