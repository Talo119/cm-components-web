import type { TableColumn, TableLabels, TableSort, TableValue } from './Table.types.ts'

export const defaultLabels: TableLabels = {
  noRows: 'No rows',
  rowsPerPage: 'Rows per page:',
  displayedRows: ({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`,
  selectAll: 'Select all rows on this page',
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  rowActions: (rowLabel) => `Actions for ${rowLabel}`,
  actionsHeader: 'Actions',
  loading: 'Loading',
}

/** A column's value for a row, from `getValue` or `field`. */
export function cellValue<Row>(column: TableColumn<Row>, row: Row): TableValue {
  if (column.getValue) return column.getValue(row)
  if (column.field !== undefined) return row[column.field] as TableValue
  return undefined
}

/** A value as text, for a cell without `render` and for the default row label. */
export function formatValue(value: TableValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString()
  return String(value)
}

const collator = new Intl.Collator(undefined, { numeric: true })

/** Compares two values ascending. Strings sort numerically, so "Item 2" comes before "Item 10". */
function compareValues(a: TableValue, b: TableValue): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'string' && typeof b === 'string') return collator.compare(a, b)
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return collator.compare(formatValue(a), formatValue(b))
}

/** Whether `client` mode can sort by the column. */
export function canSort<Row>(column: TableColumn<Row> | undefined): column is TableColumn<Row> {
  return (
    column !== undefined &&
    column.sortable === true &&
    (column.compare !== undefined || column.getValue !== undefined || column.field !== undefined)
  )
}

/**
 * The rows sorted by `sort`, as a new array. The sort is stable, and empty
 * values come last in both directions. Without a sortable column, the order
 * is unchanged.
 */
export function sortRows<Row>(
  rows: readonly Row[],
  columns: readonly TableColumn<Row>[],
  sort: TableSort | null,
): readonly Row[] {
  if (sort === null) return rows
  const column = columns.find((candidate) => candidate.id === sort.columnId)
  if (!canSort(column)) return rows
  const sign = sort.direction === 'asc' ? 1 : -1

  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      let result: number
      if (column.compare) {
        result = sign * column.compare(a.row, b.row)
      } else {
        const valueA = cellValue(column, a.row)
        const valueB = cellValue(column, b.row)
        const emptyA = valueA === null || valueA === undefined
        const emptyB = valueB === null || valueB === undefined
        if (emptyA || emptyB) result = emptyA === emptyB ? 0 : emptyA ? 1 : -1
        else result = sign * compareValues(valueA, valueB)
      }
      return result !== 0 ? result : a.index - b.index
    })
    .map(({ row }) => row)
}

/** The next step of the sort cycle: ascending, descending, then not at all. */
export function nextSort(current: TableSort | null, columnId: string): TableSort | null {
  if (current?.columnId !== columnId) return { columnId, direction: 'asc' }
  return current.direction === 'asc' ? { columnId, direction: 'desc' } : null
}
