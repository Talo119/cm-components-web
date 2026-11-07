---
'@cmotino/cm-web-components': minor
---

Add `ButtonGroup`, MUI's `ButtonGroup` with the library's default look. The default theme now sets `disableElevation: true` on `MuiButtonGroup`, because a group's own value replaces `MuiButton`'s default for its buttons. Inside a group, the group's `color`, `size`, `variant` and other shared props likewise replace `MuiButton.defaultProps`, so set those on `MuiButtonGroup` too.
