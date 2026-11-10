import type { ListItemIconProps as MuiListItemIconProps } from '@mui/material/ListItemIcon'
import type { ListItemTextProps as MuiListItemTextProps } from '@mui/material/ListItemText'
import type { MenuProps as MuiMenuProps } from '@mui/material/Menu'
import type { MenuItemProps as MuiMenuItemProps } from '@mui/material/MenuItem'
import type {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SxProps,
  Theme,
} from '@mui/material/styles'
import type { MouseEvent, ReactElement, ReactNode, Ref, SyntheticEvent } from 'react'

interface MenuItemDataBase<Id extends string | number> {
  /** Unique within `items`. Used as the React key and reported by `onItemClick`. */
  id: Id
  /** The item's visible text. It's also the item's accessible name. */
  label: ReactNode
  /** Shown before the label, in MUI's `ListItemIcon`. */
  icon?: ReactNode
  /** Shown at the end in `text.secondary`, such as a keyboard shortcut. Part of the accessible name. */
  secondary?: ReactNode
  /**
   * Shown but not selectable, and skipped by the arrow keys.
   * @default false
   */
  disabled?: boolean
  /**
   * Draws a `divider` line below the item, to separate groups.
   * @default false
   */
  divider?: boolean
  /**
   * Marks a link as the current page, with `aria-current="page"` and MUI's
   * selected background. Navbar uses it in its menus.
   * @default false
   */
  current?: boolean
  /** Called when the item is chosen, before `onItemClick`. */
  onClick?: (event: MouseEvent<HTMLElement>) => void
}

export type MenuItemData<Id extends string | number = string> = MenuItemDataBase<Id> & {
  /** Makes the item a link, through the theme's `LinkComponent`. */
  href?: string
}

export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface MenuProps<Id extends string | number = string> {
  /**
   * The button that opens the menu. It's cloned with `aria-haspopup`,
   * `aria-expanded`, `aria-controls`, `onClick`, `onKeyDown` and `ref`,
   * composed with its own, so it must render a focusable element that accepts
   * them, such as Button or MUI's `IconButton`.
   */
  trigger: ReactElement
  /** The choices, in display order. */
  items: readonly MenuItemData<Id>[]
  /** Called when the user chooses an item, after the item's own `onClick`. */
  onItemClick?: (event: MouseEvent<HTMLElement>, id: NoInfer<Id>) => void
  /** Controlled open state. */
  open?: boolean
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean
  /** Called when the menu asks to open or close. */
  onOpenChange?: (event: SyntheticEvent | Event, open: boolean) => void
  /**
   * Where the menu opens, relative to the trigger. `start` and `end` follow
   * the text direction. `slotProps.menu.anchorOrigin` and `transformOrigin`
   * win over it.
   * @default 'bottom-start'
   */
  placement?: MenuPlacement
  /**
   * MUI's: smaller items.
   * @default false
   */
  dense?: boolean
  /** Reaches the menu's paper, the visible surface. */
  className?: string
  /** Styles for the menu's paper, the visible surface. */
  sx?: SxProps<Theme>
  /** Reaches the menu's paper `<div>`. */
  ref?: Ref<HTMLDivElement>
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `Menu`. Reaches its other props, such as `anchorOrigin`, and its own slots. */
    menu?: Partial<Omit<MuiMenuProps, 'open' | 'anchorEl' | 'onClose' | 'children'>>
    /** Every MUI `MenuItem`. */
    item?: Partial<Omit<MuiMenuItemProps, 'onClick' | 'disabled' | 'divider' | 'href'>>
    /** Every MUI `ListItemIcon`. */
    itemIcon?: Partial<MuiListItemIconProps>
    /** Every MUI `ListItemText`. */
    itemText?: Partial<Omit<MuiListItemTextProps, 'primary'>>
  }
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmMenu: MenuProps<string | number>
  }
  interface ComponentNameToClassKey {
    CmMenu: 'root' | 'paper' | 'item'
  }
  interface Components<Theme = unknown> {
    CmMenu?: {
      defaultProps?: ComponentsProps['CmMenu']
      styleOverrides?: ComponentsOverrides<Theme>['CmMenu']
      variants?: ComponentsVariants<Theme>['CmMenu']
    }
  }
}
