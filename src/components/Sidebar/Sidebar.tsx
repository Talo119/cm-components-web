'use client'

import Divider from '@mui/material/Divider'
import MuiDrawer from '@mui/material/Drawer'
import { styled, useTheme, useThemeProps } from '@mui/material/styles'
import type { Breakpoint } from '@mui/material/styles'
import { mergeSlotProps, useControlled } from '@mui/material/utils'
import { Fragment, useEffect } from 'react'
import type { MouseEvent, SyntheticEvent } from 'react'
import { classNames } from '../classNames.ts'
import { List } from '../List/index.ts'
import type { ListItemData } from '../List/index.ts'
import type { SidebarItem, SidebarProps, SidebarSection } from './Sidebar.types.ts'

type Variant = 'responsive' | 'permanent' | 'temporary'

interface OwnerState {
  variant: Variant
  breakpoint: Breakpoint
  width: number | string
}

// Takes the sidebar's room in a flex row where it's permanent, and none where
// it's temporary. CSS rather than `useMediaQuery`, so the server's HTML
// already matches the screen.
const SidebarRoot = styled('div', { name: 'CmSidebar', slot: 'root' })<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    flexShrink: 0,
    width: ownerState.variant === 'permanent' ? ownerState.width : 0,
    ...(ownerState.variant === 'responsive' && {
      [theme.breakpoints.up(ownerState.breakpoint)]: { width: ownerState.width },
    }),
  }),
)

// MUI's `Drawer`, with the `paper` slot's theme overrides applied to its paper.
const SidebarDrawer = styled(MuiDrawer, {
  name: 'CmSidebar',
  slot: 'paper',
  overridesResolver: (_, styles) => ({ '& .CmSidebar-paper': styles.paper }),
})<{ ownerState: OwnerState & { drawer: 'permanent' | 'temporary' } }>(({ theme, ownerState }) => ({
  '& .CmSidebar-paper': {
    width: ownerState.width,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  ...(ownerState.variant === 'responsive' &&
    (ownerState.drawer === 'permanent'
      ? { [theme.breakpoints.down(ownerState.breakpoint)]: { display: 'none' } }
      : { [theme.breakpoints.up(ownerState.breakpoint)]: { display: 'none' } })),
}))

const SidebarHeader = styled('div', { name: 'CmSidebar', slot: 'header' })(({ theme }) => ({
  flexShrink: 0,
  padding: theme.spacing(2),
}))

const SidebarNav = styled('nav', { name: 'CmSidebar', slot: 'nav' })({
  flexGrow: 1,
  minHeight: 0,
  overflowY: 'auto',
})

const SidebarFooter = styled('div', { name: 'CmSidebar', slot: 'footer' })(({ theme }) => ({
  flexShrink: 0,
  padding: theme.spacing(2),
}))

function toListItems<Id extends string | number>(items: readonly SidebarItem<Id>[]): ListItemData<Id>[] {
  return items.map((item) =>
    item.children !== undefined
      ? {
          id: item.id,
          primary: item.label,
          icon: item.icon,
          end: item.end,
          disabled: item.disabled,
          children: toListItems(item.children),
        }
      : {
          id: item.id,
          primary: item.label,
          icon: item.icon,
          end: item.end,
          disabled: item.disabled,
          href: item.href,
        },
  )
}

/**
 * An app's main navigation in a column at the side, built on MUI's `Drawer`
 * and the library's List. Permanent beside the content on wide screens, and a
 * temporary drawer that slides in on narrow ones, closing when a link is
 * followed.
 */
export function Sidebar<Id extends string | number = string>(inProps: SidebarProps<Id>) {
  const {
    items,
    sections: sectionsProp,
    value,
    onItemClick,
    expanded,
    defaultExpanded,
    onExpandedChange,
    variant = 'responsive',
    breakpoint = 'md',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    width = 240,
    header,
    footer,
    anchor = 'left',
    'aria-label': ariaLabel = 'Main',
    slotProps = {},
    className,
    ...rootProps
  } = useThemeProps({ props: inProps, name: 'CmSidebar' }) as SidebarProps<Id>
  const {
    drawer: drawerProps,
    paper: paperProps,
    header: headerProps,
    nav: navProps,
    list: listProps,
    footer: footerProps,
  } = slotProps
  const theme = useTheme()

  // At run time `sections` wins over `items`.
  const sections: readonly SidebarSection<Id>[] =
    sectionsProp ?? [{ id: 'items', items: items ?? [] }]
  const ownerState: OwnerState = { variant, breakpoint, width }

  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: 'Sidebar',
    state: 'open',
  })
  const close = (event: SyntheticEvent | Event) => {
    setOpenState(false)
    onOpenChange?.(event, false)
  }

  // The temporary drawer is hidden by CSS from `breakpoint` up, but still
  // traps focus while open, so crossing the breakpoint closes it.
  const upQuery = theme.breakpoints.up(breakpoint).replace(/^@media( ?)/, '')
  useEffect(() => {
    if (variant !== 'responsive' || !open || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(upQuery)
    const listener = (event: MediaQueryListEvent) => {
      if (!event.matches) return
      setOpenState(false)
      onOpenChange?.(event, false)
    }
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [variant, open, upQuery, setOpenState, onOpenChange])

  const renderContent = (drawer: 'permanent' | 'temporary') => (
    <>
      {header != null && (
        <SidebarHeader {...headerProps} className={classNames('CmSidebar-header', headerProps?.className)}>
          {header}
        </SidebarHeader>
      )}
      <SidebarNav
        aria-label={ariaLabel}
        {...navProps}
        className={classNames('CmSidebar-nav', navProps?.className)}
      >
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && <Divider />}
            <List<Id>
              {...listProps}
              subheader={section.title}
              items={toListItems(section.items)}
              value={value ?? null}
              expanded={expanded}
              defaultExpanded={defaultExpanded}
              onExpandedChange={onExpandedChange}
              onChange={(event: MouseEvent<HTMLElement>, id: Id) => {
                onItemClick?.(event, id)
                if (drawer === 'temporary') close(event)
              }}
            />
          </Fragment>
        ))}
      </SidebarNav>
      {footer != null && (
        <SidebarFooter {...footerProps} className={classNames('CmSidebar-footer', footerProps?.className)}>
          {footer}
        </SidebarFooter>
      )}
    </>
  )

  const paperSlotProps = (drawer: 'permanent' | 'temporary') => {
    const own = {
      ...paperProps,
      className: classNames('CmSidebar-paper', paperProps?.className),
      ...(drawer === 'temporary' && { 'aria-label': ariaLabel }),
    }
    const theirs = drawerProps?.slotProps?.paper
    return theirs === undefined ? own : mergeSlotProps(own, theirs as typeof own)
  }

  return (
    <SidebarRoot {...rootProps} className={classNames('CmSidebar-root', className)} ownerState={ownerState}>
      {variant !== 'temporary' && (
        <SidebarDrawer
          {...drawerProps}
          ownerState={{ ...ownerState, drawer: 'permanent' }}
          variant="permanent"
          anchor={anchor}
          open
          slotProps={{ ...drawerProps?.slotProps, paper: paperSlotProps('permanent') }}
        >
          {renderContent('permanent')}
        </SidebarDrawer>
      )}
      {variant !== 'permanent' && (
        <SidebarDrawer
          {...drawerProps}
          ownerState={{ ...ownerState, drawer: 'temporary' }}
          variant="temporary"
          anchor={anchor}
          open={open}
          onClose={(event: SyntheticEvent | Event) => close(event)}
          // Opens quickly, and its links are in the server's HTML.
          ModalProps={{ keepMounted: true, ...drawerProps?.ModalProps }}
          slotProps={{ ...drawerProps?.slotProps, paper: paperSlotProps('temporary') }}
        >
          {renderContent('temporary')}
        </SidebarDrawer>
      )}
    </SidebarRoot>
  )
}
