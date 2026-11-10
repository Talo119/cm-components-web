import type {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SxProps,
  Theme,
} from '@mui/material/styles'
import type { TabProps as MuiTabProps } from '@mui/material/Tab'
import type { TabsProps as MuiTabsProps } from '@mui/material/Tabs'
import type { ComponentProps, ReactElement, ReactNode, SyntheticEvent } from 'react'

interface TabItemBase<Id extends string | number> {
  /** Unique within `items`. Used as the React key, as the value, and reported by `onChange`. */
  id: Id
  /** The tab's visible text. It's also the tab's accessible name. */
  label: ReactNode
  /** Shown with the label, above it by default. Placed with `slotProps.tab.iconPosition`. */
  icon?: ReactElement
  /**
   * Shown but not selectable, and skipped by the arrow keys.
   * @default false
   */
  disabled?: boolean
}

export type TabItem<Id extends string | number = string> = TabItemBase<Id> &
  (
    | {
        /** The panel shown when the tab is selected. */
        content?: ReactNode
        href?: never
      }
    | {
        /** Makes the tab a link, through the theme's `LinkComponent`. It then has no panel. */
        href: string
        content?: never
      }
  )

export interface TabsProps<Id extends string | number = string>
  extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** The tabs, in display order. */
  items: readonly TabItem<Id>[]
  /** Controlled selected tab. `null` means none is selected. */
  value?: Id | null
  /**
   * Initial selected tab when uncontrolled.
   * @default The first enabled item's `id`
   */
  defaultValue?: Id | null
  /** Called when the user selects a tab, with the item's `id`. */
  onChange?: (event: SyntheticEvent, value: NoInfer<Id>) => void
  /**
   * If `true`, every panel stays in the DOM, hidden, so its state is kept when
   * the user switches tabs.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Tabs at their own width, a row that scrolls, or tabs that share the full width.
   * @default 'standard'
   */
  variant?: MuiTabsProps['variant']
  /**
   * With `vertical`, the tabs are a column at the start and the panel is beside them.
   * @default 'horizontal'
   */
  orientation?: MuiTabsProps['orientation']
  /**
   * Centers the tabs. Only with `variant="standard"` and `horizontal`.
   * @default false
   */
  centered?: boolean
  /**
   * MUI's. Only with `variant="scrollable"`.
   * @default 'auto'
   */
  scrollButtons?: MuiTabsProps['scrollButtons']
  /**
   * If `true`, moving focus with the arrow keys selects the tab.
   * @default false
   */
  selectionFollowsFocus?: boolean
  /** Names the tab list, not the root. */
  'aria-label'?: string
  /** Names the tab list, not the root. */
  'aria-labelledby'?: string
  /** Styles for the root `<div>`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `Tabs`, the tab row. Reaches its other props and its own slots. */
    tabs?: Partial<Omit<MuiTabsProps, 'value' | 'onChange' | 'children'>>
    /** Every MUI `Tab`. */
    tab?: Partial<Omit<MuiTabProps, 'value' | 'label' | 'icon' | 'disabled' | 'href'>>
    /** Every panel `<div>`. */
    panel?: ComponentProps<'div'>
  }
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmTabs: TabsProps<string | number>
  }
  interface ComponentNameToClassKey {
    CmTabs: 'root' | 'tabs' | 'panel'
  }
  interface Components<Theme = unknown> {
    CmTabs?: {
      defaultProps?: ComponentsProps['CmTabs']
      styleOverrides?: ComponentsOverrides<Theme>['CmTabs']
      variants?: ComponentsVariants<Theme>['CmTabs']
    }
  }
}
