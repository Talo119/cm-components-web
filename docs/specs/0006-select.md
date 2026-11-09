# 0006: Select

- **Status:** Implemented
- **Date:** 2026-11-07
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md)

## Purpose

Lets a user pick one value from a short list, with the label, helper text and error state of a text field. MUI's `TextField` with `select` already provides the field, the listbox popup and the keyboard handling, but it takes its options as `MenuItem` children and reports the value through `event.target.value`. This library's `Select` takes an `options` array, keeps the type of the values, and uses `null` for "nothing selected".

**Use it for:** choosing one value from about 5 to 30 options in a form or a filter, such as a country, a status or a page size.

**Don't use it for:**

- Two to five options that should all stay visible. Use Radio group.
- Long lists, or lists the user needs to search. Use Autocomplete, which is on the [roadmap](./roadmap.md).
- Choosing several values. Use Autocomplete, or a group of Checkboxes.
- Actions, such as "Export as CSV". Use Menu, which is on the roadmap.

## Usage

```tsx
import { Select } from '@cmotino/cm-web-components'
import type { SelectOption } from '@cmotino/cm-web-components'

const countries: SelectOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
]

<Select label="Country" options={countries} defaultValue="es" name="country" />

<Select
  label="Status"
  options={statusOptions}
  value={status}
  onChange={(_, value) => setStatus(value)}
  required
  error={!status}
  helperText={!status ? 'Choose a status' : ' '}
/>

<Select<number>
  label="Rows per page"
  size="small"
  options={[10, 25, 50].map((n) => ({ value: n, label: String(n) }))}
  value={pageSize}
  onChange={(_, value) => setPageSize(value)}
/>
```

## API

`Select` is a component of this library, in `src/components/Select/`, built on MUI's `TextField` with `select` and `MenuItem`.

```ts
export { Select } from './Select.tsx'
export type { SelectProps, SelectOption } from './Select.types.ts'
```

It takes the [field props](./0005-inputs.md#field-props) and TextField's other props, such as `variant`, `size`, `fullWidth`, `name`, `id`, `inputRef`, `autoFocus`, `color`, `margin`, `onFocus` and `onBlur`, which work as on TextField. It adds or changes:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `readonly SelectOption<Value>[]` | | Yes | The options, in display order |
| `value` | `Value \| null` | `undefined` | No | Controlled value. `null` means nothing is selected |
| `defaultValue` | `Value \| null` | `null` | No | Initial value when uncontrolled |
| `onChange` | `(event: SelectChangeEvent<Value>, value: Value) => void` | `undefined` | No | Called when the user picks an option, with the option's value and its type |
| `slotProps` | TextField's `slotProps`, plus `option` | `undefined` | No | `option` reaches every `MenuItem`. TextField's slots work as in MUI |

`Select` is generic, as `Select<Value extends string | number = string>`. `Value` is inferred from `options`, or set explicitly, as in `<Select<number>>`.

These TextField props aren't part of `SelectProps`, because they only apply to typing text or to MUI's own select: `select`, `children`, `type`, `multiline`, `rows`, `minRows`, `maxRows` and `placeholder`. `slotProps.select.multiple` and `slotProps.select.native` are always `false`.

```ts
type Omitted = 'select' | 'children' | 'type' | 'multiline' | 'rows' | 'minRows' | 'maxRows'
  | 'placeholder' | 'value' | 'defaultValue' | 'onChange' | 'slotProps'

interface SelectOwnProps<Value extends string | number> {
  options: readonly SelectOption<Value>[]
  value?: Value | null
  defaultValue?: Value | null
  onChange?: (event: SelectChangeEvent<Value>, value: Value) => void
}

// Applied to each member of TextField's union of variants.
type SelectPropsFor<T, Value extends string | number> = T extends unknown
  ? Omit<T, Omitted> & SelectOwnProps<Value>
    & { slotProps?: T['slotProps'] & { option?: Partial<MenuItemProps> } }
  : never

export type SelectProps<Value extends string | number = string> =
  SelectPropsFor<TextFieldProps, Value>
```

`SelectProps` is a type alias, not an interface, because `TextFieldProps` is a union of one type per `variant`, and an interface can't extend a union. `SelectPropsFor` applies `Omit` and adds `slotProps.option` to each member, so `variant="filled"` keeps the filled input's types, including its `slotProps.input`. It's a private helper. `@mui/types` has a `DistributiveOmit` too, but it isn't a dependency of this library.

`aria-label` isn't passed to the root. Select passes it to the combobox through `slotProps.htmlInput`, which is where MUI's select reads it. `inputRef` works as on TextField with `select`: it receives MUI's handle, `{ node, value, focus }`, where `node` is the hidden `<input>`, rather than the `<input>` itself.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: simple components extend the matching MUI props | `SelectProps` is built from `TextFieldProps`, not MUI's `SelectProps` | MUI's `Select` is only the input. TextField adds the label, helper text and ids that the field props need |
| Section 2: data items have a stable `id` or a `getItemId` | An option's `value` is its id | Values must already be unique, because they identify the selection |

`Select.tsx` starts with `'use client'`, because it passes a function to TextField's `onChange`, and is added to `tests/dist.test.ts`.

## Data shapes

```ts
export interface SelectOption<Value extends string | number = string> {
  /** Unique within `options`. Used as the React key and reported by `onChange`. */
  value: Value
  /** What the option shows, in the list and in the field once selected. */
  label: ReactNode
  /** Shown but not selectable. */
  disabled?: boolean
}
```

`null` is the empty value. Internally, it's passed to MUI as `''`, which is how MUI's select shows no selection.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | An outlined field, as TextField in [0005](./0005-inputs.md#variants-and-states), with a down arrow at the end |
| `filled`, `standard`, `size="small"` | As on TextField |
| Empty | The label sits inside the field, as on an empty TextField |
| Selected | The label moves above the field, and the option's `label` is shown in the field |
| Open | A listbox below the field, at least as wide as the field. The selected option is highlighted, and the arrow points up |
| Hover | As on TextField. Options are highlighted with `action.hover` |
| Focus | As on TextField. In the open list, the focused option is highlighted |
| Disabled | The field is dimmed and can't be opened |
| Disabled option | Dimmed in the list, skipped by arrow keys and not selectable |
| Error, required | As on TextField |

## Styling hooks

- **Theme keys:** `MuiTextField`, `MuiSelect`, the input keys listed in [0005](./0005-inputs.md#styling-hooks), `MuiMenu`, `MuiMenuItem` and `MuiPopover`. Select has no `CmSelect` key, because it's a simple component and the MUI keys already reach every part.
- **Slots:** TextField's `root`, `input`, `inputLabel`, `htmlInput`, `formHelperText` and `select`, as in MUI, plus `option` for every `MenuItem`. Popup props, such as `MenuProps`, go through `slotProps.select`.
- **Default look:** the field is TextField's, including the `grey[500]` border from [0005](./0005-inputs.md#styling-hooks). The list uses MUI's `Menu`, on `background.paper` with the theme's shadows and 8px radius. No theme change is needed beyond 0005.

## Accessibility

- **Semantics:** the field is an element with `role="combobox"` and `aria-haspopup="listbox"`. The open list has `role="listbox"`, and each option `role="option"` with `aria-selected`. A hidden native `<input>` holds the value for form submission.
- **Keyboard:**
  - `Tab` moves focus to the field.
  - `Enter`, `Space`, `ArrowDown` and `ArrowUp` open the list, with focus on the selected option or the first one.
  - In the list, `ArrowDown` and `ArrowUp` move between options, skipping disabled ones. `Home` and `End` go to the first and last option.
  - Typing letters moves to the next option whose text starts with them.
  - `Enter` or `Space` picks the focused option, closes the list and returns focus to the field.
  - `Escape` and `Tab` close the list without changing the value.
- **Naming:** the `label`, through `aria-labelledby`. Without a label, pass `aria-label`, which reaches the combobox. The helper text is linked with `aria-describedby`.
- **Focus:** the field shows TextField's focus border. Focus moves into the list when it opens and back to the field when it closes.
- **States:** `error` sets `aria-invalid` and `required` sets `aria-required` on the combobox, and `disabled` sets `aria-disabled`.
- **Option labels:** type-ahead matches an option's text content. An option whose `label` is only an icon has no text to match, and needs visible text or `aria-label` through its element.

## Behavior and edge cases

- **Uncontrolled without `defaultValue`:** starts with nothing selected. MUI warns about an `undefined` value, and React warns when it changes, so the library passes `''` instead.
- **A value that isn't in `options`:** MUI logs a warning, and the field shows nothing. Reset the value to `null` when the options change and no longer include it.
- **A "None" option:** an option with `value: ''` lets the user clear the selection. `null` and `''` then both show that option as selected.
- **Number values:** `onChange` reports numbers as numbers, because MUI reads the value from the option rather than from the DOM. The hidden `<input>` submits it as text, as forms always do.
- **Duplicate values:** two options with the same `value` cause React key warnings, and both show as selected. Values must be unique.
- **No options:** the field renders, and opening it shows an empty list. A "No options" message is out of scope.
- **Many options:** the list scrolls, with a height limited by the window, as in MUI. It isn't virtualized, so use Autocomplete above a few hundred options.
- **Long labels:** the selected label is cut off with an ellipsis in the field. In the list, long labels make the list wider, up to the window's width.
- **Narrow screens:** as on TextField. Use `fullWidth`.
- **Forms:** `name` reaches the hidden `<input>`, so the value is submitted. `required` makes the browser's form validation stop on an empty field.
- **Without the library theme:** Select renders with the surrounding MUI theme.
- **Server Components:** Select is a client component. `options` can come from a Server Component, as long as each `label` is serializable, such as text.

## Acceptance criteria

- [x] Renders a combobox named by its `label`, showing nothing when `value` is `null`.
- [x] Opening the list shows one `option` for each item in `options`, in order, named by its `label`.
- [x] Picking an option calls `onChange` with the event and the option's `value`, and closes the list.
- [x] Number values reach `onChange` as numbers.
- [x] Works controlled with `value` and `onChange`, and uncontrolled with and without `defaultValue`, without React or MUI warnings.
- [x] `value={null}` shows nothing selected, without a warning.
- [x] A disabled option is skipped by the arrow keys and can't be picked.
- [x] `helperText` is linked with `aria-describedby`, `error` sets `aria-invalid`, and `required` sets `aria-required`.
- [x] `disabled` prevents opening the list.
- [x] `aria-label` names the combobox when there's no `label`.
- [x] `name` reaches the hidden `<input>`, so a surrounding form submits the selected value.
- [x] Turning `error` and `helperText` on and off doesn't remount the field.
- [x] `ref` reaches the root `<div>`, and `className`, `sx` and other props, such as `data-*`, reach it too.
- [x] `slotProps.option` reaches every `MenuItem`, and TextField's slots reach their elements.
- [x] Type check: `Value` is inferred from `options`, `onChange` receives that type, and a `value` of another type fails.
- [x] Under the library theme, the field has the `grey[500]` border from 0005.
- [x] A project-level `MuiMenuItem` `styleOverrides.root` object changes the options.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Select renders with that theme.
- [x] Works with the keyboard as listed under Accessibility.
- [x] Storybook has a story for every variant and state, one with number values, one with many options, one inside a form, and one showing a theme override.
- [x] `Select`, `SelectProps` and `SelectOption` are exported from `src/index.ts`, and `Select` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- Choosing several values (`multiple`).
- MUI's native `<select>` mode (`native`).
- Grouped options with headings, and options with descriptions or icons laid out by the library.
- A placeholder shown inside an empty field.
- Searching, filtering or loading options. That's Autocomplete.
- A "No options" message for an empty list.
- Virtualized lists.

## Verified behavior

Tested on 2026-11-07 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, with MUI's `TextField` with `select` and `MenuItem` children under `CmThemeProvider`. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| Field element | A `<div role="combobox" aria-haspopup="listbox">`, with `aria-labelledby` pointing at the label and `aria-describedby` at the helper text |
| Root element | `<div class="MuiFormControl-root">`, as on TextField |
| Uncontrolled, with no `value` or `defaultValue` | MUI warns about an out-of-range `undefined` value, and React warns about an uncontrolled input becoming controlled after a pick |
| `value=""` | No warning, and nothing is shown |
| A value not in the options | MUI warns about an out-of-range value |
| `ArrowDown` on the focused field | Opens a `listbox` with focus on the first option |
| Typing `m` in the open list | Moves focus to "Medium" |
| `Enter` on an option | Calls `onChange`, closes the list and returns focus to the field |
| Number values | `event.target.value` is a number. The hidden `<input>` has `value="2"` |
| A disabled `MenuItem` | Has `aria-disabled="true"` |
| `aria-label` on TextField with `select` | Reaches the root `<div>`, not the combobox. Through `slotProps.htmlInput`, it reaches the combobox |
| `aria-labelledby` on the combobox | Only the label's id, so without a label, `aria-label` names it |
| `inputRef` | Receives `{ node, value, focus }`, with `node` the hidden `<input>` |
| An empty field | Holds a zero-width space, so its text content isn't `''` |
| The open list | MUI's `Menu` is modal, so the rest of the page, including the combobox, gets `aria-hidden` |
| `slotProps.select` merged with `mergeSlotProps` | The consumer's props win, so Select sets `multiple` and `native` after spreading them |
