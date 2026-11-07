# @cmotino/cm-web-components

## 0.2.0

### Minor Changes

- 8f54e73: Add `Button`, MUI's `Button` with the library's default look. The default theme now removes the uppercase label and elevation from MUI's `Button`, and turns on MUI's keyboard focus ring for every MUI component. Set `focusVisible: false` in `createCmTheme` to turn the ring off.
- 8f54e73: The default theme now has its own look: a blue `brand` primary color, gray text and backgrounds, and matching `info`, `success`, `warning` and `error` colors, each with light and dark values. Text uses `Inter, sans-serif` with new heading sizes, corners have an 8px radius, and `shadows[1]` is a soft shadow that changes with the color scheme through the new `palette.baseShadow` token. The library doesn't load Inter, so projects that want it should load it themselves, for example with `@fontsource/inter`.

## 0.1.0

### Minor Changes

- 1b1f2e7: Add `createCmTheme` and `CmThemeProvider`, the library's default theme and its project-level override mechanism.
