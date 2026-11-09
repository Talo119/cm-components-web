# 0011: Avatar

- **Status:** Implemented
- **Date:** 2026-11-09
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

Gives projects a small picture of a person or thing, such as a profile photo, initials or an icon, with the library's default look. MUI's `Avatar` already covers the behavior, including falling back to initials or a generic icon when an image fails to load, so this library re-exports it and changes the fallback colors, which fail WCAG 2.2 AA contrast under the library theme.

**Use it for:** the photo or initials of a user in a header, a list, a comment or a Chip, and a logo or icon that stands for an item.

**Don't use it for:**

- Content images, such as product photos or illustrations. Use an `<img>`.
- A count or status shown on top of something. Use Badge.
- A removable tag with a picture. Use Chip with its `avatar` prop.

## Usage

```tsx
import { Avatar } from '@cmotino/cm-web-components'
import FolderIcon from '@mui/icons-material/Folder'

<Avatar src={user.photoUrl} alt={user.name} />

<Avatar>JD</Avatar>

<Avatar variant="rounded">
  <FolderIcon />
</Avatar>

<Avatar src={user.photoUrl} alt={user.name} sx={{ width: 24, height: 24, fontSize: '0.75rem' }} />
```

## API

`Avatar` is MUI's `Avatar`, re-exported from `src/components/Avatar/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as Avatar } from '@mui/material/Avatar'
export type { AvatarProps } from '@mui/material/Avatar'
```

The props a consumer uses most are `src`, `srcSet`, `sizes`, `alt`, `children`, `variant` and `slotProps`. MUI's defaults are kept, including `variant="circular"` and a size of 40px.

**Why a re-export and not a wrapper:** MUI's `Avatar` already takes data through props, handles a failing image, and has `slotProps` for `root`, `img` and `fallback`. A wrapper would add a layer with no logic, and would lose the `component` typing, as described for Button in [0001](./0001-button.md#api). If a later version needs its own props, such as `name` for building initials, a wrapper with the same type can replace the re-export without breaking consumers.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 6: `Avatar.tsx` and `Avatar.types.ts` | Neither file exists. The folder holds `index.ts`, `Avatar.test.tsx` and `Avatar.stories.tsx` | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's `Avatar` module carries its own.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Image | The image fills the avatar and is cropped to cover it, as in MUI |
| Children | Initials or an icon, in `common.white` on `grey[500]` |
| No image and no children | MUI's person icon, in the same colors |
| Image fails to load | The children, or the first letter of `alt`, or the person icon, in that order, in the same colors |
| `variant="circular"` | Round, as in MUI |
| `variant="rounded"` | The theme's 8px radius |
| `variant="square"` | No radius |
| Size | 40px, as in MUI. Other sizes are set with `sx` |
| Hover, focus, disabled | Don't apply. The avatar isn't interactive |

## Styling hooks

- **Theme key:** `components.MuiAvatar`. New variants use MUI's `AvatarPropsVariantOverrides`, augmented on `@mui/material/Avatar`.
- **Slots:** `root` for the `<div>`, `img` for the `<img>` and `fallback` for the person icon, as in MUI.
- **Default look:** MUI's avatar, with fallback colors that meet contrast. `src/theme/defaultTheme.ts` gains:

```ts
components: {
  // ...earlier components, unchanged
  MuiAvatar: {
    styleOverrides: {
      colorDefault: ({ theme }) => ({
        color: (theme.vars || theme).palette.common.white,
        backgroundColor: (theme.vars || theme).palette.grey[500],
      }),
    },
  },
},
```

**Why:** MUI draws the fallback in `background.default` on `grey[400]` in light mode and on `grey[600]` in dark mode. Under the library theme that's 2.56:1 and 2.62:1. Initials at MUI's 20px regular weight aren't large text, so they need 4.5:1. White on `grey[500]` gives 5.93 on both schemes, and the avatar stays visible against the background, at 5.78 in light mode and 3.40 in dark mode. One value covers both schemes, as with the input border.

**`colorDefault` only applies without a working image**, so photos aren't affected. A project's own `colorDefault` in `MuiAvatar.styleOverrides` replaces the library's, because `deepmerge` doesn't merge functions. The documentation must state this.

**Inside a Chip:** MUI's Chip sets its own text color on avatars, which would put `grey[700]` initials on the `grey[500]` background. Chip ([0013](./0013-chip.md#styling-hooks)) fixes that.

## Accessibility

- **Semantics:** a `<div>`, holding an `<img>` when there's an image. The person icon is an `aria-hidden` SVG.
- **Keyboard:** None. The avatar isn't interactive. A clickable avatar goes inside a Button or a link, which takes the focus and the name.
- **Naming:**
  - **Image:** `alt` names it. Pass the person's or item's name, or `alt=""` when the name is already shown next to it, as in a list row.
  - **Initials:** screen readers read the letters, such as "J D". When the avatar stands alone, pass `role="img"` and `aria-label` with the full name. When the name is shown next to it, pass `aria-hidden`.
  - **Icon or fallback:** has no name. Pass `role="img"` and `aria-label` if it carries meaning.
- **Focus:** None.
- **Contrast:** described under Styling hooks.

## Behavior and edge cases

- **Failing images:** MUI watches the image's load and switches to the fallback on error. A `src` that later starts working switches back.
- **Long initials:** the text isn't truncated. More than two letters can overflow a 40px avatar. Consumers pass at most two.
- **Other sizes:** `sx` sets `width` and `height`. Initials keep their 20px font unless `sx` sets `fontSize` too.
- **Non-square images:** cropped to fill the avatar.
- **Custom colors per person:** a consumer sets `sx={{ bgcolor }}`. The color must keep 4.5:1 with the text, and the library doesn't check it.
- **Without the library theme:** Avatar renders with the surrounding MUI theme and its colors. MUI's own `Avatar` used directly under the library theme gets the library look.
- **Server Components:** Avatar can be rendered from a Server Component.

## Acceptance criteria

- [ ] With `src` and `alt`, renders an `<img>` with that `src` and `alt`.
- [ ] With children, renders them, and without an image or children renders the fallback icon.
- [ ] When the image fails to load, renders the children, or the first letter of `alt`, or the fallback icon.
- [ ] `variant` changes the radius: round, the theme's 8px radius, or none.
- [ ] `ref` reaches the root `<div>`.
- [ ] `className`, `sx`, `style` and other props, such as `data-*` and `aria-*`, reach the root element.
- [ ] Each slot in `slotProps` reaches its element.
- [ ] Under the library theme, the fallback is `common.white` on `grey[500]`, on both color schemes.
- [ ] Under the library theme, an avatar with a working image doesn't get the fallback colors.
- [ ] A project-level `MuiAvatar` `styleOverrides.root` object changes the look and keeps the library's fallback colors.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Avatar renders with that theme.
- [ ] Storybook has a story for every variant and state, one for a failing image, and one showing a theme override.
- [ ] `Avatar` is exported from `src/index.ts` and added to the public API list in `tests/dist.test.ts`.

## Out of scope

- A `size` prop. Sizes are set with `sx`.
- A `name` prop that builds initials, an accessible name or a background color.
- Status dots, such as "online". A consumer wraps the avatar in a Badge with `variant="dot"`.
- `AvatarGroup`, for stacked avatars with a "+3" counter.
- Interactive avatars.

## Open questions

- **A `name` prop:** most projects show initials when a user has no photo, and each will write the same helper to build them. Decide whether to add `name`, which would turn the re-export into a wrapper, before or after Chip and the Navbar need it.

## Verified behavior

Checked on 2026-11-09 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Avatar.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Slots in `Avatar.d.ts` | `root`, `img` and `fallback` |
| Fallback order in `Avatar.js` | A working image, then the children, then the first letter of `alt` when an image was given, then the person icon |
| `colorDefault` in `Avatar.js` | Set when there's no working image. Text in `background.default`, background `palette.Avatar.defaultBg` with CSS variables, or `grey[400]` light and `grey[600]` dark without them |
| Override keys in `Avatar.js` | `root`, the variant name, and `colorDefault` |
| MUI's fallback on the library palette | 2.56 light, 2.62 dark |
| White on `grey[500]` | 5.93 |
| `grey[500]` on the backgrounds | 5.78 and 5.49 light, 3.40 and 3.22 dark |
| Rendered: fallback colors | `common.white` on `grey[500]` on both schemes, which replaces MUI's per-scheme `Avatar.defaultBg` variable |
| Rendered: failing image | jsdom never loads images, so the tests stub `Image` to fire `load` or `error`. The fallback order matches the source, and a later working `src` shows the image again |
| Rendered: working image | No `MuiAvatar-colorDefault` class and no fallback colors |
