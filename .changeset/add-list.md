---
'@cmotino/cm-web-components': minor
---

Add `List`, which takes an `items` array of `{ id, primary, secondary?, icon?, avatar?, end?, action?, disabled?, divider?, onClick? }`, with `href` for a link or `children` for nested items that expand and collapse. With `value` or `defaultValue`, the List tracks a selected item, shown with a `primary.main` bar on its start edge and `aria-current`: `"page"` for a link and `"true"` for a button. `onChange` reports the item's `id`, with its type. Uncontrolled, the parents of the selected item start expanded, and `expanded`, `defaultExpanded` and `onExpandedChange` control that. Links render through `MuiButtonBase.defaultProps.LinkComponent`, so they use the project's router. A `subheader` names the list when `aria-label` isn't set. The theme key is `components.CmList`, with the `root`, `item`, `itemButton` and `nested` slots.
