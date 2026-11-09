---
'@cmotino/cm-web-components': minor
---

Add `Select`, built on MUI's `TextField` with `select`. It takes an `options` array of `{ value, label, disabled? }`, where `value` is a string or a number, and `onChange` receives `(event, value)` with the option's value and its type. `null` means nothing is selected, in `value` and `defaultValue`, without MUI's or React's warnings. TextField's props work as on TextField, except those for typing text, and `slotProps.option` reaches every `MenuItem`. `aria-label` names the combobox when there's no `label`. `multiple` and `native` aren't supported.
