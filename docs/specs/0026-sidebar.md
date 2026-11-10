# 0026: Sidebar

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Composite
- **Depends on:** [0000](./0000-architecture.md), [0004](./0004-link.md), [0020](./0020-list.md)

## Purpose

The main navigation of an app in a column at the side, such as an admin dashboard with "Overview", "Orders", "Customers" and "Settings", with sections, icons, counts, nested pages and the current page marked. On wide screens it stays in place beside the content. On narrow screens it slides in over the content when the user opens it, and closes when they pick a page.

MUI's `Drawer` handles the panel, but each project builds the list inside it, the current-page logic, the two drawers of a responsive layout, the widths, and closing on navigation. This library's `Sidebar` takes `items` and a `value` for the current page and does that, with List ([0020](./0020-list.md)) for the items.

**Use it for:** apps with more sections than fit in a top bar, or sections with sub-pages. Dashboards and admin tools.

**Don't use it for:**

- Sites with a handful of sections. Use Navbar ([0025](./0025-navbar.md)).
- Filters or details beside a list. That's a panel in the page's layout, or MUI's `Drawer` directly.
- The sections of one page, such as a table of contents. Use a List of links in the page.

## Usage

```tsx
import { AppBar, Sidebar, Typography } from '@cmotino/cm-web-components'
import type { SidebarSection } from '@cmotino/cm-web-components'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Overview', icon: <HomeIcon />, href: '/' },
      { id: 'orders', label: 'Orders', icon: <ReceiptIcon />, href: '/orders', end: pendingCount },
      {
        id: 'customers',
        label: 'Customers',
        icon: <PeopleIcon />,
        children: [
          { id: 'customers-list', label: 'All customers', href: '/customers' },
          { id: 'segments', label: 'Segments', href: '/customers/segments' },
        ],
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    items: [{ id: 'settings', label: 'Settings', icon: <SettingsIcon />, href: '/settings' }],
  },
]

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        sections={sections}
        value={currentPageId}
        open={open}
        onOpenChange={(_, open) => setOpen(open)}
        header={<img src="/logo.svg" alt="Acme" height={28} />}
        footer={<UserCard user={user} />}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar>
          <IconButton
            edge="start"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="p">Orders</Typography>
        </AppBar>
        <Box component="main" sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  )
}
```

## API

`Sidebar` is a component of this library, in `src/components/Sidebar/`, built on MUI's `Drawer` and the library's List.

```ts
export { Sidebar } from './Sidebar.tsx'
export type { SidebarProps, SidebarItem, SidebarSection } from './Sidebar.types.ts'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `readonly SidebarItem<Id>[]` | | One of `items` or `sections` | The links, in one section without a title |
| `sections` | `readonly SidebarSection<Id>[]` | | One of `items` or `sections` | Groups of links, each with an optional title |
| `value` | `Id \| null` | `undefined` | No | The current page's item. Its link gets `aria-current="page"` |
| `onItemClick` | `(event: MouseEvent<HTMLElement>, id: Id) => void` | `undefined` | No | Called when the user follows a link |
| `expanded`, `defaultExpanded`, `onExpandedChange` | As in List | | No | The expanded parent items. See [0020](./0020-list.md#expansion). Uncontrolled, the parents of the current item start expanded |
| `variant` | `'responsive' \| 'permanent' \| 'temporary'` | `'responsive'` | No | `permanent` is always beside the content, `temporary` always slides in, and `responsive` switches at `breakpoint` |
| `breakpoint` | `Breakpoint` | `'md'` | No | With `responsive`, permanent from this breakpoint up, temporary below |
| `open` | `boolean` | `undefined` | No | Controlled open state of the temporary drawer |
| `defaultOpen` | `boolean` | `false` | No | Initial open state when uncontrolled |
| `onOpenChange` | `(event: SyntheticEvent \| Event, open: boolean) => void` | `undefined` | No | Called when the temporary drawer asks to close: `Escape`, a click on the backdrop, or a link followed |
| `width` | `number \| string` | `240` | No | The sidebar's width, in pixels or as a CSS length |
| `header` | `ReactNode` | `undefined` | No | Content at the top, such as the logo or a workspace switcher |
| `footer` | `ReactNode` | `undefined` | No | Content at the bottom, such as the signed-in user |
| `anchor` | `'left' \| 'right'` | `'left'` | No | MUI's: the side the sidebar is on. In right-to-left layouts, `left` is shown on the right, as in MUI |
| `aria-label` | `string` | `'Main'` | No | Names the `<nav>`, and the temporary drawer's dialog |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

`Sidebar` also takes `sx`, `className`, `ref` and other props of a `<div>`, which reach the root. It's generic, as `Sidebar<Id extends string | number = string>`, and `Id` is inferred from `items` or `sections`.

```ts
interface SidebarPropsBase<Id extends string | number>
  extends Omit<ComponentProps<'div'>, 'children'> {
  value?: Id | null
  onItemClick?: (event: MouseEvent<HTMLElement>, id: NoInfer<Id>) => void
  expanded?: readonly Id[]
  defaultExpanded?: readonly Id[]
  onExpandedChange?: (event: MouseEvent<HTMLElement>, expanded: NoInfer<Id>[]) => void
  variant?: 'responsive' | 'permanent' | 'temporary'
  breakpoint?: Breakpoint
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (event: SyntheticEvent | Event, open: boolean) => void
  width?: number | string
  header?: ReactNode
  footer?: ReactNode
  anchor?: 'left' | 'right'
  sx?: SxProps<Theme>
  slotProps?: {
    /** Both MUI `Drawer`s. */
    drawer?: Partial<Omit<MuiDrawerProps, 'variant' | 'open' | 'onClose' | 'anchor' | 'children'>>
    /** Both drawers' paper. */
    paper?: Partial<PaperProps>
    /** The `<div>` around `header`. */
    header?: ComponentProps<'div'>
    /** The `<nav>`, which scrolls when the items don't fit. */
    nav?: ComponentProps<'nav'>
    /** Every section's List. */
    list?: Partial<Omit<ListProps<Id>, 'items' | 'value' | 'onChange' | 'expanded' | 'defaultExpanded' | 'onExpandedChange'>>
    /** The `<div>` around `footer`. */
    footer?: ComponentProps<'div'>
  }
}

export type SidebarProps<Id extends string | number = string> = SidebarPropsBase<Id> &
  (
    | { items: readonly SidebarItem<Id>[]; sections?: never }
    | { sections: readonly SidebarSection<Id>[]; items?: never }
  )
```

### Layout

- **Root:** a `<div>` that takes `width` from the point the sidebar is permanent, and `0` below it, with `flex-shrink: 0`. Placed first in a flex row, as in the example, it reserves the sidebar's room beside the content.
- **Permanent drawer:** MUI's `Drawer` with `variant="permanent"`, inside the root. Its paper is `position: fixed`, the full height of the window, and `width` wide, as in MUI's responsive drawer.
- **Temporary drawer:** MUI's `Drawer` with `variant="temporary"`, in a portal, with `ModalProps.keepMounted`, so it opens quickly and its links are in the server's HTML.
- **Responsive:** both drawers are rendered, and CSS hides one with `display: none` at `breakpoint`, from `theme.breakpoints`, as Navbar does. There's no `useMediaQuery`, so the first render on the server already matches the screen.
- **Inside the paper:** `header`, then the `<nav>` with one List per section, which grows and scrolls, then `footer`. Each section's `title` is its List's `subheader`, and a `divider` separates sections.

**Links:** items are List items with `href`, so they render through `MuiButtonBase.defaultProps.LinkComponent`, as set up in [0004](./0004-link.md#usage). This answers the [roadmap question](./roadmap.md#questions-for-later-specs) for Sidebar: no router dependency, and the same theme setup as Link, Tabs, List and Navbar.

**Current page:** `value` is passed to every section's List, so the current link gets List's selected style and `aria-current="page"` ([0020](./0020-list.md#selection)).

**Closing on navigation:** following a link in the temporary drawer calls `onItemClick`, then `onOpenChange(event, false)`, and closes an uncontrolled drawer. Following one in the permanent drawer only calls `onItemClick`.

### Theme key

Sidebar reads its props through `useThemeProps({ props, name: 'CmSidebar' })`, and styles its parts with MUI's `styled`, with `name: 'CmSidebar'` and the slots `root`, `paper`, `header`, `nav` and `footer`. The class names `CmSidebar-root`, `CmSidebar-paper`, `CmSidebar-header`, `CmSidebar-nav` and `CmSidebar-footer` are added to those elements. The key is declared through module augmentation in `Sidebar.types.ts`, as [0019](./0019-tabs.md#theme-key) does for `CmTabs`.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: remaining props reach the root | `aria-label` names the `<nav>` and the temporary drawer, not the root | They name the navigation. On the root `<div>`, which has no role, they would name nothing |

`Sidebar.tsx` starts with `'use client'`, because it keeps state, and is added to `tests/dist.test.ts`.

## Data shapes

```ts
interface SidebarItemBase<Id extends string | number> {
  /** Unique within the whole sidebar. Used as the React key, compared with `value`, and reported by `onItemClick`. */
  id: Id
  /** The visible text. It's also the accessible name, with `end`. */
  label: ReactNode
  /** Shown before the label. */
  icon?: ReactNode
  /** Non-interactive content at the end, such as a count. Part of the accessible name. */
  end?: ReactNode
  /**
   * Shown but not interactive.
   * @default false
   */
  disabled?: boolean
}

export type SidebarItem<Id extends string | number = string> = SidebarItemBase<Id> &
  (
    | { /** The link's URL. */ href: string; children?: never }
    | { /** Nested links, shown when the item is expanded. */ children: readonly SidebarItem<Id>[]; href?: never }
  )

export interface SidebarSection<Id extends string | number = string> {
  /** Unique within `sections`. Used as the React key. */
  id: string
  /** A heading above the section's items, in List's `subheader`. */
  title?: ReactNode
  items: readonly SidebarItem<Id>[]
}
```

A Sidebar item maps to a List item: `label` to `primary`, and `icon`, `end`, `disabled`, `href` and `children` as they are. Every item is a link or a parent, so there are no buttons without a destination.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default, permanent | A column `width` wide, the full height of the window, on `background.paper`, with MUI's 1px `divider` line on the content side |
| Temporary, closed | Nothing visible |
| Temporary, open | The panel slides in from the side over a backdrop, with MUI's shadow for a temporary drawer |
| Item, hover, focus, selected, disabled | As in List ([0020](./0020-list.md#variants-and-states)), including the selected bar on the start edge |
| Parent, collapsed and expanded | As in List |
| Section titles | List's subheader, in `text.secondary` |
| With `header` and `footer` | Fixed at the top and bottom of the panel, with 16px of padding. The `<nav>` scrolls between them |
| Many items | The `<nav>` scrolls. `header` and `footer` stay visible |

## Styling hooks

- **Theme keys:** `components.CmSidebar`, with the slots `root`, `paper`, `header`, `nav` and `footer`, and default props for every Sidebar prop. The parts also use `MuiDrawer`, `MuiPaper`, `MuiBackdrop` and `CmList`.
- **Slots:** `drawer`, `paper`, `header`, `nav`, `list` and `footer`, as typed under API. The root is reached with `sx` and `className`.
- **Default look:** MUI's drawer with the library's tokens, and List's items. Sidebar's own styles set the width, the flex column inside the paper, the scrolling `<nav>`, the padding of `header` and `footer`, and the dividers between sections. Spacing comes from `theme.spacing` and breakpoints from `theme.breakpoints`.

## Accessibility

- **Semantics:** a `<nav>` named by `aria-label`, holding one List per section. Section titles are List subheaders, which name their lists. The temporary drawer's paper has `role="dialog"` and `aria-modal="true"`, from MUI, and is named by the same `aria-label`.
- **Current page:** the current link has `aria-current="page"`, from List.
- **Keyboard:**
  - In the permanent drawer, `Tab` moves through `header`, the links and parents, and `footer`, in order. Links and parents work as in List ([0020](./0020-list.md#accessibility)).
  - The temporary drawer traps focus while open. `Escape` closes it.
- **Naming:** the `<nav>` is named "Main" by default. Pass another name when the page has another `<nav>`, such as Navbar's. The button that opens the temporary drawer is the consumer's, and needs a name and `aria-expanded`, as in the example.
- **Focus:** opening the temporary drawer moves focus into its paper. Closing it, by `Escape`, the backdrop or a link, returns focus to the element that had it before, usually the button that opened it, through MUI's `Modal`.
- **Contrast:** as in List, on `background.paper`.

## Behavior and edge cases

- **Duplicate ids:** React logs key warnings, and both items show as current. Ids must be unique across sections and levels.
- **A `value` that isn't in the items:** nothing shows as current.
- **`items` and `sections` together:** a type error. At run time, `sections` wins.
- **An AppBar across the full width:** the permanent drawer's paper is `position: fixed` from the top of the window, so it covers the start of a full-width bar. Put the AppBar in the content column, as in the example, or move the paper down with `slotProps.paper.sx`, such as `{ top: 64, height: 'calc(100% - 64px)' }`.
- **Both drawers in the DOM:** the hidden one has `display: none`, and the closed temporary drawer is hidden by MUI's `Modal`, so neither is focusable or read by screen readers. Each List has its own ids from `useId`.
- **The temporary drawer open when the screen widens past `breakpoint`:** it's hidden by CSS but still open, so it traps focus. Sidebar closes it, calling `onOpenChange(event, false)`, when the breakpoint is crossed. This uses a `matchMedia` listener after hydration, not on the first render.
- **Long labels:** they wrap inside `width`. Use `slotProps.list.slotProps.itemText` to cut them off instead.
- **Without the library theme:** Sidebar renders with the surrounding MUI theme.
- **Server Components:** Sidebar is a client component. `sections` and `items` can come from a Server Component, as long as `label`, `icon` and `end` are serializable or Server Component elements.

## Acceptance criteria

- [ ] Renders a `navigation` named "Main", with one `list` per section, named by its `title`, and a link for each item with `href`, through the theme's `MuiButtonBase.defaultProps.LinkComponent`.
- [ ] `items` renders one section without a title.
- [ ] The item matching `value` has `aria-current="page"` and List's selected style, and its parents start expanded.
- [ ] Parents expand and collapse as in List, and `expanded`, `defaultExpanded` and `onExpandedChange` reach List.
- [ ] With `variant="responsive"`, the permanent drawer shows from `breakpoint` up and the temporary one below, with the right one hidden by CSS on the first render, including on the server.
- [ ] `variant="permanent"` and `variant="temporary"` render only that drawer.
- [ ] The temporary drawer works controlled with `open` and `onOpenChange`, and uncontrolled with and without `defaultOpen`, without React or MUI warnings.
- [ ] In the temporary drawer, following a link calls `onItemClick`, then `onOpenChange` with `false`, and `Escape` and the backdrop call `onOpenChange` with `false`.
- [ ] The open temporary drawer is a `dialog` named like the `<nav>`, traps focus, and returns focus when it closes.
- [ ] Crossing `breakpoint` upwards closes an open temporary drawer.
- [ ] `width`, `anchor`, `header` and `footer` work as described, and the `<nav>` scrolls between `header` and `footer`.
- [ ] The root takes `width` where the sidebar is permanent and `0` where it's temporary.
- [ ] `ref` reaches the root `<div>`, and `className`, `sx` and other props, such as `data-*`, reach it too.
- [ ] Every entry in `slotProps` reaches its elements, in both drawers.
- [ ] The parts have the `CmSidebar-root`, `CmSidebar-paper`, `CmSidebar-header`, `CmSidebar-nav` and `CmSidebar-footer` classes.
- [ ] Type check: `Id` is inferred from `items` or `sections`, `onItemClick` receives that type, passing both `items` and `sections` fails, and an item with neither `href` nor `children` fails.
- [ ] A project-level `CmSidebar.defaultProps.width` of `280` applies to every Sidebar.
- [ ] A project-level `CmSidebar` `styleOverrides.header` object changes the header.
- [ ] Type check: `createCmTheme({ components: { CmSidebar: { defaultProps: { breakpoint: 'lg' }, styleOverrides: { paper: { borderRight: 0 } } } } })` compiles, and an unknown slot name fails.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Sidebar renders with that theme.
- [ ] Works with the keyboard as listed under Accessibility.
- [ ] Storybook has a story with `items`, with sections, with nested items, with counts in `end`, with `header` and `footer`, responsive on a narrow and a wide viewport, temporary, `anchor="right"`, and one showing a theme override.
- [ ] `Sidebar`, `SidebarProps`, `SidebarItem` and `SidebarSection` are exported from `src/index.ts`, and `Sidebar` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- A collapsed "mini" sidebar showing only icons.
- Resizing the sidebar by dragging.
- Remembering the open or expanded state between visits.
- Items that run an action instead of following a link. Put a Button in `header` or `footer`.
- Search or filtering of the items.
- Swiping from the edge to open it on touch screens, MUI's `SwipeableDrawer`.
- A button to open the temporary drawer. It's the consumer's, usually in an AppBar.

## Open questions

- **Mini variant:** dashboards often collapse the sidebar to icons. It needs icon-only items with tooltips, which List leaves out of scope. Decide whether it's needed in the first version.
- **Full-width AppBar:** decide whether Sidebar should take an `offsetTop` prop for layouts where the AppBar spans the whole width, instead of `slotProps.paper.sx`.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Sidebar.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Defaults in `Drawer.js` | `variant="temporary"`, `open={false}`, `anchor="left"`, `elevation={16}` |
| Temporary paper in `Drawer.js` | `role="dialog"`, `aria-modal="true"` and `tabIndex={-1}`. Its `elevation` applies only to the temporary variant, `0` otherwise |
| `ModalProps` in `Drawer.js` | Spread into the `Modal`, so `keepMounted` reaches it |
| Permanent and persistent | Render a docked `<div>` root, without a `Modal` |
