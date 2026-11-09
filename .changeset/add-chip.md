---
'@cmotino/cm-web-components': minor
---

Add `Chip`, a re-export of MUI's `Chip` for a tag, a status, a filter or a selected value. The default theme now changes every MUI `Chip`, including MUI's own and the tags in MUI's `Autocomplete`. On default-colored chips, the delete icon is `text.secondary` and `text.primary` on hover, instead of MUI's translucent icon, which is below 3:1. Initials in an avatar are `common.white`, instead of `grey[700]`, which is below 4.5:1 on the avatar. Colored chips keep MUI's colors. `MuiChip.defaultProps.skipFocusWhenDisabled` is now `true`. MUI otherwise leaves a disabled chip with only `onDelete` in the tab order, where `Backspace` still deletes it. A project's own `MuiChip` `deleteIcon` or `avatar` style override replaces the library's rule.
