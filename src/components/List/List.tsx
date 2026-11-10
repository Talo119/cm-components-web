'use client'

import Collapse from '@mui/material/Collapse'
import MuiList from '@mui/material/List'
import MuiListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import MuiListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { styled, useThemeProps } from '@mui/material/styles'
import { useId, useState } from 'react'
import type { MouseEvent } from 'react'
import { classNames } from '../classNames.ts'
import { ChevronDownIcon } from '../icons.tsx'
import type { ListItemData, ListProps } from './List.types.ts'
import { ancestorsOf, containsId } from './List.utils.ts'

const ListRoot = styled(MuiList, { name: 'CmList', slot: 'root' })({})

// A parent's `<li>` holds its button and its nested list, one above the other.
const ListItemRoot = styled(MuiListItem, { name: 'CmList', slot: 'item' })<{
  ownerState: { hasChildren: boolean }
}>({
  variants: [
    {
      props: { hasChildren: true },
      style: { flexDirection: 'column', alignItems: 'stretch' },
    },
  ],
})

// The selected background differs from the page by less than 3:1, so a
// `primary.main` bar on the start edge shows the state. `inset-inline-start`
// follows the text direction.
const ListItemButton = styled(MuiListItemButton, { name: 'CmList', slot: 'itemButton' })<{
  ownerState: { depth: number }
}>(({ theme, ownerState }) => ({
  ...(ownerState.depth > 0 && { paddingLeft: theme.spacing(2 + 2 * ownerState.depth) }),
  '&.Mui-selected::before': {
    content: '""',
    position: 'absolute',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: (theme.vars || theme).palette.primary.main,
  },
  '& .CmList-chevron': {
    marginLeft: theme.spacing(1),
    color: (theme.vars || theme).palette.action.active,
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  '&[aria-expanded="true"] .CmList-chevron': { transform: 'rotate(180deg)' },
}))

const NestedList = styled(MuiList, { name: 'CmList', slot: 'nested' })({})

const ItemEnd = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: (theme.vars || theme).palette.text.secondary,
  marginLeft: theme.spacing(2),
  flexShrink: 0,
}))

/**
 * A list built from an `items` array, with MUI's `ListItem`, `ListItemButton`,
 * `ListItemIcon`, `ListItemAvatar` and `ListItemText` assembled for each item.
 * Items can be static, links, buttons, or parents with nested items. With
 * `value` or `defaultValue`, the List tracks a selected item.
 */
export function List<Id extends string | number = string>(inProps: ListProps<Id>) {
  const {
    items,
    value,
    defaultValue,
    onChange,
    expanded: expandedProp,
    defaultExpanded,
    onExpandedChange,
    subheader,
    dense = false,
    disablePadding = false,
    slotProps = {},
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rootProps
  } = useThemeProps({ props: inProps, name: 'CmList' }) as ListProps<Id>
  const {
    item: itemProps,
    itemButton: itemButtonProps,
    itemIcon: itemIconProps,
    itemAvatar: itemAvatarProps,
    itemText: itemTextProps,
    subheader: subheaderProps,
    nested: nestedProps,
  } = slotProps

  const baseId = useId()
  const subheaderId = subheaderProps?.id ?? `${baseId}-subheader`

  // Selection.
  const selectable = value !== undefined || defaultValue !== undefined
  const controlled = value !== undefined
  const [state, setState] = useState<Id | null>(defaultValue ?? null)
  // Uncontrolled, a selected item that's removed selects nothing, without
  // calling `onChange`.
  const stateExists = state !== null && containsId(items, state)
  if (!controlled && state !== null && !stateExists) {
    setState(null)
  }
  const selected = controlled ? value : stateExists ? state : null

  // Expansion. Uncontrolled, the parents of the selected item start expanded.
  const [expandedState, setExpandedState] = useState<readonly Id[]>(
    () => defaultExpanded ?? ancestorsOf(items, value ?? defaultValue ?? null),
  )
  const expanded = expandedProp ?? expandedState

  const interactiveList = selectable || onChange !== undefined

  const activate = (event: MouseEvent<HTMLElement>, item: ListItemData<Id>) => {
    item.onClick?.(event)
    if (item.children !== undefined) {
      const isExpanded = expanded.includes(item.id)
      const next = isExpanded ? expanded.filter((id) => id !== item.id) : [...expanded, item.id]
      if (expandedProp === undefined) setExpandedState(next)
      onExpandedChange?.(event, next)
      return
    }
    if (selectable && !controlled) setState(item.id)
    onChange?.(event, item.id)
  }

  const renderItems = (list: readonly ListItemData<Id>[], depth: number, path: string) =>
    list.map((item, index) => {
      const position = path === '' ? `${index}` : `${path}-${index}`
      const hasChildren = item.children !== undefined
      const isLink = item.href !== undefined
      const interactive = hasChildren || isLink || item.onClick !== undefined || interactiveList
      const isSelected = selectable && !hasChildren && selected !== null && item.id === selected
      const isExpanded = hasChildren && expanded.includes(item.id)
      const nestedId = `${baseId}-nested-${position}`

      const content = (
        <>
          {item.icon != null && <ListItemIcon {...itemIconProps}>{item.icon}</ListItemIcon>}
          {item.avatar != null && (
            <ListItemAvatar {...itemAvatarProps}>{item.avatar}</ListItemAvatar>
          )}
          <ListItemText {...itemTextProps} primary={item.primary} secondary={item.secondary} />
          {item.end != null && <ItemEnd>{item.end}</ItemEnd>}
          {hasChildren && <ChevronDownIcon className="CmList-chevron" />}
        </>
      )

      return (
        <ListItemRoot
          key={item.id}
          // A button or link brings its own padding.
          disablePadding={interactive}
          divider={item.divider}
          {...itemProps}
          className={classNames('CmList-item', itemProps?.className)}
          ownerState={{ hasChildren }}
          secondaryAction={item.action}
        >
          {interactive ? (
            <ListItemButton
              {...itemButtonProps}
              className={classNames('CmList-itemButton', itemButtonProps?.className)}
              ownerState={{ depth }}
              // MUI types `href` only with `component="a"`, but its
              // `ButtonBase` renders the theme's `LinkComponent` for it.
              {...(isLink && ({ href: item.href } as object))}
              selected={isSelected}
              disabled={item.disabled}
              aria-current={isSelected ? (isLink ? 'page' : 'true') : undefined}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-controls={hasChildren ? nestedId : undefined}
              onClick={(event: MouseEvent<HTMLElement>) => activate(event, item)}
            >
              {content}
            </ListItemButton>
          ) : (
            content
          )}
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto">
              <NestedList
                disablePadding
                dense={dense}
                {...nestedProps}
                className={classNames('CmList-nested', nestedProps?.className)}
                id={nestedId}
              >
                {renderItems(item.children, depth + 1, position)}
              </NestedList>
            </Collapse>
          )}
        </ListItemRoot>
      )
    })

  return (
    <ListRoot
      {...rootProps}
      className={classNames('CmList-root', className)}
      dense={dense}
      disablePadding={disablePadding}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledBy ?? (ariaLabel === undefined && subheader != null ? subheaderId : undefined)
      }
      subheader={
        subheader != null ? (
          <ListSubheader {...subheaderProps} id={subheaderId}>
            {subheader}
          </ListSubheader>
        ) : undefined
      }
    >
      {renderItems(items, 0, '')}
    </ListRoot>
  )
}
