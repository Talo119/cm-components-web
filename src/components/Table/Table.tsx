'use client'

import IconButton from '@mui/material/IconButton'
import { styled, useThemeProps } from '@mui/material/styles'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import MuiTableCell from '@mui/material/TableCell'
import MuiTableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import MuiTablePagination from '@mui/material/TablePagination'
import MuiTableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { useControlled } from '@mui/material/utils'
import visuallyHidden from '@mui/utils/visuallyHidden'
import { useId } from 'react'
import type { MouseEvent } from 'react'
import { Checkbox } from '../Checkbox/index.ts'
import { classNames } from '../classNames.ts'
import { MoreVerticalIcon } from '../icons.tsx'
import { Menu } from '../Menu/index.ts'
import { LinearProgress } from '../Progress/index.ts'
import type { TableProps, TableSort } from './Table.types.ts'
import { canSort, cellValue, defaultLabels, formatValue, nextSort, sortRows } from './Table.utils.ts'

const TableRoot = styled('div', { name: 'CmTable', slot: 'root' })(({ theme }) => ({
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: (theme.vars || theme).palette.background.paper,
}))

const TableToolbar = styled('div', { name: 'CmTable', slot: 'toolbar' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}))

const TableContainer = styled(MuiTableContainer, { name: 'CmTable', slot: 'container' })(
  ({ theme }) => ({
    '&:focus-visible': {
      outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
      outlineOffset: -2,
    },
  }),
)

const HeaderCell = styled(MuiTableCell, { name: 'CmTable', slot: 'headerCell' })(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: (theme.vars || theme).palette.text.secondary,
}))

const TableRow = styled(MuiTableRow, { name: 'CmTable', slot: 'row' })<{
  ownerState: { loading: boolean }
}>({
  variants: [{ props: { loading: true }, style: { opacity: 0.5 } }],
})

const TableCell = styled(MuiTableCell, { name: 'CmTable', slot: 'cell' })(({ theme }) => ({
  ...theme.typography.body2,
  color: (theme.vars || theme).palette.text.primary,
}))

const EmptyCell = styled(MuiTableCell, { name: 'CmTable', slot: 'empty' })(({ theme }) => ({
  ...theme.typography.body2,
  color: (theme.vars || theme).palette.text.secondary,
  textAlign: 'center',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}))

const ProgressCell = styled(MuiTableCell)({ padding: 0, borderBottom: 0 })

const TablePagination = styled(MuiTablePagination, { name: 'CmTable', slot: 'pagination' })(
  ({ theme }) => ({ borderTop: `1px solid ${(theme.vars || theme).palette.divider}` }),
)

/**
 * A table built from `columns` and `rows`, on MUI's `Table`, with sorting,
 * pagination, row selection and an actions Menu per row. In `client` mode,
 * Table sorts and slices `rows`. In `server` mode, `rows` is the current
 * page, and Table only reports what the user asked for.
 */
export function Table<Row, Id extends string | number = string>(inProps: TableProps<Row, Id>) {
  const props = useThemeProps({ props: inProps, name: 'CmTable' }) as TableProps<Row, Id>
  const {
    columns,
    rows,
    getRowId = (row: Row) => (row as { id: Id }).id,
    getRowLabel,
    mode = 'client',
    rowCount: rowCountProp,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    pagination = true,
    page: pageProp,
    defaultPage = 0,
    onPageChange,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50],
    selectable = false,
    selection: selectionProp,
    defaultSelection = [],
    onSelectionChange,
    rowActions,
    loading = false,
    emptyState,
    toolbar,
    size = 'medium',
    stickyHeader = false,
    labels: labelsProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    slotProps = {},
    className,
    ...rootProps
  } = props
  const {
    toolbar: toolbarProps,
    container: containerProps,
    table: tableProps,
    headerCell: headerCellProps,
    row: rowProps,
    cell: cellProps,
    pagination: paginationProps,
  } = slotProps
  const labels = { ...defaultLabels, ...labelsProp }
  const client = mode === 'client'
  const tableId = useId()

  const [sort, setSort] = useControlled<TableSort | null>({
    controlled: sortProp,
    default: defaultSort,
    name: 'Table',
    state: 'sort',
  })
  const [page, setPage] = useControlled({
    controlled: pageProp,
    default: defaultPage,
    name: 'Table',
    state: 'page',
  })
  const [pageSize, setPageSize] = useControlled({
    controlled: pageSizeProp,
    default: defaultPageSize,
    name: 'Table',
    state: 'pageSize',
  })
  const [selection, setSelection] = useControlled<readonly Id[]>({
    controlled: selectionProp,
    default: defaultSelection,
    name: 'Table',
    state: 'selection',
  })

  const sortedRows = client ? sortRows(rows, columns, sort) : rows
  const rowCount = client ? rows.length : (rowCountProp ?? rows.length)

  // Uncontrolled, a page past the end moves to the last page.
  const lastPage = Math.max(0, Math.ceil(rowCount / pageSize) - 1)
  if (client && pagination && pageProp === undefined && page > lastPage) {
    setPage(lastPage)
  }
  const pageRows =
    client && pagination ? sortedRows.slice(page * pageSize, (page + 1) * pageSize) : sortedRows

  const labelOf = (row: Row) =>
    getRowLabel ? getRowLabel(row) : columns[0] ? formatValue(cellValue(columns[0], row)) : ''

  const goToFirstPage = () => {
    if (page === 0) return
    setPage(0)
    onPageChange?.(null, 0)
  }

  const changeSelection = (next: Id[]) => {
    setSelection(next)
    onSelectionChange?.(next)
  }

  const pageIds = pageRows.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selection.includes(id))
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const interactiveRows = selectable || rowActions !== undefined

  return (
    <TableRoot {...rootProps} className={classNames('CmTable-root', className)}>
      {toolbar != null && (
        <TableToolbar {...toolbarProps} className={classNames('CmTable-toolbar', toolbarProps?.className)}>
          {toolbar}
        </TableToolbar>
      )}
      <TableContainer
        // Keyboard users can scroll it when it overflows.
        tabIndex={0}
        {...containerProps}
        className={classNames('CmTable-container', containerProps?.className)}
        role="region"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <MuiTable
          {...tableProps}
          id={tableProps?.id ?? tableId}
          size={size}
          stickyHeader={stickyHeader}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-busy={loading || undefined}
        >
          <TableHead>
            <MuiTableRow>
              {selectable && (
                <HeaderCell
                  padding="checkbox"
                  {...headerCellProps}
                  className={classNames('CmTable-headerCell', headerCellProps?.className)}
                >
                  <Checkbox
                    aria-label={labels.selectAll}
                    checked={pageIds.length > 0 && selectedOnPage.length === pageIds.length}
                    indeterminate={selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length}
                    disabled={pageIds.length === 0}
                    onChange={() =>
                      changeSelection(
                        selectedOnPage.length === pageIds.length
                          ? selection.filter((id) => !pageIds.includes(id))
                          : [...selection, ...pageIds.filter((id) => !selection.includes(id))],
                      )
                    }
                  />
                </HeaderCell>
              )}
              {columns.map((column) => {
                const sorted = sort !== null && sort.columnId === column.id && column.sortable === true
                const sortable = column.sortable === true && (!client || canSort(column))
                return (
                  <HeaderCell
                    key={column.id}
                    align={column.align}
                    sortDirection={sorted ? sort.direction : false}
                    {...headerCellProps}
                    className={classNames('CmTable-headerCell', headerCellProps?.className)}
                    style={{ width: column.width, ...headerCellProps?.style }}
                  >
                    {sortable ? (
                      <TableSortLabel
                        active={sorted}
                        direction={sorted ? sort.direction : 'asc'}
                        onClick={() => {
                          const next = nextSort(sort, column.id)
                          setSort(next)
                          onSortChange?.(next)
                          goToFirstPage()
                        }}
                      >
                        {column.header}
                      </TableSortLabel>
                    ) : (
                      column.header
                    )}
                  </HeaderCell>
                )
              })}
              {rowActions && (
                <HeaderCell
                  padding="checkbox"
                  {...headerCellProps}
                  className={classNames('CmTable-headerCell', headerCellProps?.className)}
                >
                  <span style={visuallyHidden}>{labels.actionsHeader}</span>
                </HeaderCell>
              )}
            </MuiTableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <MuiTableRow role="presentation">
                <ProgressCell role="presentation" colSpan={columnCount}>
                  <LinearProgress aria-label={labels.loading} />
                </ProgressCell>
              </MuiTableRow>
            )}
            {pageRows.length === 0 && !loading && (
              <MuiTableRow>
                <EmptyCell colSpan={columnCount} className="CmTable-empty">
                  {emptyState ?? labels.noRows}
                </EmptyCell>
              </MuiTableRow>
            )}
            {pageRows.map((row, index) => {
              const id = pageIds[index]
              const rowLabel = labelOf(row)
              const selected = selectable && selection.includes(id)
              const actions = rowActions?.(row)
              return (
                <TableRow
                  key={id}
                  hover={interactiveRows}
                  {...rowProps}
                  className={classNames('CmTable-row', rowProps?.className)}
                  ownerState={{ loading }}
                  selected={selected}
                >
                  {selectable && (
                    <TableCell
                      padding="checkbox"
                      {...cellProps}
                      className={classNames('CmTable-cell', cellProps?.className)}
                    >
                      <Checkbox
                        aria-label={labels.selectRow(rowLabel)}
                        checked={selected}
                        onChange={() =>
                          changeSelection(
                            selected ? selection.filter((other) => other !== id) : [...selection, id],
                          )
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      {...cellProps}
                      className={classNames('CmTable-cell', cellProps?.className)}
                    >
                      {column.render
                        ? column.render(row, index)
                        : formatValue(cellValue(column, row))}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell
                      padding="checkbox"
                      {...cellProps}
                      className={classNames('CmTable-cell', cellProps?.className)}
                    >
                      <Menu
                        placement="bottom-end"
                        items={actions}
                        trigger={
                          <IconButton
                            aria-label={labels.rowActions(rowLabel)}
                            disabled={actions.length === 0}
                          >
                            <MoreVerticalIcon />
                          </IconButton>
                        }
                      />
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          {...paginationProps}
          className={classNames('CmTable-pagination', paginationProps?.className)}
          count={rowCount}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[...pageSizeOptions]}
          labelRowsPerPage={labels.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) => labels.displayedRows({ from, to, count })}
          onPageChange={(event, newPage) => {
            setPage(newPage)
            onPageChange?.(event as MouseEvent<HTMLButtonElement> | null, newPage)
          }}
          onRowsPerPageChange={(event) => {
            const newSize = Number(event.target.value)
            setPageSize(newSize)
            onPageSizeChange?.(event, newSize)
            goToFirstPage()
          }}
        />
      )}
    </TableRoot>
  )
}
