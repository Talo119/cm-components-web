# 0002: Button group

- **Status:** Implemented
- **Date:** 2026-11-07
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0001](./0001-button.md)

## Purpose

Joins related buttons into one visual unit, with shared variant, color, size and disabled state, under the library's default look. MUI's `ButtonGroup` already provides the layout, the joined borders and the shared props, so this library adds a default that matches Button and a stable import rather than new behavior.

**Use it for:** a few related actions shown together, such as "Copy, Cut, Paste", or "Previous, Next" pagination controls.

**Don't use it for:**

- Choosing one or more options that stay selected, such as text alignment. That's a toggle button group, which isn't on the [roadmap](./roadmap.md) yet.
- Picking one value from a list. Use Radio group or Select.
- A split button with a dropdown of extra actions. That needs Menu, and is out of scope here.
- Buttons that only sit next to each other without being joined, such as a dialog's "Cancel" and "Save". Lay those out with MUI's `Stack` or the parent's own styles.

## Usage

```tsx
import { Button, ButtonGroup } from '@cmotino/cm-web-components'

<ButtonGroup aria-label="Text formatting">
  <Button>Bold</Button>
  <Button>Italic</Button>
  <Button>Underline</Button>
</ButtonGroup>

<ButtonGroup variant="contained" size="small" aria-label="Pagination">
  <Button onClick={goBack}>Previous</Button>
  <Button onClick={goForward}>Next</Button>
</ButtonGroup>

<ButtonGroup orientation="vertical" disabled={isLocked} aria-label="Row actions">
  <Button>Move up</Button>
  <Button>Move down</Button>
  <Button disabled={false}>Unlock</Button>
</ButtonGroup>
```

## API

`ButtonGroup` is MUI's `ButtonGroup`, re-exported from `src/components/ButtonGroup/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as ButtonGroup } from '@mui/material/ButtonGroup'
export type { ButtonGroupProps } from '@mui/material/ButtonGroup'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `disableElevation` | `boolean` | `true` under the library theme, `false` otherwise | No | The only default that differs from MUI. It's set in the theme, not in the component |

The props a group shares with its buttons are `color`, `disabled`, `disableElevation`, `disableFocusRipple`, `disableRipple`, `fullWidth`, `size` and `variant`. A prop set on a single Button wins over the group's value.

**Why a re-export and not a wrapper:** the same reasons as in [0001](./0001-button.md#api). `ButtonGroup` is an `OverridableComponent`, so a wrapper typed as `(props: ButtonGroupProps)` would lose the typing of the `component` prop. The re-export also keeps MUI's own context between `ButtonGroup` and `Button` intact, which is what joins the buttons. If a later version needs its own props, a wrapper with the same type can replace the re-export without breaking consumers.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: every component accepts `slotProps` | Button group has no `slotProps` | MUI's `ButtonGroup` has none in 9.5. Use `classes` or the theme for the grouped buttons, as listed under Styling hooks |
| Section 6: `ButtonGroup.tsx` and `ButtonGroup.types.ts` | Neither file exists. The folder holds `index.ts`, `ButtonGroup.test.tsx` and `ButtonGroup.stories.tsx` | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's `ButtonGroup` module carries its own.

## Data shapes

None. Buttons are passed as `children`.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | `outlined` variant, `primary` color, `medium` size, `horizontal` orientation, as in MUI. Note that MUI's default variant here is `outlined`, while Button's is `text` |
| `contained` | Joined buttons with no shadow on the group or on the buttons |
| `outlined`, `text` | As in MUI. Buttons are separated by a border in a translucent form of the group's color |
| `vertical` | Buttons are stacked, and the joined edges are top and bottom |
| `fullWidth` | The group takes its container's width, and the buttons share it |
| Hover, active | As in MUI, with no shadow on `contained` |
| Keyboard focus | The focused button shows Button's focus ring and is painted above its neighbors, so the ring isn't covered |
| Disabled | Every button in the group is disabled, unless a button sets `disabled={false}` itself |
| Loading | Applies per button, through Button's `loading` prop. The group has no loading state |
| Empty, error | Don't apply |

## Styling hooks

- **Theme key:** `components.MuiButtonGroup`. New variants, colors and sizes use MUI's `ButtonGroupPropsVariantOverrides`, `ButtonGroupPropsColorOverrides` and `ButtonGroupPropsSizeOverrides`, augmented on `@mui/material/ButtonGroup`. A project that adds a variant to Button should add it to Button group too, if the two are used together.
- **Slots:** None. Inner parts are reached with `classes` or `styleOverrides` keys: `grouped` for every button, `firstButton`, `middleButton` and `lastButton` by position, plus `root`, `contained`, `outlined`, `text`, `horizontal`, `vertical`, `fullWidth`, `disabled` and `disableElevation`.
- **Default look:** buttons inside a group keep Button's library look: no uppercase text and the keyboard focus ring. The group's corners use the theme's 8px radius, and its colors come from the palette, as described in [section 3 of the architecture spec](./0000-architecture.md#3-styling-and-theming). `src/theme/defaultTheme.ts` gains:

```ts
components: {
  MuiButton: { /* unchanged, see 0001 */ },
  MuiButtonGroup: {
    defaultProps: { disableElevation: true },
  },
},
```

**Why the group needs its own default:** MUI's `Button` resolves its props in the order instance props, then the group's context, then theme defaults. A group always passes its own `disableElevation`, which is `false` by MUI's default, so it beats the `MuiButton` theme default from 0001. Without `MuiButtonGroup.defaultProps`, a `contained` group under the library theme would have a shadow (see [Verified behavior](#verified-behavior)). The same order means any other `MuiButton.defaultProps` that a group shares, such as `size` or `variant`, are replaced by the group's values inside a group. The documentation must state this.

## Accessibility

- **Semantics:** a `<div>` with `role="group"`, holding native buttons or links, as rendered by each Button.
- **Keyboard:**
  - `Tab` and `Shift+Tab` move focus through the buttons one at a time, as with separate buttons.
  - `Enter` and `Space` activate a button, as in [0001](./0001-button.md#accessibility).
  - Arrow keys don't move focus. A toolbar with one tab stop is out of scope.
- **Naming:** the group needs `aria-label` or `aria-labelledby`, so screen readers announce what the buttons have in common. It isn't enforced by types. The documentation and every story use one. Each button is named by its own children, or by `aria-label` when it shows only an icon.
- **Focus:** shown by Button's ring, painted above neighboring buttons. Disabled buttons can't take focus and are skipped by `Tab`.

## Behavior and edge cases

- **Children:** only MUI's `Button`, which the library's `Button` is, reads the group's context. Other children, such as `IconButton`, render without the shared props or the joined borders.
- **Fragments:** a fragment counts as one child, so every button inside it gets the `firstButton`, `middleButton` or `lastButton` class of the fragment's position, and the joined borders break. Pass buttons as direct children or as an array.
- **Conditional children:** `false`, `null` and `undefined` are skipped, so `{canDelete && <Button>Delete</Button>}` keeps the right positions.
- **Wrapped buttons:** a Button wrapped in another component, such as `Tooltip`, still gets the shared props and its position class.
- **A single button:** gets no position class, so its corners stay fully rounded.
- **Long labels and narrow screens:** the group is `inline-flex` and doesn't wrap, so it can overflow its container. Use `orientation="vertical"` or fewer buttons on narrow screens. There is no automatic switch.
- **Without the library theme:** Button group renders with the surrounding MUI theme, so labels are uppercase and a `contained` group has a shadow.
- **Server Components:** Button group can be rendered from a Server Component, with the same limit as Button on function props.

## Acceptance criteria

- [x] Renders an element with `role="group"`, named by `aria-label`, containing its buttons.
- [x] `ref` reaches the root DOM element.
- [x] `className`, `sx` and other props, such as `data-*` and `aria-*`, reach the root element.
- [x] Buttons get the `grouped` class, and the `firstButton`, `middleButton` and `lastButton` classes by position.
- [x] A single button gets no position class.
- [x] `false` and `null` children are skipped when assigning positions.
- [x] `variant`, `color` and `size` on the group reach every Button, and a Button's own value wins.
- [x] `disabled` on the group disables every Button, and a Button with `disabled={false}` stays enabled.
- [x] `orientation="vertical"` and `fullWidth` add their classes to the root.
- [x] Clicking a button calls that button's `onClick`.
- [x] `component` renders the given element as the root.
- [x] Under the library theme, a `contained` group has no shadow, and its buttons have `MuiButton-disableElevation` and `text-transform: none`.
- [x] Under the library theme, keyboard focus gives a grouped button `Mui-focusVisible`, a solid outline and a `z-index` above its neighbors.
- [x] A project-level `MuiButtonGroup` `disableElevation: false` restores the shadow.
- [x] A project-level `styleOverrides.grouped` object changes the look of every grouped button.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Button group renders with that theme.
- [x] Works with the keyboard as listed under Accessibility: `Tab` reaches each enabled button in order and skips disabled ones.
- [x] `ButtonGroup` is exported from `src/index.ts` and added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Props, variants, colors or sizes beyond those in MUI.
- A data-driven API, such as an `items` array. Buttons stay as children.
- Selection state, as in MUI's `ToggleButtonGroup`. A toggle button group would need its own spec and a place on the roadmap.
- A split button, which combines a group with a dropdown. It can be specified once Menu exists.
- Arrow-key navigation with a single tab stop, as in the ARIA toolbar pattern.
- Enforcing an accessible name for the group through types.
- Wrapping to several lines, or switching orientation automatically on narrow screens.

## Verified behavior

Tested on 2026-11-07 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, with the library's `Button` inside MUI's `ButtonGroup`. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| `slotProps` in `ButtonGroup.d.ts` | Not present |
| Prop order in MUI's `Button` | Instance props, then `ButtonGroupContext`, then `MuiButton` theme defaults |
| `contained` group under the library theme, without `MuiButtonGroup.defaultProps` | The root has `shadows[2]`, and the buttons lack `MuiButton-disableElevation` |
| Same group with `MuiButtonGroup.defaultProps.disableElevation: true` | The root has no shadow, and the buttons have `MuiButton-disableElevation`. A Button's own `disableElevation={false}` still wins |
| Grouped buttons under the library theme | `text-transform: none` is kept |
| Keyboard focus on a grouped button | `2px solid` outline in the primary color and `z-index: 1` |
| Arrow keys on a focused grouped button | Focus doesn't move. `Tab` moves it to the next button |
| Root element | A `<div>` with `role="group"` |
| Two buttons inside a fragment | Both get `firstButton` |
| A Button inside `Tooltip` | Gets the shared props and its position class |
| `{false}` among the children | Skipped. The following button gets the right position |
| A single button | Only `grouped`, with no position class |
| Group `disabled` with a Button's `disabled={false}` | That Button stays enabled |
