import type {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SxProps,
  Theme,
} from '@mui/material/styles'
import type { TableProps as MuiTableProps } from '@mui/material/Table'
import type { TableCellProps as MuiTableCellProps } from '@mui/material/TableCell'
import type { TableContainerProps as MuiTableContainerProps } from '@mui/material/TableContainer'
import type { TablePaginationProps as MuiTablePaginationProps } from '@mui/material/TablePagination'
import type { TableRowProps as MuiTableRowProps } from '@mui/material/TableRow'
import type { ChangeEvent, ComponentProps, MouseEvent, ReactNode } from 'react'
import type { MenuItemData } from '../Menu/index.ts'

/** A value Table shows and sorts by. */
export type TableValue = string | number | boolean | Date | null | undefined

export interface TableColumn<Row> {
  /** Unique within `columns`. Used as the React key and in `TableSort`. */
  id: string
  /** The header's content. Also the column's accessible name. */
  header: ReactNode
  /** The row's property to show and sort by. */
  field?: keyof Row & string
  /** The value to show and sort by, when it isn't a single property. Wins over `field`. */
  getValue?: (row: Row) => TableValue
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

/** Text that Table adds, for other languages. */
export interface TableLabels {
  /** Shown in the body when there are no rows and no `emptyState`. */
  noRows: string
  /** The page-size picker's label. */
  rowsPerPage: string
  /** The pagination text, such as "1–10 of 100". `count` is `-1` when unknown. */
  displayedRows: (info: { from: number; to: number; count: number }) => string
  /** Names the header checkbox. */
  selectAll: string
  /** Names a row's checkbox. */
  selectRow: (rowLabel: string) => string
  /** Names a row's actions button. */
  rowActions: (rowLabel: string) => string
  /** The actions column's header, which is visually hidden. */
  actionsHeader: string
  /** Names the progress bar while `loading`. */
  loading: string
}

interface TablePropsBase<Row, Id extends string | number>
  extends Omit<ComponentProps<'div'>, 'children'> {
  /** The columns, in display order. */
  columns: readonly TableColumn<NoInfer<Row>>[]
  /** All rows in `client` mode, the current page in `server` mode. */
  rows: readonly Row[]
  /**
   * The row's unique id. Required when `Row` has no `id`.
   * @default row.id
   */
  getRowId?: (row: Row) => Id
  /**
   * Names a row for its checkbox and actions button, such as "Order 1042".
   * @default The first column's value
   */
  getRowLabel?: (row: Row) => string
  /** Controlled sort. `null` means unsorted. */
  sort?: TableSort | null
  /**
   * Initial sort when uncontrolled.
   * @default null
   */
  defaultSort?: TableSort | null
  /** Called when the user clicks a sortable header. */
  onSortChange?: (sort: TableSort | null) => void
  /**
   * `false` shows every row, without the pagination bar.
   * @default true
   */
  pagination?: boolean
  /** Controlled page, from 0. */
  page?: number
  /**
   * Initial page when uncontrolled.
   * @default 0
   */
  defaultPage?: number
  /** Called when the page changes. The event is `null` when Table goes back to the first page itself. */
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, page: number) => void
  /** Controlled rows per page. */
  pageSize?: number
  /**
   * Initial rows per page when uncontrolled.
   * @default 10
   */
  defaultPageSize?: number
  /** Called when the user picks another page size. */
  onPageSizeChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    pageSize: number,
  ) => void
  /**
   * The choices for rows per page. With one choice, the picker is hidden.
   * @default [10, 25, 50]
   */
  pageSizeOptions?: readonly number[]
  /**
   * Adds a checkbox column.
   * @default false
   */
  selectable?: boolean
  /** Controlled selected row ids. */
  selection?: readonly NoInfer<Id>[]
  /**
   * Initial selected row ids when uncontrolled.
   * @default []
   */
  defaultSelection?: readonly NoInfer<Id>[]
  /** Called when the user selects or clears rows, with every selected id. */
  onSelectionChange?: (selection: NoInfer<Id>[]) => void
  /** Adds a last column with a Menu of these items per row. */
  rowActions?: (row: Row) => readonly MenuItemData[]
  /**
   * Shows a progress bar under the header, and sets `aria-busy` on the table.
   * @default false
   */
  loading?: boolean
  /**
   * Shown in the body when there are no rows.
   * @default labels.noRows
   */
  emptyState?: ReactNode
  /** Content above the table, such as search and filter fields. */
  toolbar?: ReactNode
  /**
   * MUI's: row height.
   * @default 'medium'
   */
  size?: 'medium' | 'small'
  /**
   * MUI's: keeps the header visible when the container scrolls. Needs a
   * height, through `slotProps.container.sx`.
   * @default false
   */
  stickyHeader?: boolean
  /**
   * Text that Table adds, for other languages.
   * @default English labels
   */
  labels?: Partial<TableLabels>
  /** Names the table and its scrolling region, not the root. */
  'aria-label'?: string
  /** Names the table and its scrolling region, not the root. */
  'aria-labelledby'?: string
  /** Styles for the root `<div>`. */
  sx?: SxProps<Theme>
  /** Props for inner parts. */
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
    pagination?: Partial<
      Omit<
        MuiTablePaginationProps,
        'count' | 'page' | 'rowsPerPage' | 'onPageChange' | 'onRowsPerPageChange' | 'rowsPerPageOptions'
      >
    >
  }
}

/** `rowCount` is required in `server` mode, where `rows` is only the current page. */
type TableModeProps =
  | {
      /**
       * Who sorts and paginates: Table, over every row in `rows`, or the
       * consumer, who passes the current page.
       * @default 'client'
       */
      mode?: 'client'
      /**
       * The total number of rows, for pagination.
       * @default rows.length
       */
      rowCount?: number
    }
  | {
      mode: 'server'
      /** The total number of rows, for pagination. `-1` when unknown. */
      rowCount: number
    }

/** `getRowId` is required when `Row` has no `id` of type `Id`. */
type RowIdProps<Row, Id> = Row extends { id: Id }
  ? object
  : {
      /** The row's unique id. Required because `Row` has no `id`. */
      getRowId: (row: Row) => Id
    }

export type TableProps<Row, Id extends string | number = string> = TablePropsBase<Row, Id> &
  TableModeProps &
  RowIdProps<Row, Id>

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    CmTable: Partial<TablePropsBase<unknown, string | number>> & {
      mode?: 'client' | 'server'
      rowCount?: number
    }
  }
  interface ComponentNameToClassKey {
    CmTable: 'root' | 'toolbar' | 'container' | 'headerCell' | 'row' | 'cell' | 'empty' | 'pagination'
  }
  interface Components<Theme = unknown> {
    CmTable?: {
      defaultProps?: ComponentsProps['CmTable']
      styleOverrides?: ComponentsOverrides<Theme>['CmTable']
      variants?: ComponentsVariants<Theme>['CmTable']
    }
  }
}
