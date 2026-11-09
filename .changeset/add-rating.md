---
'@cmotino/cm-web-components': minor
---

Add `Rating`, MUI's star rating with `label`, `helperText`, `error`, `required` and `disabled` built in. The root is a MUI `FormControl`. The stars sit in an element with `role="radiogroup"` named by the label, with `aria-describedby`, `aria-invalid` and `aria-required` from the helper text, `error` and `required`. A `readOnly` rating is an `img` named by the label and the value. `aria-label`, `aria-labelledby` and `aria-describedby` reach that element. `required` doesn't stop a native form submit, because MUI checks a hidden "Empty" radio when there's no value. The default theme now colors every MUI `Rating`'s filled stars `warning.main`, instead of MUI's hard-coded `#faaf00`, and its empty stars `grey[500]`, instead of `action.disabled`, which can't be seen against the background. This also applies to MUI's own `Rating` under the library theme. A project's own `MuiRating` `root` or `iconEmpty` style override replaces these colors.
