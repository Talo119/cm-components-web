import type { IconButtonProps } from '@mui/material/IconButton'
import type {
  Breakpoint,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
} from '@mui/material/styles'
import type { ToolbarProps } from '@mui/material/Toolbar'
import type { ComponentProps, MouseEvent, ReactNode } from 'react'
import type { AppBarProps } from '../AppBar/index.ts'
import type { ButtonProps } from '../Button/index.ts'
import type { LinkProps } from '../Link/index.ts'
import type { MenuProps } from '../Menu/index.ts'

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
    | {
        /** The link's URL, rendered through the theme's `LinkComponent`. */
        href: string
        children?: never
      }
    | {
        /** Links shown in a dropdown. One level only. */
        children: readonly (NavbarItemBase<Id> & { href: string })[]
        href?: never
      }
  )

/** Text that Navbar adds, for other languages. */
export interface NavbarLabels {
  /** The `<nav>`'s accessible name. */
  nav: string
  /** The collapsed menu button's accessible name. */
  openMenu: string
}

export interface NavbarProps<Id extends string | number = string>
  extends Omit<AppBarProps, 'children' | 'slotProps'> {
  /** The links and groups, in display order. */
  items: readonly NavbarItem<Id>[]
  /**
   * The current page's item. Its link gets `aria-current="page"`, and its
   * group shows as current too.
   */
  value?: Id | null
  /** Called when the user follows a link, in the bar or in a menu. */
  onItemClick?: (event: MouseEvent<HTMLElement>, id: NoInfer<Id>) => void
  /** The logo or the site's name, at the start. */
  brand?: ReactNode
  /** Makes `brand` a link, usually to `/`. */
  brandHref?: string
  /** Content at the end, such as a search button or the account Menu. Shown on every screen size. */
  actions?: ReactNode
  /**
   * Below this breakpoint, the links move into a menu. `false` never collapses.
   * @default 'md'
   */
  collapseBelow?: Breakpoint | false
  /**
   * Text that Navbar adds, for other languages.
   * @default English labels
   */
  labels?: Partial<NavbarLabels>
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `Toolbar`, through AppBar. */
    toolbar?: Partial<Omit<ToolbarProps, 'children'>>
    /** The brand's Link, or its `<div>` without `brandHref`. */
    brand?: Partial<LinkProps>
    /** Both `<nav>` elements: the bar's and the collapsed one's. */
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

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmNavbar: NavbarProps<string | number>
  }
  interface ComponentNameToClassKey {
    CmNavbar: 'root' | 'brand' | 'nav' | 'item' | 'actions'
  }
  interface Components<Theme = unknown> {
    CmNavbar?: {
      defaultProps?: ComponentsProps['CmNavbar']
      styleOverrides?: ComponentsOverrides<Theme>['CmNavbar']
      variants?: ComponentsVariants<Theme>['CmNavbar']
    }
  }
}
