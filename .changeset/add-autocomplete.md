---
'@cmotino/cm-web-components': minor
---

Add `Autocomplete`, MUI's `Autocomplete` with the TextField built in. It takes `label`, `helperText`, `error`, `required` and `disabled`, `placeholder` and `variant`, and an `options` array of `{ value, label, disabled? }` with string or number values and string labels. `value`, `defaultValue` and `onChange` use the values, with their type, and `multiple` makes them arrays, shown as chips. `null` or `[]` means nothing is selected. With `name`, a hidden input per selected value submits the values, not the labels, with a form. `aria-label`, `aria-labelledby` and `aria-describedby` reach the combobox, and `aria-describedby` is joined with the helper text. With `required` and `multiple`, native validation passes once a value is selected. `slotProps.textField` reaches the TextField, and MUI's slots, such as `chip` and `listbox`, work as in MUI. `freeSolo`, `groupBy`, `renderInput` and MUI's option getters aren't supported.
