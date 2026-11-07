import Tooltip from '@mui/material/Tooltip'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { ButtonGroup } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const button = (name: string) => screen.getByRole('button', { name })

const positionClasses = (element: HTMLElement) =>
  ['firstButton', 'middleButton', 'lastButton'].filter((name) =>
    element.classList.contains(`MuiButtonGroup-${name}`),
  )

describe('ButtonGroup', () => {
  it('renders a group named by aria-label, containing its buttons', () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button>Bold</Button>
        <Button>Italic</Button>
      </ButtonGroup>,
    )

    const group = screen.getByRole('group', { name: 'Text formatting' })
    expect(group.tagName).toBe('DIV')
    expect(group).toContainElement(button('Bold'))
    expect(group).toContainElement(button('Italic'))
  })

  it('passes ref to the root DOM element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <ButtonGroup ref={ref} aria-label="Actions">
        <Button>Copy</Button>
      </ButtonGroup>,
    )

    expect(ref.current).toBe(screen.getByRole('group'))
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <ButtonGroup
        className="custom"
        sx={{ marginTop: '7px' }}
        data-testid="actions"
        aria-describedby="hint"
        aria-label="Actions"
      >
        <Button>Copy</Button>
      </ButtonGroup>,
    )

    const group = screen.getByRole('group')
    expect(group).toHaveClass('custom')
    expect(group).toHaveStyle({ marginTop: '7px' })
    expect(group).toHaveAttribute('data-testid', 'actions')
    expect(group).toHaveAttribute('aria-describedby', 'hint')
  })

  it('renders the given component as the root', () => {
    render(
      <ButtonGroup component="section" aria-label="Actions">
        <Button>Copy</Button>
      </ButtonGroup>,
    )

    expect(screen.getByRole('group').tagName).toBe('SECTION')
  })

  it('calls the clicked button’s onClick', async () => {
    const onCopy = vi.fn()
    const onCut = vi.fn()
    render(
      <ButtonGroup aria-label="Actions">
        <Button onClick={onCopy}>Copy</Button>
        <Button onClick={onCut}>Cut</Button>
      </ButtonGroup>,
    )

    await userEvent.click(button('Cut'))

    expect(onCut).toHaveBeenCalledOnce()
    expect(onCopy).not.toHaveBeenCalled()
  })

  describe('positions', () => {
    it('gives every button the grouped class and a class for its position', () => {
      render(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
          <Button>Cut</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
      )

      for (const name of ['Copy', 'Cut', 'Paste']) {
        expect(button(name)).toHaveClass('MuiButtonGroup-grouped')
      }
      expect(positionClasses(button('Copy'))).toEqual(['firstButton'])
      expect(positionClasses(button('Cut'))).toEqual(['middleButton'])
      expect(positionClasses(button('Paste'))).toEqual(['lastButton'])
    })

    it('gives a single button no position class', () => {
      render(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
        </ButtonGroup>,
      )

      expect(button('Copy')).toHaveClass('MuiButtonGroup-grouped')
      expect(positionClasses(button('Copy'))).toEqual([])
    })

    it('skips false and null children', () => {
      render(
        <ButtonGroup aria-label="Actions">
          {false}
          <Button>Copy</Button>
          {null}
          <Button>Paste</Button>
          {undefined}
        </ButtonGroup>,
      )

      expect(positionClasses(button('Copy'))).toEqual(['firstButton'])
      expect(positionClasses(button('Paste'))).toEqual(['lastButton'])
    })

    it('treats a fragment as one child', () => {
      render(
        <ButtonGroup aria-label="Actions">
          <>
            <Button>Copy</Button>
            <Button>Cut</Button>
          </>
          <Button>Paste</Button>
        </ButtonGroup>,
      )

      expect(positionClasses(button('Copy'))).toEqual(['firstButton'])
      expect(positionClasses(button('Cut'))).toEqual(['firstButton'])
    })

    it('reaches a Button wrapped in Tooltip', () => {
      render(
        <ButtonGroup variant="contained" aria-label="Actions">
          <Button>Copy</Button>
          <Tooltip title="Paste from clipboard" describeChild>
            <Button>Paste</Button>
          </Tooltip>
        </ButtonGroup>,
      )

      expect(button('Paste')).toHaveClass('MuiButton-contained', 'MuiButtonGroup-lastButton')
    })
  })

  describe('shared props', () => {
    it('passes variant, color and size to every Button, and a Button’s own value wins', () => {
      render(
        <ButtonGroup variant="contained" color="secondary" size="small" aria-label="Actions">
          <Button>Copy</Button>
          <Button variant="outlined" color="error" size="large">
            Delete
          </Button>
        </ButtonGroup>,
      )

      expect(button('Copy')).toHaveClass(
        'MuiButton-contained',
        'MuiButton-colorSecondary',
        'MuiButton-sizeSmall',
      )
      expect(button('Delete')).toHaveClass(
        'MuiButton-outlined',
        'MuiButton-colorError',
        'MuiButton-sizeLarge',
      )
    })

    it('uses the outlined variant by default', () => {
      render(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
        </ButtonGroup>,
      )

      expect(screen.getByRole('group')).toHaveClass('MuiButtonGroup-outlined')
      expect(button('Copy')).toHaveClass('MuiButton-outlined')
    })

    it('disables every Button, except one with disabled={false}', () => {
      render(
        <ButtonGroup disabled aria-label="Row actions">
          <Button>Move up</Button>
          <Button>Move down</Button>
          <Button disabled={false}>Unlock</Button>
        </ButtonGroup>,
      )

      expect(button('Move up')).toBeDisabled()
      expect(button('Move down')).toBeDisabled()
      expect(button('Unlock')).toBeEnabled()
    })

    it.each([
      ['orientation="vertical"', { orientation: 'vertical' }, 'MuiButtonGroup-vertical'],
      ['fullWidth', { fullWidth: true }, 'MuiButtonGroup-fullWidth'],
    ] as const)('adds its class to the root for %s', (_, props, className) => {
      render(
        <ButtonGroup {...props} aria-label="Actions">
          <Button>Copy</Button>
        </ButtonGroup>,
      )

      expect(screen.getByRole('group')).toHaveClass(className)
    })
  })

  describe('with the keyboard', () => {
    it('moves through enabled buttons in order with Tab, skipping disabled ones', async () => {
      render(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
          <Button disabled>Cut</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
      )

      await userEvent.tab()
      expect(button('Copy')).toHaveFocus()
      await userEvent.tab()
      expect(button('Paste')).toHaveFocus()
      await userEvent.tab({ shift: true })
      expect(button('Copy')).toHaveFocus()
    })

    it('does not move focus with arrow keys', async () => {
      render(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
      )

      await userEvent.tab()
      await userEvent.keyboard('{ArrowRight}{ArrowDown}')

      expect(button('Copy')).toHaveFocus()
    })

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('activates the focused button with %s', async (_, key) => {
      const onClick = vi.fn()
      render(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
          <Button onClick={onClick}>Paste</Button>
        </ButtonGroup>,
      )

      await userEvent.tab()
      await userEvent.tab()
      await userEvent.keyboard(key)

      expect(onClick).toHaveBeenCalledOnce()
    })
  })

  describe('under the library theme', () => {
    it('gives a contained group and its buttons no elevation, and keeps the label case', () => {
      renderThemed(
        <ButtonGroup variant="contained" aria-label="Actions">
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
      )

      const group = screen.getByRole('group')
      expect(group).toHaveClass('MuiButtonGroup-disableElevation')
      expect(group).toHaveStyle({ boxShadow: 'none' })
      for (const name of ['Copy', 'Paste']) {
        expect(button(name)).toHaveClass('MuiButton-disableElevation')
        expect(button(name)).toHaveStyle({ textTransform: 'none' })
      }
    })

    it('lets a Button’s own disableElevation={false} win', () => {
      renderThemed(
        <ButtonGroup variant="contained" aria-label="Actions">
          <Button disableElevation={false}>Copy</Button>
        </ButtonGroup>,
      )

      expect(button('Copy')).not.toHaveClass('MuiButton-disableElevation')
    })

    it('shows a solid outline on keyboard focus, above the neighboring buttons', async () => {
      renderThemed(
        <ButtonGroup variant="contained" aria-label="Actions">
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
      )

      await userEvent.tab()

      const focused = button('Copy')
      expect(focused).toHaveClass('Mui-focusVisible')
      expect(focused).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineColor: createCmTheme().palette.primary.main,
        zIndex: '1',
      })
      expect(button('Paste')).not.toHaveStyle({ zIndex: '1' })
    })
  })

  describe('with overrides', () => {
    it('restores elevation with a project MuiButtonGroup disableElevation of false', () => {
      renderThemed(
        <ButtonGroup variant="contained" aria-label="Actions">
          <Button>Copy</Button>
        </ButtonGroup>,
        { components: { MuiButtonGroup: { defaultProps: { disableElevation: false } } } },
      )

      const group = screen.getByRole('group')
      expect(group).not.toHaveClass('MuiButtonGroup-disableElevation')
      expect(group).not.toHaveStyle({ boxShadow: 'none' })
      expect(button('Copy')).not.toHaveClass('MuiButton-disableElevation')
    })

    it('changes every grouped button with a project styleOverrides.grouped object', () => {
      renderThemed(
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>,
        { components: { MuiButtonGroup: { styleOverrides: { grouped: { letterSpacing: '3px' } } } } },
      )

      expect(button('Copy')).toHaveStyle({ letterSpacing: '3px' })
      expect(button('Paste')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <ButtonGroup sx={{ borderRadius: '2px' }} aria-label="Actions">
          <Button>Copy</Button>
        </ButtonGroup>,
      )

      expect(screen.getByRole('group')).toHaveStyle({ borderRadius: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })

      render(
        <ThemeProvider theme={theme}>
          <ButtonGroup variant="contained" aria-label="Actions">
            <Button>Copy</Button>
          </ButtonGroup>
        </ThemeProvider>,
      )

      const group = screen.getByRole('group')
      expect(group).not.toHaveClass('MuiButtonGroup-disableElevation')
      expect(group).not.toHaveStyle({ boxShadow: 'none' })
      expect(button('Copy')).toHaveStyle({
        backgroundColor: '#aa0000',
        textTransform: 'uppercase',
      })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <ButtonGroup component="section" />,
      <ButtonGroup orientation="vertical" disableElevation />,
    ]
    const rejected = [
      // @ts-expect-error: not a ButtonGroup prop
      <ButtonGroup unknownProp />,
      // @ts-expect-error: MUI's ButtonGroup has no slotProps
      <ButtonGroup slotProps={{}} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(4)
  })
})
