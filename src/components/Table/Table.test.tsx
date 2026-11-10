import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Table } from './index.ts'
import type { TableColumn, TableSort } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

interface Order {
  id: string
  number: string
  customer: string | null
  total: number
}

const orders: Order[] = Array.from({ length: 23 }, (_, index) => ({
  id: `o${index + 1}`,
  number: `Item ${index + 1}`,
  customer: index === 1 ? null : `Customer ${String.fromCharCode(65 + (index % 5))}`,
  total: (index * 37) % 100,
}))

const noOrders: Order[] = []

const columns: TableColumn<Order>[] = [
  { id: 'number', header: 'Order', field: 'number', sortable: true },
  { id: 'customer', header: 'Customer', field: 'customer', sortable: true },
  { id: 'total', header: 'Total', field: 'total', sortable: true, align: 'right', render: (row) => `$${row.total}` },
]

const table = () => screen.getByRole('table')
const bodyRows = () => within(table().querySelector('tbody')!).queryAllByRole('row')
// The first data cell, after the checkbox cell when `selectable`.
const firstColumn = () =>
  bodyRows().map((row) => row.querySelector('td:not(.MuiTableCell-paddingCheckbox)')!.textContent)
const header = (name: string) => screen.getByRole('columnheader', { name })
const sortButton = (name: string) => within(header(name)).getByRole('button')
const nextPage = () => screen.getByRole('button', { name: 'Go to next page' })

describe('Table', () => {
  let warn: MockInstance
  let error: MockInstance

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn')
    error = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const expectNoWarnings = () => {
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  }

  it('renders a table named by aria-label, with headers in order and a row per row on the page', () => {
    render(<Table aria-label="Orders" columns={columns} rows={orders} />)

    expect(screen.getByRole('table', { name: 'Orders' })).toBe(table())
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Order',
      'Customer',
      'Total',
    ])
    expect(bodyRows()).toHaveLength(10)
    const cells = within(bodyRows()[0]).getAllByRole('cell')
    expect(cells.map((cell) => cell.textContent)).toEqual(['Item 1', 'Customer A', '$0'])
    expect(cells[2]).toHaveClass('MuiTableCell-alignRight')
    expect(header('Order')).toHaveAttribute('scope', 'col')
    expectNoWarnings()
  })

  it('shows getValue over field, and nothing without field, getValue or render', () => {
    render(
      <Table
        aria-label="Orders"
        columns={[
          { id: 'label', header: 'Label', field: 'number', getValue: (row) => `#${row.id}` },
          { id: 'empty', header: 'Empty' },
        ]}
        rows={orders.slice(0, 1)}
      />,
    )

    expect(within(bodyRows()[0]).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['#o1', ''])
  })

  it('uses getRowId and getRowLabel', async () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        aria-label="People"
        columns={[{ id: 'name', header: 'Name', field: 'name' }]}
        rows={[{ key: 7, name: 'Ana' }]}
        getRowId={(row) => row.key}
        getRowLabel={(row) => `Person ${row.name}`}
        selectable
        onSelectionChange={onSelectionChange}
        rowActions={() => [{ id: 'view', label: 'View' }]}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Person Ana' }))

    expect(onSelectionChange).toHaveBeenCalledWith([7])
    expect(screen.getByRole('button', { name: 'Actions for Person Ana' })).toBeInTheDocument()
  })

  it('names rows by the first column’s value by default', () => {
    render(<Table aria-label="Orders" columns={columns} rows={orders.slice(0, 1)} selectable />)

    expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).toBeInTheDocument()
  })

  describe('sorting in client mode', () => {
    it('cycles ascending, descending and unsorted, with aria-sort and onSortChange', async () => {
      const onSortChange = vi.fn()
      render(
        <Table aria-label="Orders" columns={columns} rows={orders} pagination={false} onSortChange={onSortChange} />,
      )

      await userEvent.click(sortButton('Order'))
      expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'number', direction: 'asc' })
      expect(header('Order')).toHaveAttribute('aria-sort', 'ascending')
      // Numeric: "Item 2" before "Item 10".
      expect(firstColumn().slice(0, 3)).toEqual(['Item 1', 'Item 2', 'Item 3'])

      await userEvent.click(sortButton('Order'))
      expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'number', direction: 'desc' })
      expect(header('Order')).toHaveAttribute('aria-sort', 'descending')
      expect(firstColumn().slice(0, 2)).toEqual(['Item 23', 'Item 22'])

      await userEvent.click(sortButton('Order'))
      expect(onSortChange).toHaveBeenLastCalledWith(null)
      expect(header('Order')).not.toHaveAttribute('aria-sort')
      expect(firstColumn().slice(0, 2)).toEqual(['Item 1', 'Item 2'])
    })

    it('sorts by another header ascending', async () => {
      render(<Table aria-label="Orders" columns={columns} rows={orders} defaultSort={{ columnId: 'number', direction: 'desc' }} />)

      await userEvent.click(sortButton('Total'))

      expect(header('Total')).toHaveAttribute('aria-sort', 'ascending')
      expect(header('Order')).not.toHaveAttribute('aria-sort')
    })

    it('puts empty values last in both directions, and keeps the sort stable', async () => {
      render(<Table aria-label="Orders" columns={columns} rows={orders} pagination={false} />)
      const customers = () => bodyRows().map((row) => within(row).getAllByRole('cell')[1].textContent)

      await userEvent.click(sortButton('Customer'))
      expect(customers().at(-1)).toBe('')
      expect(firstColumn().slice(0, 3)).toEqual(['Item 1', 'Item 6', 'Item 11'])

      await userEvent.click(sortButton('Customer'))
      expect(customers().at(-1)).toBe('')
      expect(customers()[0]).toBe('Customer E')
    })

    it('sorts dates by time and booleans by value', () => {
      const rows = [
        { id: 'a', when: new Date(2024, 5, 1), done: true },
        { id: 'b', when: new Date(2023, 0, 1), done: false },
      ]
      const { rerender } = render(
        <Table
          aria-label="Tasks"
          columns={[
            { id: 'id', header: 'Id', field: 'id' },
            { id: 'when', header: 'When', field: 'when', sortable: true },
            { id: 'done', header: 'Done', field: 'done', sortable: true },
          ]}
          rows={rows}
          sort={{ columnId: 'when', direction: 'asc' }}
        />,
      )
      expect(firstColumn()).toEqual(['b', 'a'])

      rerender(
        <Table
          aria-label="Tasks"
          columns={[
            { id: 'id', header: 'Id', field: 'id' },
            { id: 'done', header: 'Done', field: 'done', sortable: true },
          ]}
          rows={rows}
          sort={{ columnId: 'done', direction: 'desc' }}
        />,
      )
      expect(firstColumn()).toEqual(['a', 'b'])
    })

    it('uses a column’s compare', async () => {
      render(
        <Table
          aria-label="Orders"
          columns={[{ id: 'number', header: 'Order', sortable: true, render: (row) => row.number, compare: (a, b) => b.total - a.total }]}
          rows={orders.slice(0, 4)}
        />,
      )

      await userEvent.click(sortButton('Order'))

      expect(firstColumn()).toEqual(['Item 3', 'Item 2', 'Item 4', 'Item 1'])
    })

    it('leaves the order unchanged for a sort on a missing or non-sortable column', () => {
      render(
        <Table
          aria-label="Orders"
          columns={[{ id: 'number', header: 'Order', field: 'number' }]}
          rows={orders.slice(0, 3)}
          sort={{ columnId: 'number', direction: 'desc' }}
        />,
      )

      expect(firstColumn()).toEqual(['Item 1', 'Item 2', 'Item 3'])
      expect(header('Order')).not.toHaveAttribute('aria-sort')
      expect(within(header('Order')).queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('pagination in client mode', () => {
    it('shows pageSize rows per page and changes page and page size', async () => {
      const onPageChange = vi.fn()
      const onPageSizeChange = vi.fn()
      render(
        <Table
          aria-label="Orders"
          columns={columns}
          rows={orders}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />,
      )
      expect(screen.getByText('1–10 of 23')).toBeInTheDocument()

      await userEvent.click(nextPage())
      expect(onPageChange).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'click' }), 1)
      expect(firstColumn()[0]).toBe('Item 11')

      await userEvent.click(nextPage())
      expect(bodyRows()).toHaveLength(3)
      expect(screen.getByText('21–23 of 23')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('combobox', { name: 'Rows per page:' }))
      await userEvent.click(screen.getByRole('option', { name: '25' }))
      expect(onPageSizeChange).toHaveBeenCalledWith(expect.anything(), 25)
      expect(bodyRows()).toHaveLength(23)
      expect(onPageChange).toHaveBeenLastCalledWith(null, 0)
      expectNoWarnings()
    })

    it('goes back to the first page when the sort changes', async () => {
      const onPageChange = vi.fn()
      render(<Table aria-label="Orders" columns={columns} rows={orders} defaultPage={2} onPageChange={onPageChange} />)

      await userEvent.click(sortButton('Order'))

      expect(onPageChange).toHaveBeenCalledWith(null, 0)
      expect(firstColumn()[0]).toBe('Item 1')
    })

    it('moves an uncontrolled Table to the last page when rows shrink', () => {
      const { rerender } = render(<Table aria-label="Orders" columns={columns} rows={orders} defaultPage={2} />)

      rerender(<Table aria-label="Orders" columns={columns} rows={orders.slice(0, 12)} />)

      expect(firstColumn()).toEqual(['Item 11', 'Item 12'])
    })

    it('shows every row without the bar with pagination={false}', () => {
      render(<Table aria-label="Orders" columns={columns} rows={orders} pagination={false} />)

      expect(bodyRows()).toHaveLength(23)
      expect(document.querySelector('.CmTable-pagination')).not.toBeInTheDocument()
    })

    it('hides the page-size picker with one option', () => {
      render(<Table aria-label="Orders" columns={columns} rows={orders} pageSizeOptions={[5]} defaultPageSize={5} />)

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      expect(bodyRows()).toHaveLength(5)
    })
  })

  describe('server mode', () => {
    it('doesn’t sort or slice rows, and reports what the user asks for', async () => {
      const onSortChange = vi.fn()
      const onPageChange = vi.fn()
      const onPageSizeChange = vi.fn()
      const page = orders.slice(0, 12)
      render(
        <Table
          aria-label="Orders"
          mode="server"
          columns={columns}
          rows={page}
          rowCount={230}
          onSortChange={onSortChange}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />,
      )

      expect(bodyRows()).toHaveLength(12)
      expect(screen.getByText('1–10 of 230')).toBeInTheDocument()

      await userEvent.click(sortButton('Order'))
      await userEvent.click(sortButton('Order'))
      expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'number', direction: 'desc' })
      expect(header('Order')).toHaveAttribute('aria-sort', 'descending')
      expect(firstColumn()[0]).toBe('Item 1')

      await userEvent.click(nextPage())
      expect(onPageChange).toHaveBeenLastCalledWith(expect.anything(), 1)
      expect(firstColumn()[0]).toBe('Item 1')

      await userEvent.click(screen.getByRole('combobox', { name: 'Rows per page:' }))
      await userEvent.click(screen.getByRole('option', { name: '50' }))
      expect(onPageSizeChange).toHaveBeenCalledWith(expect.anything(), 50)
    })

    it('shows "more than" with rowCount={-1} and keeps the next-page button enabled', () => {
      render(<Table aria-label="Orders" mode="server" columns={columns} rows={orders.slice(0, 10)} rowCount={-1} />)

      expect(screen.getByText('1–10 of more than 10')).toBeInTheDocument()
      expect(nextPage()).toBeEnabled()
    })
  })

  describe('state', () => {
    it('works with every state controlled', async () => {
      function Controlled() {
        const [sort, setSort] = useState<TableSort | null>(null)
        const [page, setPage] = useState(0)
        const [pageSize, setPageSize] = useState(5)
        const [selection, setSelection] = useState<string[]>([])
        return (
          <Table
            aria-label="Orders"
            columns={columns}
            rows={orders}
            sort={sort}
            onSortChange={setSort}
            page={page}
            onPageChange={(_, next) => setPage(next)}
            pageSize={pageSize}
            onPageSizeChange={(_, next) => setPageSize(next)}
            pageSizeOptions={[5, 10]}
            selectable
            selection={selection}
            onSelectionChange={setSelection}
          />
        )
      }
      render(<Controlled />)

      expect(bodyRows()).toHaveLength(5)
      await userEvent.click(nextPage())
      expect(firstColumn()[0]).toBe('Item 6')
      await userEvent.click(screen.getByRole('checkbox', { name: 'Select Item 6' }))
      expect(screen.getByRole('checkbox', { name: 'Select Item 6' })).toBeChecked()
      await userEvent.click(sortButton('Order'))
      await userEvent.click(sortButton('Order'))
      expect(firstColumn()[0]).toBe('Item 23')
      expectNoWarnings()
    })

    it('keeps a controlled state the consumer doesn’t change', async () => {
      const onSortChange = vi.fn()
      const onSelectionChange = vi.fn()
      render(
        <Table
          aria-label="Orders"
          columns={columns}
          rows={orders}
          sort={null}
          onSortChange={onSortChange}
          page={0}
          selectable
          selection={[]}
          onSelectionChange={onSelectionChange}
        />,
      )

      await userEvent.click(sortButton('Order'))
      await userEvent.click(nextPage())
      await userEvent.click(screen.getByRole('checkbox', { name: 'Select Item 1' }))

      expect(onSortChange).toHaveBeenCalled()
      expect(onSelectionChange).toHaveBeenCalledWith(['o1'])
      expect(header('Order')).not.toHaveAttribute('aria-sort')
      expect(firstColumn()[0]).toBe('Item 1')
      expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).not.toBeChecked()
    })
  })

  describe('selection', () => {
    it('selects rows, and the header checkbox selects and clears the page and is indeterminate for part of it', async () => {
      const onSelectionChange = vi.fn()
      render(<Table aria-label="Orders" columns={columns} rows={orders} selectable onSelectionChange={onSelectionChange} />)
      const all = () => screen.getByRole('checkbox', { name: 'Select all rows on this page' })

      await userEvent.click(screen.getByRole('checkbox', { name: 'Select Item 2' }))
      expect(onSelectionChange).toHaveBeenLastCalledWith(['o2'])
      expect(all()).toHaveAttribute('data-indeterminate', 'true')
      expect(bodyRows()[1]).toHaveClass('Mui-selected')

      await userEvent.click(all())
      expect(onSelectionChange).toHaveBeenLastCalledWith(['o2', 'o1', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8', 'o9', 'o10'])
      expect(all()).toBeChecked()

      await userEvent.click(nextPage())
      expect(all()).not.toBeChecked()
      await userEvent.click(screen.getByRole('checkbox', { name: 'Select Item 11' }))
      expect(onSelectionChange.mock.lastCall![0]).toHaveLength(11)

      await userEvent.click(screen.getByRole('button', { name: 'Go to previous page' }))
      await userEvent.click(all())
      expect(onSelectionChange).toHaveBeenLastCalledWith(['o11'])
    })

    it('keeps selection by id across sorts', async () => {
      render(<Table aria-label="Orders" columns={columns} rows={orders} selectable defaultSelection={['o1']} />)

      await userEvent.click(sortButton('Order'))
      await userEvent.click(sortButton('Order'))

      expect(screen.queryByRole('checkbox', { name: 'Select Item 1' })).not.toBeInTheDocument()
      await userEvent.click(sortButton('Order'))
      expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).toBeChecked()
    })
  })

  describe('row actions', () => {
    it('adds an actions column with a Menu per row, named by the row label', async () => {
      const refund = vi.fn()
      render(
        <Table
          aria-label="Orders"
          columns={columns}
          rows={orders.slice(0, 2)}
          getRowLabel={(row) => `Order ${row.number}`}
          rowActions={(row) =>
            row.id === 'o2'
              ? []
              : [
                  { id: 'view', label: 'View', href: `/orders/${row.id}` },
                  { id: 'refund', label: 'Refund', onClick: () => refund(row.id) },
                ]
          }
        />,
      )

      expect(screen.getAllByRole('columnheader').at(-1)).toHaveTextContent('Actions')
      expect(screen.getByRole('button', { name: 'Actions for Order Item 2' })).toBeDisabled()

      await userEvent.click(screen.getByRole('button', { name: 'Actions for Order Item 1' }))
      expect(screen.getByRole('menu', { name: 'Actions for Order Item 1' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'View' })).toHaveAttribute('href', '/orders/o1')
      await userEvent.click(screen.getByRole('menuitem', { name: 'Refund' }))
      expect(refund).toHaveBeenCalledWith('o1')
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })
  })

  it('shows a progress bar and sets aria-busy while loading', () => {
    const { rerender } = render(<Table aria-label="Orders" columns={columns} rows={orders} loading />)

    expect(table()).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(10)

    rerender(<Table aria-label="Orders" columns={columns} rows={noOrders} loading />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('No rows')).not.toBeInTheDocument()

    rerender(<Table aria-label="Orders" columns={columns} rows={orders} />)
    expect(table()).not.toHaveAttribute('aria-busy')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows emptyState in one row spanning every column', () => {
    const { rerender } = render(<Table aria-label="Orders" columns={columns} rows={noOrders} selectable />)

    const empty = document.querySelector('.CmTable-empty')!
    expect(empty).toHaveTextContent('No rows')
    expect(empty).toHaveAttribute('colspan', '4')

    rerender(<Table aria-label="Orders" columns={columns} rows={noOrders} emptyState="No orders yet" />)
    expect(document.querySelector('.CmTable-empty')).toHaveTextContent('No orders yet')
    expectNoWarnings()
  })

  it('renders toolbar, size and stickyHeader', () => {
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={orders}
        toolbar={<input aria-label="Search" />}
        size="small"
        stickyHeader
      />,
    )

    expect(document.querySelector('.CmTable-toolbar')).toContainElement(screen.getByRole('textbox', { name: 'Search' }))
    expect(table()).toHaveClass('MuiTable-stickyHeader')
    expect(header('Order')).toHaveClass('MuiTableCell-sizeSmall', 'MuiTableCell-stickyHeader')
  })

  it('replaces the text it adds with labels', () => {
    render(
      <Table
        aria-label="Pedidos"
        columns={columns}
        rows={orders}
        selectable
        rowActions={() => [{ id: 'a', label: 'A' }]}
        labels={{
          rowsPerPage: 'Filas por página:',
          displayedRows: ({ from, to, count }) => `${from}–${to} de ${count}`,
          selectAll: 'Seleccionar todo',
          selectRow: (label) => `Seleccionar ${label}`,
          rowActions: (label) => `Acciones de ${label}`,
          actionsHeader: 'Acciones',
        }}
      />,
    )

    expect(screen.getByText('1–10 de 23')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filas por página:' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Seleccionar todo' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Seleccionar Item 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acciones de Item 1' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('makes the scrolling region focusable and names it like the table', () => {
    render(<Table aria-label="Orders" columns={columns} rows={orders} />)

    const region = screen.getByRole('region', { name: 'Orders' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveClass('CmTable-container')
  })

  it('passes ref, className, sx and other props to the root <div>, but not aria-label', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Table
        ref={ref}
        aria-label="Orders"
        columns={columns}
        rows={orders}
        data-testid="root"
        className="custom"
        sx={{ marginTop: '7px' }}
      />,
    )

    const root = screen.getByTestId('root')
    expect(ref.current).toBe(root)
    expect(root).toHaveClass('custom', 'CmTable-root')
    expect(root).toHaveStyle({ marginTop: '7px' })
    expect(root).not.toHaveAttribute('aria-label')
  })

  it('passes every slotProps entry to its elements', () => {
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={orders}
        toolbar="Tools"
        slotProps={{
          toolbar: { className: 'toolbar' },
          container: { className: 'container' },
          table: { className: 'table' },
          headerCell: { className: 'header-cell' },
          row: { className: 'row' },
          cell: { className: 'cell' },
          pagination: { className: 'pagination', showFirstButton: true },
        }}
      />,
    )

    expect(document.querySelector('.toolbar')).toHaveClass('CmTable-toolbar')
    expect(document.querySelector('.container')).toHaveClass('CmTable-container')
    expect(table()).toHaveClass('table')
    expect(header('Order')).toHaveClass('header-cell')
    expect(bodyRows()[0]).toHaveClass('row')
    expect(within(bodyRows()[0]).getAllByRole('cell')[0]).toHaveClass('cell')
    expect(document.querySelector('.pagination')).toHaveClass('CmTable-pagination')
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument()
  })

  it('adds the CmTable classes to its parts', () => {
    const { rerender } = render(<Table aria-label="Orders" columns={columns} rows={orders} toolbar="Tools" />)

    for (const name of ['root', 'toolbar', 'container', 'headerCell', 'row', 'cell', 'pagination']) {
      expect(document.querySelector(`.CmTable-${name}`)).toBeInTheDocument()
    }
    rerender(<Table aria-label="Orders" columns={columns} rows={noOrders} />)
    expect(document.querySelector('.CmTable-empty')).toBeInTheDocument()
  })

  it('works with the keyboard', async () => {
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={orders.slice(0, 1)}
        selectable
        toolbar={<input aria-label="Search" />}
        rowActions={() => [{ id: 'view', label: 'View' }]}
      />,
    )

    await userEvent.tab()
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('region')).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toHaveFocus()
    await userEvent.tab()
    expect(sortButton('Order')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(header('Order')).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Select Item 1' })).toBeChecked()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Actions for Item 1' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menuitem', { name: 'View' })).toHaveFocus()
  })

  describe('under the library theme', () => {
    it('draws a divider border with the theme’s radius, and styles header and body text', () => {
      renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} data-testid="root" />)

      expect(screen.getByTestId('root')).toHaveStyle({ borderWidth: '1px', borderRadius: '8px' })
      expect(header('Order')).toHaveStyle({ color: light.text.secondary, fontWeight: '500' })
      expect(within(bodyRows()[0]).getAllByRole('cell')[0]).toHaveStyle({ color: light.text.primary })
    })

    it('dims rows while loading, and centers the empty state in text.secondary', () => {
      const { rerender } = renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} loading />)
      expect(bodyRows()[0]).toHaveStyle({ opacity: '0.5' })

      rerender(
        <CmThemeProvider theme={createCmTheme()}>
          <Table aria-label="Orders" columns={columns} rows={noOrders} />
        </CmThemeProvider>,
      )
      expect(document.querySelector('.CmTable-empty')).toHaveStyle({ textAlign: 'center', color: light.text.secondary })
    })

    it('highlights rows on hover only when they’re selectable or have actions', () => {
      const { rerender } = renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} />)
      expect(bodyRows()[0]).not.toHaveClass('MuiTableRow-hover')

      rerender(
        <CmThemeProvider theme={createCmTheme()}>
          <Table aria-label="Orders" columns={columns} rows={orders} selectable />
        </CmThemeProvider>,
      )
      expect(bodyRows()[0]).toHaveClass('MuiTableRow-hover')
    })
  })

  describe('with overrides', () => {
    it('applies a project-level CmTable.defaultProps.size', () => {
      renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} />, {
        components: { CmTable: { defaultProps: { size: 'small' } } },
      })

      expect(header('Order')).toHaveClass('MuiTableCell-sizeSmall')
    })

    it('applies a project-level styleOverrides.headerCell object', () => {
      renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} />, {
        components: { CmTable: { styleOverrides: { headerCell: { letterSpacing: '3px' } } } },
      })

      expect(header('Order')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('applies project-level styleOverrides to the other slots', () => {
      renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} toolbar="Tools" data-testid="root" />, {
        components: {
          CmTable: {
            styleOverrides: {
              root: { borderWidth: 0 },
              toolbar: { letterSpacing: '1px' },
              container: { letterSpacing: '2px' },
              row: { letterSpacing: '4px' },
              cell: { letterSpacing: '5px' },
              pagination: { letterSpacing: '6px' },
            },
          },
        },
      })

      expect(screen.getByTestId('root')).toHaveStyle({ borderWidth: '0px' })
      expect(document.querySelector('.CmTable-toolbar')).toHaveStyle({ letterSpacing: '1px' })
      expect(document.querySelector('.CmTable-container')).toHaveStyle({ letterSpacing: '2px' })
      expect(bodyRows()[0]).toHaveStyle({ letterSpacing: '4px' })
      expect(within(bodyRows()[0]).getAllByRole('cell')[0]).toHaveStyle({ letterSpacing: '5px' })
      expect(document.querySelector('.CmTable-pagination')).toHaveStyle({ letterSpacing: '6px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<Table aria-label="Orders" columns={columns} rows={orders} data-testid="root" sx={{ letterSpacing: '2px' }} />, {
        components: { CmTable: { styleOverrides: { root: { letterSpacing: '1px' } } } },
      })

      expect(screen.getByTestId('root')).toHaveStyle({ letterSpacing: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { text: { secondary: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <Table aria-label="Orders" columns={columns} rows={orders} />
        </ThemeProvider>,
      )

      expect(header('Order')).toHaveStyle({ color: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Table columns={columns} rows={orders} onSelectionChange={(ids: string[]) => ids} />,
      <Table
        columns={[{ id: 'a', header: 'A', field: 'name', render: (row) => row.name.toUpperCase() }]}
        rows={[{ key: 1, name: 'Ana' }]}
        getRowId={(row) => row.key}
        // `Id` is inferred from `getRowId`.
        onSelectionChange={(ids) => {
          const numbers: number[] = ids
          return void numbers
        }}
      />,
      <Table mode="server" columns={columns} rows={orders} rowCount={100} />,
      <Table<Order> columns={columns} rows={orders} rowCount={5} labels={{ noRows: 'Nada' }} />,
    ]
    const rejected = [
      // @ts-expect-error: `field` only accepts keys of Row
      <Table columns={[{ id: 'a', header: 'A', field: 'nope' }]} rows={orders} />,
      // @ts-expect-error: `render` receives Row
      <Table columns={[{ id: 'a', header: 'A', render: (row: { other: string }) => row.other }]} rows={orders} />,
      // @ts-expect-error: `mode="server"` needs `rowCount`
      <Table mode="server" columns={columns} rows={orders} />,
      // @ts-expect-error: rows without `id` need `getRowId`
      <Table columns={[{ id: 'a', header: 'A', field: 'name' }]} rows={[{ name: 'Ana' }]} />,
    ]

    const themes = [
      createCmTheme({
        components: {
          CmTable: {
            defaultProps: { defaultPageSize: 25 },
            styleOverrides: { root: { border: 0 } },
          },
        },
      }),
      // @ts-expect-error: not a CmTable slot
      createCmTheme({ components: { CmTable: { styleOverrides: { header: { border: 0 } } } } }),
    ]

    expect([...accepted, ...rejected, ...themes]).toHaveLength(10)
  })
})
