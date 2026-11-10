import MuiAppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import type { AppBarProps } from './AppBar.types.ts'

/**
 * MUI's `AppBar` with its `Toolbar` already inside, for the height and
 * padding. Under the library theme the bar is sticky, on `background.paper`,
 * with a `divider` line instead of a shadow.
 */
export function AppBar({ children, slotProps = {}, ...rootProps }: AppBarProps) {
  return (
    <MuiAppBar {...rootProps}>
      <Toolbar {...slotProps.toolbar}>{children}</Toolbar>
    </MuiAppBar>
  )
}
