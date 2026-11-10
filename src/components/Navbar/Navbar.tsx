'use client'

import IconButton from '@mui/material/IconButton'
import { styled, useTheme, useThemeProps } from '@mui/material/styles'
import type { Breakpoint } from '@mui/material/styles'
import type { MouseEvent } from 'react'
import { AppBar } from '../AppBar/index.ts'
import { Button } from '../Button/index.ts'
import { classNames } from '../classNames.ts'
import { ChevronDownIcon, HamburgerIcon } from '../icons.tsx'
import { Link } from '../Link/index.ts'
import { Menu } from '../Menu/index.ts'
import type { MenuItemData, MenuProps } from '../Menu/index.ts'
import type { NavbarItem, NavbarLabels, NavbarProps } from './Navbar.types.ts'

const defaultLabels: NavbarLabels = { nav: 'Main', openMenu: 'Open navigation menu' }

const NavbarRoot = styled(AppBar, { name: 'CmNavbar', slot: 'root' })({})

const NavbarBrand = styled('div', { name: 'CmNavbar', slot: 'brand' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  marginRight: theme.spacing(2),
  color: 'inherit',
}))

const NavbarBrandLink = styled(Link, { name: 'CmNavbar', slot: 'brand' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  marginRight: theme.spacing(2),
}))

interface NavOwnerState {
  collapseBelow: Breakpoint | false
}

// The bar's links, hidden below `collapseBelow`. CSS rather than
// `useMediaQuery`, so the server's HTML already matches the screen.
const BarNav = styled('nav', { name: 'CmNavbar', slot: 'nav' })<{ ownerState: NavOwnerState }>(
  ({ theme, ownerState }) => ({
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    ...(ownerState.collapseBelow && {
      [theme.breakpoints.down(ownerState.collapseBelow)]: { display: 'none' },
    }),
  }),
)

// The menu button, shown only below `collapseBelow`.
const CollapsedNav = styled('nav', { name: 'CmNavbar', slot: 'nav' })<{
  ownerState: { collapseBelow: Breakpoint }
}>(({ theme, ownerState }) => ({
  display: 'none',
  marginRight: theme.spacing(1),
  [theme.breakpoints.down(ownerState.collapseBelow)]: { display: 'flex' },
}))

const NavList = styled('ul')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}))

// Color alone doesn't show the current page, so a 2px line goes under its
// label. On a colored bar, links inherit its text color, and so does the line.
const NavbarItemButton = styled(Button, { name: 'CmNavbar', slot: 'item' })<{
  ownerState: { current: boolean; colored: boolean }
}>(({ theme, ownerState }) => ({
  position: 'relative',
  whiteSpace: 'nowrap',
  ...(ownerState.current && {
    ...(!ownerState.colored && {
      color: (theme.vars || theme).palette.primary.dark,
      ...theme.applyStyles('dark', { color: (theme.vars || theme).palette.primary.main }),
    }),
    '&::after': {
      content: '""',
      position: 'absolute',
      left: theme.spacing(1),
      right: theme.spacing(1),
      bottom: 0,
      height: 2,
      backgroundColor: ownerState.colored ? 'currentColor' : (theme.vars || theme).palette.primary.main,
    },
  }),
  '& .CmNavbar-chevron': {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  '&[aria-expanded="true"] .CmNavbar-chevron': { transform: 'rotate(180deg)' },
}))

const NavbarActions = styled('div', { name: 'CmNavbar', slot: 'actions' })(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginLeft: 'auto',
  flexShrink: 0,
}))

/**
 * The site's main navigation in an AppBar: the brand, a row of links with
 * groups in a Menu, the current page marked, and `actions` at the end. Below
 * `collapseBelow`, the links move into a Menu behind a button.
 */
export function Navbar<Id extends string | number = string>(inProps: NavbarProps<Id>) {
  const {
    items,
    value,
    onItemClick,
    brand,
    brandHref,
    actions,
    collapseBelow = 'md',
    labels: labelsProp,
    slotProps = {},
    className,
    color,
    ...rootProps
  } = useThemeProps({ props: inProps, name: 'CmNavbar' }) as NavbarProps<Id>
  const {
    toolbar: toolbarProps,
    brand: brandProps,
    nav: navProps,
    item: itemProps,
    menu: menuProps,
    menuButton: menuButtonProps,
    actions: actionsProps,
  } = slotProps
  const labels = { ...defaultLabels, ...labelsProp }
  // The bar's color, as AppBar resolves it, so links on a colored bar keep its text color.
  const theme = useTheme()
  const colored = (color ?? theme.components?.MuiAppBar?.defaultProps?.color ?? 'primary') !== 'default'
  const sharedMenuProps = menuProps as Partial<MenuProps<Id>> | undefined

  const isCurrent = (item: NavbarItem<Id>) =>
    value != null &&
    (item.id === value || (item.children?.some((child) => child.id === value) ?? false))

  const asMenuItem = (child: NavbarItem<Id>): MenuItemData<Id> => ({
    id: child.id,
    label: child.label,
    icon: child.icon,
    href: child.href,
    current: value != null && child.id === value,
  })

  const chooseFromMenu = (event: MouseEvent<HTMLElement>, id: Id) => {
    sharedMenuProps?.onItemClick?.(event, id)
    onItemClick?.(event, id)
  }

  // Every link, with each group's children in its place between dividers.
  const collapsedItems: MenuItemData<Id>[] = []
  for (const item of items) {
    if (item.children === undefined) {
      collapsedItems.push(asMenuItem(item))
      continue
    }
    const previous = collapsedItems.at(-1)
    if (previous) collapsedItems[collapsedItems.length - 1] = { ...previous, divider: true }
    const children = item.children.map((child) => asMenuItem(child as NavbarItem<Id>))
    if (children.length > 0) children[children.length - 1] = { ...children.at(-1)!, divider: true }
    collapsedItems.push(...children)
  }
  const last = collapsedItems.at(-1)
  if (last?.divider) collapsedItems[collapsedItems.length - 1] = { ...last, divider: false }

  const itemButton = (item: NavbarItem<Id>) => {
    const current = isCurrent(item)
    return {
      variant: 'text' as const,
      color: 'inherit' as const,
      startIcon: item.icon,
      ...itemProps,
      className: classNames('CmNavbar-item', itemProps?.className),
      ownerState: { current, colored },
    }
  }

  const hasItems = items.length > 0
  const brandContent =
    brand == null ? null : brandHref !== undefined ? (
      <NavbarBrandLink
        underline="none"
        color="inherit"
        {...brandProps}
        className={classNames('CmNavbar-brand', brandProps?.className)}
        href={brandHref}
      >
        {brand}
      </NavbarBrandLink>
    ) : (
      <NavbarBrand className={classNames('CmNavbar-brand', brandProps?.className)} sx={brandProps?.sx}>
        {brand}
      </NavbarBrand>
    )

  return (
    <NavbarRoot
      {...rootProps}
      color={color}
      className={classNames('CmNavbar-root', className)}
      slotProps={{ toolbar: toolbarProps }}
    >
      {hasItems && collapseBelow !== false && (
        <CollapsedNav
          aria-label={labels.nav}
          {...navProps}
          className={classNames('CmNavbar-nav', navProps?.className)}
          ownerState={{ collapseBelow }}
        >
          <Menu<Id>
            {...sharedMenuProps}
            items={collapsedItems}
            onItemClick={chooseFromMenu}
            trigger={
              <IconButton edge="start" color="inherit" aria-label={labels.openMenu} {...menuButtonProps}>
                <HamburgerIcon />
              </IconButton>
            }
          />
        </CollapsedNav>
      )}
      {brandContent}
      {hasItems && (
        <BarNav
          aria-label={labels.nav}
          {...navProps}
          className={classNames('CmNavbar-nav', navProps?.className)}
          ownerState={{ collapseBelow }}
        >
          <NavList>
            {items.map((item) => (
              <li key={item.id}>
                {item.children === undefined ? (
                  <NavbarItemButton
                    {...itemButton(item)}
                    href={item.href}
                    aria-current={item.id === value ? 'page' : undefined}
                    onClick={(event: MouseEvent<HTMLElement>) => onItemClick?.(event, item.id)}
                  >
                    {item.label}
                  </NavbarItemButton>
                ) : (
                  <Menu<Id>
                    {...sharedMenuProps}
                    items={item.children.map((child) => asMenuItem(child as NavbarItem<Id>))}
                    onItemClick={chooseFromMenu}
                    trigger={
                      <NavbarItemButton
                        {...itemButton(item)}
                        endIcon={<ChevronDownIcon className="CmNavbar-chevron" />}
                      >
                        {item.label}
                      </NavbarItemButton>
                    }
                  />
                )}
              </li>
            ))}
          </NavList>
        </BarNav>
      )}
      {actions != null && (
        <NavbarActions {...actionsProps} className={classNames('CmNavbar-actions', actionsProps?.className)}>
          {actions}
        </NavbarActions>
      )}
    </NavbarRoot>
  )
}
