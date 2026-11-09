# 0008: Switch

- **Status:** Implemented
- **Date:** 2026-11-07
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md)

## Purpose

Gives projects an on-off switch for settings that take effect at once, with its label and helper text built in. MUI's `Switch` is only the control, so this library's `Switch` adds the [field props](./0005-inputs.md#field-props), in the same way and with the same structure as Checkbox in [0005](./0005-inputs.md#checkbox). It also gives the track a color that meets WCAG 2.2 AA contrast when the switch is off.

**Use it for:** a setting that applies as soon as it changes, such as "Dark mode", "Email notifications" or "Show archived items".

**Don't use it for:**

- A choice that only applies when a form is submitted, such as "Accept the terms". Use Checkbox.
- Choosing between two named options that aren't on and off, such as "Monthly" and "Yearly". Use Radio group.
- Selecting rows or items in a list. Use Checkbox.

## Usage

```tsx
import { Switch } from '@cmotino/cm-web-components'

<Switch label="Email notifications" defaultChecked />

<Switch
  label="Dark mode"
  checked={mode === 'dark'}
  onChange={(_, checked) => setMode(checked ? 'dark' : 'light')}
/>

<Switch
  label="Public profile"
  checked={isPublic}
  onChange={(_, checked) => savePublic(checked)}
  disabled={isSaving}
  error={saveFailed}
  helperText={saveFailed ? 'Could not save. Try again.' : 'Anyone with the link can see your profile'}
/>

<Switch aria-label="Enable rule" size="small" checked={rule.enabled} onChange={toggleRule} />
```

## API

`Switch` is a component of this library, in `src/components/Switch/`, built on MUI's `Switch`, `FormControl`, `FormControlLabel` and `FormHelperText`.

```ts
export { Switch } from './Switch.tsx'
export type { SwitchProps } from './Switch.types.ts'
```

It takes the [field props](./0005-inputs.md#field-props), plus these props of MUI's `Switch`, which reach the MUI switch and its `<input>`:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | `undefined` | No | Controlled state |
| `defaultChecked` | `boolean` | `undefined` | No | Initial state when uncontrolled |
| `onChange` | `(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void` | `undefined` | No | Called when the user toggles the switch |
| `name`, `value` | `string` | `undefined`, `'on'` | No | Sent with a submitted form when on, as with a native checkbox |
| `id` | `string` | `undefined` | No | The `<input>`'s id. The helper text's id is built from it when set |
| `inputRef` | `Ref<HTMLInputElement>` | `undefined` | No | Reaches the `<input>`. `ref` reaches the root |
| `color`, `size` | MUI's | `'primary'`, `'medium'` | No | As in MUI |
| `autoFocus`, `disableRipple`, `onFocus`, `onBlur` | MUI's | | No | As in MUI |
| `labelPlacement` | `'end' \| 'start' \| 'top' \| 'bottom'` | `'end'` | No | Where the label sits. Passed to `FormControlLabel` |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

Other MUI `Switch` props, such as `edge`, `icon` and `checkedIcon`, aren't part of `SwitchProps`. A consumer can still reach them through `slotProps.control`.

```ts
export interface SwitchProps
  extends FieldProps, // label, helperText, error, required, disabled
    Pick<MuiSwitchProps, 'checked' | 'defaultChecked' | 'onChange' | 'name' | 'value' | 'id'
      | 'inputRef' | 'color' | 'size' | 'autoFocus' | 'disableRipple' | 'onFocus' | 'onBlur'>,
    Omit<ComponentProps<'div'>, 'onChange' | 'onFocus' | 'onBlur' | 'color' | 'defaultChecked' | 'defaultValue'> {
  labelPlacement?: FormControlLabelProps['labelPlacement']
  sx?: SxProps<Theme>
  slotProps?: {
    control?: Partial<MuiSwitchProps>
    htmlInput?: ComponentProps<'input'>
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label'>>
    formHelperText?: Partial<FormHelperTextProps>
  }
}
```

Switch and Checkbox build the same structure, so they should share a private component or helper for it. That code isn't exported.

### Exceptions to the architecture spec

The same as Checkbox in [0005](./0005-inputs.md#exceptions-to-the-architecture-spec), for the same reasons:

| Rule | Exception |
| --- | --- |
| Section 2: simple components extend the matching MUI props | `SwitchProps` picks the MUI props listed above |
| Section 2: `value`, `defaultValue` and `onChange` | Switch uses `checked`, `defaultChecked` and `onChange` |
| Section 2: remaining props reach the root | `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<input>` |

`Switch.tsx` starts with `'use client'`, because it calls `useId`, and is added to `tests/dist.test.ts`.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Off | A `grey[500]` track with the thumb at the start. The thumb is `common.white` in light mode and `grey[300]` in dark mode, as in MUI |
| On | The thumb moves to the end in the switch's color, `primary.main` by default, over the same color at half opacity, as in MUI |
| `size="small"` | As in MUI |
| `labelPlacement` | The label sits at the start, top or bottom instead of the end |
| Hover | A round highlight behind the thumb, as in MUI |
| Keyboard focus | The theme's focus ring around the track, from [0001](./0001-button.md#styling-hooks), as MUI draws it when `focusVisible` is on |
| Disabled | The thumb, track and label are dimmed, as in MUI, and the input is disabled |
| Error | The label and helper text use `error.main`, and the input has `aria-invalid="true"`. The track keeps its color |
| Required | An asterisk after the label, and `required` on the input |
| With `helperText` | The text sits below the switch and label, with no indent |
| Without `label` | Only the switch, inside the root. It needs `aria-label` or `aria-labelledby` |

## Styling hooks

- **Theme keys:** the keys of the MUI parts it's built from: `MuiSwitch`, `MuiFormControlLabel`, `MuiFormControl` and `MuiFormHelperText`. Switch has no `CmSwitch` key, because it's a simple component and the MUI keys already reach every part.
- **Slots:** `control` for MUI's `Switch`, `htmlInput` for the `<input>`, `formControlLabel` for the `<label>` and `formHelperText` for the helper text. MUI's own `track`, `thumb` and `switchBase` slots are reached through `slotProps.control.slotProps`.
- **Default look:** MUI's switch, with colors from the library's design tokens, and an opaque track when off. `src/theme/defaultTheme.ts` gains:

```ts
components: {
  // ...earlier components, unchanged
  MuiSwitch: {
    styleOverrides: {
      track: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.grey[500],
        opacity: 1,
      }),
    },
  },
},
```

**Why `grey[500]`:** under the library theme, MUI's off track is `common.onBackground` at 38% opacity in light mode and 30% in dark mode. That's 2.68:1 and 2.54:1 against the background, and the light thumb is 2.75:1 against the track, below the 3:1 that WCAG 2.2 AA asks for the parts of a control (1.4.11). `grey[500]` gives the track 5.78 and 5.49 in light mode and 3.40 and 3.22 in dark mode, on `background.default` and `background.paper`. The thumb reaches 5.93 against it in light mode and 3.56 in dark mode.

**`opacity: 1`:** the library theme turns on `focusVisible`, so MUI draws the track with a background color rather than opacity. A project that sets `focusVisible: false` gets MUI's opacity rule back, and `opacity: 1` keeps the off track opaque in that case too. The on and disabled tracks use more specific selectors, so MUI's colors and opacities still apply to them.

**This rule applies to every MUI `Switch`** under the library theme, including one used directly from MUI. A project's own `track` in `MuiSwitch.styleOverrides` replaces it, because `deepmerge` doesn't merge functions. The documentation must state this.

## Accessibility

- **Semantics:** a native `<input type="checkbox" role="switch">`, inside the `<label>` when `label` is set. Screen readers announce it as a switch that's on or off.
- **Keyboard:**
  - `Tab` moves focus to the switch.
  - `Space` toggles it. `Enter` doesn't, as with a native checkbox. The ARIA switch pattern lists `Enter` as optional.
- **Naming:** the `label`. Without one, pass `aria-label` or `aria-labelledby`, which reach the `<input>`. Name the setting, such as "Email notifications", not its state, such as "Notifications on", because screen readers already announce the state. The helper text is linked with `aria-describedby`.
- **Focus:** shown by the theme's focus ring around the track. Disabled switches can't take focus.
- **States:** as on Checkbox: `error` sets `aria-invalid="true"` and `required` sets `required` on the input.
- **Contrast:** the off state meets 3:1 as described under Styling hooks. In the on state, the thumb in `primary.main` reaches 4.04 and 3.84 in light mode and 4.87 and 4.60 in dark mode against the background, so the state is visible from the thumb's color and position. The half-opacity on track is 1.97:1 and isn't needed to tell the state. The error color in dark mode has the problem noted in [0005](./0005-inputs.md#open-questions).

## Behavior and edge cases

- **Settings that save to a server:** Switch reports `onChange` and doesn't wait for anything. A consumer that saves on change can disable the switch while saving, and show a failure with `error` and `helperText`, then set `checked` back. A built-in loading state is out of scope.
- **Turning `error` and `helperText` on and off:** doesn't remount the input, as described under [field props](./0005-inputs.md#field-props). Adding or removing `label` does.
- **Forms:** a switch that's off isn't submitted, as with a native checkbox. A form that needs an explicit "off" value adds it itself.
- **Long labels:** the label wraps, and the switch stays vertically centered on it, as in MUI.
- **Settings lists:** a label at the start and a switch pushed to the end of a row, as in many settings screens, needs `labelPlacement="start"` and layout styles from the consumer. List, on the [roadmap](./roadmap.md), may cover it.
- **Without the library theme:** Switch renders with the surrounding MUI theme, with MUI's translucent track.
- **Server Components:** Switch is a client component, and its function props, such as `onChange`, must come from a client component.

## Acceptance criteria

- [x] With `label`, renders an element with `role="switch"`, named by the label, inside a `<label>`.
- [x] Without `label`, `aria-label` names the switch.
- [x] Clicking it, or pressing `Space` while it's focused, toggles it and calls `onChange` with the event and the new `checked` value.
- [x] Works uncontrolled with `defaultChecked`, and controlled with `checked` and `onChange`.
- [x] `helperText` is linked to the `<input>` with `aria-describedby`, joined with a consumer's own `aria-describedby`.
- [x] `error` sets `aria-invalid="true"` on the `<input>` and the `Mui-error` class on the label and helper text.
- [x] `required` sets `required` on the `<input>` and shows an asterisk after the label.
- [x] `disabled` disables the `<input>` and dims the label.
- [x] Turning `error` and `helperText` on and off doesn't remount the `<input>`.
- [x] `name` and `value` are sent with a submitted form when the switch is on.
- [x] `ref` reaches the root `<div>`, and `inputRef` reaches the `<input>`.
- [x] `className`, `sx`, `style` and other props, such as `data-*`, reach the root element.
- [x] `labelPlacement` reaches `FormControlLabel`, and each slot in `slotProps` reaches its element.
- [x] Under the library theme, the off track is `grey[500]` with `opacity: 1`, and the on and disabled tracks keep MUI's colors.
- [x] Under a project theme with `focusVisible: false`, the off track stays opaque.
- [x] Under the library theme, keyboard focus shows the focus ring around the track.
- [x] Helper text has no left indent.
- [x] A project-level `MuiSwitch` `styleOverrides.thumb` object changes the thumb.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Switch renders with that theme.
- [x] Works with the keyboard as listed under Accessibility.
- [x] Storybook has a story for every variant and state, one for a setting that saves and can fail, and one showing a theme override.
- [x] `Switch` and `SwitchProps` are exported from `src/index.ts`, and `Switch` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- A loading or pending state while a change is saved.
- Labels or icons inside the track or thumb, such as "On" and "Off".
- Changing the on track's opacity.
- A settings-row layout with the switch pushed to the end.
- Exporting MUI's `Switch` on its own.

## Open questions

- **Off track color:** `grey[500]` makes the off track darker and more solid than MUI's, and in light mode darker than the on track. Confirm that the design accepts it, or pick another value that still meets 3:1 against the background and the thumb on both schemes.

## Verified behavior

Tested on 2026-11-07 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, with MUI's `Switch` inside `FormControlLabel` under `CmThemeProvider` and the current default theme. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| `slotProps` in `Switch.d.ts` | `root`, `track`, `thumb`, `switchBase` and `input` |
| The `<input>` | `<input type="checkbox" role="switch">`, named by the `FormControlLabel`'s label |
| Click, then `Space` on the focused switch | Turns it on, then off |
| Track styles in `Switch.js` with `focusVisible` on | The off track is `common.onBackground` at the `switchTrack` opacity, 0.38 in light and 0.3 in dark, drawn as a background color. The on track is the color's `main` at 0.5 |
| Track styles in `Switch.js` with `focusVisible` off | The same colors, drawn with `opacity` |
| Thumb colors in `Switch.js` | Off: `common.white` in light and `grey[300]` in dark. On: the color's `main` |
| Contrast with MUI's `getContrastRatio`, on `background.default` and `background.paper` | MUI's off track: 2.68 and 2.64 light, 2.54 and 2.67 dark. `grey[500]`: 5.78 and 5.49 light, 3.40 and 3.22 dark. On track at half opacity: 1.97 light, 1.98 dark |
| Thumb against the track | Light: white on MUI's track 2.75, white on `grey[500]` 5.93. Dark: `grey[300]` on `grey[500]` 3.56 |
