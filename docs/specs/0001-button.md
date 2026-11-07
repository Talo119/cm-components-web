# 0001: Button

- **Status:** Implemented
- **Date:** 2026-11-06
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

Gives projects a button that has the library's default look and can be restyled through the theme. MUI's `Button` already covers the behavior a project needs, including loading states, icons and link rendering, so this library adds a default look and a stable import rather than new behavior.

**Use it for:** actions such as saving, submitting or opening something, and links that should look like buttons.

**Don't use it for:** links inside text, which belong to Link. Groups of related actions belong to Button group. Both are on the [roadmap](./roadmap.md).

## Usage

```tsx
import { Button } from '@cmotino/cm-web-components'
import AddIcon from '@mui/icons-material/Add'
import { Link as RouterLink } from 'react-router'

<Button variant="contained" onClick={handleSave}>Save</Button>

<Button variant="contained" loading={isSaving} onClick={handleSave}>Save</Button>

<Button variant="outlined" startIcon={<AddIcon />}>Add user</Button>

<Button href="/docs" target="_blank">Read the docs</Button>

<Button component={RouterLink} to="/settings">Settings</Button>
```

## API

`Button` is MUI's `Button`, re-exported from `src/components/Button/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as Button } from '@mui/material/Button'
export type { ButtonProps } from '@mui/material/Button'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `disableElevation` | `boolean` | `true` under the library theme, `false` otherwise | No | The only default that differs from MUI. It's set in the theme, not in the component |

**Why a re-export and not a wrapper:** a wrapper typed as `(props: ButtonProps) => ...` fails to compile for `component={RouterLink} to="/x"` and for `href` with `target`, because `ButtonProps` describes the `<button>` form only. Keeping those working would need a cast to `ExtendButton<ButtonTypeMap>`, which would add a component layer and contain no logic. If a later version needs its own props, a wrapper with that same type can replace the re-export without breaking consumers.

`ButtonProps` keeps that limit for consumers too. A project writing its own wrapper around the link form needs to declare link props such as `target` itself.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: every component accepts `slotProps` | Button has no `slotProps` | MUI's `Button` has none in 9.5. Use `classes` or the theme for inner parts, as listed under Styling hooks |
| Section 6: `Button.tsx` and `Button.types.ts` | Neither file exists. The folder holds `index.ts`, `Button.test.tsx` and `Button.stories.tsx` | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's `Button` module carries its own.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | `text` variant, `primary` color, `medium` size, as in MUI. Label isn't uppercased |
| `contained`, `outlined` | As in MUI. `contained` has no shadow by default |
| Hover, active | As in MUI, with no shadow on `contained` |
| Keyboard focus | Solid 2px outline with a 2px offset, in the primary color of the active color scheme |
| Disabled | A `<button>` is natively disabled. A link gets `aria-disabled="true"` and `tabindex="-1"`, and keeps its `href` |
| Loading | Disabled, showing a progress indicator placed by `loadingPosition`. The accessible name stays the same |
| Empty, error | Don't apply |

## Styling hooks

- **Theme key:** `components.MuiButton`. New variants, colors and sizes use MUI's `ButtonPropsVariantOverrides`, `ButtonPropsColorOverrides` and `ButtonPropsSizeOverrides`, augmented on `@mui/material/Button`.
- **Slots:** None. Inner parts are reached with `classes` or `styleOverrides` keys, including `startIcon`, `endIcon` and `loadingIndicator`.
- **Default look:** no uppercase text, no elevation, and a keyboard focus ring. Colors, font and the 8px radius come from the library's design tokens, described in [section 3 of the architecture spec](./0000-architecture.md#3-styling-and-theming). `src/theme/defaultTheme.ts` gains:

```ts
export const defaultThemeOptions: ThemeOptions = {
  // ...design tokens
  focusVisible: true,
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none' } },
    },
  },
}
```

**`focusVisible` applies to the whole theme.** It turns on MUI's keyboard focus ring for every MUI component, which later specs can rely on. It's needed here because `disableElevation` removes the shadow that `contained` buttons otherwise show on focus. Projects change it with `createCmTheme({ focusVisible: { outlineColor: '...' } })` or turn it off with `focusVisible: false`.

**`styleOverrides.root` is kept as an object.** A project's object merges with it. A project's function replaces it, because `deepmerge` only merges plain objects. The label then follows `typography.button`, which isn't uppercase under the library theme since [0003](./0003-typography.md#styling-hooks), but is uppercase if a project sets it so, unless the function sets `textTransform` itself. The documentation must state this.

## Accessibility

- **Semantics:** a native `<button type="button">` by default, or an `<a>` when `href` is set. With `component`, the semantics are those of the element it renders.
- **Keyboard:**
  - `Tab` moves focus to the button.
  - `Enter` and `Space` activate a `<button>`.
  - `Enter` activates a link.
- **Naming:** the visible children. A button with only an icon needs `aria-label`. Icons passed as `startIcon` and `endIcon` are decorative unless the consumer gives them a name.
- **Loading:** the default indicator has `role="progressbar"` and is labelled by the button. A custom `loadingIndicator` must contain an element with `role="progressbar"` and an accessible name.
- **Focus:** shown by the ring described under Styling hooks. Disabled and loading buttons can't take focus.

## Behavior and edge cases

- **Forms:** the default `type` is `button`, so it doesn't submit a form. Pass `type="submit"` for that.
- **Toggling `loading`:** pass `true` or `false` from the first render, not `undefined`. MUI only keeps the loading wrapper in place for boolean values, and that wrapper prevents a known crash when browsers translate the page.
- **Becoming disabled while focused:** a focused button that gets `loading` stops responding to keys until loading ends, and browsers differ in where focus goes. This version accepts that behavior.
- **Disabled links:** `pointer-events: none` and `tabindex="-1"` stop mouse and keyboard use, but the `href` stays in the DOM. Remove `href` as well if navigation must be impossible.
- **Router links:** the component passed to `component` must forward `ref` and spread its props onto the DOM element.
- **Without the library theme:** Button renders with the surrounding MUI theme, so the label is uppercase and `contained` has a shadow. MUI's own `Button` used directly under the library theme gets the library look.
- **Server Components:** Button can be rendered from a Server Component, but function props such as `onClick` or a function `sx` can't cross that boundary. Those uses belong in a client component.
- **Long labels:** they wrap as in MUI. There is no truncation.

## Acceptance criteria

- [x] Renders a `<button type="button">` named by its children.
- [x] Clicking calls `onClick`.
- [x] A `disabled` button doesn't call `onClick`.
- [x] `ref` reaches the DOM element.
- [x] `className`, `sx` and other props, such as `data-*` and `aria-*`, reach the root element.
- [x] `startIcon` and `endIcon` render with the label.
- [x] `href` renders an `<a>`, and `target` reaches it.
- [x] `component` renders the given component and passes it its own props.
- [x] `type="submit"` submits a surrounding form, and the default doesn't.
- [x] `loading` disables the button, doesn't call `onClick`, and shows a `progressbar` labelled by the button.
- [x] Type check: `component={RouterLink} to="/x"` and `href` with `target` compile, while an unknown prop or a missing required `to` fails.
- [x] Under the library theme, the label has `text-transform: none` and `contained` has no elevation.
- [x] Under the library theme, keyboard focus gives the button `Mui-focusVisible` and a solid outline.
- [x] A project-level `styleOverrides.root` object changes the look and keeps the other library defaults.
- [x] A project-level `disableElevation: false` restores elevation.
- [x] `focusVisible: false` in a project theme removes the outline.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Button renders with that theme.
- [x] Works with the keyboard as listed under Accessibility.
- [x] `Button` is exported from `src/index.ts` and added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Props, variants, colors or sizes beyond those in MUI.
- Icon-only buttons as a separate component, such as `IconButton` or `Fab`. Neither is on the roadmap.
- Keeping a loading button focusable, or announcing the loading state with `aria-busy` or a live region.
- Setting `loading` automatically from an async `onClick`.
- A router integration beyond the `component` prop. The [roadmap](./roadmap.md) keeps this question open for Link.

## Verified behavior

Tested on 2026-11-06 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| Wrapper typed as `(props: ButtonProps)`, with `component={RouterLink} to` or `href` with `target` | Doesn't compile |
| Re-export, or a wrapper cast to `ExtendButton<ButtonTypeMap>`, with the same props | Compiles. On the re-export, an unknown prop or a missing `to` is rejected |
| `slotProps` in `Button.d.ts` | Not present |
| `disableElevation` on a focused `contained` button, without `focusVisible` | No shadow and no outline |
| `focusVisible: true` through `deepmerge` and `createTheme` | Outline on `contained`, `outlined` and `text`. An object override and `false` both work |
| Function in `styleOverrides.root` through `deepmerge`, over an object default | Replaces the default, and the label returns to uppercase. Since [0003](./0003-typography.md), it follows `typography.button` instead, which isn't uppercase by default |
| `loading` on a `<button>` | `disabled`, with `role="progressbar"` labelled by the button |
| `disabled` or `loading` with `href` | `aria-disabled="true"`, `tabindex="-1"` and `href` kept. With `loading`, `pointer-events: none` blocked the test's click |
