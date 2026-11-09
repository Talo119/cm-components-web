# 0005: Inputs (text field and checkbox)

- **Status:** Implemented
- **Date:** 2026-11-07
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0003](./0003-typography.md)

## Purpose

Gives projects the two basic form inputs, a text field and a checkbox, each with its label, helper text and error state built in, under the library's default look.

- **TextField:** MUI's `TextField` already puts the label, input, helper text and error state together, so this library re-exports it and adds an input border that meets WCAG 2.2 AA contrast.
- **Checkbox:** MUI's `Checkbox` is only the box. A label needs `FormControlLabel`, and helper text needs `FormControl` and `FormHelperText`. This library's `Checkbox` adds `label`, `helperText` and `error` props, so a consumer doesn't put those parts together.

This spec also sets the **field props** that Select ([0006](./0006-select.md)), Radio group ([0007](./0007-radio-group.md)) and Switch ([0008](./0008-switch.md)) share.

**Use it for:**

- TextField: single-line and multi-line text, email, password, number and search input.
- Checkbox: a yes-or-no choice that takes effect when a form is submitted, such as "Accept the terms", and selecting rows or items in a list.

**Don't use it for:**

- Picking one value from a list. Use Select or Radio group. TextField's `select` prop still works, but Select is simpler.
- A setting that applies as soon as it changes. Use Switch.
- Several related checkboxes with a shared label. Group them in a `FormControl` with a `FormLabel` for now. A checkbox group is out of scope.
- Searching or picking from many options. Use Autocomplete, which is on the [roadmap](./roadmap.md).

## Usage

```tsx
import { Checkbox, TextField } from '@cmotino/cm-web-components'

<TextField label="Email" type="email" required />

<TextField
  label="Name"
  value={name}
  onChange={(event) => setName(event.target.value)}
  error={!name}
  helperText={!name ? 'Enter your name' : ' '}
/>

<TextField label="Notes" multiline minRows={3} fullWidth />

<Checkbox label="Remember me" defaultChecked />

<Checkbox
  label="I accept the terms"
  checked={accepted}
  onChange={(_, checked) => setAccepted(checked)}
  required
  error={submitted && !accepted}
  helperText={submitted && !accepted ? 'You must accept the terms' : undefined}
/>

<Checkbox aria-label="Select row" checked={selected} onChange={toggleRow} />
```

## API

### TextField

`TextField` is MUI's `TextField`, re-exported from `src/components/TextField/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as TextField } from '@mui/material/TextField'
export type { TextFieldProps } from '@mui/material/TextField'
```

The props a consumer uses most are `label`, `value`, `defaultValue`, `onChange`, `helperText`, `error`, `required`, `disabled`, `type`, `multiline`, `fullWidth`, `size` and `slotProps`. MUI's defaults are kept, including `variant="outlined"`.

**Why a re-export and not a wrapper:** TextField already accepts data through props, generates the ids that link the label and helper text to the input, and has `slotProps` for every inner part. A wrapper would add a layer with no logic, and would lose the typing that changes with `variant`. If a later version needs its own props, a wrapper with the same type can replace the re-export without breaking consumers.

### Field props

Checkbox, Select, Radio group and Switch take these props, with the same names and meaning as on TextField:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | `undefined` | No | The visible label. It's also the accessible name |
| `helperText` | `ReactNode` | `undefined` | No | Text below the field, linked to the input with `aria-describedby` |
| `error` | `boolean` | `false` | No | Shows the label and helper text in the error color, and sets `aria-invalid="true"` |
| `required` | `boolean` | `false` | No | Shows an asterisk after the label, and makes the input required for native form validation |
| `disabled` | `boolean` | `false` | No | Disables the field and dims the label |

Each of these components follows the same rules:

- **Root:** the root element is a MUI `FormControl`, a `<div>`, as on TextField. `sx`, `className`, `style`, `ref` and props not listed in the component's spec reach it.
- **Naming props:** `aria-label`, `aria-labelledby` and `aria-describedby` reach the element that has the role, such as the `<input>`, and not the root. A consumer's `aria-describedby` is joined with the helper text's id.
- **Stable structure:** `helperText` and `error` never change the elements around the input, so turning them on during validation doesn't remount the input or lose its state. Only `label` changes the structure, so keep it set, or unset, for the life of the component.
- **Ids:** the helper text's id is generated with React's `useId`, unless the consumer passes `id`, in which case it's `${id}-helper-text`, as on TextField.

### Checkbox

`Checkbox` is a component of this library, in `src/components/Checkbox/`, built on MUI's `Checkbox`, `FormControl`, `FormControlLabel` and `FormHelperText`.

```ts
export { Checkbox } from './Checkbox.tsx'
export type { CheckboxProps } from './Checkbox.types.ts'
```

It takes the field props, plus these props of MUI's `Checkbox`, which reach the MUI checkbox and its `<input>`:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | `undefined` | No | Controlled state |
| `defaultChecked` | `boolean` | `undefined` | No | Initial state when uncontrolled |
| `onChange` | `(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void` | `undefined` | No | Called when the user toggles the checkbox |
| `indeterminate` | `boolean` | `false` | No | Shows the mixed icon and sets the input's `indeterminate` property |
| `name`, `value` | `string` | `undefined`, `'on'` | No | Sent with a submitted form, as with a native checkbox |
| `id` | `string` | `undefined` | No | The `<input>`'s id. The helper text's id is built from it when set |
| `inputRef` | `Ref<HTMLInputElement>` | `undefined` | No | Reaches the `<input>`. `ref` reaches the root |
| `color`, `size` | MUI's | `'primary'`, `'medium'` | No | As in MUI |
| `icon`, `checkedIcon`, `indeterminateIcon` | `ReactNode` | MUI's icons | No | As in MUI |
| `autoFocus`, `disableRipple`, `onFocus`, `onBlur` | MUI's | | No | As in MUI |
| `labelPlacement` | `'end' \| 'start' \| 'top' \| 'bottom'` | `'end'` | No | Where the label sits. Passed to `FormControlLabel` |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

Other MUI `Checkbox` props, such as `edge`, `readOnly` and `component`, aren't part of `CheckboxProps`. A consumer can still reach them through `slotProps.control`.

```ts
export interface CheckboxProps
  extends FieldProps, // label, helperText, error, required, disabled
    Pick<MuiCheckboxProps, 'checked' | 'defaultChecked' | 'onChange' | 'indeterminate' | 'name' | 'value'
      | 'id' | 'color' | 'size' | 'icon' | 'checkedIcon' | 'indeterminateIcon'
      | 'autoFocus' | 'disableRipple' | 'onFocus' | 'onBlur'>,
    Omit<ComponentProps<'div'>, 'onChange' | 'onFocus' | 'onBlur' | 'color' | 'defaultChecked' | 'defaultValue'> {
  inputRef?: Ref<HTMLInputElement>
  labelPlacement?: FormControlLabelProps['labelPlacement']
  sx?: SxProps<Theme>
  slotProps?: {
    control?: Partial<MuiCheckboxProps>
    htmlInput?: ComponentProps<'input'>
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label'>>
    formHelperText?: Partial<FormHelperTextProps>
  }
}
```

`FieldProps` is private, in `src/components/fieldProps.ts`. Each component's props type extends it, so the exported declarations are complete.

MUI 9's `Checkbox` has no `inputRef` prop, so `CheckboxProps` declares it, and `Checkbox` passes it to the `<input>` through MUI's `slotProps.input.ref`, joined with `slotProps.htmlInput.ref`.

The root `FormControl` has `variant="standard"`. MUI's default `outlined` makes `FormHelperText` indent itself by 14px, as it does under an outlined input.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: simple components extend the matching MUI props | `CheckboxProps` picks the MUI props listed above, rather than extending all of `CheckboxProps` from MUI | The root is now the `FormControl`, not MUI's checkbox. Extending MUI's type would send `sx` and every remaining prop to an inner element, and its `slotProps.root` would no longer be the root |
| Section 2: `value`, `defaultValue` and `onChange` | Checkbox uses `checked`, `defaultChecked` and `onChange` | `value` is the value a form submits, as with a native checkbox and MUI. Renaming it would break both |
| Section 2: remaining props reach the root | `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<input>` | They describe the input, and on the root they would leave the input without a name. MUI's own `Checkbox` puts `aria-label` on its `<span>` (see [Verified behavior](#verified-behavior)) |
| Section 6: `TextField.tsx` and `TextField.types.ts` | Neither file exists. The folder holds `index.ts`, `TextField.test.tsx` and `TextField.stories.tsx` | There is no component code or type of our own to put in them |

`Checkbox.tsx` starts with `'use client'`, because it calls `useId`, and is added to `tests/dist.test.ts`. The TextField module needs no directive, because MUI's `TextField` module carries its own.

## Data shapes

None.

## Variants and states

### TextField

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | `outlined` variant, `medium` size, as in MUI. The border is `grey[500]` instead of MUI's translucent color. See Styling hooks |
| `filled`, `standard` | As in MUI. Their underline keeps MUI's color, and its contrast isn't changed by this spec |
| `size="small"` | As in MUI |
| Hover | The border becomes `text.primary`, as in MUI |
| Focus | A 2px border in the field's color, `primary.main` by default, as in MUI. The theme's focus ring doesn't apply, because the input isn't a `ButtonBase` |
| Disabled | Dimmed text and border, as in MUI |
| Error | The label, border and helper text use `error.main`. `aria-invalid="true"` is set on the input |
| Required | An asterisk after the label, and `required` on the input |

### Checkbox

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | MUI's box in `text.secondary`, with the label after it in `body1` |
| Checked, indeterminate | MUI's filled icon in the checkbox's color, `primary.main` by default |
| `labelPlacement` | The label sits at the start, top or bottom instead of the end |
| Hover | A round highlight behind the box, as in MUI |
| Keyboard focus | The theme's focus ring around the box, from [0001](./0001-button.md#styling-hooks) |
| Disabled | The box and label are dimmed, and the input is disabled |
| Error | The label and helper text use `error.main`, and the input has `aria-invalid="true"`. The box keeps its color, as in MUI |
| Required | An asterisk after the label, and `required` on the input |
| With `helperText` | The text sits below the box and label, with no indent, aligned with the box |
| Without `label` | Only the box, inside the root. It needs `aria-label` or `aria-labelledby` |

## Styling hooks

- **Theme keys:** TextField uses `components.MuiTextField` and the input's keys, `MuiOutlinedInput`, `MuiFilledInput`, `MuiInput`, `MuiInputLabel` and `MuiFormHelperText`. Checkbox uses the keys of the MUI parts it's built from: `MuiCheckbox`, `MuiFormControlLabel`, `MuiFormControl` and `MuiFormHelperText`. Checkbox has no `CmCheckbox` key, because it's a simple component and the MUI keys already reach every part.
- **Slots:**
  - TextField: MUI's `root`, `input`, `inputLabel`, `htmlInput`, `formHelperText` and `select`.
  - Checkbox: `control` for MUI's `Checkbox`, `htmlInput` for the `<input>`, `formControlLabel` for the `<label>` and `formHelperText` for the helper text.
- **Default look:** colors, font and radius come from the library's design tokens. Inputs use the 8px radius, the label and box use `text.secondary`, and the text uses `body1`. Checkbox needs no theme change. `src/theme/defaultTheme.ts` gains one rule for the outlined input border:

```ts
import { outlinedInputClasses } from '@mui/material/OutlinedInput'

components: {
  // ...MuiButton, MuiButtonGroup, MuiTypography and MuiLink, unchanged
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: ({ theme }) => ({
        borderColor: (theme.vars || theme).palette.grey[500],
      }),
      root: ({ theme }) => ({
        // MUI resets the hover border on touch screens to its translucent color.
        '@media (hover: none)': {
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: (theme.vars || theme).palette.grey[500],
          },
        },
      }),
    },
  },
},
```

**Why `grey[500]`:** MUI's border is `common.onBackground` at 23% opacity. That's 1.74:1 on the light background and 1.94:1 on the dark one, below the 3:1 that WCAG 2.2 AA asks for the edge of a control (1.4.11). `grey[500]` reaches 5.78 and 5.49 in light mode and 3.40 and 3.22 in dark mode, on `background.default` and `background.paper`. The grey scale is the same in both schemes, so one value covers both. Hover, focus, error and disabled borders use more specific selectors, so MUI's colors still apply to them.

**This rule applies to every outlined input.** It reaches TextField, Select and any MUI component that uses `OutlinedInput`, such as `Autocomplete`, under the library theme. A project's own `notchedOutline` or `root` in `MuiOutlinedInput.styleOverrides` replaces the library's rule, because `deepmerge` doesn't merge functions. The documentation must state this.

## Accessibility

- **Semantics:**
  - TextField: a native `<input>` or `<textarea>` with a `<label>` linked by `for` and `id`.
  - Checkbox: a native `<input type="checkbox">`, inside the `<label>` when `label` is set.
- **Keyboard:**
  - `Tab` moves focus to the input.
  - TextField: typing edits the text, as with a native input.
  - Checkbox: `Space` toggles it. `Enter` doesn't, as with a native checkbox.
- **Naming:**
  - TextField: the `label`. Without one, pass `aria-label` through `slotProps.htmlInput`.
  - Checkbox: the `label`. Without one, pass `aria-label` or `aria-labelledby` on the Checkbox. It reaches the `<input>`.
  - The helper text is the input's description, through `aria-describedby`.
- **Focus:** TextField shows its 2px focus border. Checkbox shows the theme's focus ring. Disabled inputs can't take focus.
- **States:** `error` sets `aria-invalid="true"` and `required` sets `required` on the input, so screen readers announce them. Checkbox's `indeterminate` sets the input's `indeterminate` property, so it's announced as mixed.
- **Contrast:** the input border meets 3:1 as described under Styling hooks. The label and helper text use `text.secondary`, at 7.15 or more on both schemes. Checked boxes use `primary.main`, at 3.84 or more, which meets 3:1 for a control.
- **Error color in dark mode:** `error.main` is 2.15:1 on the dark background, so error helper text and labels fail 4.5:1 in dark mode. This comes from the palette, as noted in [0003](./0003-typography.md#accessibility). See [Open questions](#open-questions).
- **Placeholders:** MUI shows placeholder text at reduced opacity, so it doesn't meet 4.5:1. Don't put needed information in a placeholder. Use `label` or `helperText`.

## Behavior and edge cases

- **Helper text that comes and goes:** TextField's height changes when helper text appears, which moves the content below it. Pass `helperText=" "` to keep the space reserved, as in MUI's docs. The same applies to Checkbox.
- **Checkbox without a label, then with one:** adding or removing `label` remounts the input, as described under [Field props](#field-props). An uncontrolled Checkbox loses its state when that happens.
- **Long labels:** a Checkbox label wraps, and the box stays vertically centered on the whole label, as in MUI. Aligning the box to the first line is out of scope. TextField's floating label is cut off with an ellipsis, as in MUI. Keep TextField labels short and put details in `helperText`.
- **Narrow screens:** without `fullWidth`, TextField takes the browser's default width for an input, which can overflow a narrow container. Use `fullWidth` in narrow layouts.
- **Number fields:** `type="number"` keeps the browser's spinner and its quirks, such as changing the value on scroll. Many forms work better with `type="text"` and `slotProps.htmlInput={{ inputMode: 'numeric' }}`.
- **Autofill:** browsers style autofilled inputs with their own background. This spec doesn't change that.
- **Checkbox inside a table:** without a label, the root still wraps the box in an inline-flex `<div>`. It has no margin or padding, so it doesn't change the row's layout.
- **Without the library theme:** TextField renders with the surrounding theme and MUI's translucent border. Checkbox renders with that theme too.
- **Server Components:** TextField can be rendered from a Server Component, with the same limit as Button on function props. Checkbox is a client component, and its function props, such as `onChange`, must come from a client component.

## Acceptance criteria

### TextField

- [x] Renders a textbox named by its `label`, with the label linked by `for` and `id`.
- [x] `helperText` is linked to the input with `aria-describedby`.
- [x] `error` sets `aria-invalid="true"` on the input and the `Mui-error` class on the label.
- [x] `required` sets `required` on the input and shows an asterisk.
- [x] `ref` reaches the root `<div>`, and `slotProps.htmlInput` reaches the `<input>`.
- [x] `className`, `sx` and other props, such as `data-*`, reach the root element.
- [x] Typing calls `onChange`, and a controlled value updates.
- [x] Under the library theme, the outlined border is `grey[500]` at rest and inside `@media (hover: none)`, and keeps MUI's colors on hover, focus, error and disabled.
- [x] A project-level `MuiOutlinedInput` `notchedOutline` override changes the border.

### Checkbox

- [x] With `label`, renders a checkbox named by the label, inside a `<label>`.
- [x] Without `label`, `aria-label` names the `<input>`.
- [x] `helperText` is linked to the `<input>` with `aria-describedby`, joined with a consumer's own `aria-describedby`.
- [x] `error` sets `aria-invalid="true"` on the `<input>` and the `Mui-error` class on the label and helper text.
- [x] `required` sets `required` on the `<input>` and shows an asterisk after the label.
- [x] `disabled` disables the `<input>` and dims the label.
- [x] Works uncontrolled with `defaultChecked`, and controlled with `checked` and `onChange`, which receives the event and the new `checked` value.
- [x] Turning `error` and `helperText` on and off doesn't remount the `<input>`. An uncontrolled Checkbox keeps its state, and a focused one keeps focus.
- [x] `indeterminate` sets the input's `indeterminate` property.
- [x] `name` and `value` are sent with a submitted form when checked.
- [x] `ref` reaches the root `<div>`, and `inputRef` reaches the `<input>`.
- [x] `className`, `sx`, `style` and other props, such as `data-*`, reach the root element.
- [x] `labelPlacement` reaches `FormControlLabel`.
- [x] Each slot in `slotProps` reaches its element.
- [x] Under the library theme, keyboard focus gives the box `Mui-focusVisible` and a solid outline.
- [x] Helper text has no left indent.
- [x] A project-level `MuiCheckbox` `styleOverrides.root` object changes the box.

### Both

- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, both render with that theme.
- [x] Work with the keyboard as listed under Accessibility.
- [x] Storybook has a story for every variant and state of each, one with a form that shows validation errors, and one showing a theme override.
- [x] `TextField`, `TextFieldProps`, `Checkbox` and `CheckboxProps` are exported from `src/index.ts`, and both components are added to the public API list in `tests/dist.test.ts`. `Checkbox` is added to the `'use client'` list.

## Out of scope

- Props, variants, colors or sizes beyond those listed here.
- A checkbox group with an `options` prop. Several checkboxes are composed by the consumer for now.
- Input masks, character counters and formatting of numbers, dates or currencies.
- Validation logic. Fields show errors that the consumer computes. Form ([roadmap](./roadmap.md)) will decide how validation works.
- Changing the contrast of the `filled` and `standard` TextField variants.
- Changing the `error` palette color. That belongs to a change in the architecture spec's tokens.
- A read-only checkbox. Native checkboxes ignore `readonly`.
- Aligning a Checkbox's box to the first line of a long label.

## Open questions

- **Error color in dark mode:** `error.main` (`red[500]`) is 2.15:1 on the dark background, and `error.light` (`red[400]`) is 3.21:1, so error messages fail 4.5:1 in dark mode. `red[300]` reaches 6.10. Fixing this means changing the dark `error` palette in the architecture spec, which also changes error-colored Buttons. Decide before Select, Radio group and Switch are accepted, because they show the same errors.
- **Border color:** `grey[500]` makes outlined inputs noticeably darker than MUI's in light mode. Confirm that the design accepts it, or pick another value that still meets 3:1 on both schemes.

## Verified behavior

Tested on 2026-11-07 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, with MUI's parts under `CmThemeProvider` and the current default theme, before the changes in this spec. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| `slotProps` in `TextField.d.ts` | `root`, `input`, `inputLabel`, `htmlInput`, `formHelperText` and `select` |
| `InputProps`, `inputProps`, `InputLabelProps`, `SelectProps` and `FormHelperTextProps` in `TextField.d.ts` | Not present |
| `TextField` with `label`, `helperText`, `required` and `error` | Root `<div class="MuiFormControl-root">`. The input gets a generated `id`, `aria-describedby="<id>-helper-text"`, `aria-invalid="true"` and `required`. The label has `for="<id>"` |
| `aria-label` on MUI's `Checkbox` | Reaches the `<span>` root, not the `<input>`, which is left without a name |
| `FormControl` with `error` and `required`, around `FormControlLabel` with `required` | The label gets `Mui-error` and `Mui-required`. The `<input>` gets `required` but no `aria-invalid` |
| MUI's `Checkbox` with `indeterminate` | Sets the input's `indeterminate` property |
| Outlined border color in `OutlinedInput.js` | `common.onBackground` at 0.23, with a reset to the same color on hover inside `@media (hover: none)` |
| Contrast with MUI's `getContrastRatio`, on `background.default` and `background.paper` | MUI's border: 1.74 and 1.73 light, 1.94 and 2.05 dark. `grey[500]`: 5.78 and 5.49 light, 3.40 and 3.22 dark. `text.secondary`: 7.52 and 7.15 light, 7.67 and 7.25 dark |
| Error colors on the dark `background.default` | `red[500]` 2.15, `red[400]` 3.21, `red[300]` 6.10 |
| `inputRef` in `Checkbox.d.ts` and `SwitchBase.d.ts` | Not present. The `<input>`'s ref goes through `slotProps.input.ref` |
| `FormHelperText` inside a `FormControl` with its default `variant` | Gets `MuiFormHelperText-contained` and a 14px left and right margin |
| MUI's `Checkbox` focus ring under `focusVisible` | Drawn on the box's first `<svg>`, not on the `<span>` root |
