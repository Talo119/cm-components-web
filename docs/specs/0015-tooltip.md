# 0015: Tooltip

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

Shows a short text label next to an element when the user hovers over it, focuses it with the keyboard or long-presses it. MUI's `Tooltip` already covers the behavior, including the delays, the arrow, placement, touch support, and the keyboard and hover rules that WCAG 2.2 asks for content that appears on hover or focus (1.4.13). Its colors meet contrast under the library theme, so this library re-exports it with no changes, and documents how to name its child correctly.

**Use it for:** naming an icon-only button, such as "Delete" on a trash icon. Showing the full text of something cut off with an ellipsis, such as a long Chip label. Adding a short hint to a control that already has a name.

**Don't use it for:**

- Information the user needs to finish a task, such as a field's format. Use `helperText`, because touch users rarely see tooltips and the text isn't visible until hover.
- Content with links, buttons or other interactive elements. A tooltip can't take focus. Use a popover or dialog, which aren't on the [roadmap](./roadmap.md) yet.
- Messages about the page or a task. Use Alert, which is on the roadmap.
- Long text. MUI limits the width to 300px, and a tooltip should be a few words.

## Usage

```tsx
import { Button, Chip, Tooltip } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

// Names an icon-only button. The title becomes its `aria-label`.
<Tooltip title="Delete">
  <IconButton onClick={handleDelete}>
    <DeleteIcon />
  </IconButton>
</Tooltip>

// Adds a hint to a button that already has a name.
<Tooltip title="Saves without publishing" describeChild>
  <Button>Save draft</Button>
</Tooltip>

// A disabled button doesn't receive pointer events, so wrap it.
<Tooltip title="You don't have permission to delete" describeChild>
  <span>
    <Button disabled>Delete</Button>
  </span>
</Tooltip>

<Tooltip title={user.email} placement="top" arrow>
  <Chip label={user.email} sx={{ maxWidth: 160 }} />
</Tooltip>
```

## API

`Tooltip` is MUI's `Tooltip`, re-exported from `src/components/Tooltip/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed, and no defaults change.

```ts
export { default as Tooltip } from '@mui/material/Tooltip'
export type { TooltipProps } from '@mui/material/Tooltip'
```

The props a consumer uses most are `title`, `children`, `describeChild`, `placement`, `arrow`, `enterDelay`, `leaveDelay`, `open`, `onOpen`, `onClose`, `disableInteractive` and `slotProps`. MUI's defaults are kept: `placement="bottom"`, `enterDelay={100}`, `leaveDelay={0}`, `enterTouchDelay={700}`, `leaveTouchDelay={1500}` and `describeChild={false}`.

**Why a re-export and not a wrapper:** the same reasons as Button in [0001](./0001-button.md#api). MUI's `Tooltip` has no logic for this library to add, and its colors pass under the library theme, so a wrapper would be a layer with nothing in it.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: `sx`, `className`, `ref` and other props reach the root element | Tooltip has no root element. They reach the child, which MUI clones with them. The tooltip itself is styled through `slotProps.tooltip` | MUI renders the child as it is and puts the tooltip in a portal. Wrapping the child would change the layout and break `ref` on the child |
| Section 6: `Tooltip.tsx` and `Tooltip.types.ts` | Neither file exists. The folder holds `index.ts`, `Tooltip.test.tsx` and `Tooltip.stories.tsx` | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's `Tooltip` module carries its own.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | White 11px text, medium weight, on `grey[700]` at 92% opacity, with the theme's 8px radius and a maximum width of 300px, below the child, as in MUI |
| `arrow` | A small arrow pointing at the child, in the tooltip's color |
| `placement` | Any of MUI's 12 placements. It flips when there's no room |
| Hidden | The tooltip isn't in the DOM |
| Hover | Opens after `enterDelay`. Moving the pointer onto the tooltip keeps it open, unless `disableInteractive` is set |
| Keyboard focus | Opens when the child gets keyboard focus, not when it's clicked |
| Touch | Opens after a 700ms long press, and closes 1.5s after the finger lifts |
| Empty `title` | Never opens. `0` is still shown |

## Styling hooks

- **Theme key:** `components.MuiTooltip`.
- **Slots:** `popper`, `transition`, `tooltip` and `arrow`, as in MUI.
- **Default look:** MUI's tooltip, which takes its 8px radius and its font from the library's design tokens. No theme change is needed, because its text passes contrast, as listed under Accessibility.

## Accessibility

- **Semantics:** the tooltip has `role="tooltip"` and an `id`. It's rendered in a portal at the end of the `<body>`.
- **Naming:** by default, a string `title` becomes the child's `aria-label`, which replaces the child's own name. That suits icon-only buttons, as in the first example.
  - A child with visible text needs `describeChild`, as in the second example. Otherwise its accessible name becomes the tooltip's text, which fails WCAG 2.2's "Label in Name" (2.5.3) when the two differ. With `describeChild`, the tooltip is linked with `aria-describedby` while it's open.
  - A `title` that isn't a string, such as a fragment, is linked with `aria-labelledby` only while the tooltip is open, so the child has no name while it's closed. Keep `title` a string.
  - An icon button that has its own `aria-label` keeps it. MUI spreads the child's props after its own.
- **Keyboard:** `Tab` to the child opens the tooltip. `Escape` closes it, and moving focus away closes it. The tooltip itself can't take focus.
- **Hover and focus content (1.4.13):** the tooltip can be dismissed with `Escape` without moving the pointer or focus, it stays open while the pointer is over it, and it stays until the pointer or focus leaves. `disableInteractive` and `followCursor` turn off the second rule, so don't use them where the text matters.
- **Disabled children:** a disabled `<button>` doesn't get focus, and MUI's disabled Button has `pointer-events: none`, so neither the mouse nor the keyboard can open its tooltip. Wrap it in a `<span>`, as in the third example. Keyboard users still can't reach it, so a reason that matters must also be given somewhere visible.
- **Contrast:** white on the tooltip background is 8.75:1 on the light background and 11.80:1 on the dark one. In dark mode the tooltip's background is only 1.71:1 against the page, which is allowed, because the text, not the shape, carries the information.

## Behavior and edge cases

- **The child:** must be a single element that holds a `ref` and spreads its props onto the DOM element. MUI logs an error if it doesn't. A plain string child is wrapped in a `<span>`.
- **A `title` on the child:** MUI logs an error, because the browser would show its own tooltip as well.
- **Long text:** wraps at 300px. Set `slotProps.tooltip.sx.maxWidth` for a wider one, but prefer shorter text.
- **Several tooltips in a row:** with `enterNextDelay`, moving between nearby children opens the next tooltip without the delay, as in a toolbar.
- **Controlled:** `open` with `onOpen` and `onClose` shows the tooltip from code. The hover and focus rules then only report events.
- **Scrolling and resizing:** the tooltip follows the child, through MUI's `Popper`.
- **Without the library theme:** Tooltip renders with the surrounding MUI theme, with MUI's 4px radius.
- **Server Components:** Tooltip can be rendered from a Server Component. Its child and `title` must be serializable or rendered by a client component.

## Acceptance criteria

- [ ] Hovering the child opens an element with `role="tooltip"` showing `title`, and moving the pointer away closes it.
- [ ] Focusing the child with the keyboard opens the tooltip, and `Escape` closes it.
- [ ] Without `describeChild`, a string `title` becomes the child's `aria-label`.
- [ ] With `describeChild`, the child keeps its own name, and is linked to the open tooltip with `aria-describedby`.
- [ ] A child's own `aria-label` isn't replaced.
- [ ] An empty `title` never opens a tooltip.
- [ ] A disabled Button wrapped in a `<span>` opens its tooltip on hover.
- [ ] `ref`, `className` and other props, such as `data-*`, reach the child element.
- [ ] Each slot in `slotProps` reaches its element.
- [ ] Under the library theme, the tooltip has the theme's 8px radius.
- [ ] A project-level `MuiTooltip` `styleOverrides.tooltip` object changes the tooltip.
- [ ] A project-level `MuiTooltip.defaultProps.describeChild` of `true` applies to every tooltip.
- [ ] An instance-level `slotProps.tooltip.sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Tooltip renders with that theme.
- [ ] Works with the keyboard as listed under Accessibility.
- [ ] Storybook has a story for every placement, one with `arrow`, one on an icon button, one with `describeChild` on a text button, one on a disabled button, one with a long Chip label, and one showing a theme override.
- [ ] `Tooltip` is exported from `src/index.ts` and added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Interactive content inside a tooltip, such as links or buttons.
- A popover or toggletip that opens on click.
- Making disabled children reachable with the keyboard.
- Changing the default `describeChild` (see Open questions).
- Exporting MUI's `IconButton`. Consumers import it from MUI until a spec adds it, as in [0012](./0012-badge.md#out-of-scope).

## Open questions

- **Default `describeChild`:** MUI's default replaces the child's name with the tooltip's text, which is right for icon-only buttons and wrong for children with visible text. Turning it on for the whole library theme would fix text children, but MUI then names an icon-only button through its `title` attribute only while the tooltip is closed. Once keyboard focus opens the tooltip, the button has no name, only a description. This spec keeps MUI's default and asks consumers to pass `describeChild` on text children. Confirm, or decide to change the default and require `aria-label` on icon-only buttons.
- **Text size:** MUI's 11px text is the smallest in the library, below `caption` at 12px. Confirm that the design accepts it, or set `typography.caption` on the tooltip through the theme.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`, with the tooltip's background blended over the page. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Tooltip.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Slots in `Tooltip.d.ts` | `popper`, `transition`, `tooltip` and `arrow` |
| Defaults in `Tooltip.js` | `placement="bottom"`, `enterDelay={100}`, `enterNextDelay={0}`, `leaveDelay={0}`, `enterTouchDelay={700}`, `leaveTouchDelay={1500}`, `describeChild={false}`, `arrow={false}` |
| Naming in `Tooltip.js` | Without `describeChild`: `aria-label={title}` when `title` is a string, else `aria-labelledby` while open. With it: `title={title}` while closed, and `aria-describedby` while open. The child's props are spread after these |
| Other props in `Tooltip.js` | Spread onto the cloned child, with `className` joined, and `ref` forked with the child's own |
| `Escape` in `Tooltip.js` | A `keydown` listener on the document closes the open tooltip |
| Interactive in `Tooltip.js` | Without `disableInteractive` or `followCursor`, hover and focus on the popper keep the tooltip open |
| Empty `title` in `Tooltip.js` | Every falsy value except `0` keeps the tooltip closed |
| Role in `BasePopper.js` | `role="tooltip"` |
| Style in `Tooltip.js` | `palette.Tooltip.bg` (`grey[700]` at 0.92), `common.white`, 11px, `fontWeightMedium`, `shape.borderRadius`, `maxWidth: 300` |
| White on the tooltip | 8.75 light, 11.80 dark |
| The tooltip against the page | 8.52 light, 1.71 dark |
| Rendered: naming | Without `describeChild`, the child's `aria-label` is the `title`. With it, the child keeps its name and gets `aria-describedby` pointing at the open tooltip's `id`. A child's own `aria-label` wins |
| Rendered: keyboard | `Tab` opens the tooltip, `Escape` closes it with focus left on the child, and moving focus away closes it |
| Rendered: empty `title` | `''` and `null` never open. `0` is shown |
| Rendered: `ref` and props | `ref`, `className` and `data-*` passed to Tooltip reach the child, with `className` joined to the child's own |
| Rendered: radius | 8px under the library theme, and the surrounding theme's radius without it |
