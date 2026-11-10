---
'@cmotino/cm-web-components': minor
---

Add `Menu`, which opens a list of actions or links from a `trigger` button and takes an `items` array of `{ id, label, icon?, secondary?, disabled?, divider?, current?, onClick?, href? }`. Menu keeps the open state, anchors to the trigger, puts `aria-haspopup`, `aria-expanded` and `aria-controls` on it, and closes after each choice, calling the item's `onClick`, then `onItemClick(event, id)`. `ArrowDown` and `ArrowUp` on the trigger open the menu on the first or last enabled item. `open`, `defaultOpen` and `onOpenChange` control the open state, and `placement` sets where it opens, following the text direction. Items with `href` render through `MuiButtonBase.defaultProps.LinkComponent`, and `current` marks one as the current page. `sx`, `className` and `ref` reach the menu's paper. The theme key is `components.CmMenu`, with the `root`, `paper` and `item` slots.
