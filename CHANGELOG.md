# @cmotino/cm-web-components

## 0.4.0

### Minor Changes

- 8f3f7ce: Add `TextField` and `Checkbox`. `TextField` is MUI's `TextField`. `Checkbox` adds `label`, `helperText`, `error`, `required` and `disabled` to MUI's `Checkbox`, with its root a MUI `FormControl`: `ref`, `sx` and other props reach that root, while `inputRef`, `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<input>`. The default theme now gives outlined inputs a `grey[500]` border, which meets WCAG 2.2 AA's 3:1 for the edge of a control on both color schemes. This also applies to MUI's own outlined inputs, such as `Select` and `Autocomplete`, under the library theme. A project's own `MuiOutlinedInput` `notchedOutline` or `root` style override replaces this rule.
- 8f3f7ce: Add `Link`, MUI's `Link` with the library's type scale. The default theme now colors `color="primary"` links with `primary.dark` in light mode and `primary.main` in dark mode, so links in body text pass WCAG 2.2 AA contrast on both color schemes. This also applies to MUI's own `Link` used under the library theme. A project's `MuiLink.styleOverrides.root` object merges with this rule, but its own `root.variants` array or a `root` function replaces it. To use a router everywhere, set `MuiLink.defaultProps.component` and `MuiButtonBase.defaultProps.LinkComponent` in `createCmTheme`, as shown in the README.
- 8f3f7ce: Add `RadioGroup`, which takes an `options` array of `{ value, label, disabled? }` with string values, and `label`, `helperText`, `error`, `required` and `disabled`. It puts MUI's `FormControl`, `FormLabel`, `RadioGroup`, `FormControlLabel`, `Radio` and `FormHelperText` together and links them for screen readers. The value type is inferred from `options`, `onChange` receives `(event, value)`, and `null` means nothing is selected. `error` and `required` set `aria-invalid` and `aria-required` on the group, and `required` also sets `required` on every radio input. `row`, `color`, `size`, `name` and `slotProps` for each inner part are supported.
- 8f3f7ce: Add `Select`, built on MUI's `TextField` with `select`. It takes an `options` array of `{ value, label, disabled? }`, where `value` is a string or a number, and `onChange` receives `(event, value)` with the option's value and its type. `null` means nothing is selected, in `value` and `defaultValue`, without MUI's or React's warnings. TextField's props work as on TextField, except those for typing text, and `slotProps.option` reaches every `MenuItem`. `aria-label` names the combobox when there's no `label`. `multiple` and `native` aren't supported.
- 8f3f7ce: Add `Switch`, MUI's `Switch` with `label`, `helperText`, `error`, `required` and `disabled` built in, in the same way as `Checkbox`. The default theme now gives every MUI `Switch` an opaque `grey[500]` track when off, which meets WCAG 2.2 AA's 3:1 for the parts of a control on both color schemes. This also applies to MUI's own `Switch` under the library theme. A project's own `MuiSwitch` `track` style override replaces this rule.

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
