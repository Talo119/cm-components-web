# 0007: Radio group

- **Status:** Implemented
- **Date:** 2026-11-07
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md)

## Purpose

Lets a user pick one value from a few options that stay visible. MUI's `RadioGroup` handles the shared `name`, the selected value and the keyboard, but a consumer still puts together `FormControl`, `FormLabel`, one `FormControlLabel` and `Radio` per option, and `FormHelperText`, and links them for screen readers. This library's `RadioGroup` takes an `options` array and the [field props](./0005-inputs.md#field-props), and does that wiring.

**Use it for:** two to five mutually exclusive options that the user should compare at a glance, such as a plan, a shipping method or a notification frequency.

**Don't use it for:**

- A single yes-or-no choice. Use Checkbox, or Switch for a setting that applies at once.
- More than about seven options, or options that take too much space. Use Select.
- Choosing several values. Use a group of Checkboxes.

## Usage

```tsx
import { RadioGroup } from '@cmotino/cm-web-components'

<RadioGroup
  label="Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team', disabled: !canUseTeams },
  ]}
  value={plan}
  onChange={(_, value) => setPlan(value)}
/>

<RadioGroup
  label="Delivery"
  name="delivery"
  options={deliveryOptions}
  defaultValue="standard"
  row
  required
  error={submitted && !delivery}
  helperText="Express costs €5 more"
/>
```

## API

`RadioGroup` is a component of this library, in `src/components/RadioGroup/`, built on MUI's `FormControl`, `FormLabel`, `RadioGroup`, `FormControlLabel`, `Radio` and `FormHelperText`.

```ts
export { RadioGroup } from './RadioGroup.tsx'
export type { RadioGroupProps, RadioOption } from './RadioGroup.types.ts'
```

It takes the [field props](./0005-inputs.md#field-props), plus:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `readonly RadioOption<Value>[]` | | Yes | The options, in display order |
| `value` | `Value \| null` | `undefined` | No | Controlled value. `null` means nothing is selected |
| `defaultValue` | `Value \| null` | `null` | No | Initial value when uncontrolled |
| `onChange` | `(event: ChangeEvent<HTMLInputElement>, value: Value) => void` | `undefined` | No | Called when the user picks an option |
| `name` | `string` | Generated | No | The `name` shared by the radio inputs, which a submitted form uses |
| `row` | `boolean` | `false` | No | Lays the options out in a row, wrapping when there isn't room |
| `color`, `size` | MUI `Radio`'s | `'primary'`, `'medium'` | No | Passed to every `Radio` |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

`RadioGroup` is generic, as `RadioGroup<Value extends string = string>`. `Value` is inferred from `options`, so a union of string literals is kept. `value`, `defaultValue` and `onChange` use `NoInfer<Value>`, so a `value` outside the options' values is an error rather than widening `Value`.

```ts
export interface RadioGroupProps<Value extends string = string>
  extends FieldProps, // label, helperText, error, required, disabled
    Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  options: readonly RadioOption<Value>[]
  value?: NoInfer<Value> | null
  defaultValue?: NoInfer<Value> | null
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: NoInfer<Value>) => void
  name?: string
  row?: boolean
  color?: RadioProps['color']
  size?: RadioProps['size']
  sx?: SxProps<Theme>
  slotProps?: {
    formLabel?: Partial<FormLabelProps>
    radioGroup?: Partial<MuiRadioGroupProps>
    formControlLabel?: Partial<Omit<FormControlLabelProps, 'control' | 'label' | 'value'>>
    control?: Partial<RadioProps>
    formHelperText?: Partial<FormHelperTextProps>
  }
}
```

The element with `role="radiogroup"` is MUI's `RadioGroup`. `aria-label`, `aria-labelledby` and `aria-describedby` reach it, as the field props' naming rule says. `id` stays on the root. When it's set, the group label's id is `${id}-label` and the helper text's is `${id}-helper-text`.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: simple components extend the matching MUI props | `RadioGroupProps` isn't built from MUI's `RadioGroupProps` | MUI's `RadioGroup` is only the inner `role="radiogroup"` element. The root is now the `FormControl`, and its props reach the inner element through `slotProps.radioGroup` |
| Section 2: data items have a stable `id` or a `getItemId` | An option's `value` is its id | Values must already be unique, because they identify the selection |

`RadioGroup.tsx` starts with `'use client'`, because it calls `useId`, and is added to `tests/dist.test.ts`.

## Data shapes

```ts
export interface RadioOption<Value extends string = string> {
  /** Unique within `options`. Used as the React key, the input's `value` and the value `onChange` reports. */
  value: Value
  /** The visible label of this option, which is also its accessible name. */
  label: ReactNode
  /** Shown but not selectable. */
  disabled?: boolean
}
```

Values are strings, because a radio input's `value` is text and MUI's `RadioGroup` reports `event.target.value`. A project with numeric ids converts them, as in `String(id)`.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | The group label in `text.secondary`, then the options in a column. Each radio is MUI's circle in `text.secondary`, with its label in `body1` |
| `row` | Options side by side, wrapping onto more lines when they don't fit |
| Selected | MUI's filled circle in the group's color, `primary.main` by default |
| Hover | A round highlight behind the radio, as in MUI |
| Keyboard focus | The theme's focus ring around the focused radio, from [0001](./0001-button.md#styling-hooks) |
| Disabled | Every radio and label is dimmed and can't be picked |
| Disabled option | Only that radio and label are dimmed, and the arrow keys skip it |
| Error | The group label and helper text use `error.main`, and the group has `aria-invalid="true"` |
| Required | An asterisk after the group label, `aria-required="true"` on the group, and `required` on every radio input |
| With `helperText` | The text sits below the options, with no indent |
| Nothing selected | Every radio is empty |

## Styling hooks

- **Theme keys:** the keys of the MUI parts it's built from: `MuiFormControl`, `MuiFormLabel`, `MuiRadioGroup`, `MuiFormGroup`, `MuiFormControlLabel`, `MuiRadio` and `MuiFormHelperText`. Radio group has no `CmRadioGroup` key, because it's a simple component and the MUI keys already reach every part.
- **Slots:** `formLabel` for the group label, `radioGroup` for the element with `role="radiogroup"`, `formControlLabel` for every option's `<label>`, `control` for every `Radio` and `formHelperText` for the helper text.
- **Default look:** MUI's radios and labels, with colors, font and spacing from the library's design tokens. No theme change is needed.

## Accessibility

- **Semantics:** a `<div role="radiogroup">` holding native `<input type="radio">` elements that share one `name`, each inside its own `<label>`. The group label is a `<label>` element, as in MUI's docs, linked to the group with `aria-labelledby`.
- **Keyboard:**
  - `Tab` moves focus into the group, onto the selected radio. With nothing selected, it moves onto the first enabled radio, or the last one with `Shift+Tab`.
  - `ArrowDown` and `ArrowRight` select the next enabled radio, and `ArrowUp` and `ArrowLeft` the previous one, wrapping at the ends. This is the browser's own behavior for radio inputs.
  - `Space` selects the focused radio when none is selected.
  - `Tab` moves focus out of the group. The group is a single tab stop.
- **Naming:** the group is named by `label`. Without one, pass `aria-label` or `aria-labelledby`. Each radio is named by its option's `label`. The helper text is linked to the group with `aria-describedby`.
- **Focus:** shown by the theme's focus ring on the focused radio. Disabled radios can't take focus.
- **States:** MUI doesn't pass `required` or `error` to the radios or the group (see [Verified behavior](#verified-behavior)), so the library sets `required` on each input, and `aria-required` and `aria-invalid` on the group.
- **Contrast:** empty radios use `text.secondary`, at 7.15 or more, and selected ones `primary.main`, at 3.84 or more, which meets 3:1 for a control on both schemes. The error color in dark mode has the problem noted in [0005](./0005-inputs.md#open-questions).

## Behavior and edge cases

- **Uncontrolled without `defaultValue`:** starts with nothing selected. A user can't clear a radio group once something is selected. Add an option such as "None" if clearing is needed.
- **A value that isn't in `options`:** no radio is selected. The library doesn't warn. Values are compared with `===`, so `null` never selects an option whose value is `'null'` or `''`, as MUI's string comparison would.
- **Duplicate values:** cause React key warnings, and both radios show as selected. Values must be unique.
- **One option:** renders a single radio, which can't be unselected. Use Checkbox instead.
- **No options:** renders the label, an empty group and the helper text.
- **Long labels:** an option's label wraps, and the radio stays vertically centered on it, as in MUI. With `row`, a long label takes a line of its own when it wraps.
- **Narrow screens:** `row` wraps, so it doesn't overflow. A column is easier to scan on phones.
- **Generated `name`:** two radio groups on one page never share a generated name. Pass `name` when the form's data needs a specific key.
- **Forms:** the selected radio's `value` is submitted under `name`. `required` makes the browser's validation stop on a group with nothing selected.
- **Without the library theme:** Radio group renders with the surrounding MUI theme.
- **Server Components:** Radio group is a client component. `options` can come from a Server Component, as long as each `label` is serializable, such as text.

## Acceptance criteria

- [x] Renders an element with `role="radiogroup"`, named by `label`, holding one radio per option, in order, each named by its option's `label`.
- [x] Without `label`, `aria-label` names the group.
- [x] Picking a radio calls `onChange` with the event and the option's `value`.
- [x] Works controlled with `value` and `onChange`, and uncontrolled with and without `defaultValue`.
- [x] `value={null}` selects nothing, without warnings.
- [x] Every radio shares `name`, generated when not passed, and a surrounding form submits the selected value under it.
- [x] A disabled option can't be picked. `disabled` on the group disables every radio.
- [x] `helperText` is linked to the group with `aria-describedby`, joined with a consumer's own `aria-describedby`.
- [x] `error` sets `aria-invalid="true"` on the group and the `Mui-error` class on the group label and helper text.
- [x] `required` sets `aria-required="true"` on the group and `required` on every radio input, and shows an asterisk.
- [x] `row` adds MUI's `row` class to the group.
- [x] `color` and `size` reach every `Radio`.
- [x] Turning `error` and `helperText` on and off doesn't remount the radios.
- [x] `ref` reaches the root `<div>`, and `className`, `sx`, `style` and other props, such as `data-*`, reach it too.
- [x] Each slot in `slotProps` reaches its element.
- [x] Type check: `Value` is inferred from `options` as a union of literals, `onChange` receives that type, and a `value` outside it fails.
- [x] Under the library theme, keyboard focus gives the focused radio `Mui-focusVisible` and a solid outline.
- [x] A project-level `MuiRadio` `styleOverrides.root` object changes every radio.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Radio group renders with that theme.
- [x] Works with the keyboard as listed under Accessibility: `Tab` lands on the selected radio, arrow keys select the next enabled one, and `Tab` leaves the group.
- [x] Storybook has a story for every variant and state, one with `row`, one inside a form, and one showing a theme override.
- [x] `RadioGroup`, `RadioGroupProps` and `RadioOption` are exported from `src/index.ts`, and `RadioGroup` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- A description line under each option, or options laid out as cards.
- Non-string values.
- Exporting MUI's `Radio` on its own.
- A way to clear the selection other than an option the consumer adds.
- Changing the `error` palette color. See [0005](./0005-inputs.md#open-questions).

## Verified behavior

Tested on 2026-11-07 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, with MUI's parts assembled as in MUI's docs under `CmThemeProvider`. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| `slotProps` in `RadioGroup.d.ts` | Not present. MUI's `Radio` has `root` and `input` |
| MUI's `RadioGroup` | A `<div role="radiogroup">`. `aria-labelledby` pointing at a `FormLabel` names it |
| `name` in `RadioGroup.js` | Generated with `useId` when not passed |
| `FormLabel` | Renders a `<label>` |
| `Tab` into a group with `defaultValue="free"` | Focus lands on the "free" radio |
| `ArrowDown` from "free", with the next option disabled | Selects and focuses the option after it, and calls `onChange` with its value |
| `Tab` from inside the group | Focus leaves the group |
| `FormControl` with `disabled` | Every radio is disabled |
| `FormControl` with `required` and `error` | The `FormLabel` gets an asterisk, `Mui-error` and `Mui-required`. The radio inputs get neither `required` nor `aria-invalid` |
