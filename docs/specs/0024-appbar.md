# 0024: AppBar

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

The bar at the top of an app or a page, holding its title, a menu button and actions. MUI's `AppBar` is only the surface: a consumer also adds a `Toolbar` inside it for the height and padding, and picks a `position`, knowing that MUI's default, `fixed`, covers the top of the page unless they add a spacer. MUI's default color, `primary`, also puts text below the contrast WCAG asks for under the library theme. See Styling hooks.

This library's `AppBar` is MUI's `AppBar` with the `Toolbar` already inside, and theme defaults that give a bar on the page's surface color, without a shadow, that stays at the top while the page scrolls. It's the thin wrapper. Navbar ([0025](./0025-navbar.md)) is the data-driven composite built on it, which answers the [roadmap question](./roadmap.md#questions-for-later-specs) about where the line between them falls: AppBar takes `children`, and Navbar takes `items`.

**Use it for:** the top bar of an app whose content the project lays out itself, such as a title and two icon buttons. The top bar of a dialog or a section, with `position="static"`.

**Don't use it for:**

- The site's main navigation with links. Use Navbar, which adds the links, the current page and the narrow-screen menu.
- A toolbar of actions inside a page, such as above a table. Use a row of Buttons, or Table's `toolbar` ([0023](./0023-table.md)).
- A banner with a message. Use Alert.

## Usage

```tsx
import { AppBar, Typography } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'

<AppBar>
  <IconButton edge="start" aria-label="Open navigation" onClick={openSidebar}>
    <MenuIcon />
  </IconButton>
  <Typography variant="h6" component="p" sx={{ flexGrow: 1 }}>
    Dashboard
  </Typography>
  <IconButton aria-label="Notifications">
    <NotificationsIcon />
  </IconButton>
</AppBar>

<AppBar position="static" color="primary" slotProps={{ toolbar: { variant: 'dense' } }}>
  <Typography variant="h6" component="h2">Edit project</Typography>
</AppBar>
```

## API

`AppBar` is a component of this library, in `src/components/AppBar/`, built on MUI's `AppBar` and `Toolbar`.

```ts
export { AppBar } from './AppBar.tsx'
export type { AppBarProps } from './AppBar.types.ts'
```

It takes MUI's `AppBar` props, such as `position`, `color`, `elevation`, `enableColorOnDark`, `component`, `sx` and `className`, which reach the root. It adds:

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | `undefined` | No | The bar's content, inside MUI's `Toolbar` |
| `slotProps` | `{ toolbar?: Partial<ToolbarProps> }` | `undefined` | No | Props for the `Toolbar`, such as `variant="dense"` or `disableGutters` |

```ts
export interface AppBarProps extends Omit<MuiAppBarProps, 'children'> {
  children?: ReactNode
  slotProps?: {
    /** MUI's `Toolbar`, the row inside the bar. */
    toolbar?: Partial<Omit<ToolbarProps, 'children'>>
  }
}
```

MUI's `AppBar` has no `slotProps` of its own, so this one doesn't collide.

**Typing:** `AppBar` is typed as `(props: AppBarProps) => ...`, as Card is ([0018](./0018-card.md#api)). `component` changes the root element, such as to `div` for a bar inside a dialog. Props of another component passed through `component` aren't type-checked.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: remaining props reach the root | `children` goes inside the `Toolbar`, not directly in the root | A bar without a `Toolbar` has no height or padding. A consumer who wants the bare surface uses MUI's `AppBar` |

No `'use client'` directive is needed, because `AppBar.tsx` uses no hooks and passes no functions of its own.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | `position="sticky"`, `color="default"` and `elevation={0}`, from the theme: a bar on `background.paper` with `text.primary`, a 1px `divider` line at the bottom, no shadow, 56px high on small screens and 64px from `sm` up, with 16px and then 24px of padding at the sides |
| `slotProps.toolbar.variant="dense"` | MUI's 48px bar |
| `color="primary"` and other palette colors | MUI's: the color's `main` behind its `contrastText`. See Styling hooks for contrast |
| `color="transparent"` and `"inherit"` | MUI's |
| `position` | MUI's `fixed`, `absolute`, `sticky`, `static` and `relative`. `fixed` needs a spacer, as in MUI |
| `elevation` | MUI's shadows, if a project wants one |
| Dark mode | `background.paper` and `text.primary` of the dark scheme |

## Styling hooks

- **Theme key:** `components.MuiAppBar` and `components.MuiToolbar`.
- **Slots:** `toolbar`, for MUI's `Toolbar`. The root is reached with `sx` and `className`.
- **Default look:** `src/theme/defaultTheme.ts` gains:

```ts
colorSchemes: {
  light: { palette: { /* ...unchanged */ AppBar: { defaultBg: 'hsl(220, 35%, 97%)' } } },
  dark: { palette: { /* ...unchanged */ AppBar: { defaultBg: 'hsl(220, 30%, 7%)' } } },
},
components: {
  // ...earlier components, unchanged
  // MUI's default `primary` bar puts `contrastText` on `primary.main` at 3.65:1,
  // below 4.5:1 for the bar's title. A bar on the paper color, with a line
  // instead of a shadow, matches the library's flat surfaces. Sticky, so it
  // needs no spacer.
  MuiAppBar: {
    defaultProps: { color: 'default', elevation: 0, position: 'sticky' },
    styleOverrides: {
      root: {
        variants: [
          {
            props: { color: 'default' },
            style: ({ theme }) => ({
              borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
            }),
          },
        ],
      },
    },
  },
},
```

The `defaultBg` values are each scheme's `background.paper`, written out because the palette is built before `background` can be referenced. They come from the same tokens, so the implementation imports them from where `background.paper` is defined rather than repeating the string.

**Why `defaultBg`:** with `cssVariables`, MUI's `color="default"` reads `palette.AppBar.defaultBg`, which is `grey[100]` in light mode and `grey[900]` in dark mode. In dark mode it also uses `palette.AppBar.darkBg` and `darkColor`, which MUI already sets to `background.paper` and `text.primary`. Setting `defaultBg` gives the paper color in both schemes.

**These defaults apply to every MUI `AppBar`** under the library theme, as `MuiButton`'s `disableElevation` does. A project that wants MUI's default sets `MuiAppBar.defaultProps` back, such as `{ color: 'primary', position: 'fixed' }`. The documentation must state this, and that `color="primary"` fails 4.5:1 for normal text.

## Accessibility

- **Semantics:** the root is a `<header>`, MUI's default, which is a `banner` landmark when it isn't inside `<article>`, `<aside>`, `<main>`, `<nav>` or `<section>`. A page has one banner. A bar inside a dialog or section should use `component="div"`, or stays a plain header there.
- **Keyboard:** AppBar adds nothing. Its children are reached with `Tab`, in order.
- **Naming:** the banner landmark needs no name. The title is the consumer's: use a heading only when it is the page's heading, otherwise `component="p"`, as in the first example.
- **Focus:** the children show the theme's focus ring. On colored bars, MUI adds a ring in `background.default` around focused children, so it shows against the color.
- **Contrast:** `text.primary` on the default bar is 18.00 light and 19.09 dark. `primary.contrastText` on `color="primary"` is 3.65 on both schemes, which meets 3:1 for icons and text of 18.66px bold or 24px, but not 4.5:1 for normal text.

## Behavior and edge cases

- **Sticky inside a scrolling container:** `position: sticky` sticks to the nearest scrolling ancestor, so a bar inside a scrolling `<div>` sticks to the top of that `<div>`, not the window.
- **`overflow: hidden` on an ancestor:** stops `sticky` from working, as in CSS. Use `fixed` with a spacer there.
- **Links to anchors on the page:** the target scrolls under the bar. The consumer sets `scroll-margin-top` on targets.
- **Many children:** the `Toolbar` is a flex row that doesn't wrap, so children overflow on narrow screens. Hide some below a breakpoint, or use Navbar, which collapses its items.
- **Printing:** a `fixed` bar prints at the top of the first page only, as in MUI. `sticky` prints in place.
- **Without the library theme:** AppBar renders with the surrounding theme's defaults, which in plain MUI is a fixed `primary` bar with a shadow.
- **Server Components:** AppBar can be rendered from a Server Component. MUI's `AppBar` and `Toolbar` are client components, which a Server Component can render.

## Acceptance criteria

- [ ] Renders a `banner` landmark with its children inside a `Toolbar`.
- [ ] Under the library theme, the bar is sticky, has no shadow, and uses `background.paper`, `text.primary` and a `divider` line at the bottom, in light and dark mode.
- [ ] `position`, `color`, `elevation` and `component` reach MUI's `AppBar` and win over the theme's defaults.
- [ ] `slotProps.toolbar` reaches the `Toolbar`, and `variant="dense"` makes the bar 48px high.
- [ ] `ref` reaches the root, and `className`, `sx` and other props, such as `data-*`, reach it too.
- [ ] A project-level `MuiAppBar.defaultProps.color` of `'primary'` applies to every AppBar.
- [ ] A project-level `MuiAppBar` `styleOverrides.root` object changes the bar and keeps the library's bottom line on `color="default"`.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, AppBar renders with that theme.
- [ ] Works with the keyboard as listed under Accessibility.
- [ ] Storybook has a story for the default bar, every `color`, dense, `static` inside a dialog-like box, a long page that shows it sticking, and one showing a theme override.
- [ ] `AppBar` and `AppBarProps` are exported from `src/index.ts`, and `AppBar` is added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Hiding the bar on scroll down and showing it on scroll up.
- A bar that shrinks or gains a shadow on scroll.
- A bottom app bar.
- Props for a title, a menu button or actions. Those are Navbar's.
- Exporting MUI's `Toolbar` on its own. It can be imported from MUI.

## Open questions

- **Default `position`:** `sticky` avoids the spacer that `fixed` needs, but doesn't work under an ancestor with `overflow: hidden`, which some layouts have. Confirm `sticky`.
- **Primary bars:** a darker `primary` for colored bars would fix their contrast. Decide whether that's worth a theme change, or whether `color="primary"` stays documented as below 4.5:1.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`. The rows from the source were rechecked on implementing, and the rendered rows are covered by `AppBar.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Defaults in `AppBar.js` | `color="primary"`, `position="fixed"`, `enableColorOnDark={false}`, `component="header"`, `elevation={4}` |
| `color="default"` in `AppBar.js` | Sets `--AppBar-background` to `palette.AppBar.defaultBg` and `--AppBar-color` to `text.primary` with CSS variables |
| Dark mode in `AppBar.js` | Without `enableColorOnDark`, uses `palette.AppBar.darkBg` and `darkColor`, falling back to `--AppBar-background` and `--AppBar-color` |
| `createThemeWithVars.js` | `AppBar.defaultBg` is `grey[100]` light and `grey[900]` dark. `darkBg` is `background.paper` and `darkColor` is `text.primary`. `setColor` only fills keys that aren't set, so a theme's own `defaultBg` is kept |
| `Toolbar.js` | `variant="regular"` by default, `dense` is 48px high, `gutters` add padding at the sides |
| `primary.contrastText` on `primary.main` | 3.65 on both schemes |
| `text.primary` on `background.paper` | 18.00 light, 19.09 dark |
