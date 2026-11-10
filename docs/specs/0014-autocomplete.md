# 0014: Autocomplete

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md), [0006](./0006-select.md), [0013](./0013-chip.md)

## Purpose

Lets a user pick one or several values from a list by typing to filter it, with the label, helper text and error state of a text field. MUI's `Autocomplete` already provides the combobox, filtering, the listbox popup, keyboard handling and the chips for several values, but it needs a `renderInput` function that builds the TextField, and it reports option objects. This library's `Autocomplete` takes the [field props](./0005-inputs.md#field-props) directly, takes an `options` array shaped like Select's, reports the selected values with their type, and submits them with a form.

**Use it for:** choosing from a long list, such as a country, a user or a product. Choosing several values, such as tags or email recipients. Searching options on the server as the user types.

**Don't use it for:**

- About 5 to 30 options that don't need searching. Use Select.
- Two to five options that should all stay visible. Use Radio group.
- Free text with suggestions, where the user can type a value that isn't in the list. That's `freeSolo`, which is out of scope.
- Actions, such as "Export as CSV". Use Menu, which is on the [roadmap](./roadmap.md).

## Usage

```tsx
import { Autocomplete } from '@cmotino/cm-web-components'
import type { AutocompleteOption } from '@cmotino/cm-web-components'

const countries: AutocompleteOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
]

<Autocomplete label="Country" options={countries} defaultValue="es" name="country" />

<Autocomplete
  label="Tags"
  multiple
  options={tagOptions}
  value={tags}
  onChange={(_, value) => setTags(value)}
  helperText="Press Backspace to remove the last tag"
/>

// Searching on the server. The selected option stays in `options`.
<Autocomplete<number>
  label="Customer"
  options={selected ? [selected, ...results.filter((o) => o.value !== selected.value)] : results}
  value={selected?.value ?? null}
  onChange={(_, value) => setSelected(results.find((o) => o.value === value) ?? null)}
  onInputChange={(_, text) => search(text)}
  filterOptions={(options) => options}
  loading={isSearching}
/>
```

## API

`Autocomplete` is a component of this library, in `src/components/Autocomplete/`, built on MUI's `Autocomplete` and `TextField`.

```ts
export { Autocomplete } from './Autocomplete.tsx'
export type { AutocompleteProps, AutocompleteOption } from './Autocomplete.types.ts'
```

It takes the field props, and MUI's `Autocomplete` props except those listed below, which work as in MUI, such as `loading`, `loadingText`, `noOptionsText`, `inputValue`, `onInputChange`, `filterOptions`, `filterSelectedOptions`, `limitTags`, `disableClearable`, `disableCloseOnSelect`, `open`, `onOpen`, `onClose`, `openOnFocus`, `autoHighlight`, `readOnly`, `size`, `fullWidth` and `renderOption`. It adds or changes:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `readonly AutocompleteOption<Value>[]` | | Yes | The options, in display order |
| `multiple` | `Multiple` | `false` | No | If `true`, the user picks several values, shown as chips |
| `value` | `Value \| null`, or `readonly Value[]` with `multiple` | `undefined` | No | Controlled value. `null` or `[]` means nothing is selected |
| `defaultValue` | Same as `value` | `null`, or `[]` with `multiple` | No | Initial value when uncontrolled |
| `onChange` | `(event: SyntheticEvent, value: Value \| null, reason: AutocompleteChangeReason) => void`, with `Value[]` when `multiple` | `undefined` | No | Called when the user picks, removes or clears a value. `reason` is MUI's, such as `'selectOption'`, `'removeOption'` or `'clear'` |
| `name` | `string` | `undefined` | No | Renders a hidden `<input>` for each selected value, so a form submits the values, not the labels |
| `placeholder` | `string` | `undefined` | No | Shown in the empty input |
| `variant` | `'outlined' \| 'filled' \| 'standard'` | `'outlined'` | No | TextField's variant |
| `slotProps` | MUI's `Autocomplete` slots, plus `textField` | `undefined` | No | `textField` reaches the TextField, including its own `slotProps`. MUI's slots, such as `chip`, `listbox`, `paper` and `popper`, work as in MUI |

`Autocomplete` is generic, as `Autocomplete<Value extends string | number = string, Multiple extends boolean = false>`. `Value` is inferred from `options`, and `Multiple` from `multiple`.

These MUI props aren't part of `AutocompleteProps`, because this library sets them or leaves their feature out of scope: `renderInput`, `getOptionLabel`, `getOptionValue`, `getOptionKey`, `getOptionDisabled`, `isOptionEqualToValue`, `freeSolo`, `groupBy`, `renderGroup` and `renderValue`.

```ts
type Omitted = 'options' | 'value' | 'defaultValue' | 'onChange' | 'multiple' | 'renderInput'
  | 'getOptionLabel' | 'getOptionValue' | 'getOptionKey' | 'getOptionDisabled'
  | 'isOptionEqualToValue' | 'freeSolo' | 'groupBy' | 'renderGroup' | 'renderValue' | 'slotProps'

type AutocompleteValue<Value, Multiple extends boolean> = Multiple extends true ? Value[] : Value | null

export interface AutocompleteProps<Value extends string | number = string, Multiple extends boolean = false>
  extends FieldProps, // label, helperText, error, required, disabled
    Omit<MuiAutocompleteProps<AutocompleteOption<Value>, Multiple, boolean, false>, Omitted> {
  options: readonly AutocompleteOption<Value>[]
  multiple?: Multiple
  value?: Multiple extends true ? readonly Value[] : Value | null
  defaultValue?: Multiple extends true ? readonly Value[] : Value | null
  onChange?: (event: SyntheticEvent, value: AutocompleteValue<Value, Multiple>, reason: AutocompleteChangeReason) => void
  name?: string
  placeholder?: string
  variant?: TextFieldProps['variant']
  slotProps?: MuiAutocompleteProps<AutocompleteOption<Value>, Multiple, boolean, false>['slotProps'] & {
    textField?: Partial<TextFieldProps>
  }
}
```

**How it maps to MUI:** Autocomplete passes MUI `getOptionValue={(option) => option.value}`, `getOptionLabel={(option) => option.label}`, `getOptionKey={(option) => option.value}` and `getOptionDisabled={(option) => option.disabled ?? false}`. MUI 9.5's `getOptionValue` makes `value`, `defaultValue` and `onChange` use the values rather than the option objects, and matches them by `===`, so this library doesn't map values itself. `renderInput` renders TextField with the field props, `placeholder`, `variant` and `slotProps.textField`, merged with MUI's `params` through `mergeSlotProps`, so the consumer's handlers run alongside MUI's.

**Naming props:** `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<input>` with `role="combobox"`, through TextField's `slotProps.htmlInput`, as the [field props](./0005-inputs.md#field-props) require. A consumer's `aria-describedby` is joined with the helper text's id.

**`required`:** sets the asterisk and `aria-required="true"` on the input. The native `required` attribute is only set while nothing is selected, because with `multiple` the input's own text is empty after picking a value, and the browser would block the form. See [Verified behavior](#verified-behavior).

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| [0005](./0005-inputs.md#field-props): the root is a MUI `FormControl` | The root is MUI's `Autocomplete` root, a `<div>` around the TextField's `FormControl` | MUI's `Autocomplete` owns the root and measures the input inside it. `sx`, `className`, `ref` and other props reach that `<div>` |
| Section 2: data items have a stable `id` or a `getItemId` | An option's `value` is its id | Values must already be unique, because they identify the selection, as in [0006](./0006-select.md#exceptions-to-the-architecture-spec) |
| [0006](./0006-select.md#data-shapes): `label` is a `ReactNode` | An option's `label` is a `string` | The label is typed into the input, filtered and shown in chips, so it must be text. `renderOption` can show more in the list |

`Autocomplete.tsx` starts with `'use client'`, because it passes functions to MUI's `Autocomplete`, and is added to `tests/dist.test.ts`.

## Data shapes

```ts
export interface AutocompleteOption<Value extends string | number = string> {
  /** Unique within `options`. Used as the React key and reported by `onChange`. */
  value: Value
  /** What the option shows in the list, in the input once selected, and in chips. */
  label: string
  /**
   * Shown but not selectable.
   * @default false
   */
  disabled?: boolean
}
```

The shape matches `SelectOption` from [0006](./0006-select.md#data-shapes), except that `label` is a `string`, so a list of string labels can move from Select to Autocomplete as it grows.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | An outlined field, as TextField in [0005](./0005-inputs.md#variants-and-states), with a clear button and a down arrow at the end |
| `filled`, `standard`, `size="small"` | As on TextField. `size="small"` also makes the chips small |
| Empty | The label sits inside the field, and `placeholder` shows once the field has focus |
| Selected, single | The option's `label` is shown in the input as text |
| Selected, `multiple` | Each value is a Chip from [0013](./0013-chip.md) before the input, with a delete icon. `limitTags` shows "+N" for the rest while the field doesn't have focus |
| Open | A listbox below the field, on `background.paper` with the theme's shadow and 8px radius. The selected options are highlighted with `primary.main` at the theme's selected opacity |
| Keyboard-highlighted option | The theme's focus ring drawn inside the option, from `theme.focusVisible`. A mouse-highlighted option gets `action.hover` |
| Loading | `loadingText` in the popup while there are no options to show |
| No options | `noOptionsText` in the popup |
| Hover, focus | As on TextField. The clear button appears on hover and focus when there is a value |
| Disabled | The field and its chips are dimmed and can't be opened |
| Disabled option | Dimmed in the list, skipped by arrow keys and not selectable |
| Error, required | As on TextField |
| Read only | `readOnly`: the field shows the value, and it can't be changed or opened |

## Styling hooks

- **Theme keys:** `MuiAutocomplete`, plus the keys of the parts it's built from: `MuiTextField` and the input keys listed in [0005](./0005-inputs.md#styling-hooks), `MuiChip`, `MuiPaper`, `MuiPopper` and `MuiIconButton`. Autocomplete has no `CmAutocomplete` key, because it's a simple component and the MUI keys already reach every part.
- **Slots:** MUI's `root`, `chip`, `clearIndicator`, `popupIndicator`, `listbox`, `status`, `paper` and `popper`, plus `textField` for the TextField.
- **Default look:** no theme change. The field gets the `grey[500]` border from [0005](./0005-inputs.md#styling-hooks), the chips get the delete icon and avatar colors from [0013](./0013-chip.md#styling-hooks), and keyboard-highlighted options get the focus ring that MUI 9.5 draws when `theme.focusVisible` is set, which the library theme sets in [0001](./0001-button.md#styling-hooks).

## Accessibility

- **Semantics:** the input has `role="combobox"`, with `aria-autocomplete="list"`, `aria-expanded`, and `aria-controls` pointing at the listbox while it's open. The list has `role="listbox"`, with `aria-multiselectable` when `multiple` is set, and each option has `role="option"` with `aria-selected` and `aria-disabled`. The highlighted option is announced through `aria-activedescendant`, so focus stays in the input.
- **Keyboard:**
  - `Tab` moves focus to the input. The chips, clear button and arrow button aren't in the tab order.
  - Typing filters the options and opens the list.
  - `ArrowDown` and `ArrowUp` open the list and move the highlight, skipping disabled options. `Home`, `End`, `PageUp` and `PageDown` move it further.
  - `Enter` picks the highlighted option and closes the list, unless `disableCloseOnSelect` is set, as in MUI.
  - `Escape` closes the list. With `clearOnEscape`, a second `Escape` clears the value.
  - With `multiple` and an empty input: `ArrowLeft` and `ArrowRight` move between chips, `Backspace` removes the focused chip or the last one, and `Delete` removes the focused chip.
- **Naming:** the `label`, through the `<label>` element linked to the input. Without a label, pass `aria-label`, which reaches the input. The helper text is linked with `aria-describedby`. The clear and arrow buttons are named by `clearText`, `openText` and `closeText`, which default to English. A project in another language passes its own.
- **Announcements:** "Loading…" and "No options" are in MUI's `status` slot, which has `role="status"` and `aria-live="polite"`, so screen readers announce them. The number of matching options isn't announced. That's out of scope.
- **Focus:** the input shows TextField's focus border and keeps focus while the list is open. Removing a chip leaves focus in the input.
- **Removing chips:** the chips' delete icons can't take focus, as noted in [0013](./0013-chip.md#accessibility). A field with `multiple` should say in its helper text that `Backspace` removes values, as in the second example.
- **States:** `error` sets `aria-invalid` and `required` sets `aria-required` on the input, and `disabled` disables it.
- **Contrast:** the border meets 3:1 as in 0005. Option text is `text.primary` at 16.15 or more on a selected option and 16.94 or more on a hovered one. Loading and empty text is `text.secondary`, at 7.15 or more.

## Behavior and edge cases

- **Values that aren't in `options`:** MUI matches values against the current `options`. A value that isn't there shows as an empty input, or as a chip with no label. When searching on the server, keep the selected options in `options`, as in the third example. Autocomplete doesn't remember labels for values it can't find.
- **Duplicate values:** MUI logs an error naming the duplicate, because values identify options. Values must be unique.
- **Number values:** `onChange` reports numbers as numbers. The hidden inputs submit them as text, as forms always do.
- **Filtering:** MUI's default filter matches the typed text anywhere in the `label`, ignoring case and accents. Server search passes `filterOptions={(options) => options}`, so MUI doesn't filter results a second time.
- **Many options:** the list scrolls up to 40% of the window's height. It isn't virtualized, so above a few thousand options, limit what's shown with MUI's `createFilterOptions({ limit })`, imported from `@mui/material/Autocomplete`, or search on the server.
- **Many chips:** they wrap onto new lines and the field grows. `limitTags` keeps the field short while it doesn't have focus.
- **Long labels:** a single selected label scrolls inside the input. Chips cut long labels off with an ellipsis, as in [0013](./0013-chip.md#behavior-and-edge-cases). In the list, long labels wrap.
- **Forms:** with `name`, a single Autocomplete renders one hidden `<input>` while a value is selected, and a `multiple` one renders one per value, all with the same `name`. The visible input has no `name`, so its text isn't submitted. A disabled Autocomplete disables its hidden inputs, so it submits nothing, as native fields do. Resetting the form doesn't reset the Autocomplete. A controlled `value` is the way to reset it.
- **A controlled value that doesn't change:** if `onChange` doesn't update `value`, the selection stays, but the input keeps the picked option's label as typed text until it loses focus, as in MUI.
- **`multiple` in the theme:** Autocomplete always passes `multiple` to MUI, so `MuiAutocomplete.defaultProps.multiple` has no effect. Pass `multiple` on each instance, because it changes the type of `value`.
- **Stable structure:** as for the [field props](./0005-inputs.md#field-props), turning `error` and `helperText` on and off doesn't remount the input.
- **Narrow screens:** MUI renders the input full width inside the root, but the root isn't full width unless `fullWidth` is set. Use `fullWidth` in narrow layouts. The popup is as wide as the field.
- **Without the library theme:** Autocomplete renders with the surrounding MUI theme.
- **Server Components:** Autocomplete is a client component. `options` can come from a Server Component, because they're plain data.

## Acceptance criteria

- [ ] Renders a combobox named by its `label`, showing nothing when `value` is `null`.
- [ ] Typing filters the options by `label`, and opening the list shows one `option` for each matching item, in order.
- [ ] Picking an option calls `onChange` with the event, the option's `value` and the reason, and shows the option's `label` in the input.
- [ ] With `multiple`, picking options calls `onChange` with an array of values, and each value shows as a Chip with the option's `label`.
- [ ] With `multiple`, clicking a chip's delete icon, or pressing `Backspace` in the empty input, removes the value and calls `onChange` with `'removeOption'`.
- [ ] Number values reach `onChange` as numbers.
- [ ] Works controlled with `value` and `onChange`, and uncontrolled with and without `defaultValue`, in both modes, without React or MUI warnings.
- [ ] A disabled option is skipped by the arrow keys and can't be picked.
- [ ] `loading` with no options shows `loadingText`, and no matching options shows `noOptionsText`, inside an element with `role="status"`.
- [ ] `helperText` is linked with `aria-describedby`, joined with a consumer's own `aria-describedby`. `error` sets `aria-invalid`, and `required` sets `aria-required` and shows an asterisk.
- [ ] With `required` and `multiple`, a form with at least one value selected submits, and a form with none is blocked by the browser's validation.
- [ ] `disabled` prevents typing and opening the list.
- [ ] `aria-label` names the combobox when there's no `label`.
- [ ] With `name`, a surrounding form submits each selected value, not its label.
- [ ] Turning `error` and `helperText` on and off doesn't remount the input.
- [ ] `ref` reaches the root `<div>`, and `className`, `sx` and other props, such as `data-*`, reach it too.
- [ ] `slotProps.textField` reaches the TextField, and MUI's slots, such as `chip` and `listbox`, reach their elements.
- [ ] Type check: `Value` is inferred from `options`, `multiple` changes `value` and `onChange` to arrays, and a `value` of another type fails.
- [ ] Under the library theme, the field has the `grey[500]` border from 0005, and chips have the delete icon color from 0013.
- [ ] Under the library theme, an option highlighted with the keyboard shows the focus ring.
- [ ] A project-level `MuiAutocomplete` `styleOverrides.listbox` object changes the list.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Autocomplete renders with that theme.
- [ ] Works with the keyboard as listed under Accessibility.
- [ ] Storybook has a story for every variant and state, one with `multiple`, one with number values, one searching a fake server with `loading`, one with many options, one inside a form, and one showing a theme override.
- [ ] `Autocomplete`, `AutocompleteProps` and `AutocompleteOption` are exported from `src/index.ts`, and `Autocomplete` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- Values the user types that aren't in the list (`freeSolo`), and creating options from the input.
- Grouped options with headings (`groupBy`).
- Remembering the labels of selected values that are no longer in `options`.
- Virtualized lists.
- Announcing the number of matching options.
- Option labels that aren't text. `renderOption` can add content in the list, such as an avatar, but the `label` stays a string.
- Exporting `createFilterOptions`. Consumers import it from MUI until a spec adds it.
- Fetching options. Autocomplete reports `onInputChange` and shows `loading`, and the consumer fetches.

## Open questions

- **`disableCloseOnSelect` with `multiple`:** MUI closes the list after each pick by default, so picking several tags means reopening it each time. Decide whether the library sets `disableCloseOnSelect` when `multiple` is set.
- **Hidden inputs:** submitting values through hidden inputs differs from MUI, where the visible input submits the label. Form, on the [roadmap](./roadmap.md), may manage values without native submission. Confirm that `name` should render hidden inputs before Form is specified.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Autocomplete.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Slots in `Autocomplete.d.ts` | `root`, `chip`, `clearIndicator`, `popupIndicator`, `listbox`, `status`, `paper` and `popper` |
| `getOptionValue` in `useAutocomplete.d.ts` and `useOptionValue.js` | Accepts a string, number or boolean. `value`, `defaultValue` and `onChange` then use those values, matched with `===` through a lookup map |
| A value with no matching option in `useOptionValue.js` | Resolves to `null`. The input text becomes `''`, and a chip's label becomes `''`. No warning is logged |
| Duplicate values in `validateOptionValues.js` | Logs an error naming the duplicate value, once |
| Default `getOptionLabel` in `useAutocomplete.js` | `option.label ?? option`. A label that isn't a string logs an error and is converted with `String` |
| `renderInput` params in `Autocomplete.js` | `id`, `disabled`, `fullWidth` (default `true`), `size`, and `slotProps.inputLabel`, `slotProps.input` (with `ref`, `startAdornment` and `endAdornment`) and `slotProps.htmlInput` |
| Chips in `Autocomplete.js` | Rendered with MUI's `Chip` through the `chip` slot, with `tabIndex={-1}` and `onDelete` from `getItemProps` |
| Status in `Autocomplete.js` | `loadingText` and `noOptionsText` are inside the `status` slot, with `role="status"`, `aria-live="polite"` and `aria-atomic="true"` |
| Input props in `useAutocomplete.js` | `role="combobox"`, `aria-autocomplete`, `aria-controls`, `aria-expanded`, and `aria-activedescendant` while open. The listbox is labelled by `${id}-label` |
| Keys in `useAutocomplete.js` | `Home`, `End`, `PageUp`, `PageDown`, `ArrowDown`, `ArrowUp`, `ArrowLeft`, `ArrowRight`, `Enter`, `Escape`, `Backspace` and `Delete`, as listed under Accessibility |
| `required` on TextField | Sets `required` on the `<input>`, whose own text is empty with `multiple`, so native validation fails even with values selected |
| Option colors in `Autocomplete.js` | Highlighted: `action.hover`. Selected: `primary.main` at `selectedOpacity`. With `theme.focusVisible`, a keyboard-highlighted option gets the focus ring, inset |
| Text on options, light and dark | `text.primary` on a selected option: 16.30 and 16.15. On a hovered option: 17.24 and 16.94 |
| Options created by `filterOptions` in `useOptionValue.js` | Remembered while selected, so a value picked from results that `filterOptions` made up keeps its label. Options removed from `options` aren't remembered |
| `htmlInput` in `InputBase.js` | Spread after InputBase's own `required`, `aria-describedby` and `aria-invalid`, so Autocomplete's `required` and joined `aria-describedby` replace TextField's |
| `mergeSlotProps` in `@mui/material/utils` | The consumer's props replace MUI's, except event handlers, which both run. Autocomplete puts MUI's `ref` back after merging |
| Rendered: `required` with `multiple` | No `required` attribute once a value is selected, with `aria-required="true"` kept. `form.checkValidity()` is `false` with no values and `true` with one |
| Rendered: hidden inputs | `FormData` has one entry per selected value under `name`, and none while disabled. Number values are submitted as text |
| Rendered: disabled options | `aria-disabled="true"` and `pointer-events: none`. MUI blocks clicks only through `pointer-events` |
| Rendered: the clear button | `tabindex="-1"`, and hidden with `visibility` until the field is hovered or focused, so it has no accessible name while hidden |
| Rendered: keyboard-highlighted option | `Mui-focusVisible` with a 2px solid outline under the library theme |
| Rendered: duplicate values | MUI logs an error naming the value |
| Type check: inline `options` | `Value` is inferred as the literal values, and a `string` `value` still fits, because `value` takes part in inference. A `number` `value` for string options fails |
