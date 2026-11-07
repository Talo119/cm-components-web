# @cmotino/cm-web-components

## 0.3.0

### Minor Changes

- 7b0b152: Add `ButtonGroup`, MUI's `ButtonGroup` with the library's default look. The default theme now sets `disableElevation: true` on `MuiButtonGroup`, because a group's own value replaces `MuiButton`'s default for its buttons. Inside a group, the group's `color`, `size`, `variant` and other shared props likewise replace `MuiButton.defaultProps`, so set those on `MuiButtonGroup` too.
- 7b0b152: Add `Typography`, MUI's `Typography` with the library's type scale. The default theme now maps `subtitle1` and `subtitle2` to `<p>` instead of `<h6>`, so subtitles no longer appear as headings, and sets `typography.button.textTransform` to `none`, so the `button` variant and components that use it, such as `Tab` and `ToggleButton`, are no longer uppercase. Use `color="textSecondary"`, not `color="text.secondary"`, which has no effect in MUI 9.
  
  A `MuiButton.styleOverrides.root` function, which replaces the library's root styles, no longer brings back an uppercase label, because the label now follows `typography.button`.

## 0.2.0

### Minor Changes

- 8f54e73: Add `Button`, MUI's `Button` with the library's default look. The default theme now removes the uppercase label and elevation from MUI's `Button`, and turns on MUI's keyboard focus ring for every MUI component. Set `focusVisible: false` in `createCmTheme` to turn the ring off.
- 8f54e73: The default theme now has its own look: a blue `brand` primary color, gray text and backgrounds, and matching `info`, `success`, `warning` and `error` colors, each with light and dark values. Text uses `Inter, sans-serif` with new heading sizes, corners have an 8px radius, and `shadows[1]` is a soft shadow that changes with the color scheme through the new `palette.baseShadow` token. The library doesn't load Inter, so projects that want it should load it themselves, for example with `@fontsource/inter`.

## 0.1.0

### Minor Changes

- 1b1f2e7: Add `createCmTheme` and `CmThemeProvider`, the library's default theme and its project-level override mechanism.
