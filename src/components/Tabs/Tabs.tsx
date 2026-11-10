'use client'

import { styled, useThemeProps } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import MuiTabs from '@mui/material/Tabs'
import { useId, useState } from 'react'
import type { TabItem, TabsProps } from './Tabs.types.ts'

interface OwnerState {
  orientation: 'horizontal' | 'vertical'
}

const TabsRoot = styled('div', { name: 'CmTabs', slot: 'root' })<{ ownerState: OwnerState }>({
  variants: [{ props: { orientation: 'vertical' }, style: { display: 'flex' } }],
})

// The divider line sits on the panels' side of the row, where MUI's indicator is.
const TabsList = styled(MuiTabs, { name: 'CmTabs', slot: 'tabs' })(({ theme }) => ({
  borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
  variants: [
    {
      props: { orientation: 'vertical' },
      style: {
        borderBottom: 0,
        borderRight: `1px solid ${(theme.vars || theme).palette.divider}`,
        flexShrink: 0,
      },
    },
  ],
}))

const TabPanel = styled('div', { name: 'CmTabs', slot: 'panel' })<{ ownerState: OwnerState }>(
  ({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    // So a project's `display` doesn't show a hidden panel.
    '&[hidden]': { display: 'none' },
    variants: [
      {
        props: { orientation: 'vertical' },
        style: {
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          flexGrow: 1,
          minWidth: 0,
        },
      },
    ],
  }),
)

/**
 * Tabs built from an `items` array, with a panel for each item's `content`,
 * linked to its tab. Items with `href` are links, through the theme's
 * `LinkComponent`, and have no panel.
 */
export function Tabs<Id extends string | number = string>(inProps: TabsProps<Id>) {
  const {
    items,
    value,
    defaultValue,
    onChange,
    keepMounted = false,
    variant,
    orientation = 'horizontal',
    centered,
    scrollButtons,
    selectionFollowsFocus,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    slotProps = {},
    className,
    ...rootProps
  } = useThemeProps({ props: inProps, name: 'CmTabs' }) as TabsProps<Id>
  const { tabs: tabsProps, tab: tabProps, panel: panelProps } = slotProps
  const ownerState: OwnerState = { orientation: orientation ?? 'horizontal' }

  const baseId = useId()
  const tabId = (index: number) => `${baseId}-tab-${index}`
  const panelId = (index: number) => `${baseId}-panel-${index}`

  const firstEnabled = items.find((item) => !item.disabled)?.id ?? null
  const controlled = value !== undefined
  const [state, setState] = useState<Id | null>(
    defaultValue === undefined ? firstEnabled : defaultValue,
  )

  // Uncontrolled, a selected item that's removed or disabled falls back to
  // the first enabled one, without calling `onChange`. `null` stays `null`.
  const isEnabled = items.some((item) => item.id === state && !item.disabled)
  const uncontrolledValue = state === null || isEnabled ? state : firstEnabled
  if (!controlled && uncontrolledValue !== null && uncontrolledValue !== state) {
    setState(uncontrolledValue)
  }
  const selected = controlled ? value : uncontrolledValue

  const panelIsRendered = (item: TabItem<Id>) =>
    item.content !== undefined && (keepMounted || item.id === selected)

  return (
    <TabsRoot className={classNames('CmTabs-root', className)} ownerState={ownerState} {...rootProps}>
      <TabsList
        {...tabsProps}
        className={classNames('CmTabs-tabs', tabsProps?.className)}
        // MUI shows no selection for `false`.
        value={selected ?? false}
        onChange={(event, newValue: Id) => {
          if (!controlled) setState(newValue)
          onChange?.(event, newValue)
        }}
        variant={variant}
        orientation={orientation}
        centered={centered}
        scrollButtons={scrollButtons}
        selectionFollowsFocus={selectionFollowsFocus}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {items.map((item, index) => (
          <MuiTab
            key={item.id}
            {...tabProps}
            value={item.id}
            label={item.label}
            icon={item.icon}
            disabled={item.disabled}
            id={tabId(index)}
            // Only while the panel is in the DOM, so the reference is valid.
            aria-controls={panelIsRendered(item) ? panelId(index) : undefined}
            {...(item.href !== undefined && {
              href: item.href,
              'aria-current': item.id === selected ? 'page' : undefined,
            })}
          />
        ))}
      </TabsList>
      {items.map((item, index) =>
        panelIsRendered(item) ? (
          <TabPanel
            key={item.id}
            {...panelProps}
            className={classNames('CmTabs-panel', panelProps?.className)}
            ownerState={ownerState}
            role="tabpanel"
            id={panelId(index)}
            aria-labelledby={tabId(index)}
            hidden={item.id !== selected}
            tabIndex={0}
          >
            {item.content}
          </TabPanel>
        ) : null,
      )}
    </TabsRoot>
  )
}

function classNames(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(' ')
}
