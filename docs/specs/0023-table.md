# 0023: Table

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Composite
- **Depends on:** [0000](./0000-architecture.md), [0005](./0005-inputs.md), [0006](./0006-select.md), [0001](./0001-button.md), [0016](./0016-progress.md), [0021](./0021-menu.md)

## Purpose

Shows rows of data in columns, such as orders, users or invoices, with sorting, pagination, row selection and an actions menu per row. Sorting and pagination run in the browser for data the page already has, or on the server for large data sets, where Table only reports what the user asked for.

MUI's `Table` is only the HTML table: `TableContainer`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableSortLabel` and `TablePagination` are assembled by hand, and the sorting, slicing, selection and empty and loading states are each project's code. This library's `Table` takes `columns` and `rows` and does all of that.

**Use it for:** records with several attributes that users scan, compare and sort, such as a list of orders with date, customer, status and total. Admin pages where users select rows and act on them.

**Don't use it for:**

- Items with one or two lines of text, such as notifications. Use List ([0020](./0020-list.md)).
- Layout. Use CSS grid or flexbox.
- Spreadsheet-like editing, column resizing or tens of thousands of rows on one page. See [Rendering](#rendering).
- A single record's fields. Use a list of labels and values in the page's own layout.

## Usage

```tsx
import { Chip, Table } from '@cmotino/cm-web-components'
import type { TableColumn } from '@cmotino/cm-web-components'

interface Order {
  id: string
  number: string
  customer: string
  date: Date
  status: 'paid' | 'pending'
  total: number
}

const columns: TableColumn<Order>[] = [
  { id: 'number', header: 'Order', field: 'number', sortable: true },
  { id: 'customer', header: 'Customer', field: 'customer', sortable: true },
  { id: 'date', header: 'Date', field: 'date', sortable: true, render: (row) => formatDate(row.date) },
  { id: 'status', header: 'Status', field: 'status', render: (row) => <Chip label={row.status} size="small" /> },
  { id: 'total', header: 'Total', field: 'total', sortable: true, align: 'right', render: (row) => formatMoney(row.total) },
]

// Client: Table sorts and paginates the rows it's given.
<Table
  aria-label="Orders"
  columns={columns}
  rows={orders}
  defaultSort={{ columnId: 'date', direction: 'desc' }}
  selectable
  onSelectionChange={setSelectedIds}
  rowActions={(row) => [
    { id: 'view', label: 'View', href: `/orders/${row.id}` },
    { id: 'refund', label: 'Refund', disabled: row.status !== 'paid', onClick: () => refund(row.id) },
  ]}
  getRowLabel={(row) => `Order ${row.number}`}
/>

// Server: `rows` is the current page, and Table reports what the user asks for.
<Table
  aria-label="Orders"
  mode="server"
  columns={columns}
  rows={data?.items ?? []}
  rowCount={data?.total ?? 0}
  loading={isFetching}
  sort={sort}
  onSortChange={setSort}
  page={page}
  onPageChange={(_, page) => setPage(page)}
  pageSize={pageSize}
  onPageSizeChange={(_, size) => setPageSize(size)}
  toolbar={<TextField label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />}
/>
```

## API

`Table` is a component of this library, in `src/components/Table/`, built on MUI's `Table`, `TableContainer`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableSortLabel` and `TablePagination`, with the library's Checkbox, Menu and `LinearProgress`.

```ts
export { Table } from './Table.tsx'
export type { TableProps, TableColumn, TableSort, TableLabels } from './Table.types.ts'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `columns` | `readonly TableColumn<Row>[]` | | Yes | The columns, in display order |
| `rows` | `readonly Row[]` | | Yes | All rows in `client` mode, the current page in `server` mode |
| `getRowId` | `(row: Row) => Id` | `row.id` | No | Required when `Row` has no `id` |
| `getRowLabel` | `(row: Row) => string` | The first column's value | No | Names a row for its checkbox and actions button, such as "Order 1042" |
| `mode` | `'client' \| 'server'` | `'client'` | No | Who sorts and paginates. See [Client and server](#client-and-server) |
| `rowCount` | `number` | `rows.length` | In `server` mode | The total number of rows, for pagination. `-1` when unknown |
| `sort` | `TableSort \| null` | `undefined` | No | Controlled sort |
| `defaultSort` | `TableSort \| null` | `null` | No | Initial sort when uncontrolled |
| `onSortChange` | `(sort: TableSort \| null) => void` | `undefined` | No | Called when the user clicks a sortable header |
| `pagination` | `boolean` | `true` | No | `false` shows every row, without the pagination bar |
| `page` | `number` | `undefined` | No | Controlled page, from 0 |
| `defaultPage` | `number` | `0` | No | Initial page when uncontrolled |
| `onPageChange` | `(event: MouseEvent<HTMLButtonElement> \| null, page: number) => void` | `undefined` | No | Called when the user changes page |
| `pageSize` | `number` | `undefined` | No | Controlled rows per page |
| `defaultPageSize` | `number` | `10` | No | Initial rows per page when uncontrolled |
| `onPageSizeChange` | `(event: ChangeEvent, pageSize: number) => void` | `undefined` | No | Called when the user picks another page size |
| `pageSizeOptions` | `readonly number[]` | `[10, 25, 50]` | No | The choices for rows per page. With one choice, the picker is hidden |
| `selectable` | `boolean` | `false` | No | Adds a checkbox column |
| `selection` | `readonly Id[]` | `undefined` | No | Controlled selected row ids |
| `defaultSelection` | `readonly Id[]` | `[]` | No | Initial selected row ids when uncontrolled |
| `onSelectionChange` | `(selection: Id[]) => void` | `undefined` | No | Called when the user selects or clears rows |
| `rowActions` | `(row: Row) => readonly MenuItemData[]` | `undefined` | No | Adds a last column with a Menu per row. See [0021](./0021-menu.md#data-shapes) |
| `loading` | `boolean` | `false` | No | Shows a progress bar under the header. See Variants and states |
| `emptyState` | `ReactNode` | `labels.noRows` | No | Shown in the body when there are no rows |
| `toolbar` | `ReactNode` | `undefined` | No | Content above the table, such as search and filter fields, or actions for the selected rows |
| `size` | `'medium' \| 'small'` | `'medium'` | No | MUI's: row height |
| `stickyHeader` | `boolean` | `false` | No | MUI's: keeps the header visible when the container scrolls. Needs a height, through `slotProps.container.sx` |
| `labels` | `Partial<TableLabels>` | English labels | No | Text that Table adds, for other languages |
| `slotProps` | See below | `undefined` | No | Props for inner parts |

`Table` also takes `sx`, `className`, `ref` and other props of a `<div>`, which reach the root. It's generic, as `Table<Row, Id extends string | number = string>`, and `Row` is inferred from `rows`.

```ts
export interface TableProps<Row, Id extends string | number = string>
  extends Omit<ComponentProps<'div'>, 'children'> {
  columns: readonly TableColumn<NoInfer<Row>>[]
  rows: readonly Row[]
  getRowId?: (row: Row) => Id
  getRowLabel?: (row: Row) => string
  mode?: 'client' | 'server'
  rowCount?: number
  sort?: TableSort | null
  defaultSort?: TableSort | null
  onSortChange?: (sort: TableSort | null) => void
  pagination?: boolean
  page?: number
  defaultPage?: number
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, page: number) => void
  pageSize?: number
  defaultPageSize?: number
  onPageSizeChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, pageSize: number) => void
  pageSizeOptions?: readonly number[]
  selectable?: boolean
  selection?: readonly Id[]
  defaultSelection?: readonly Id[]
  onSelectionChange?: (selection: Id[]) => void
  rowActions?: (row: Row) => readonly MenuItemData[]
  loading?: boolean
  emptyState?: ReactNode
  toolbar?: ReactNode
  size?: 'medium' | 'small'
  stickyHeader?: boolean
  labels?: Partial<TableLabels>
  'aria-label'?: string
  'aria-labelledby'?: string
  sx?: SxProps<Theme>
  slotProps?: {
    /** The `<div>` around `toolbar`. */
    toolbar?: ComponentProps<'div'>
    /** MUI's `TableContainer`, the scrolling region. */
    container?: Partial<MuiTableContainerProps>
    /** MUI's `Table`, the `<table>`. */
    table?: Partial<Omit<MuiTableProps, 'size' | 'stickyHeader'>>
    /** Every header `TableCell`. */
    headerCell?: Partial<MuiTableCellProps>
    /** Every body `TableRow`. */
    row?: Partial<Omit<MuiTableRowProps, 'selected'>>
    /** Every body `TableCell`. */
    cell?: Partial<MuiTableCellProps>
    /** MUI's `TablePagination`. */
    pagination?: Partial<Omit<MuiTablePaginationProps, 'count' | 'page' | 'rowsPerPage' | 'onPageChange' | 'onRowsPerPageChange' | 'rowsPerPageOptions'>>
  }
}
```

**Typing `mode`:** the interface above is simplified. The exported type is a union on `mode`, so `rowCount` is required with `mode: 'server'` and optional otherwise.

**Typing `Id`:** `Id` defaults to `string`. When rows have number ids, set it: `Table<Order, number>`, or let `getRowId` infer it. `getRowId` is required when `Row` has no `id` of type `Id`. `selection`, `defaultSelection` and `onSelectionChange` don't infer `Id`, so `defaultSelection={['o1']}` doesn't narrow it to `'o1'`.

### MUI Table, not DataGrid

This answers the [roadmap question](./roadmap.md#questions-for-later-specs) for Table: **Table is built on MUI's `Table`, not on MUI X DataGrid.**

- **No new dependency.** DataGrid is `@mui/x-data-grid`, a large package with its own release cycle, which would become a peer dependency of every project.
- **No paid tiers.** The free DataGrid covers sorting, filtering and pagination, but multi-column sorting, column pinning, tree data, row grouping and Excel export are in the paid Pro and Premium plans. Building on the free tier means hitting a paywall when a project asks for one of them.
- **The library's look.** MUI's `Table` is plain HTML and takes the library theme directly. DataGrid has its own styling layer.
- **The needs fit.** Sorting, pagination, selection and row actions, in the browser or on the server, are a few hundred lines on MUI's `Table`.
- **Revisit if** a project needs virtualization of thousands of rows, column resizing or editing in cells. A separate `DataGrid` component could wrap MUI X then, without changing this one.

### Client and server

This also answers the roadmap's question of where sorting and pagination run: **either, chosen per Table with `mode`.** Filtering stays outside Table in both modes.

| | `client` | `server` |
| --- | --- | --- |
| `rows` | Every row | The current page, already sorted |
| Sorting | Table sorts, with the column's `compare` or the default comparison | Table reports `onSortChange` and shows the arrow. The consumer fetches |
| Pagination | Table slices `rows` | Table reports `onPageChange` and `onPageSizeChange`, and needs `rowCount`. The consumer fetches |
| Filtering | The consumer filters `rows`, with fields in `toolbar` | The consumer adds the filters to its query, with fields in `toolbar` |

- **Default comparison:** by the column's value, from `field` or `getValue`. Strings with `Intl.Collator` in numeric mode, so "Item 2" comes before "Item 10". Numbers and booleans by value, `Date` by time. `null` and `undefined` last in both directions. The sort is stable.
- **Sort cycle:** clicking a sortable header sorts ascending, then descending, then not at all. Clicking another header sorts by it, ascending. `onSortChange` reports each step.
- **Page reset:** changing the sort or the page size goes back to the first page, calling `onPageChange` with `null` as the event and `0`. A consumer's filter change should do the same through `page`.
- **Page out of range:** in `client` mode, if `rows` shrinks below the current page, an uncontrolled Table moves to the last page. A controlled Table shows an empty page.

### Selection

- The header checkbox selects or clears every row on the current page. It's indeterminate when some are selected.
- Selection is kept by id across pages and sorts. In `server` mode it can hold ids of rows on other pages.
- A row's checkbox is named "Select {row label}", and the header's "Select all rows on this page", from `labels`.

### Rendering

Table renders the rows of the current page, in `client` mode by slicing `rows`. Sorting runs in the browser over every row, which is fine for a few thousand rows. Beyond that, or with `pagination={false}` and more than a few hundred rows, use `server` mode. There's no virtualization.

### Theme key

Table reads its props through `useThemeProps({ props, name: 'CmTable' })`, and styles its parts with MUI's `styled`, with `name: 'CmTable'` and the slots `root`, `toolbar`, `container`, `headerCell`, `row`, `cell`, `empty` and `pagination`. The class names `CmTable-root`, `CmTable-toolbar` and so on are added to those elements. The key is declared through module augmentation in `Table.types.ts`, as [0019](./0019-tabs.md#theme-key) does for `CmTabs`.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: remaining props reach the root | `aria-label` and `aria-labelledby` reach the `<table>`, and also name the scrolling region | They name the table. On the root `<div>`, which has no role, they would name nothing |

`Table.tsx` starts with `'use client'`, because it keeps state and calls `useId`, and is added to `tests/dist.test.ts`.

## Data shapes

```ts
export interface TableColumn<Row> {
  /** Unique within `columns`. Used as the React key and in `TableSort`. */
  id: string
  /** The header's content. Also the column's accessible name. */
  header: ReactNode
  /** The row's property to show and sort by. */
  field?: keyof Row & string
  /** The value to show and sort by, when it isn't a single property. Wins over `field`. */
  getValue?: (row: Row) => string | number | boolean | Date | null | undefined
  /** The cell's content. Defaults to the value, as text. */
  render?: (row: Row, rowIndex: number) => ReactNode
  /**
   * Makes the header a sort button.
   * @default false
   */
  sortable?: boolean
  /** A custom comparison for `client` mode, ascending. */
  compare?: (a: Row, b: Row) => number
  /**
   * The cells' alignment. Use `right` for numbers.
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right'
  /** The column's width, as a CSS length or a number of pixels. */
  width?: number | string
}

export interface TableSort {
  columnId: string
  direction: 'asc' | 'desc'
}

export interface TableLabels {
  noRows: string
  rowsPerPage: string
  displayedRows: (info: { from: number; to: number; count: number }) => string
  selectAll: string
  selectRow: (rowLabel: string) => string
  rowActions: (rowLabel: string) => string
  actionsHeader: string
  loading: string
}
```

Default labels, in English: "No rows", "Rows per page:", MUI's "1–10 of 100", "Select all rows on this page", "Select {row}", "Actions for {row}", "Actions" for the actions column's header, which is visually hidden, and "Loading" for the progress bar.

A column without `field`, `getValue` or `render` shows nothing. A `sortable` column in `client` mode needs `field`, `getValue` or `compare`.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | The toolbar, then the table in a box with a 1px `divider` border and the theme's `shape.borderRadius`, then the pagination bar inside the box. Header cells in `subtitle2` and `text.secondary`, body cells in `body2` and `text.primary`, a 1px `divider` line between rows |
| `size="small"` | MUI's smaller cells |
| Row hover | `action.hover` background, only when `selectable` or `rowActions` is set |
| Selected row | MUI's selected background, `primary.main` at `action.selectedOpacity`, and its checkbox checked |
| Sortable header | MUI's `TableSortLabel`: the arrow shows on hover and focus, and stays on the sorted column, pointing up for ascending |
| Keyboard focus | The theme's focus ring on sort buttons, checkboxes, action buttons and pagination buttons |
| Loading | A `LinearProgress` across the top of the body, and the rows at 50% opacity. With no rows yet, the body shows only the bar |
| Empty | One row spanning every column, with `emptyState` centered in `text.secondary` |
| `stickyHeader` | MUI's: the header stays at the top of the container, on `background.paper` |
| `pagination={false}` | No pagination bar |
| Narrow screens | The container scrolls sideways. The toolbar and pagination bar stay the width of the screen |

## Styling hooks

- **Theme keys:** `components.CmTable`, with the slots `root`, `toolbar`, `container`, `headerCell`, `row`, `cell`, `empty` and `pagination`, and default props for every Table prop. The parts also use `MuiTable`, `MuiTableCell`, `MuiTableRow`, `MuiTableSortLabel`, `MuiTablePagination`, `MuiCheckbox`, `MuiLinearProgress` and `CmMenu`.
- **Slots:** `toolbar`, `container`, `table`, `headerCell`, `row`, `cell` and `pagination`, as typed under API. The root is reached with `sx` and `className`.
- **Default look:** MUI's table with the library's tokens. Table's own styles add the border and radius around the table, the header's text style, the loading opacity and the empty row. Header and selected colors are listed under Variants and states. No change to `MuiTable*` in the default theme, so plain MUI tables keep MUI's look.

## Accessibility

- **Semantics:** a real `<table>`, with `<thead>`, `<tbody>`, `<th scope="col">` headers from MUI, and `<td>` cells. The container is a `role="region"` named like the table, with `tabIndex={0}`, so keyboard users can scroll it when it overflows.
- **Sorting:** a sortable header contains a `<button>` from `TableSortLabel`. The sorted header has `aria-sort="ascending"` or `"descending"`, through MUI's `sortDirection` on `TableCell`.
- **Keyboard:** `Tab` moves through the toolbar, sort buttons, checkboxes, row action buttons, links in cells, and the pagination controls, in order. `Enter` and `Space` work as on each control. Row actions open a Menu with the keyboard of [0021](./0021-menu.md#accessibility). Arrow-key navigation between cells is out of scope.
- **Naming:** the table is named by `aria-label` or `aria-labelledby`. Checkboxes and action buttons are named with `getRowLabel`, as described under Selection and Data shapes, so each is unique. The actions column's header is visually hidden but read.
- **Loading:** the `<table>` has `aria-busy="true"`, and the progress bar has `aria-label` from `labels.loading`, "Loading" by default.
- **Pagination:** MUI's `TablePagination`, with labelled buttons for the previous and next page, a labelled page-size picker, and the "1–10 of 100" text.
- **Contrast:** header text is `text.secondary`, at 7.15 or more, and body text `text.primary`, at 18 or more, on both schemes. Text on a selected row stays at 16 or more.

## Behavior and edge cases

- **Rows without `id`:** a type error unless `getRowId` is passed.
- **Duplicate row ids:** React logs key warnings, and selecting one selects both. Ids must be unique.
- **Long text:** cells wrap. `slotProps.cell` or a column's `render` can cut it off instead.
- **Many columns:** the container scrolls sideways. Columns keep their order. There's no hiding or pinning.
- **A `sort` naming a column that doesn't exist or isn't sortable:** no arrow shows, and `client` mode leaves the order unchanged.
- **`server` mode without `rowCount`:** a type error. `rowCount={-1}` shows "1–10 of more than 10", as MUI does, and the next-page button stays enabled.
- **`rowActions` returning `[]` for a row:** that row's button is disabled.
- **Clicking a row:** does nothing. Put a Link in a cell to open the record, which keeps the table accessible.
- **Selection in `server` mode with filters:** ids of rows that the filter hides stay selected. The consumer clears `selection` when the filter changes, if it wants to.
- **Without the library theme:** Table renders with the surrounding MUI theme.
- **Server Components:** Table is a client component. `columns` with `render`, `getValue` or `compare` are functions, so they can't come from a Server Component, but `rows` can.

## Acceptance criteria

- [ ] Renders a `table` named by `aria-label`, with a `columnheader` for each column, in order, and a `row` for each row on the page, showing each column's value or `render`.
- [ ] `getRowId` and `getRowLabel` replace the defaults.
- [ ] In `client` mode, clicking a sortable header sorts ascending, then descending, then not at all, sets `aria-sort` on its header, and calls `onSortChange` each time. Strings sort numerically, and empty values come last.
- [ ] A column's `compare` replaces the default comparison.
- [ ] In `client` mode, Table shows `pageSize` rows per page, and the pagination bar changes the page and the page size.
- [ ] Changing the sort or the page size goes back to page 0 and calls `onPageChange`.
- [ ] In `server` mode, Table doesn't sort or slice `rows`, and reports `onSortChange`, `onPageChange` and `onPageSizeChange`, with `rowCount` in the pagination text.
- [ ] Sort, page, page size and selection each work controlled and uncontrolled, without React or MUI warnings.
- [ ] With `selectable`, each row has a checkbox named from `getRowLabel`, and the header checkbox selects and clears the page, and is indeterminate for part of it. `onSelectionChange` reports the ids, kept across pages.
- [ ] `rowActions` adds an actions column with a Menu per row, named from `getRowLabel`.
- [ ] `loading` shows the progress bar and sets `aria-busy="true"` on the table.
- [ ] With no rows, `emptyState` shows in one row spanning every column.
- [ ] `toolbar`, `size`, `stickyHeader`, `pagination={false}`, `pageSizeOptions` and `labels` work as described.
- [ ] The scrolling region is focusable and named like the table.
- [ ] `ref` reaches the root `<div>`, and `className`, `sx` and other props, such as `data-*`, reach it too.
- [ ] Every entry in `slotProps` reaches its elements.
- [ ] The parts have the `CmTable-root`, `CmTable-toolbar`, `CmTable-container`, `CmTable-headerCell`, `CmTable-row`, `CmTable-cell`, `CmTable-empty` and `CmTable-pagination` classes.
- [ ] Type check: `Row` is inferred from `rows`, `field` only accepts keys of `Row`, `render` receives `Row`, and `mode="server"` without `rowCount` fails.
- [ ] A project-level `CmTable.defaultProps.size` of `'small'` applies to every Table.
- [ ] A project-level `CmTable` `styleOverrides.headerCell` object changes the header cells.
- [ ] Type check: `createCmTheme({ components: { CmTable: { defaultProps: { defaultPageSize: 25 }, styleOverrides: { root: { border: 0 } } } } })` compiles, and an unknown slot name fails.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Table renders with that theme.
- [ ] Works with the keyboard as listed under Accessibility.
- [ ] Storybook has a story for client mode, server mode with a fake delay, selection, row actions, loading, empty, small, sticky header, many columns on a narrow screen, a toolbar with a search field, and one showing a theme override.
- [ ] `Table`, `TableProps`, `TableColumn`, `TableSort` and `TableLabels` are exported from `src/index.ts`, and `Table` is added to the public API and `'use client'` lists in `tests/dist.test.ts`.

## Out of scope

- MUI X DataGrid, and a separate component built on it.
- Filters built into the columns or the header. Filtering is the consumer's, with fields in `toolbar`.
- Sorting by more than one column.
- Resizing, reordering, hiding or pinning columns.
- Virtualization.
- Editing in cells.
- Rows that expand to show details, and tree data.
- Grouped or multi-row headers, and a footer row with totals.
- Clicking a whole row to open it.
- Exporting to CSV or Excel.
- Remembering the sort, page or selection between visits.

## Open questions

- **Table or DataGrid:** confirm the decision under [MUI Table, not DataGrid](#mui-table-not-datagrid).
- **Labels in other languages:** as for Form, decide whether projects set `labels` once through `CmTable.defaultProps.labels`, which this spec already allows, or whether the library ships Spanish labels too.
- **Selecting every row:** the header checkbox selects the current page. Decide whether to add "Select all {rowCount} rows", which in `server` mode means selecting ids Table doesn't have.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Table.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| `TableCell.js` | Header cells get `scope="col"`. `sortDirection` sets `aria-sort` to `"ascending"` or `"descending"` |
| `TableSortLabel.js` | A `ButtonBase` with `active`, `direction` (default `"asc"`) and `hideSortIcon` |
| `TablePagination.js` | Defaults: `rowsPerPageOptions={[10, 25, 50, 100]}`, `labelRowsPerPage="Rows per page:"`, displayed rows as "1–10 of 100", or "of more than 10" when `count` is `-1`. The page-size picker is hidden with one option. Takes `getItemAriaLabel` for the button labels |
