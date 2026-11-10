'use client'

import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenu from '@mui/material/Menu'
import { PopoverPaper } from '@mui/material/Popover'
import type { PopoverOrigin } from '@mui/material/Popover'
import MuiMenuItem from '@mui/material/MenuItem'
import { styled, useTheme, useThemeProps } from '@mui/material/styles'
import { mergeSlotProps, useControlled, useForkRef } from '@mui/material/utils'
import { cloneElement, useId, useState } from 'react'
import type {
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
  Ref,
  SyntheticEvent,
} from 'react'
import { classNames } from '../classNames.ts'
import type { MenuItemData, MenuPlacement, MenuProps } from './Menu.types.ts'

const MenuRoot = styled(MuiMenu, { name: 'CmMenu', slot: 'root' })({})

// MUI's `MenuPaper`, which `@mui/material/Menu` doesn't export as an ES
// module. Its name keeps `MuiMenu` paper overrides working.
const MuiMenuPaper = styled(PopoverPaper, { name: 'MuiMenu', slot: 'Paper' })({
  maxHeight: 'calc(100% - 96px)',
  WebkitOverflowScrolling: 'touch',
})

const MenuPaperSlot = styled(MuiMenuPaper, { name: 'CmMenu', slot: 'paper' })({})

const MenuItem = styled(MuiMenuItem, { name: 'CmMenu', slot: 'item' })({})

const ItemSecondary = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: (theme.vars || theme).palette.text.secondary,
  paddingLeft: theme.spacing(2),
}))

/** The props Menu reads from, and composes with, the trigger's own. */
interface TriggerProps {
  id?: string
  onClick?: MouseEventHandler<HTMLElement>
  onKeyDown?: KeyboardEventHandler<HTMLElement>
  ref?: Ref<HTMLElement>
}

function origins(placement: MenuPlacement, rtl: boolean) {
  const [vertical, side] = placement.split('-') as ['top' | 'bottom', 'start' | 'end']
  const horizontal = (side === 'start') !== rtl ? 'left' : 'right'
  const anchorOrigin: PopoverOrigin = { vertical, horizontal }
  const transformOrigin: PopoverOrigin = {
    vertical: vertical === 'bottom' ? 'top' : 'bottom',
    horizontal,
  }
  return { anchorOrigin, transformOrigin }
}

/**
 * Merges Menu's own slot props over the consumer's, which may be a function of
 * MUI's owner state. Event handlers are composed, and class names joined.
 */
function overSlotProps<Own extends object, Theirs>(own: Own, theirs: Theirs | undefined) {
  return (theirs === undefined ? own : mergeSlotProps(own, theirs as unknown as Own)) as Own
}

/**
 * MUI's `Menu`, opened by a `trigger` button and built from an `items` array.
 * Menu keeps the open state and the anchor, puts the `aria-*` attributes on
 * the trigger, and closes after each choice.
 */
export function Menu<Id extends string | number = string>(inProps: MenuProps<Id>) {
  const {
    trigger,
    items,
    onItemClick,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottom-start',
    dense = false,
    className,
    sx,
    ref,
    slotProps = {},
  } = useThemeProps({ props: inProps, name: 'CmMenu' }) as MenuProps<Id>
  const {
    menu: menuProps = {},
    item: itemProps,
    itemIcon: itemIconProps,
    itemText: itemTextProps,
  } = slotProps
  const { slotProps: menuSlotProps = {}, ...otherMenuProps } = menuProps
  const theme = useTheme()

  const triggerProps = trigger.props as TriggerProps
  const generatedId = useId()
  const triggerId = triggerProps.id ?? `${generatedId}-trigger`
  const menuId = `${generatedId}-menu`

  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: 'Menu',
    state: 'open',
  })
  const setOpen = (event: SyntheticEvent | Event, next: boolean) => {
    setOpenState(next)
    onOpenChange?.(event, next)
  }

  // Kept in state, so a Menu opened from code anchors to the trigger.
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const triggerRef = useForkRef(triggerProps.ref, setAnchorEl)
  // Set when `ArrowUp` opens the menu, so focus starts on the last item.
  const [focusLast, setFocusLast] = useState(false)

  const choose = (event: MouseEvent<HTMLElement>, item: MenuItemData<Id>) => {
    item.onClick?.(event)
    onItemClick?.(event, item.id)
    setOpen(event, false)
  }

  const { anchorOrigin, transformOrigin } = origins(placement, theme.direction === 'rtl')

  return (
    <>
      {cloneElement(trigger, {
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': open ? 'true' : undefined,
        'aria-controls': open ? menuId : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          triggerProps.onClick?.(event)
          if (event.defaultPrevented) return
          setFocusLast(false)
          setOpen(event, !open)
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          triggerProps.onKeyDown?.(event)
          if (event.defaultPrevented || open) return
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setFocusLast(event.key === 'ArrowUp')
            setOpen(event, true)
          }
        },
        ref: triggerRef,
      } as Partial<unknown>)}
      <MenuRoot
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        {...otherMenuProps}
        className={classNames('CmMenu-root', otherMenuProps.className)}
        // Its items have no selected state, so focus starts on the first enabled one.
        variant="menu"
        open={open && anchorEl !== null}
        anchorEl={anchorEl}
        onClose={(event: SyntheticEvent | Event) => setOpen(event, false)}
        slots={{ paper: MenuPaperSlot, ...otherMenuProps.slots }}
        slotProps={{
          ...menuSlotProps,
          paper: overSlotProps(
            { ref, className: classNames('CmMenu-paper', className), sx },
            menuSlotProps.paper,
          ),
          list: overSlotProps({ id: menuId, 'aria-labelledby': triggerId }, menuSlotProps.list),
          transition: overSlotProps(
            {
              onEntering: (element: HTMLElement) => {
                if (!focusLast) return
                setFocusLast(false)
                const enabled = [
                  ...element.querySelectorAll<HTMLElement>('[role="menuitem"]'),
                ].filter((menuItem) => menuItem.getAttribute('aria-disabled') !== 'true')
                enabled.at(-1)?.focus()
              },
            },
            menuSlotProps.transition,
          ),
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            dense={dense}
            {...itemProps}
            className={classNames('CmMenu-item', itemProps?.className)}
            divider={item.divider}
            disabled={item.disabled}
            selected={item.current}
            aria-current={item.current ? 'page' : undefined}
            onClick={(event: MouseEvent<HTMLElement>) => choose(event, item)}
            // `ButtonBase` renders the theme's `LinkComponent` for `href` only
            // when its component is `button`.
            {...(item.href !== undefined && ({ component: 'button', href: item.href } as object))}
          >
            {item.icon != null && <ListItemIcon {...itemIconProps}>{item.icon}</ListItemIcon>}
            <ListItemText {...itemTextProps} primary={item.label} />
            {item.secondary != null && <ItemSecondary>{item.secondary}</ItemSecondary>}
          </MenuItem>
        ))}
      </MenuRoot>
    </>
  )
}
