import DoneIcon from '@mui/icons-material/Done'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Chip } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const chip = (testId = 'chip') => screen.getByTestId(testId)
const part = (root: HTMLElement, name: 'label' | 'icon' | 'avatar' | 'deleteIcon') =>
  root.querySelector<HTMLElement>(`.MuiChip-${name}`)!

/** The last `color` the page's CSS gives the chip's delete icon on hover. */
function deleteIconHoverColor(root: HTMLElement) {
  const chipClass = [...root.classList].find((name) => name.startsWith('css-'))!
  const css = [...document.querySelectorAll('style')].map((style) => style.textContent).join('')
  const rule = new RegExp(`\\.${chipClass} \\.MuiChip-deleteIcon:hover\\{color:([^;}]+)`, 'g')
  return [...css.matchAll(rule)].at(-1)?.[1]
}

describe('Chip', () => {
  it('renders the label in a div with no role', () => {
    render(<Chip data-testid="chip" label="Draft" />)

    expect(chip()).toHaveTextContent('Draft')
    expect(chip().tagName).toBe('DIV')
    expect(chip()).not.toHaveAttribute('role')
    expect(chip()).not.toHaveAttribute('tabindex')
  })

  it.each([
    ['icon', { icon: <DoneIcon data-testid="added" /> }],
    ['avatar', { avatar: <Avatar data-testid="added">AR</Avatar> }],
  ] as const)('renders the %s before the label', (name, props) => {
    render(<Chip data-testid="chip" label="Ana Ruiz" {...props} />)

    const added = screen.getByTestId('added')
    expect(added).toHaveClass(`MuiChip-${name}`)
    expect(chip().firstElementChild).toBe(added)
    expect(added.nextElementSibling).toBe(part(chip(), 'label'))
  })

  describe('with onClick', () => {
    it('renders a button that calls onClick on click and Enter', async () => {
      const onClick = vi.fn()
      render(<Chip label="Only open" onClick={onClick} />)

      const button = screen.getByRole('button', { name: 'Only open' })
      await userEvent.click(button)
      expect(onClick).toHaveBeenCalledOnce()

      button.focus()
      await userEvent.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('calls onClick with Space', async () => {
      const onClick = vi.fn()
      render(<Chip label="Only open" onClick={onClick} />)

      await userEvent.tab()
      await userEvent.keyboard(' ')

      expect(onClick).toHaveBeenCalledOnce()
    })

    it('passes aria-pressed for a toggle', () => {
      render(<Chip label="Only open" onClick={() => {}} aria-pressed />)

      expect(screen.getByRole('button', { name: 'Only open', pressed: true })).toBeInTheDocument()
    })
  })

  describe('with onDelete', () => {
    it('renders the delete icon, which calls onDelete when clicked', async () => {
      const onDelete = vi.fn()
      render(<Chip data-testid="chip" label="Ana Ruiz" onDelete={onDelete} />)

      expect(chip()).toHaveAttribute('role', 'button')
      const deleteIcon = part(chip(), 'deleteIcon')
      expect(deleteIcon.tagName).toBe('svg')
      await userEvent.click(deleteIcon)

      expect(onDelete).toHaveBeenCalledOnce()
    })

    it.each(['Backspace', 'Delete'])('calls onDelete with %s on the focused chip', async (key) => {
      const onDelete = vi.fn()
      render(<Chip label="Ana Ruiz" onDelete={onDelete} />)

      await userEvent.tab()
      expect(screen.getByRole('button')).toHaveFocus()
      await userEvent.keyboard(`{${key}}`)

      expect(onDelete).toHaveBeenCalledOnce()
    })

    it('does not call onClick when the delete icon of a clickable chip is clicked', async () => {
      const onClick = vi.fn()
      const onDelete = vi.fn()
      render(<Chip data-testid="chip" label="Ana Ruiz" onClick={onClick} onDelete={onDelete} />)

      await userEvent.click(part(chip(), 'deleteIcon'))

      expect(onDelete).toHaveBeenCalledOnce()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('renders a custom deleteIcon with the delete behavior', async () => {
      const onDelete = vi.fn()
      render(
        <Chip
          data-testid="chip"
          label="Ana Ruiz"
          onDelete={onDelete}
          deleteIcon={<DoneIcon data-testid="custom" />}
        />,
      )

      const custom = screen.getByTestId('custom')
      expect(custom).toHaveClass('MuiChip-deleteIcon')
      await userEvent.click(custom)

      expect(onDelete).toHaveBeenCalledOnce()
    })
  })

  describe('when disabled', () => {
    it('stops onClick and onDelete on a clickable chip, and does not take focus', async () => {
      const onClick = vi.fn()
      const onDelete = vi.fn()
      render(
        <Chip data-testid="chip" label="Ana Ruiz" onClick={onClick} onDelete={onDelete} disabled />,
      )

      expect(chip()).toHaveClass('Mui-disabled')
      expect(chip()).toHaveStyle({ pointerEvents: 'none' })
      expect(chip()).toHaveAttribute('aria-disabled', 'true')
      await userEvent.tab()
      expect(chip()).not.toHaveFocus()

      // Focused from code, the chip still ignores the keys.
      chip().focus()
      await userEvent.keyboard('{Enter}{Backspace}')

      expect(onClick).not.toHaveBeenCalled()
      expect(onDelete).not.toHaveBeenCalled()
    })

    it('takes a deletable chip out of the tab order under the library theme', async () => {
      const onDelete = vi.fn()
      renderThemed(
        <>
          <Chip data-testid="chip" label="Ana Ruiz" onDelete={onDelete} disabled />
          <Chip data-testid="enabled" label="Jane Doe" onDelete={onDelete} />
        </>,
      )

      expect(chip()).toHaveAttribute('tabindex', '-1')
      expect(chip()).toHaveStyle({ pointerEvents: 'none' })
      await userEvent.tab()
      expect(chip('enabled')).toHaveFocus()
      await userEvent.keyboard('{Backspace}')

      expect(onDelete).toHaveBeenCalledOnce()
    })

    it('leaves a deletable chip in the tab order without the library theme, as MUI does', async () => {
      const onDelete = vi.fn()
      render(<Chip data-testid="chip" label="Ana Ruiz" onDelete={onDelete} disabled />)

      await userEvent.tab()
      expect(chip()).toHaveFocus()
      await userEvent.keyboard('{Backspace}')

      expect(onDelete).toHaveBeenCalledOnce()
    })
  })

  it('renders a link with component="a" and href', () => {
    render(<Chip label="Docs" component="a" href="/docs" clickable />)

    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/docs')
  })

  it.each([
    ['a static chip', {}],
    ['a clickable chip', { onClick: () => {} }],
  ])('passes ref to the root element of %s', (_, props) => {
    const ref = createRef<HTMLDivElement>()
    render(<Chip ref={ref} data-testid="chip" label="Draft" {...props} />)

    expect(ref.current).toBe(chip())
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <Chip
        data-testid="chip"
        label="Draft"
        className="custom"
        sx={{ marginTop: '7px' }}
        aria-describedby="hint"
      />,
    )

    expect(chip()).toHaveClass('custom')
    expect(chip()).toHaveStyle({ marginTop: '7px' })
    expect(chip()).toHaveAttribute('aria-describedby', 'hint')
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <Chip
        data-testid="chip"
        label="Draft"
        slotProps={{ root: { className: 'root' }, label: { className: 'label' } }}
      />,
    )

    expect(chip()).toHaveClass('root')
    expect(part(chip(), 'label')).toHaveClass('label')
  })

  describe('under the library theme', () => {
    it('gives the delete icon of a default chip text.secondary, and text.primary on hover', () => {
      renderThemed(<Chip data-testid="chip" label="Ana Ruiz" onDelete={() => {}} />)

      expect(part(chip(), 'deleteIcon')).toHaveStyle({ color: light.text.secondary })
      expect(deleteIconHoverColor(chip())).toBe('var(--mui-palette-text-primary)')
    })

    it('gives initials in an avatar on a default chip common.white on grey[500]', () => {
      renderThemed(<Chip data-testid="chip" label="Ana Ruiz" avatar={<Avatar>AR</Avatar>} />)

      expect(part(chip(), 'avatar')).toHaveStyle({
        color: light.common.white,
        backgroundColor: light.grey[500],
      })
    })

    it('keeps MUI’s delete icon and avatar colors on colored chips', () => {
      renderThemed(
        <Chip
          data-testid="chip"
          label="Ana Ruiz"
          color="primary"
          avatar={<Avatar>AR</Avatar>}
          onDelete={() => {}}
        />,
      )

      expect(part(chip(), 'deleteIcon')).not.toHaveStyle({ color: light.text.secondary })
      expect(deleteIconHoverColor(chip())).not.toBe('var(--mui-palette-text-primary)')
      expect(part(chip(), 'avatar')).toHaveStyle({
        color: light.primary.contrastText,
        backgroundColor: light.primary.dark,
      })
    })

    it('shows the focus ring on keyboard focus', async () => {
      renderThemed(<Chip label="Only open" onClick={() => {}} />)

      await userEvent.tab()

      const button = screen.getByRole('button')
      expect(button).toHaveFocus()
      expect(button).toHaveClass('Mui-focusVisible')
      expect(button).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: light.primary.main,
      })
    })
  })

  describe('with overrides', () => {
    it('merges a project styleOverrides.root object and keeps the library’s delete icon and avatar colors', () => {
      renderThemed(
        <Chip
          data-testid="chip"
          label="Ana Ruiz"
          avatar={<Avatar>AR</Avatar>}
          onDelete={() => {}}
        />,
        { components: { MuiChip: { styleOverrides: { root: { letterSpacing: '3px' } } } } },
      )

      expect(chip()).toHaveStyle({ letterSpacing: '3px' })
      expect(part(chip(), 'deleteIcon')).toHaveStyle({ color: light.text.secondary })
      expect(part(chip(), 'avatar')).toHaveStyle({ color: light.common.white })
    })

    it('replaces the library’s rule with a project-level deleteIcon', () => {
      renderThemed(<Chip data-testid="chip" label="Ana Ruiz" onDelete={() => {}} />, {
        components: { MuiChip: { styleOverrides: { deleteIcon: { fontSize: '13px' } } } },
      })

      expect(part(chip(), 'deleteIcon')).toHaveStyle({ fontSize: '13px' })
      expect(part(chip(), 'deleteIcon')).not.toHaveStyle({ color: light.text.secondary })
    })

    it('restores MUI’s focus on disabled deletable chips with skipFocusWhenDisabled: false', async () => {
      renderThemed(<Chip data-testid="chip" label="Ana Ruiz" onDelete={() => {}} disabled />, {
        components: { MuiChip: { defaultProps: { skipFocusWhenDisabled: false } } },
      })

      await userEvent.tab()

      expect(chip()).toHaveFocus()
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Chip
          data-testid="chip"
          label="Ana Ruiz"
          onDelete={() => {}}
          sx={{ '& .MuiChip-deleteIcon': { color: 'rgb(170, 0, 0)' } }}
        />,
      )

      expect(part(chip(), 'deleteIcon')).toHaveStyle({ color: 'rgb(170, 0, 0)' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { success: { main: '#00aa00' } } })

      render(
        <ThemeProvider theme={theme}>
          <Chip data-testid="chip" label="Paid" color="success" />
        </ThemeProvider>,
      )

      expect(chip()).toHaveStyle({ backgroundColor: '#00aa00' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Chip label="x" variant="outlined" color="success" size="small" onDelete={() => {}} />,
      <Chip label="x" component="a" href="/x" clickable />,
      <Chip label="x" icon={<DoneIcon />} slotProps={{ label: { className: 'x' } }} />,
    ]
    const rejected = [
      // @ts-expect-error: not a Chip prop
      <Chip unknownProp />,
      // @ts-expect-error: icons are elements, not any node
      <Chip label="x" icon="✓" />,
      // @ts-expect-error: not a Chip variant
      <Chip label="x" variant="contained" />,
      // @ts-expect-error: Chip has no selected prop
      <Chip label="x" selected />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(7)
  })
})
