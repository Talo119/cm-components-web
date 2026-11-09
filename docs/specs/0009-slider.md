# 0009: Slider

- **Status:** Implemented
- **Date:** 2026-11-09
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md)

## Purpose

Gives projects a slider for picking a number, or a range of numbers, between a minimum and a maximum, with its label and helper text built in. MUI's `Slider` is only the control: a visible label needs a separate element linked with `aria-labelledby`, and helper text needs `FormHelperText` linked by hand. This library's `Slider` adds the [field props](./0005-inputs.md#field-props), as Select, Radio group and Switch do, so the Form on the [roadmap](./roadmap.md) can treat every input the same way. It also gives the rail a color that meets WCAG 2.2 AA contrast.

**Use it for:** a value where the position in a range matters more than the exact number, such as volume, brightness, zoom, or a price range in a filter.

**Don't use it for:**

- An exact number that the user types, such as a quantity or an age. Use TextField with `type="number"`.
- A few named options, such as "Small", "Medium" and "Large". Use Radio group or Select.
- Rating something with stars. Use Rating.
- Showing progress that the user can't change. Use Progress, which is on the [roadmap](./roadmap.md).

## Usage

```tsx
import { Slider } from '@cmotino/cm-web-components'

<Slider label="Volume" defaultValue={30} />

<Slider
  label="Price"
  value={price}
  onChange={(_, value) => setPrice(value)}
  onChangeCommitted={(_, value) => search({ price: value })}
  min={0}
  max={500}
  step={10}
  valueLabelDisplay="auto"
  getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
  getAriaValueText={(value) => `${value} dollars`}
  helperText="Prices include taxes"
/>

<Slider
  label="Zoom"
  defaultValue={100}
  min={50}
  max={200}
  step={null}
  marks={[
    { value: 50, label: '50%' },
    { value: 100, label: '100%' },
    { value: 200, label: '200%' },
  ]}
/>

<Slider aria-label="Opacity" size="small" value={opacity} onChange={(_, value) => setOpacity(value)} />
```

## API

`Slider` is a component of this library, in `src/components/Slider/`, built on MUI's `Slider`, `FormControl`, `FormLabel` and `FormHelperText`.

```ts
export { Slider } from './Slider.tsx'
export type { SliderProps } from './Slider.types.ts'
```

It takes the [field props](./0005-inputs.md#field-props) except `required` (see [Exceptions](#exceptions-to-the-architecture-spec)), plus these props of MUI's `Slider`, which reach the MUI slider:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `Value` | `undefined` | No | Controlled value. A number for one thumb, an array for a range |
| `defaultValue` | `Value` | `undefined` | No | Initial value when uncontrolled |
| `onChange` | `(event: Event, value: Value, activeThumb: number) => void` | `undefined` | No | Called on every change while the user drags or presses a key |
| `onChangeCommitted` | `(event: SyntheticEvent \| Event, value: Value) => void` | `undefined` | No | Called once when the user releases the thumb, or after a key press. Use it for work that shouldn't run on every step, such as a request |
| `min`, `max` | `number` | `0`, `100` | No | The range |
| `step` | `number \| null` | `1` | No | The step between values. `null` limits the values to `marks` |
| `marks` | `boolean \| readonly Mark[]` | `false` | No | Marks on the rail, with optional labels. `true` adds one per step |
| `shiftStep` | `number` | `10` | No | The step for `Shift` + arrow keys, `Page Up` and `Page Down` |
| `scale` | `(value: number) => number` | `(x) => x` | No | Maps the value before it's shown and announced |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | No | A vertical slider needs a height from the consumer |
| `track` | `'normal' \| 'inverted' \| false` | `'normal'` | No | As in MUI |
| `valueLabelDisplay` | `'on' \| 'auto' \| 'off'` | `'off'` | No | Shows the value above the thumb always, on hover and focus, or never |
| `valueLabelFormat` | `string \| ((value: number, index: number) => ReactNode)` | `(x) => x` | No | Formats the value label |
| `getAriaLabel` | `(index: number) => string` | `undefined` | No | Names each thumb. Needed for a range. See Accessibility |
| `getAriaValueText` | `(value: number, index: number) => string` | `undefined` | No | The text screen readers announce for a value, such as "30 dollars" |
| `aria-valuetext` | `string` | `undefined` | No | The same, for a single thumb |
| `disableSwap` | `boolean` | `false` | No | Stops one thumb from passing the other in a range |
| `name` | `string` | `undefined` | No | Sent with a submitted form, once per thumb |
| `color`, `size` | MUI's | `'primary'`, `'medium'` | No | As in MUI |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

`Slider` is generic, as `Slider<Value extends number | readonly number[] = number | number[]>`, and `Value` is inferred from `value` or `defaultValue`. A slider given a number gets a number in `onChange`, and one given an array gets an array. A literal such as `defaultValue={30}` is widened to `number`, so `onChange` doesn't get the type `30`. Other MUI `Slider` props, such as `disabled` from MUI's own API, `tabIndex` and `component`, aren't part of `SliderProps`. `disabled` comes from the field props, and the rest can be reached through `slotProps.control`.

```ts
export interface SliderProps<Value extends number | readonly number[] = number | number[]>
  extends Omit<FieldProps, 'required'>, // label, helperText, error, disabled
    Pick<SliderOwnProps<Value>, 'value' | 'defaultValue' | 'onChange' | 'onChangeCommitted'
      | 'min' | 'max' | 'step' | 'marks' | 'shiftStep' | 'scale' | 'orientation' | 'track'
      | 'valueLabelDisplay' | 'valueLabelFormat' | 'getAriaLabel' | 'getAriaValueText'
      | 'aria-valuetext' | 'disableSwap' | 'name' | 'color' | 'size'>,
    Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  sx?: SxProps<Theme>
  slotProps?: {
    formLabel?: Partial<FormLabelProps>
    control?: Partial<MuiSliderProps>
    htmlInput?: ComponentProps<'input'>
    formHelperText?: Partial<FormHelperTextProps>
  }
}
```

The root is a MUI `FormControl` with `fullWidth`, so a horizontal slider fills its container, and `variant="standard"`, so helper text isn't indented. The label is a `FormLabel`, as in Radio group. `id` stays on the root. When it's set, the label's id is `${id}-label` and the helper text's is `${id}-helper-text`. Otherwise both come from `useId`.

The library sets `aria-labelledby`, `aria-describedby` and `aria-invalid` on each thumb's `<input>` through MUI's `slotProps.input`, merged with `slotProps.htmlInput`. MUI's other slots, such as `thumb`, `rail`, `track`, `mark` and `valueLabel`, are reached through `slotProps.control.slotProps`.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: simple components extend the matching MUI props | `SliderProps` picks the MUI props listed above | The root is the `FormControl`, not MUI's slider, as with Checkbox in [0005](./0005-inputs.md#exceptions-to-the-architecture-spec) |
| Section 2: remaining props reach the root | `aria-label`, `aria-labelledby` and `aria-describedby` reach each thumb's `<input>` | They name and describe the slider, as the [field props](./0005-inputs.md#field-props) rule says |
| [0005](./0005-inputs.md#field-props): every input takes the field props | Slider has no `required` | A range input always has a value, so `required` would show an asterisk that means nothing and would never fail native validation |

`Slider.tsx` starts with `'use client'`, because it calls `useId`, and is added to `tests/dist.test.ts`.

## Data shapes

`Mark` is MUI's type, `{ value: number; label?: ReactNode }`. It isn't re-exported, because consumers pass plain objects.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | A `grey[500]` rail, with the track and thumb in the slider's color, `primary.main` by default |
| Range | Two thumbs over the same rail, with the track between them |
| `marks` | Dots on the rail, with labels below in `text.secondary`, as in MUI |
| `valueLabelDisplay` | A `grey[600]` bubble with white text above the thumb, as in MUI |
| `orientation="vertical"` | As in MUI. The root needs a height |
| `size="small"` | As in MUI |
| `track="inverted"`, `track={false}` | As in MUI. The inverted rail keeps MUI's color |
| Hover | A halo around the thumb, as in MUI |
| Keyboard focus | The theme's focus ring around the thumb, from [0001](./0001-button.md#styling-hooks), as MUI draws it when `focusVisible` is on |
| Dragging | As in MUI |
| Disabled | The slider turns `grey[400]` and the label is dimmed, as in MUI. The rail keeps MUI's color. The inputs are disabled |
| Error | The label and helper text use `error.main`, and each input has `aria-invalid="true"`. The slider keeps its color |
| With `helperText` | The text sits below the slider, with no indent |
| Without `label` | Only the slider, inside the root. It needs `aria-label`, `aria-labelledby` or `getAriaLabel` |

## Styling hooks

- **Theme keys:** `MuiSlider`, `MuiFormControl`, `MuiFormLabel` and `MuiFormHelperText`. Slider has no `CmSlider` key, because it's a simple component.
- **Slots:** `formLabel` for the label, `control` for MUI's `Slider`, `htmlInput` for every thumb's `<input>` and `formHelperText` for the helper text.
- **Default look:** MUI's slider, with colors from the library's design tokens, and an opaque rail. `src/theme/defaultTheme.ts` gains:

```ts
components: {
  // ...earlier components, unchanged
  MuiSlider: {
    styleOverrides: {
      rail: ({ theme, ownerState }) =>
        ownerState.disabled || ownerState.track === 'inverted'
          ? {}
          : { backgroundColor: (theme.vars || theme).palette.grey[500], opacity: 1 },
    },
  },
},
```

**Why `grey[500]`:** MUI draws the rail in the slider's color at 38% opacity. Under the library theme that's 1.66 and 1.64 against the light backgrounds and 1.60 and 1.62 against the dark ones, below the 3:1 that WCAG 2.2 AA asks for the parts of a control (1.4.11). `grey[500]` gives 5.78 and 5.49 in light mode and 3.40 and 3.22 in dark mode, the value already used for the input border and the Switch track.

**Disabled and inverted rails:** a disabled slider is exempt from 1.4.11, and the inverted rail is the colored part of the slider, so both keep MUI's styles.

**This rule applies to every MUI `Slider`** under the library theme, including one used directly from MUI. A project's own `rail` in `MuiSlider.styleOverrides` replaces it, because `deepmerge` doesn't merge functions. The documentation must state this.

## Accessibility

- **Semantics:** each thumb holds a visually hidden `<input type="range">`, with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-orientation`, as in MUI. Mark labels are `aria-hidden`.
- **Keyboard:**
  - `Tab` moves focus to each thumb in turn.
  - `Arrow Right` and `Arrow Up` add `step`. `Arrow Left` and `Arrow Down` subtract it. Right and left swap in right-to-left layouts.
  - `Shift` with an arrow key, `Page Up` and `Page Down` change the value by `shiftStep`.
  - `Home` and `End` go to `min` and `max`.
- **Naming:**
  - **One thumb:** the `label` names the input through `aria-labelledby`. Without one, pass `aria-label` or `aria-labelledby`.
  - **Two thumbs:** both thumbs need their own name, such as "Minimum price" and "Maximum price", passed with `getAriaLabel`. When `getAriaLabel` is set, the library doesn't put `aria-labelledby` on the inputs, because it would override their names. The root gets `role="group"` and `aria-labelledby` pointing at the label instead, so screen readers announce "Price" and then the thumb's name. A consumer's own `aria-labelledby` goes to the root group in the same way. With nothing to name the group, the root has no role.
  - **Values:** pass `getAriaValueText` or `aria-valuetext` when the number alone isn't clear, such as a price or a percentage.
  - The helper text is linked to each input with `aria-describedby`, joined with a consumer's own.
- **Focus:** shown by the theme's focus ring around the thumb. Disabled sliders can't take focus.
- **Contrast:** the thumb, in `primary.main`, reaches 4.04 and 3.84 in light mode and 4.87 and 4.60 in dark mode against the background, and the rail meets 3:1 as described under Styling hooks. The track against the `grey[500]` rail is 1.43:1, which is allowed because the thumb's position shows the value.

## Behavior and edge cases

- **Requests on change:** `onChange` fires on every step while dragging. Work such as a search request belongs in `onChangeCommitted`.
- **Range order:** without `disableSwap`, a thumb dragged past the other swaps with it, and the value array stays sorted, as in MUI.
- **`step={null}`:** the values are limited to `marks`. With no marks, the slider can't move.
- **Many marks:** `marks={true}` with a small `step` over a large range draws one dot per step and can crowd the rail. Pass an explicit list instead.
- **Long labels:** the label wraps above the slider. Long mark labels can overlap. Consumers shorten them or use fewer marks.
- **Value label near the edges:** at `min` and `max` the bubble can overflow its container, as in MUI. The container needs room or padding.
- **Narrow screens:** the slider fills the width of its container. MUI adds a right margin on devices with a coarse pointer, so the last thumb can be reached.
- **Forms:** each thumb submits its value under `name`. A range submits two values with the same name.
- **Turning `error` and `helperText` on and off:** doesn't remount the inputs, as described under [field props](./0005-inputs.md#field-props).
- **Without the library theme:** Slider renders with the surrounding MUI theme, with MUI's translucent rail.
- **Server Components:** Slider is a client component, and its function props must come from a client component.

## Acceptance criteria

- [x] With `label`, renders an element with `role="slider"` named by the label.
- [x] Without `label`, `aria-label` names the slider.
- [x] With `getAriaLabel` and two values, each thumb is named by `getAriaLabel`, and the root has `role="group"` named by the label or by a consumer's `aria-labelledby`.
- [x] Pressing the keys listed under Accessibility changes the value and calls `onChange` with the event, the new value and the active thumb.
- [x] `onChangeCommitted` is called once after a key press.
- [x] Works uncontrolled with `defaultValue`, and controlled with `value` and `onChange`, for one thumb and for a range.
- [x] `min`, `max`, `step` and `marks` reach the slider, and `getAriaValueText` sets `aria-valuetext`.
- [x] `helperText` is linked to every thumb's `<input>` with `aria-describedby`, joined with a consumer's own `aria-describedby`.
- [x] `error` sets `aria-invalid="true"` on every thumb's `<input>` and the `Mui-error` class on the label and helper text.
- [x] `disabled` disables the inputs and dims the label.
- [x] `SliderProps` has no `required` prop.
- [x] Turning `error` and `helperText` on and off doesn't remount the inputs.
- [x] `name` sends each thumb's value with a submitted form.
- [x] `ref` reaches the root `<div>`.
- [x] `className`, `sx`, `style` and other props, such as `data-*`, reach the root element.
- [x] Each slot in `slotProps` reaches its element.
- [x] Type check: a number `defaultValue` gives `onChange` a number, and an array gives it an array.
- [x] Under the library theme, the rail is `grey[500]` with `opacity: 1`, and the disabled and inverted rails keep MUI's styles.
- [x] Under the library theme, keyboard focus shows the focus ring around the thumb.
- [x] Helper text has no left indent.
- [x] A project-level `MuiSlider` `styleOverrides.thumb` object changes the thumb.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Slider renders with that theme.
- [x] Works with the keyboard as listed under Accessibility.
- [x] Storybook has a story for every variant and state, one for a price-range filter that searches on commit, and one showing a theme override.
- [x] `Slider` and `SliderProps` are exported from `src/index.ts`, and `Slider` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- A number input next to the slider, kept in sync with it.
- Showing `min` and `max` as text at the ends of the rail, unless the consumer passes them as `marks`.
- Ranges with more than two thumbs. MUI supports them, but naming and the group rule above aren't tested for them.
- Coloring the slider when `error` is set.
- Exporting MUI's `Slider` on its own.

## Open questions

- **Rail color:** `grey[500]` makes the rail darker and more solid than MUI's, and close in lightness to the `primary` track (1.43:1). Confirm that the design accepts it, or pick another value that still meets 3:1 on both schemes.

## Verified behavior

Tested on 2026-11-09 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, under `CmThemeProvider` and the current default theme. Contrast was computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`. Recheck these when upgrading either one.

| Check | Result |
| --- | --- |
| Slots in `Slider.d.ts` | `root`, `track`, `rail`, `thumb`, `mark`, `markLabel`, `valueLabel` and `input` |
| `Slider.d.ts` typing | `SliderOwnProps<Value extends number \| readonly number[]>`, with `onChange(event, value: Value, activeThumb)`. The default export is typed as overloads, one per kind of value, so `Slider.tsx` casts it to `SliderComponent<Value>` |
| Inferring `Value` | `defaultValue={30}` infers `30`, because the constraint includes `number`. `Slider.tsx` widens it to `number` |
| Thumb input in `Slider.js` | Gets `aria-label` from `getAriaLabel(index)` or `aria-label`, then `aria-labelledby`, then `slotProps.input`, which is spread last |
| `FormControl` context | MUI's `Slider` doesn't read `disabled` from it, so `disabled` is passed to the slider too |
| Rail in `Slider.js` | `backgroundColor: currentColor` at `opacity: 0.38`. `opacity: 1` when `track="inverted"` |
| Disabled root in `Slider.js` | `color: grey[400]` and `pointer-events: none` |
| Focus ring | With the library theme, `Tab` gives the thumb `Mui-focusVisible` and a 2px solid `primary.main` outline. Without it, MUI's own halo |
| Keys | Arrows, `Shift` with an arrow, `Page Up`, `Page Down`, `Home` and `End` move the value. `onChangeCommitted` is called once per key press |
| Range with `End` on the first thumb | The thumbs swap, and the value stays sorted |
| Pointer in jsdom | `userEvent.click` on the slider throws, because jsdom has no `hasPointerCapture` and no layout. Tests use the keyboard and `change` events |
| Forms | `FormData` has one entry per thumb under `name` |
| Rail at 38% primary on the backgrounds | 1.66 and 1.64 light, 1.60 and 1.62 dark |
| `grey[500]` on the backgrounds | 5.78 and 5.49 light, 3.40 and 3.22 dark |
| `primary.main` on the backgrounds | 4.04 and 3.84 light, 4.87 and 4.60 dark |
| Value label, white on `grey[600]` | 7.72 |
