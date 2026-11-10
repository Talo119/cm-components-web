import type { ListProps as MuiListProps } from '@mui/material/List'
import type { ListItemProps as MuiListItemProps } from '@mui/material/ListItem'
import type { ListItemAvatarProps as MuiListItemAvatarProps } from '@mui/material/ListItemAvatar'
import type { ListItemButtonProps as MuiListItemButtonProps } from '@mui/material/ListItemButton'
import type { ListItemIconProps as MuiListItemIconProps } from '@mui/material/ListItemIcon'
import type { ListItemTextProps as MuiListItemTextProps } from '@mui/material/ListItemText'
import type { ListSubheaderProps as MuiListSubheaderProps } from '@mui/material/ListSubheader'
import type {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SxProps,
  Theme,
} from '@mui/material/styles'
import type { ComponentProps, MouseEvent, ReactNode } from 'react'

interface ListItemDataBase<Id extends string | number> {
  /** Unique within the whole tree of `items`. Used as the React key, the value, and reported by `onChange`. */
  id: Id
  /** The main line. It's also the item's accessible name, with `secondary` and `end`. */
  primary: ReactNode
  /** A second line, in `text.secondary`. */
  secondary?: ReactNode
  /** Shown before the text, in MUI's `ListItemIcon`. Use `icon` or `avatar`, not both. */
  icon?: ReactNode
  /** Shown before the text, in MUI's `ListItemAvatar`. */
  avatar?: ReactNode
  /** Non-interactive content after the text, inside the item, such as a count or a time. */
  end?: ReactNode
  /** An interactive element at the end, outside the item's button, such as an icon button. */
  action?: ReactNode
  /**
   * Shown but not interactive.
   * @default false
   */
  disabled?: boolean
  /**
   * Draws a `divider` line below the item.
   * @default false
   */
  divider?: boolean
  /** Called when the item is activated, before `onChange`. */
  onClick?: (event: MouseEvent<HTMLElement>) => void
}

export type ListItemData<Id extends string | number = string> = ListItemDataBase<Id> &
  (
    | {
        /** Makes the item a link, through the theme's `LinkComponent`. */
        href: string
        children?: never
      }
    | {
        /** Nested items, shown when the item is expanded. */
        children: readonly ListItemData<Id>[]
        href?: never
      }
    | { href?: never; children?: never }
  )

export interface ListProps<Id extends string | number = string>
  extends Omit<ComponentProps<'ul'>, 'onChange' | 'defaultValue' | 'children'> {
  /** The items, in display order. */
  items: readonly ListItemData<Id>[]
  /** Controlled selected item. `null` means none is selected. */
  value?: Id | null
  /**
   * Initial selected item when uncontrolled. A List tracks a selected item
   * only when `value` or `defaultValue` is passed.
   */
  defaultValue?: Id | null
  /** Called when the user activates an item that has no `children`, with its `id`. */
  onChange?: (event: MouseEvent<HTMLElement>, value: NoInfer<Id>) => void
  /** Controlled ids of the expanded parent items. */
  expanded?: readonly Id[]
  /**
   * Initial expanded parents when uncontrolled.
   * @default The parents of the selected item
   */
  defaultExpanded?: readonly Id[]
  /** Called when the user expands or collapses a parent item, with every expanded id. */
  onExpandedChange?: (event: MouseEvent<HTMLElement>, expanded: NoInfer<Id>[]) => void
  /**
   * A heading at the top of the list. It also names the list when
   * `aria-label` and `aria-labelledby` aren't set.
   */
  subheader?: ReactNode
  /**
   * MUI's: smaller vertical padding on every item.
   * @default false
   */
  dense?: boolean
  /**
   * MUI's: no padding above and below the list.
   * @default false
   */
  disablePadding?: boolean
  /** Styles for the root `<ul>`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /** Every MUI `ListItem`, the `<li>`. */
    item?: Partial<Omit<MuiListItemProps, 'secondaryAction' | 'children'>>
    /** Every MUI `ListItemButton`, for interactive items. */
    itemButton?: Partial<Omit<MuiListItemButtonProps, 'href' | 'selected' | 'disabled' | 'onClick'>>
    /** Every MUI `ListItemIcon`. */
    itemIcon?: Partial<MuiListItemIconProps>
    /** Every MUI `ListItemAvatar`. */
    itemAvatar?: Partial<MuiListItemAvatarProps>
    /** Every MUI `ListItemText`. Reaches its `primary` and `secondary` slots through its own `slotProps`. */
    itemText?: Partial<Omit<MuiListItemTextProps, 'primary' | 'secondary'>>
    /** MUI's `ListSubheader`. */
    subheader?: Partial<MuiListSubheaderProps>
    /** Every nested `<ul>` of a parent item. */
    nested?: Partial<MuiListProps>
  }
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmList: ListProps<string | number>
  }
  interface ComponentNameToClassKey {
    CmList: 'root' | 'item' | 'itemButton' | 'nested'
  }
  interface Components<Theme = unknown> {
    CmList?: {
      defaultProps?: ComponentsProps['CmList']
      styleOverrides?: ComponentsOverrides<Theme>['CmList']
      variants?: ComponentsVariants<Theme>['CmList']
    }
  }
}
