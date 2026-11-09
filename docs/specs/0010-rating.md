# 0010: Rating

- **Status:** Implemented
- **Date:** 2026-11-09
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md)

## Purpose

Gives projects a star rating, both for collecting a score from the user and for showing one. MUI's `Rating` is only the stars: its root has no role, so the radio inputs inside it have no group name, and a label or helper text has to be added and linked by hand. This library's `Rating` adds the [field props](./0005-inputs.md#field-props), as Radio group does, and names the group. It also replaces MUI's hard-coded star color with the theme's, and gives the empty stars a color that can be seen.

**Use it for:** a score on a small fixed scale, such as a product review, feedback on a support chat, or showing the average score of an item.

**Don't use it for:**

- A score on a long scale, such as 0 to 100. Use Slider.
- Choices that aren't a scale, such as "Yes", "No" and "Maybe". Use Radio group.
- A single like or favorite toggle. Use a Button or Checkbox with an icon.

## Usage

```tsx
import { Rating } from '@cmotino/cm-web-components'

<Rating label="How was your order?" defaultValue={null} name="order-rating" />

<Rating
  label="Quality"
  value={quality}
  onChange={(_, value) => setQuality(value)}
  required
  error={submitted && quality == null}
  helperText={submitted && quality == null ? 'Choose a rating' : ' '}
/>

<Rating label="Average rating" value={4.5} precision={0.5} readOnly size="small" />

<Rating aria-label="Rate this answer" max={3} value={score} onChange={(_, value) => setScore(value)} />
```

## API

`Rating` is a component of this library, in `src/components/Rating/`, built on MUI's `Rating`, `FormControl`, `FormLabel` and `FormHelperText`.

```ts
export { Rating } from './Rating.tsx'
export type { RatingProps } from './Rating.types.ts'
```

It takes the [field props](./0005-inputs.md#field-props), plus these props of MUI's `Rating`, which reach the MUI rating:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number \| null` | `undefined` | No | Controlled value. `null` means no rating |
| `defaultValue` | `number \| null` | `null` | No | Initial value when uncontrolled |
| `onChange` | `(event: SyntheticEvent, value: number \| null) => void` | `undefined` | No | Called when the user picks a value, or clears it by picking the current value again |
| `onChangeActive` | `(event: SyntheticEvent, value: number) => void` | `undefined` | No | Called when the hovered value changes. `-1` when the pointer leaves. MUI doesn't call it for keyboard focus |
| `max` | `number` | `5` | No | The number of stars |
| `precision` | `number` | `1` | No | The smallest step, such as `0.5` for half stars |
| `readOnly` | `boolean` | `false` | No | Shows the value without inputs. See Accessibility |
| `highlightSelectedOnly` | `boolean` | `false` | No | Fills only the selected star, as for a scale of faces |
| `name` | `string` | Generated | No | The `name` shared by the radio inputs, which a submitted form uses |
| `id` | `string` | `undefined` | No | The root's id. The label's and helper text's ids are built from it when set |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | No | As in MUI |
| `icon`, `emptyIcon` | `ReactNode` | MUI's filled and outlined stars | No | The filled and empty icons |
| `getLabelText` | `(value: number) => string` | `"1 Star"`, `"2 Stars"`… | No | The name of each value. Pass a translated function for other languages |
| `emptyLabelText` | `ReactNode` | `'Empty'` | No | The name of the "no rating" input |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

Other MUI `Rating` props, such as `component`, aren't part of `RatingProps`. They can be reached through `slotProps.control`.

```ts
export interface RatingProps
  extends FieldProps, // label, helperText, error, required, disabled
    Pick<MuiRatingProps, 'value' | 'defaultValue' | 'onChange' | 'onChangeActive' | 'max' | 'precision'
      | 'readOnly' | 'highlightSelectedOnly' | 'name' | 'size' | 'icon' | 'emptyIcon'
      | 'getLabelText' | 'emptyLabelText'>,
    Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  sx?: SxProps<Theme>
  slotProps?: {
    formLabel?: Partial<FormLabelProps>
    control?: Partial<MuiRatingProps>
    formHelperText?: Partial<FormHelperTextProps>
  }
}
```

The root is a MUI `FormControl` with `variant="standard"`, so helper text isn't indented. The label is a `FormLabel`, as in Radio group, with the id `${id}-label`, and the helper text's id is `${id}-helper-text`. MUI's root `<span>` gets the id `${id}-rating`, unless `slotProps.control.id` sets one. All three come from `useId` when `id` isn't set.

**The group:** when the rating isn't `readOnly`, MUI's root `<span>` gets `role="radiogroup"`, with `aria-labelledby` pointing at the label, `aria-describedby` pointing at the helper text, and `aria-invalid` and `aria-required` from `error` and `required`. MUI's `slots` for `label`, `icon` and `decimal` are reached through `slotProps.control.slotProps`.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: simple components extend the matching MUI props | `RatingProps` picks the MUI props listed above | The root is the `FormControl`, not MUI's rating, as with Checkbox in [0005](./0005-inputs.md#exceptions-to-the-architecture-spec) |
| Section 2: remaining props reach the root | `aria-label`, `aria-labelledby` and `aria-describedby` reach the element with `role="radiogroup"`, or `role="img"` when `readOnly` | They name the rating, as the [field props](./0005-inputs.md#field-props) rule says |
| [0005](./0005-inputs.md#field-props): `required` makes the input required for native form validation | `required` shows the asterisk and sets `aria-required="true"` on the group, but doesn't block a native form submit | MUI checks a hidden "Empty" radio when there's no value, so a native `required` on the radios is always met. Consumers validate the value themselves, as in the second example |

`Rating.tsx` starts with `'use client'`, because it calls `useId`, and is added to `tests/dist.test.ts`.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | Five outlined stars in `grey[500]` |
| With a value | The stars up to the value are filled in `warning.main` |
| `precision` below 1 | Stars fill partly, as in MUI |
| `highlightSelectedOnly` | Only the selected icon is filled |
| `size` | 18px, 24px or 30px stars, as in MUI |
| Hover | The stars up to the pointer fill, and the hovered one grows, as in MUI |
| Keyboard focus | The theme's focus ring around the active star, from [0001](./0001-button.md#styling-hooks), as MUI draws it when `focusVisible` is on |
| Read-only | The stars without inputs or hover, in the same colors |
| Disabled | The stars and label are dimmed, as in MUI. The inputs are disabled, and the "Empty" input isn't rendered |
| Error | The label and helper text use `error.main`, and the group has `aria-invalid="true"`. The stars keep their colors |
| Required | An asterisk after the label, and `aria-required="true"` on the group |
| With `helperText` | The text sits below the stars, with no indent |
| Without `label` | Only the stars, inside the root. They need `aria-label` or `aria-labelledby` |

## Styling hooks

- **Theme keys:** `MuiRating`, `MuiFormControl`, `MuiFormLabel` and `MuiFormHelperText`. Rating has no `CmRating` key, because it's a simple component.
- **Slots:** `formLabel` for the label, `control` for MUI's `Rating` and `formHelperText` for the helper text.
- **Default look:** MUI's rating, with the star colors taken from the theme. `src/theme/defaultTheme.ts` gains:

```ts
components: {
  // ...earlier components, unchanged
  MuiRating: {
    styleOverrides: {
      root: ({ theme }) => ({ color: (theme.vars || theme).palette.warning.main }),
      iconEmpty: ({ theme }) => ({ color: (theme.vars || theme).palette.grey[500] }),
    },
  },
},
```

**Why `warning.main` for filled stars:** MUI hard-codes `#faaf00`, which breaks the architecture rule that colors come from the theme, and is 1.83:1 on the light backgrounds. `warning.main` is the library's gold, and a project that changes its palette changes the stars too. It reaches 5.63 and 5.33 in dark mode but only 2.71 and 2.58 in light mode. See [Open questions](#open-questions).

**Why `grey[500]` for empty stars:** MUI uses `action.disabled`, which is 1.89 in light mode and 2.54 in dark mode, so the scale can't be seen. `grey[500]` gives 5.78 and 5.49 in light mode and 3.40 and 3.22 in dark mode, the value used for the input border, the Switch track and the Slider rail. Empty stars are outlined and filled stars are solid, so the value doesn't rely on color alone.

**This rule applies to every MUI `Rating`** under the library theme, including one used directly from MUI. A project's own `root` or `iconEmpty` in `MuiRating.styleOverrides` replaces the library's, because `deepmerge` doesn't merge functions. The documentation must state this.

## Accessibility

- **Semantics:** an interactive rating is a set of native radio inputs, one per value plus a hidden "Empty" one, inside an element with `role="radiogroup"`. Each input is named by `getLabelText`, such as "3 Stars". A `readOnly` rating has no inputs, and its root has `role="img"`, named by `getLabelText(value)`.
- **Keyboard:** native radio behavior, as MUI adds no keys of its own.
  - `Tab` moves focus to the selected value, or to the "Empty" input when there's none.
  - Arrow keys move to the next or previous value and select it.
  - `Space` selects the focused value.
- **Naming:**
  - The `label` names the group. Without one, pass `aria-label` or `aria-labelledby`. The helper text is linked to the group with `aria-describedby`, joined with a consumer's own.
  - With `readOnly` and a `label`, the `img` gets `aria-labelledby` pointing at the label and at itself, so screen readers announce "Average rating, 4.5 Stars". Without a `label`, it's named by `getLabelText` only, so write a `getLabelText` that gives the context, or pass `aria-label`.
  - The default names are in English. Projects in other languages pass `getLabelText` and `emptyLabelText`.
- **Focus:** shown by the theme's focus ring around the active star. Disabled and read-only ratings can't take focus.
- **Contrast:** described under Styling hooks. Filled stars in light mode fall short of 3:1.

## Behavior and edge cases

- **Clearing:** picking the current value again sets it to `null`, as in MUI. A consumer that doesn't want this ignores `null` in `onChange`.
- **Decimal values:** a `value` of 3.7 with `precision={1}` shows 4 stars. With `precision={0.5}` it shows 3.5. The value isn't changed, but a `readOnly` rating's name uses the rounded value, such as "4 Stars".
- **Large `max`:** each value is a radio input, so a `max` of 10 with `precision={0.5}` renders 20 inputs. Values above 10 are out of scope.
- **Narrow screens:** the stars don't wrap. With `size="large"` and a large `max`, the row can overflow its container.
- **Forms:** the selected value is submitted under `name`, and an empty rating submits an empty string.
- **Turning `error` and `helperText` on and off:** doesn't remount the inputs, as described under [field props](./0005-inputs.md#field-props).
- **Without the library theme:** Rating renders with the surrounding MUI theme and MUI's colors.
- **Server Components:** Rating is a client component, and its function props must come from a client component.

## Acceptance criteria

- [x] With `label`, renders an element with `role="radiogroup"` named by the label, holding a radio input per value.
- [x] Without `label`, `aria-label` names the group.
- [x] Clicking a star, or pressing an arrow key on a focused input, calls `onChange` with the event and the new value.
- [x] Picking the current value again calls `onChange` with `null`.
- [x] Works uncontrolled with `defaultValue`, and controlled with `value` and `onChange`.
- [x] `max` and `precision` change the number of inputs, and `getLabelText` names them.
- [x] `readOnly` renders no inputs and a root with `role="img"` named by the label and the value.
- [x] `helperText` is linked to the group with `aria-describedby`, joined with a consumer's own `aria-describedby`.
- [x] `error` sets `aria-invalid="true"` on the group and the `Mui-error` class on the label and helper text.
- [x] `required` sets `aria-required="true"` on the group and shows an asterisk after the label.
- [x] `disabled` disables every input, drops the "Empty" input, and dims the stars and the label.
- [x] Turning `error` and `helperText` on and off doesn't remount the inputs.
- [x] `name` sends the selected value with a submitted form.
- [x] `ref` reaches the root `<div>`.
- [x] `className`, `sx`, `style` and other props, such as `data-*`, reach the root element.
- [x] Each slot in `slotProps` reaches its element.
- [x] Under the library theme, filled stars are `warning.main` and empty stars are `grey[500]`.
- [x] Under the library theme, keyboard focus shows the focus ring around the active star.
- [x] Helper text has no left indent.
- [x] A project-level `MuiRating` `styleOverrides.icon` object changes the icons.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Rating renders with that theme.
- [x] Works with the keyboard as listed under Accessibility.
- [x] Storybook has a story for every variant and state, one for a review form that requires a rating, one for read-only half stars, and one showing a theme override.
- [x] `Rating` and `RatingProps` are exported from `src/index.ts`, and `Rating` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- Showing the number next to the stars, such as "4.5 (120 reviews)". Consumers add it with Typography.
- A tooltip or text for the hovered value. `onChangeActive` lets a consumer build one.
- Native form validation for `required`.
- Ratings with a `max` above 10.
- Exporting MUI's `Rating` on its own.

## Open questions

- **Filled star color in light mode:** `warning.main` (`orange[400]`) is 2.71:1 on the light background, below 3:1, and no `warning` shade in the light palette lies between it and `warning.dark` (`orange[800]`, a dark brown at 10.33). `orange[500]` or `orange[600]` would need a palette change in the architecture spec, which also changes warning-colored Buttons. Decide before this spec is accepted.
- **Empty star color:** `grey[500]` outlines are darker than the gold filled stars in light mode (2.13:1 between them). Confirm that the design accepts it.

## Verified behavior

Checked on 2026-11-09 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`, and rendered in jsdom by `Rating.test.tsx`. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Slots in `Rating.d.ts` | `root` (`<span>`), `label` (`<label>`), `icon` and `decimal` |
| Root in `Rating.js` | `role="img"` and `aria-label={getLabelText(value)}` when `readOnly`, no role otherwise |
| Root color in `Rating.js` | Hard-coded `#faaf00`. Empty icons use `action.disabled` |
| Inputs in `Rating.js` | Native radios sharing `name`, plus an "Empty" radio checked when the value is `null`. None are rendered when `readOnly`. When `disabled`, the value inputs are disabled and the "Empty" one isn't rendered |
| Keyboard in `Rating.js` | No key handlers of its own beyond focus tracking, so arrow keys are the browser's radio behavior |
| `onChangeActive` in `Rating.js` | Called only from `mousemove` and `mouseleave`, not on focus |
| Props on the root in `Rating.js` | A consumer's `role` and `aria-label` replace MUI's, even when `undefined`, so Rating only passes the ones that are set |
| Focus ring in `Rating.js` | With `theme.focusVisible`, the active icon gets the theme's ring |
| `#faaf00` on the backgrounds | 1.83 and 1.74 light, 10.77 and 10.18 dark |
| `warning.main` on the backgrounds | 2.71 and 2.58 light, 5.63 and 5.33 dark |
| `action.disabled` on the backgrounds | 1.89 and 1.88 light, 2.54 and 2.67 dark |
| `grey[500]` on the backgrounds | 5.78 and 5.49 light, 3.40 and 3.22 dark |
