---
'@cmotino/cm-web-components': minor
---

Add `RadioGroup`, which takes an `options` array of `{ value, label, disabled? }` with string values, and `label`, `helperText`, `error`, `required` and `disabled`. It puts MUI's `FormControl`, `FormLabel`, `RadioGroup`, `FormControlLabel`, `Radio` and `FormHelperText` together and links them for screen readers. The value type is inferred from `options`, `onChange` receives `(event, value)`, and `null` means nothing is selected. `error` and `required` set `aria-invalid` and `aria-required` on the group, and `required` also sets `required` on every radio input. `row`, `color`, `size`, `name` and `slotProps` for each inner part are supported.
