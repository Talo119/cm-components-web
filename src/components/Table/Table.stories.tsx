import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Chip } from '../Chip/index.ts'
import { Link } from '../Link/index.ts'
import { TextField } from '../TextField/index.ts'
import { Table } from './index.ts'
import type { TableColumn, TableSort } from './index.ts'

interface Order {
  id: string
  number: string
  customer: string
  date: Date
  status: 'paid' | 'pending'
  total: number
}

const customers = ['Ana Torres', 'Luis Pérez', 'Eva Díaz', 'Marta Ruiz', 'Juan Gil']

const orders: Order[] = Array.from({ length: 57 }, (_, index) => ({
  id: `order-${index + 1}`,
  number: `#${1000 + index}`,
  customer: customers[index % customers.length],
  date: new Date(2026, 0, 1 + ((index * 7) % 300)),
  status: index % 3 === 0 ? 'pending' : 'paid',
  total: ((index * 37) % 500) + 20,
}))

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: TableColumn<Order>[] = [
  {
    id: 'number',
    header: 'Order',
    field: 'number',
    sortable: true,
    render: (row) => <Link href={`#${row.id}`}>{row.number}</Link>,
  },
  { id: 'customer', header: 'Customer', field: 'customer', sortable: true },
  {
    id: 'date',
    header: 'Date',
    field: 'date',
    sortable: true,
    render: (row) => row.date.toLocaleDateString('en-US'),
  },
  {
    id: 'status',
    header: 'Status',
    field: 'status',
    render: (row) => (
      <Chip label={row.status} size="small" color={row.status === 'paid' ? 'success' : 'default'} />
    ),
  },
  {
    id: 'total',
    header: 'Total',
    field: 'total',
    sortable: true,
    align: 'right',
    render: (row) => money.format(row.total),
  },
]

/**
 * A table built from `columns` and `rows`, on MUI's `Table`. In `client` mode
 * Table sorts and paginates the rows it's given. In `server` mode `rows` is
 * the current page, and Table reports `onSortChange`, `onPageChange` and
 * `onPageSizeChange`. Name the table with `aria-label`. The theme key is
 * `components.CmTable`, with the slots `root`, `toolbar`, `container`,
 * `headerCell`, `row`, `cell`, `empty` and `pagination`.
 */
const meta = {
  component: Table<Order>,
  args: {
    'aria-label': 'Orders',
    columns,
    rows: orders,
    defaultSort: { columnId: 'date', direction: 'desc' },
    getRowLabel: (row: Order) => `Order ${row.number}`,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    loading: { control: 'boolean' },
    selectable: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    pagination: { control: 'boolean' },
    columns: { control: false },
    rows: { control: false },
  },
} satisfies Meta<typeof Table<Order>>

export default meta

type Story = StoryObj<typeof meta>

/** Table sorts and paginates every row it's given. */
export const ClientMode: Story = {}

/** `rows` is the current page, fetched with a fake delay. Table only reports what the user asks for. */
export const ServerMode: StoryObj = {
  render: function Render() {
    const [sort, setSort] = useState<TableSort | null>(null)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [data, setData] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      let cancelled = false
      // A stand-in for a request to the server, which sorts and slices.
      const timer = setTimeout(() => {
        const column = columns.find((candidate) => candidate.id === sort?.columnId)
        const sorted = [...orders]
        if (sort && column?.field) {
          const field = column.field
          sorted.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0))
          if (sort.direction === 'desc') sorted.reverse()
        }
        if (!cancelled) {
          setData(sorted.slice(page * pageSize, (page + 1) * pageSize))
          setLoading(false)
        }
      }, 600)
      return () => {
        cancelled = true
        clearTimeout(timer)
      }
    }, [sort, page, pageSize])

    return (
      <Table
        aria-label="Orders"
        mode="server"
        columns={columns}
        rows={data}
        rowCount={orders.length}
        loading={loading}
        sort={sort}
        onSortChange={(next) => {
          setLoading(true)
          setSort(next)
        }}
        page={page}
        onPageChange={(_, next) => {
          setLoading(true)
          setPage(next)
        }}
        pageSize={pageSize}
        onPageSizeChange={(_, next) => {
          setLoading(true)
          setPageSize(next)
        }}
      />
    )
  },
}

/** A checkbox per row. The header checkbox selects or clears the current page. */
export const Selection: StoryObj = {
  render: function Render() {
    const [selection, setSelection] = useState<string[]>([])
    return (
      <Table
        aria-label="Orders"
        columns={columns}
        rows={orders}
        getRowLabel={(row) => `Order ${row.number}`}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        toolbar={
          <>
            <span>{selection.length} selected</span>
            <Button variant="outlined" disabled={selection.length === 0} onClick={() => setSelection([])}>
              Clear
            </Button>
          </>
        }
      />
    )
  },
}

/** A Menu per row, named from `getRowLabel`. */
export const RowActions: Story = {
  args: {
    rowActions: (row: Order) => [
      { id: 'view', label: 'View', href: `#${row.id}` },
      { id: 'refund', label: 'Refund', disabled: row.status !== 'paid' },
    ],
  },
}

export const Loading: Story = {
  args: { loading: true },
}

export const Empty: Story = {
  args: { rows: [], emptyState: 'No orders yet' },
}

export const Small: Story = {
  args: { size: 'small' },
}

/** The header stays visible while the container scrolls. It needs a height. */
export const StickyHeader: Story = {
  args: {
    stickyHeader: true,
    pagination: false,
    slotProps: { container: { sx: { maxHeight: 360 } } },
  },
}

/** The container scrolls sideways, and the pagination bar stays the width of the screen. */
export const ManyColumnsOnANarrowScreen: Story = {
  args: {
    columns: [
      ...columns,
      { id: 'customer-again', header: 'Billing contact', field: 'customer' },
      { id: 'date-again', header: 'Shipped', getValue: (row) => row.date.toDateString() },
      { id: 'id', header: 'Internal id', field: 'id' },
    ],
  },
  render: (args) => (
    <Box sx={{ maxWidth: 360 }}>
      <Table {...args} />
    </Box>
  ),
}

/** Filtering is the consumer's, with a field in `toolbar`. */
export const ToolbarWithSearch: StoryObj = {
  render: function Render() {
    const [query, setQuery] = useState('')
    const filtered = orders.filter((order) =>
      `${order.number} ${order.customer}`.toLowerCase().includes(query.toLowerCase()),
    )
    return (
      <Table
        aria-label="Orders"
        columns={columns}
        rows={filtered}
        toolbar={
          <TextField
            label="Search"
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        }
        emptyState={`No orders match “${query}”`}
      />
    )
  },
}

/** A project theme makes every table small, with 25 rows per page and uppercase headers. */
export const ThemeOverride: Story = {
  parameters: { withoutThemeProvider: true },
  render: (args) => (
    <CmThemeProvider
      theme={createCmTheme({
        components: {
          CmTable: {
            defaultProps: { size: 'small', defaultPageSize: 25 },
            styleOverrides: { headerCell: { textTransform: 'uppercase', letterSpacing: 0.5 } },
          },
        },
      })}
    >
      <Table {...args} />
    </CmThemeProvider>
  ),
}
