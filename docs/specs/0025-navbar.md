# 0025: Navbar

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Composite
- **Depends on:** [0000](./0000-architecture.md), [0001](./0001-button.md), [0004](./0004-link.md), [0021](./0021-menu.md), [0024](./0024-appbar.md)

## Purpose

The site's main navigation in a bar across the top: the brand, which links home, a row of links to the main sections, with groups of links in a dropdown, the current page marked, and actions at the end, such as the account menu. On narrow screens the links move into a menu behind a button.

Building it from AppBar, Buttons and Menus means each project writes the current-page logic, the `aria-current`, the dropdowns, the responsive switch and the `<nav>` structure. This library's `Navbar` takes `items` and a `value` for the current page and does that.

Navbar is the data-driven composite built on AppBar ([0024](./0024-appbar.md)), as the [roadmap](./roadmap.md#questions-for-later-specs) planned.

**Use it for:** the main navigation of a site or app with a handful of sections, such as "Products", "Pricing", "Docs" and "Blog".

**Don't use it for:**

- Apps with many sections, or sections with many sub-pages, such as an admin dashboard. Use Sidebar ([0026](./0026-sidebar.md)), with an AppBar for the title and actions.
- A bar with only a title and actions. Use AppBar.
- Switching between views of one page. Use Tabs ([0019](./0019-tabs.md)).

## Usage

```tsx
import { Avatar, Menu, Navbar } from '@cmotino/cm-web-components'
import type { NavbarItem } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'

const items: NavbarItem[] = [
  { id: 'products', label: 'Products', href: '/products' },
  {
    id: 'resources',
    label: 'Resources',
    children: [
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'blog', label: 'Blog', href: '/blog' },
    ],
  },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
]

<Navbar
  brand={<img src="/logo.svg" alt="Acme" height={28} />}
  brandHref="/"
  items={items}
  value={currentSectionId}
  actions={
    <Menu
      trigger={
        <IconButton aria-label="Account">
          <Avatar src={user.photoUrl} alt="" sx={{ width: 32, height: 32 }} />
        </IconButton>
      }
      placement="bottom-end"
      items={[
        { id: 'profile', label: 'Profile', href: '/profile' },
        { id: 'sign-out', label: 'Sign out', onClick: signOut },
      ]}
    />
  }
/>
```

## API

`Navbar` is a component of this library, in `src/components/Navbar/`, built on the library's AppBar, Button, Link and Menu.

```ts
export { Navbar } from './Navbar.tsx'
export type { NavbarProps, NavbarItem, NavbarLabels } from './Navbar.types.ts'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly NavbarItem<Id>[]` | | Yes | The links and groups, in display order |
| `value` | `Id \| null` | `undefined` | No | The current page's item. Its link gets `aria-current="page"`, and its group shows as current too |
| `onItemClick` | `(event: MouseEvent<HTMLElement>, id: Id) => void` | `undefined` | No | Called when the user follows a link, in the bar or in a menu |
| `brand` | `ReactNode` | `undefined` | No | The logo or the site's name, at the start |
| `brandHref` | `string` | `undefined` | No | Makes `brand` a link, usually to `/` |
| `actions` | `ReactNode` | `undefined` | No | Content at the end, such as a search button or the account Menu. Shown on every screen size |
| `collapseBelow` | `Breakpoint \| false` | `'md'` | No | Below this breakpoint, the links move into a menu. `false` never collapses |
| `labels` | `Partial<NavbarLabels>` | English labels | No | Text that Navbar adds, for other languages |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

`Navbar` also takes AppBar's props, such as `position`, `color`, `sx`, `className` and `ref`, which reach the AppBar, the root. It's generic, as `Navbar<Id extends string | number = string>`, and `Id` is inferred from `items`.

```ts
export interface NavbarProps<Id extends string | number = string>
  extends Omit<AppBarProps, 'children' | 'slotProps'> {
  items: readonly NavbarItem<Id>[]
  value?: Id | null
  onItemClick?: (event: MouseEvent<HTMLElement>, id: NoInfer<Id>) => void
  brand?: ReactNode
  brandHref?: string
  actions?: ReactNode
  collapseBelow?: Breakpoint | false
  labels?: Partial<NavbarLabels>
  slotProps?: {
    /** MUI's `Toolbar`, through AppBar. */
    toolbar?: Partial<Omit<ToolbarProps, 'children'>>
    /** The brand's Link, or its `<div>` without `brandHref`. */
    brand?: Partial<LinkProps>
    /** The `<nav>`. */
    nav?: ComponentProps<'nav'>
    /** Every link Button and group Button in the bar. */
    item?: Partial<Omit<ButtonProps, 'href' | 'onClick'>>
    /** Every Menu: the groups' and the collapsed one's. */
    menu?: Partial<Omit<MenuProps, 'trigger' | 'items'>>
    /** The button that opens the collapsed menu. */
    menuButton?: Partial<IconButtonProps>
    /** The `<div>` around `actions`. */
    actions?: ComponentProps<'div'>
  }
}
```

### Layout

From left to right, in a left-to-right layout: the brand, the `<nav>` with the links, a flexible space, then `actions`. Below `collapseBelow`, the `<nav>` holds only a menu button, placed before the brand, and the links go into its Menu.

**Links:** a top-level link is a `text` Button with `color="inherit"` and `href`, so it renders through `MuiButtonBase.defaultProps.LinkComponent`, as set up in [0004](./0004-link.md#usage). The brand is a Link with `underline="none"`, through `MuiLink.defaultProps.component`. This answers the [roadmap question](./roadmap.md#questions-for-later-specs) for Navbar: no router dependency, and the same theme setup as Link and Tabs.

**Groups:** an item with `children` is a `text` Button with a chevron, which is the `trigger` of a Menu ([0021](./0021-menu.md)) whose items are the children, as links. Choosing one follows it and calls `onItemClick`.

**Collapsed:** below `collapseBelow`, one Menu holds every item. A group's children follow the group's position, flattened, with a `divider` before and after them. The group's own label isn't shown. See [Open questions](#open-questions).

**Responsive switch:** both layouts are rendered, and CSS hides one with `display: none` at the breakpoint, from `theme.breakpoints`. There's no `useMediaQuery`, so the first render on the server already matches the screen, without a flash.

### Theme key

Navbar reads its props through `useThemeProps({ props, name: 'CmNavbar' })`, and styles its parts with MUI's `styled`, with `name: 'CmNavbar'` and the slots `root`, `brand`, `nav`, `item` and `actions`. The class names `CmNavbar-root`, `CmNavbar-brand`, `CmNavbar-nav`, `CmNavbar-item` and `CmNavbar-actions` are added to those elements. The key is declared through module augmentation in `Navbar.types.ts`, as [0019](./0019-tabs.md#theme-key) does for `CmTabs`.

### Exceptions to the architecture spec

None. The root is the AppBar, so `sx`, `className`, `ref` and the remaining props reach it.

`Navbar.tsx` starts with `'use client'`, because Menu keeps state and Navbar calls `useId`, and is added to `tests/dist.test.ts`.

## Data shapes

```ts
interface NavbarItemBase<Id extends string | number> {
  /** Unique within the whole tree of `items`. Used as the React key, compared with `value`, and reported by `onItemClick`. */
  id: Id
  /** The visible text. It's also the accessible name. */
  label: ReactNode
  /** Shown before the label, in the bar and in menus. */
  icon?: ReactNode
}

export type NavbarItem<Id extends string | number = string> = NavbarItemBase<Id> &
  (
    | { /** The link's URL. */ href: string; children?: never }
    | { /** Links shown in a dropdown. One level only. */ children: readonly (NavbarItemBase<Id> & { href: string })[]; href?: never }
  )

export interface NavbarLabels {
  /** The `<nav>`'s accessible name. */
  nav: string
  /** The collapsed menu button's accessible name. */
  openMenu: string
}
```

Default labels, in English: "Main" and "Open navigation menu".

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | AppBar's default look, 64px from `sm` up. The brand, then the links 4px apart, then the actions at the end |
| Link | A `text` Button in `text.primary`, MUI's hover background |
| Current link, or a group holding it | The label in `primary.dark` in light mode and `primary.main` in dark mode, as Tabs does ([0019](./0019-tabs.md#styling-hooks)), and a 2px `primary.main` line under the label |
| Keyboard focus | The theme's focus ring, from [0001](./0001-button.md#styling-hooks) |
| Group | A chevron after the label, pointing up while its Menu is open |
| Collapsed | Below `collapseBelow`: a menu button with a hamburger icon, the brand, and the actions |
| Current item in a menu | Its `menuitem` has `aria-current="page"` and MUI's selected background, through Menu's `current` ([0021](./0021-menu.md#data-shapes)) |
| No items | The brand and actions only, with no `<nav>` and no menu button |
| `color` other than `default` | AppBar's colors. Links inherit the bar's text color, and the current link is marked by the line only, drawn in that text color, since `primary.main` wouldn't show on a `primary` bar |

## Styling hooks

- **Theme keys:** `components.CmNavbar`, with the slots `root`, `brand`, `nav`, `item` and `actions`, and default props for every Navbar prop. The parts also use `MuiAppBar`, `MuiToolbar`, `MuiButton`, `MuiLink`, `MuiIconButton` and `CmMenu`.
- **Slots:** `toolbar`, `brand`, `nav`, `item`, `menu`, `menuButton` and `actions`, as typed under API. The root is reached with `sx` and `className`.
- **Default look:** AppBar's, with link Buttons from the library's tokens. Navbar's own `item` style adds the current label color and line. The chevron and hamburger icons are made with `createSvgIcon` from `@mui/material/utils`, as the architecture spec requires.

**Why the line:** color alone doesn't meet WCAG 2.2 AA 1.4.1 for showing the current page. The line is `primary.main`, at 3.84 or more against the bar in both schemes, which meets 3:1. On a colored bar it's the bar's text color, the `contrastText` of its color.

## Accessibility

- **Semantics:** the AppBar's `<header>`, a `banner` landmark, holds a `<nav>` named by `labels.nav`, with a `<ul>` of `<li>`, one per item. Links are `<a>`. A group is a `<button>` with `aria-haspopup="menu"` and `aria-expanded`, from Menu.
- **Current page:** the current link has `aria-current="page"`, in the bar and in the menus. A group holding it has no `aria-current`, because it isn't a link. Its look shows it.
- **Keyboard:**
  - `Tab` moves through the brand, the links and groups, and the actions, in order.
  - `Enter` follows a link. On a group or the menu button, `Enter`, `Space` and `ArrowDown` open its Menu, which works as in [0021](./0021-menu.md#accessibility). `Escape` closes it and returns focus to the button.
- **Naming:** the `<nav>` is named by `labels.nav`. Pass a different name when the page has another `<nav>`, such as Sidebar's. The menu button is named by `labels.openMenu`. The brand link is named by its content, so an image needs `alt`, as in the example.
- **Focus:** following a link moves focus as the router decides. Navbar doesn't move it.
- **Skip link:** a "Skip to content" link before the Navbar is the consumer's.
- **Contrast:** link text is `text.primary`, at 18 or more. The current label is `primary.dark` at 6.31 on light paper and `primary.main` at 4.60 on dark paper.

## Behavior and edge cases

- **Duplicate ids:** React logs key warnings. Ids must be unique across groups.
- **A `value` that isn't in `items`:** nothing shows as current.
- **More links than fit above `collapseBelow`:** the bar overflows sideways. Raise `collapseBelow`, such as to `'lg'`, or use fewer items.
- **Long labels:** they don't wrap in the bar. Keep them to one or two words.
- **Many `actions` on narrow screens:** they stay visible and take room from the brand. Keep them to one or two icon buttons.
- **Both layouts in the DOM:** the hidden one has `display: none`, so it isn't focusable or read by screen readers. Its Menus are closed, so they render nothing.
- **Following a link inside a Menu:** the Menu closes and returns focus to its button, then the router navigates.
- **`onItemClick`:** called for links, not for opening a group. Use it for analytics or to close something, not to navigate.
- **Without the library theme:** Navbar renders with the surrounding MUI theme, so the bar is MUI's fixed `primary` bar unless `position` and `color` are passed.
- **Server Components:** Navbar is a client component. `items` can come from a Server Component, as long as `label` and `icon` are serializable or Server Component elements.

## Acceptance criteria

- [ ] Renders a `banner` with a `navigation` named "Main", holding a `list` with one link for each item with `href`, in order, through the theme's `MuiButtonBase.defaultProps.LinkComponent`.
- [ ] `brand` with `brandHref` renders a link before the navigation, through `MuiLink.defaultProps.component`. Without `brandHref`, it isn't a link.
- [ ] The item matching `value` has `aria-current="page"` and the current style. A group holding it has the current style.
- [ ] A group renders a button that opens a Menu with its children as links, and choosing one calls `onItemClick` with its `id`.
- [ ] Below `collapseBelow`, the links are hidden and a button named "Open navigation menu" opens a Menu with every link, groups flattened between dividers. At or above it, the button is hidden. `collapseBelow={false}` never collapses.
- [ ] The first render, including on the server, has both layouts, with the right one hidden by CSS.
- [ ] `actions` render at the end on every screen size.
- [ ] Without items, there's no navigation and no menu button.
- [ ] `labels` replaces the default names.
- [ ] `position`, `color`, `ref`, `className`, `sx` and other props, such as `data-*`, reach the AppBar.
- [ ] Every entry in `slotProps` reaches its elements.
- [ ] The parts have the `CmNavbar-root`, `CmNavbar-brand`, `CmNavbar-nav`, `CmNavbar-item` and `CmNavbar-actions` classes.
- [ ] Type check: `Id` is inferred from `items`, `onItemClick` receives that type, an item with both `href` and `children` fails, and a child without `href` fails.
- [ ] Under the library theme, the current label is `primary.dark` in light mode and `primary.main` in dark mode, with a `primary.main` line.
- [ ] A project-level `CmNavbar.defaultProps.collapseBelow` of `'lg'` applies to every Navbar.
- [ ] A project-level `CmNavbar` `styleOverrides.item` object changes the links.
- [ ] Type check: `createCmTheme({ components: { CmNavbar: { defaultProps: { collapseBelow: 'sm' }, styleOverrides: { brand: { marginRight: 32 } } } } })` compiles, and an unknown slot name fails.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Navbar renders with that theme.
- [ ] Works with the keyboard as listed under Accessibility.
- [ ] Storybook has a story with links only, with groups, with an account Menu in `actions`, collapsed on a narrow viewport, with a current item inside a group, with `color="primary"`, and one showing a theme override.
- [ ] `Navbar`, `NavbarProps`, `NavbarItem` and `NavbarLabels` are exported from `src/index.ts`, and `Navbar` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- Mega menus, with columns or descriptions.
- More than one level of groups.
- A search field built into the bar. It goes in `actions`.
- A drawer for the collapsed menu. Navbar uses Menu.
- Hiding the bar on scroll.
- Links that open in a new tab with an icon.
- Matching nested routes to an item. The consumer maps the route to `value`.

## Open questions

- **Groups as menus:** the WAI-ARIA authoring practices prefer a disclosure button with a plain list of links for site navigation, over `role="menu"`, which makes screen readers switch modes. This spec uses Menu, as the roadmap's dependencies planned. Decide whether that's acceptable, or whether groups render a disclosure, which Menu would need as a mode.
- **Collapsed groups:** flattening loses the group's label in the collapsed menu. A drawer with a nested List ([0020](./0020-list.md)) would keep it, at the cost of a dependency on List. Decide which to use.

## Verified behavior

Checked on 2026-11-10, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`. Rechecked on implementing, and covered by `Navbar.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Current label on `background.paper` | `primary.dark` 6.31 light, `primary.main` 4.60 dark |
| Current line on `background.paper` | `primary.main` 3.84 light, 4.60 dark |
| Link text on `background.paper` | `text.primary` 18.00 light, 19.09 dark |
