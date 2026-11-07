---
'@cmotino/cm-web-components': minor
---

Add `Typography`, MUI's `Typography` with the library's type scale. The default theme now maps `subtitle1` and `subtitle2` to `<p>` instead of `<h6>`, so subtitles no longer appear as headings, and sets `typography.button.textTransform` to `none`, so the `button` variant and components that use it, such as `Tab` and `ToggleButton`, are no longer uppercase. Use `color="textSecondary"`, not `color="text.secondary"`, which has no effect in MUI 9.

A `MuiButton.styleOverrides.root` function, which replaces the library's root styles, no longer brings back an uppercase label, because the label now follows `typography.button`.
