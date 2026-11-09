# 0012: Badge

- **Status:** Implemented
- **Date:** 2026-11-09
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

Gives projects a small count or dot on the corner of another element, such as the number of unread messages on an icon. MUI's `Badge` already covers the behavior, including a maximum such as "99+", hiding at zero and a dot variant, so this library re-exports it with one changed default: MUI's default `color="default"` draws the number with no background, which hardly reads as a badge.

**Use it for:** a count of new or pending items on an icon or button, such as notifications or a cart, and a dot that marks something as new or online.

**Don't use it for:**

- A status label that stands on its own in text or a table, such as "Paid" or "Draft". Use Chip.
- A message that needs attention. Use Alert, which is on the [roadmap](./roadmap.md).
- The only way to give important information. A badge is small and isn't announced by itself, as described under Accessibility.

## Usage

```tsx
import { Avatar, Badge, Button } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'
import MailIcon from '@mui/icons-material/Mail'

<IconButton aria-label={`Messages, ${unread} unread`}>
  <Badge badgeContent={unread} max={99}>
    <MailIcon />
  </Badge>
</IconButton>

<Badge badgeContent={cart.length} color="primary" showZero>
  <Button variant="outlined">Cart</Button>
</Badge>

<Badge variant="dot" color="success" overlap="circular">
  <Avatar src={user.photoUrl} alt={user.name} />
</Badge>
```

## API

`Badge` is MUI's `Badge`, re-exported from `src/components/Badge/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as Badge } from '@mui/material/Badge'
export type { BadgeProps } from '@mui/material/Badge'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `color` | MUI's | `'error'` under the library theme, `'default'` otherwise | No | The only default that differs from MUI. It's set in the theme, not in the component |

The props a consumer uses most are `badgeContent`, `max`, `showZero`, `invisible`, `variant`, `color`, `overlap`, `anchorOrigin` and `slotProps`.

**Why a re-export and not a wrapper:** the same reasons as Button in [0001](./0001-button.md#api). MUI's `Badge` has no logic to add, has `slotProps` for `root` and `badge`, and keeps the `component` typing.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 6: `Badge.tsx` and `Badge.types.ts` | Neither file exists. The folder holds `index.ts`, `Badge.test.tsx` and `Badge.stories.tsx` | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's `Badge` module carries its own.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | A pill at the top right of the child, in `error.main` with `error.contrastText` text, 12px medium weight, as MUI draws a colored badge |
| `color` | `primary`, `secondary`, `info`, `success`, `warning` or `error`, as in MUI. `default` draws the number with no background |
| `variant="dot"` | An 8px dot with no content |
| `max` | A count above it shows as `${max}+`. Defaults to 99 |
| `badgeContent` of 0 | Hidden, unless `showZero` is set |
| `invisible` | Hidden, with MUI's scale transition |
| `overlap="circular"` | Placed for a round child, such as an Avatar |
| `anchorOrigin` | Moves the badge to another corner |
| Hover, focus, disabled | Don't apply. The badge isn't interactive |

## Styling hooks

- **Theme key:** `components.MuiBadge`. New variants and colors use MUI's `BadgePropsVariantOverrides` and `BadgePropsColorOverrides`, augmented on `@mui/material/Badge`.
- **Slots:** `root` for the wrapping `<span>` and `badge` for the badge itself, as in MUI.
- **Default look:** MUI's badge, with `error` as the default color. Colors, font and weight come from the library's design tokens. `src/theme/defaultTheme.ts` gains:

```ts
components: {
  // ...earlier components, unchanged
  MuiBadge: {
    defaultProps: { color: 'error' },
  },
},
```

**Why `error`:** a count badge is most often an alert that something needs attention, and `error` is the only theme color whose text meets 4.5:1 on its background in both schemes, at 6.29 in light mode and 9.38 in dark mode. Badge text is 12px, so it needs 4.5:1. `primary` gives 3.65 on both schemes, `info` 2.36 and 2.67, `success` 7.61 and 5.44, and `warning` 6.61 and 3.58. See [Open questions](#open-questions).

A project changes the default with `createCmTheme({ components: { MuiBadge: { defaultProps: { color: 'primary' } } } })`.

## Accessibility

- **Semantics:** the badge is an `aria-hidden` `<span>`, as in MUI, so screen readers never read it. The root is a `<span>` around the child.
- **Keyboard:** None. The child, such as a button, takes the focus.
- **Naming:** the information in the badge must be in the child's accessible name, such as `aria-label="Messages, 4 unread"` on the icon button in the first example. A dot that means "online" needs the same, such as `alt="Ana Ruiz, online"` on the avatar.
- **Changes:** a count that changes while the user is on the page isn't announced. A live region is out of scope.
- **Contrast:** described under Styling hooks. The dot carries no text, but its color against the child or background isn't checked.

## Behavior and edge cases

- **Large counts:** shown as "99+" above `max`. Content that isn't a number, such as "New", isn't capped and widens the pill.
- **Long content:** the pill grows to the right of its anchor and can cover nearby content. Keep it to a few characters.
- **Zero:** hidden by default, which is usually right for notifications. Pass `showZero` when zero is information, such as an empty cart in a checkout.
- **Children that clip:** a child with `overflow: hidden` doesn't clip the badge, because the badge belongs to the root, not the child. A parent with `overflow: hidden` can clip it.
- **Without the library theme:** Badge renders with the surrounding MUI theme and MUI's `default` color. MUI's own `Badge` used directly under the library theme gets the library default.
- **Server Components:** Badge can be rendered from a Server Component.

## Acceptance criteria

- [ ] Renders the child and a badge showing `badgeContent`.
- [ ] The badge has `aria-hidden="true"`.
- [ ] A `badgeContent` above `max` shows `${max}+`.
- [ ] A `badgeContent` of 0 hides the badge, and `showZero` shows it.
- [ ] `invisible` hides the badge.
- [ ] `variant="dot"` shows a badge with no content.
- [ ] `ref` reaches the root `<span>`.
- [ ] `className`, `sx` and other props, such as `data-*`, reach the root element.
- [ ] Each slot in `slotProps` reaches its element.
- [ ] Under the library theme, a badge without `color` uses `error.main` and `error.contrastText`.
- [ ] A project-level `MuiBadge.defaultProps.color` changes the default color.
- [ ] A project-level `MuiBadge` `styleOverrides.badge` object changes the badge.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Badge renders with that theme.
- [ ] Storybook has a story for every variant and state, one on an icon button with its accessible name, one on an Avatar, and one showing a theme override.
- [ ] `Badge` is exported from `src/index.ts` and added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Announcing count changes with a live region.
- Building the child's accessible name from `badgeContent`.
- Animating count changes.
- Exporting MUI's `IconButton`. Consumers import it from MUI until a spec adds it.

## Open questions

- **Default color:** `error` makes every badge red unless a project picks another color. Confirm that it fits the design, or keep MUI's `default` and require `color` on each badge.
- **`primary` and `info` text contrast:** `primary.contrastText` on `primary.main` is 3.65:1, and `info.contrastText` on `info.main` is 2.36:1 in light mode and 2.67:1 in dark mode, both below 4.5:1 for 12px text. This comes from the palette and also affects contained Buttons and filled Chips. Fixing it means changing the palette in the architecture spec.

## Verified behavior

Checked on 2026-11-09 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Badge.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Slots in `Badge.d.ts` | `root` and `badge` |
| Default `color` in `Badge.js` | `'default'`, which matches no palette color, so the badge gets no background or text color |
| Colored badges in `Badge.js` | `backgroundColor` from `palette[color].main` and `color` from `palette[color].contrastText`, 12px, `fontWeightMedium` |
| The badge in `Badge.js` | Rendered with `aria-hidden` |
| `contrastText` on `main`, light | `error` 6.29, `primary` 3.65, `info` 2.36, `success` 7.61, `warning` 6.61, `secondary` 6.29 |
| `contrastText` on `main`, dark | `error` 9.38, `primary` 3.65, `info` 2.67, `success` 5.44, `warning` 3.58, `secondary` 7.57 |
| Rendered: default color | `MuiBadge-colorError`, with `error.main` and `error.contrastText` |
| Rendered: hidden badges | A count of 0, `invisible`, and no `badgeContent` without `variant="dot"` add `MuiBadge-invisible`, which scales the badge to 0 |
