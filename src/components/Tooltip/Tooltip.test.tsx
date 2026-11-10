import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Tooltip } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const tooltip = () => screen.findByRole('tooltip')
const noTooltip = () => waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())

/** The element inside the popper that holds the text, MUI's `tooltip` slot. */
const tooltipBox = async () => (await tooltip()).querySelector<HTMLElement>('.MuiTooltip-tooltip')!

describe('Tooltip', () => {
  it('opens on hover with the title, and closes when the pointer leaves', async () => {
    render(
      <Tooltip title="Delete">
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button'))
    expect(await tooltip()).toHaveTextContent('Delete')

    await userEvent.unhover(screen.getByRole('button'))
    await noTooltip()
  })

  it('opens on keyboard focus and closes with Escape', async () => {
    render(
      <Tooltip title="Delete">
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </Tooltip>,
    )

    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    expect(await tooltip()).toHaveTextContent('Delete')

    await userEvent.keyboard('{Escape}')
    await noTooltip()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('closes when focus moves away', async () => {
    render(
      <>
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <button type="button">Next</button>
      </>,
    )

    await userEvent.tab()
    await tooltip()
    await userEvent.tab()

    await noTooltip()
  })

  it('makes a string title the child’s aria-label without describeChild', () => {
    render(
      <Tooltip title="Delete">
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </Tooltip>,
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('aria-label', 'Delete')
  })

  it('keeps the child’s own name with describeChild, and describes it while open', async () => {
    render(
      <Tooltip title="Saves without publishing" describeChild>
        <Button>Save draft</Button>
      </Tooltip>,
    )

    const button = screen.getByRole('button', { name: 'Save draft' })
    expect(button).not.toHaveAttribute('aria-label')

    await userEvent.hover(button)
    const open = await tooltip()

    expect(button).toHaveAttribute('aria-describedby', open.id)
    expect(button).toHaveAccessibleDescription('Saves without publishing')
    expect(button).toHaveAccessibleName('Save draft')
  })

  it('keeps a child’s own aria-label', () => {
    render(
      <Tooltip title="Remove">
        <IconButton aria-label="Delete invoice">
          <DeleteIcon />
        </IconButton>
      </Tooltip>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName('Delete invoice')
  })

  it.each([
    ['an empty string', ''],
    ['null', null],
  ])('never opens with %s as the title', async (_, title) => {
    render(
      <Tooltip title={title}>
        <button type="button">Save</button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button'))
    await userEvent.tab()

    // Longer than the 100ms enter delay.
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows 0 as a title', async () => {
    render(
      <Tooltip title={0}>
        <button type="button">Count</button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button'))

    expect(await tooltip()).toHaveTextContent('0')
  })

  it('opens on hover over a disabled Button wrapped in a span', async () => {
    render(
      <Tooltip title="You don’t have permission to delete" describeChild>
        <span data-testid="wrapper">
          <Button disabled>Delete</Button>
        </span>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByTestId('wrapper'))

    expect(await tooltip()).toHaveTextContent('You don’t have permission to delete')
  })

  it('passes ref, className and other props to the child', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <Tooltip ref={ref} title="Delete" className="custom" data-testid="child">
        <IconButton className="own">
          <DeleteIcon />
        </IconButton>
      </Tooltip>,
    )

    const child = screen.getByTestId('child')
    expect(ref.current).toBe(child)
    expect(child).toHaveClass('custom', 'own')
  })

  it('passes each slot in slotProps to its element', async () => {
    render(
      <Tooltip
        title="Delete"
        arrow
        open
        slotProps={{
          popper: { className: 'popper' },
          tooltip: { className: 'tooltip' },
          arrow: { className: 'arrow' },
          transition: { timeout: 0 },
        }}
      >
        <button type="button">Delete</button>
      </Tooltip>,
    )

    const popper = await tooltip()
    expect(popper).toHaveClass('popper')
    expect(popper.querySelector('.MuiTooltip-tooltip')).toHaveClass('tooltip')
    expect(popper.querySelector('.MuiTooltip-arrow')).toHaveClass('arrow')
  })

  it('opens and closes from code when controlled', async () => {
    const { rerender } = render(
      <Tooltip title="Saved" open>
        <button type="button">Save</button>
      </Tooltip>,
    )
    expect(await tooltip()).toHaveTextContent('Saved')

    rerender(
      <Tooltip title="Saved" open={false}>
        <button type="button">Save</button>
      </Tooltip>,
    )
    await noTooltip()
  })

  describe('under the library theme', () => {
    it('has the theme’s 8px radius', async () => {
      renderThemed(
        <Tooltip title="Delete" open>
          <button type="button">Delete</button>
        </Tooltip>,
      )

      expect(await tooltipBox()).toHaveStyle({ borderRadius: '8px' })
    })
  })

  describe('with overrides', () => {
    it('applies a project-level styleOverrides.tooltip object', async () => {
      renderThemed(
        <Tooltip title="Delete" open>
          <button type="button">Delete</button>
        </Tooltip>,
        { components: { MuiTooltip: { styleOverrides: { tooltip: { letterSpacing: '3px' } } } } },
      )

      expect(await tooltipBox()).toHaveStyle({ letterSpacing: '3px', borderRadius: '8px' })
    })

    it('applies a project-level defaultProps.describeChild to every tooltip', () => {
      renderThemed(
        <Tooltip title="Saves without publishing">
          <Button>Save draft</Button>
        </Tooltip>,
        { components: { MuiTooltip: { defaultProps: { describeChild: true } } } },
      )

      expect(screen.getByRole('button')).toHaveAccessibleName('Save draft')
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-label')
    })

    it('lets an instance-level slotProps.tooltip.sx override the theme', async () => {
      renderThemed(
        <Tooltip title="Delete" open slotProps={{ tooltip: { sx: { borderRadius: '2px' } } }}>
          <button type="button">Delete</button>
        </Tooltip>,
      )

      expect(await tooltipBox()).toHaveStyle({ borderRadius: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', async () => {
      render(
        <ThemeProvider theme={createTheme({ shape: { borderRadius: 3 } })}>
          <Tooltip title="Delete" open>
            <button type="button">Delete</button>
          </Tooltip>
        </ThemeProvider>,
      )

      expect(await tooltipBox()).toHaveStyle({ borderRadius: '3px' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Tooltip title="x" placement="top-start" arrow describeChild>
        <button type="button">x</button>
      </Tooltip>,
      <Tooltip title={<b>x</b>} slotProps={{ tooltip: { sx: { maxWidth: 400 } } }}>
        <span>x</span>
      </Tooltip>,
    ]
    const rejected = [
      // @ts-expect-error: title is required
      <Tooltip>
        <button type="button">x</button>
      </Tooltip>,
      // @ts-expect-error: not a placement
      <Tooltip title="x" placement="middle">
        <button type="button">x</button>
      </Tooltip>,
      // @ts-expect-error: the child must be a single element
      <Tooltip title="x">text</Tooltip>,
    ]

    expect([...accepted, ...rejected]).toHaveLength(5)
  })
})
