import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import type { ToolbarProps } from '@mui/material/Toolbar'
import type { ReactNode } from 'react'

export interface AppBarProps extends Omit<MuiAppBarProps, 'children'> {
  /** The bar's content, inside MUI's `Toolbar`. */
  children?: ReactNode
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `Toolbar`, the row inside the bar, such as `variant: 'dense'` or `disableGutters`. */
    toolbar?: Partial<Omit<ToolbarProps, 'children'>>
  }
}
