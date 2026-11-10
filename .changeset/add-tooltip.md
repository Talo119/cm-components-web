---
'@cmotino/cm-web-components': minor
---

Add `Tooltip`, a re-export of MUI's `Tooltip`, with no changes. Without `describeChild`, a string `title` becomes the child's `aria-label`, which suits icon-only buttons. Pass `describeChild` on a child with visible text, so it keeps its own name. Wrap a disabled button in a `<span>` so its tooltip opens on hover.
