import type { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer'
import type { PaperProps } from '@mui/material/Paper'
import type {
  Breakpoint,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SxProps,
  Theme,
} from '@mui/material/styles'
import type { ComponentProps, MouseEvent, ReactNode, SyntheticEvent } from 'react'
import type { ListProps } from '../List/index.ts'

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
    | {
        /** The link's URL, rendered through the theme's `LinkComponent`. */
        href: string
        children?: never
      }
    | {
        /** Nested links, shown when the item is expanded. */
        children: readonly SidebarItem<Id>[]
        href?: never
      }
  )

export interface SidebarSection<Id extends string | number = string> {
  /** Unique within `sections`. Used as the React key. */
  id: string
  /** A heading above the section's items, in List's `subheader`. It also names the section's list. */
  title?: ReactNode
  /** The section's links. */
  items: readonly SidebarItem<Id>[]
}

interface SidebarPropsBase<Id extends string | number>
  extends Omit<ComponentProps<'div'>, 'children'> {
  /** The current page's item. Its link gets `aria-current="page"`. */
  value?: Id | null
  /** Called when the user follows a link. */
  onItemClick?: (event: MouseEvent<HTMLElement>, id: NoInfer<Id>) => void
  /** Controlled ids of the expanded parent items, as in List. */
  expanded?: readonly Id[]
  /**
   * Initial expanded parents when uncontrolled, as in List.
   * @default The parents of the current item
   */
  defaultExpanded?: readonly Id[]
  /** Called when the user expands or collapses a parent item, as in List. */
  onExpandedChange?: (event: MouseEvent<HTMLElement>, expanded: NoInfer<Id>[]) => void
  /**
   * `permanent` is always beside the content, `temporary` always slides in,
   * and `responsive` switches at `breakpoint`.
   * @default 'responsive'
   */
  variant?: 'responsive' | 'permanent' | 'temporary'
  /**
   * With `responsive`, permanent from this breakpoint up, temporary below.
   * @default 'md'
   */
  breakpoint?: Breakpoint
  /** Controlled open state of the temporary drawer. */
  open?: boolean
  /**
   * Initial open state of the temporary drawer when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Called when the temporary drawer asks to close: `Escape`, a click on the
   * backdrop, a link followed, or the screen widening past `breakpoint`.
   */
  onOpenChange?: (event: SyntheticEvent | Event, open: boolean) => void
  /**
   * The sidebar's width, in pixels or as a CSS length.
   * @default 240
   */
  width?: number | string
  /** Content at the top, such as the logo or a workspace switcher. */
  header?: ReactNode
  /** Content at the bottom, such as the signed-in user. */
  footer?: ReactNode
  /**
   * MUI's: the side the sidebar is on.
   * @default 'left'
   */
  anchor?: 'left' | 'right'
  /**
   * Names the `<nav>`, and the temporary drawer's dialog, not the root.
   * @default 'Main'
   */
  'aria-label'?: string
  /** Styles for the root `<div>`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
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
    list?: Partial<
      Omit<ListProps<Id>, 'items' | 'value' | 'onChange' | 'expanded' | 'defaultExpanded' | 'onExpandedChange'>
    >
    /** The `<div>` around `footer`. */
    footer?: ComponentProps<'div'>
  }
}

export type SidebarProps<Id extends string | number = string> = SidebarPropsBase<Id> &
  (
    | {
        /** The links, in one section without a title. */
        items: readonly SidebarItem<Id>[]
        sections?: never
      }
    | {
        /** Groups of links, each with an optional title. */
        sections: readonly SidebarSection<Id>[]
        items?: never
      }
  )

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmSidebar: SidebarPropsBase<string | number> & {
      items?: readonly SidebarItem<string | number>[]
      sections?: readonly SidebarSection<string | number>[]
    }
  }
  interface ComponentNameToClassKey {
    CmSidebar: 'root' | 'paper' | 'header' | 'nav' | 'footer'
  }
  interface Components<Theme = unknown> {
    CmSidebar?: {
      defaultProps?: ComponentsProps['CmSidebar']
      styleOverrides?: ComponentsOverrides<Theme>['CmSidebar']
      variants?: ComponentsVariants<Theme>['CmSidebar']
    }
  }
}
