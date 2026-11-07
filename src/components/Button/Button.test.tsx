import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactElement, Ref } from 'react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from './index.ts'

/** Stands in for a router's link: `to` is required and isn't a DOM attribute. */
function RouterLink({
  to,
  ref,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string; ref?: Ref<HTMLAnchorElement> }) {
  return <a ref={ref} href={to} data-router-link {...props} />
}

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const focusWithKeyboard = async () => {
  await userEvent.tab()
  return screen.getByRole('button')
}

describe('Button', () => {
  it('renders a button of type button, named by its children', () => {
    render(<Button>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button, { pointerEventsCheck: 0 })

    expect(onClick).not.toHaveBeenCalled()
  })

  it('passes ref to the DOM element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)

    expect(ref.current).toBe(screen.getByRole('button'))
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <Button
        className="custom"
        sx={{ marginTop: '7px' }}
        data-testid="save"
        aria-describedby="hint"
      >
        Save
      </Button>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom')
    expect(button).toHaveStyle({ marginTop: '7px' })
    expect(button).toHaveAttribute('data-testid', 'save')
    expect(button).toHaveAttribute('aria-describedby', 'hint')
  })

  it('renders startIcon and endIcon with the label', () => {
    render(
      <Button startIcon={<svg data-testid="start" />} endIcon={<svg data-testid="end" />}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toContainElement(screen.getByTestId('start'))
    expect(button).toContainElement(screen.getByTestId('end'))
  })

  describe('as a link', () => {
    it('renders an anchor for href and passes target to it', () => {
      render(
        <Button href="/docs" target="_blank">
          Read the docs
        </Button>,
      )

      const link = screen.getByRole('link', { name: 'Read the docs' })
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/docs')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders the given component and passes it its own props', () => {
      render(
        <Button component={RouterLink} to="/settings">
          Settings
        </Button>,
      )

      const link = screen.getByRole('link', { name: 'Settings' })
      expect(link).toHaveAttribute('data-router-link')
      expect(link).toHaveAttribute('href', '/settings')
      expect(link).not.toHaveAttribute('to')
    })

    it.each([
      ['disabled', { disabled: true }],
      ['loading', { loading: true }],
    ])('takes a %s link out of the tab order and keeps its href', (_, props) => {
      render(
        <Button href="/docs" {...props}>
          Read the docs
        </Button>,
      )

      const link = screen.getByRole('link', { name: 'Read the docs' })
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveAttribute('tabindex', '-1')
      expect(link).toHaveAttribute('href', '/docs')
    })
  })

  describe('in a form', () => {
    const renderForm = (ui: ReactElement) => {
      const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
      render(<form onSubmit={onSubmit}>{ui}</form>)
      return onSubmit
    }

    it('does not submit by default', async () => {
      const onSubmit = renderForm(<Button>Save</Button>)

      await userEvent.click(screen.getByRole('button'))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits with type submit', async () => {
      const onSubmit = renderForm(<Button type="submit">Save</Button>)

      await userEvent.click(screen.getByRole('button'))

      expect(onSubmit).toHaveBeenCalledOnce()
    })
  })

  describe('loading', () => {
    it('disables the button, ignores clicks and keeps its accessible name', async () => {
      const onClick = vi.fn()
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      )

      const button = screen.getByRole('button', { name: 'Save' })
      expect(button).toBeDisabled()
      await userEvent.click(button, { pointerEventsCheck: 0 })

      expect(onClick).not.toHaveBeenCalled()
    })

    it('shows a progressbar labelled by the button', () => {
      render(<Button loading>Save</Button>)

      const progressbar = screen.getByRole('progressbar', { name: 'Save' })
      expect(screen.getByRole('button')).toContainElement(progressbar)
    })
  })

  describe('with the keyboard', () => {
    it('moves focus to the button with Tab', async () => {
      render(<Button>Save</Button>)

      await userEvent.tab()

      expect(screen.getByRole('button')).toHaveFocus()
    })

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('activates a button with %s', async (_, key) => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Save</Button>)

      await userEvent.tab()
      await userEvent.keyboard(key)

      expect(onClick).toHaveBeenCalledOnce()
    })

    it('activates a link with Enter', async () => {
      const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
      render(
        <Button href="/docs" onClick={onClick}>
          Read the docs
        </Button>,
      )

      await userEvent.tab()
      expect(screen.getByRole('link')).toHaveFocus()
      await userEvent.keyboard('{Enter}')

      expect(onClick).toHaveBeenCalledOnce()
    })

    it('skips disabled and loading buttons with Tab', async () => {
      render(
        <>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button>Enabled</Button>
        </>,
      )

      await userEvent.tab()

      expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus()
    })
  })

  describe('under the library theme', () => {
    it('does not uppercase the label', () => {
      renderThemed(<Button>Save</Button>)

      expect(screen.getByRole('button')).toHaveStyle({ textTransform: 'none' })
    })

    it('gives contained buttons no elevation', () => {
      renderThemed(<Button variant="contained">Save</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiButton-disableElevation')
      expect(button).toHaveStyle({ boxShadow: 'none' })
    })

    it('shows a solid outline on keyboard focus', async () => {
      renderThemed(<Button variant="contained">Save</Button>)

      const button = await focusWithKeyboard()

      expect(button).toHaveClass('Mui-focusVisible')
      expect(button).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineOffset: '2px',
        outlineColor: createCmTheme().palette.primary.main,
      })
    })
  })

  describe('with overrides', () => {
    it('merges a project styleOverrides.root object with the library defaults', () => {
      renderThemed(<Button>Save</Button>, {
        components: { MuiButton: { styleOverrides: { root: { letterSpacing: '3px' } } } },
      })

      expect(screen.getByRole('button')).toHaveStyle({
        letterSpacing: '3px',
        textTransform: 'none',
      })
    })

    it('replaces the library root styles when styleOverrides.root is a function', () => {
      renderThemed(<Button>Save</Button>, {
        components: {
          MuiButton: { styleOverrides: { root: () => ({ letterSpacing: '3px' }) } },
        },
      })

      expect(screen.getByRole('button')).toHaveStyle({
        letterSpacing: '3px',
        textTransform: 'uppercase',
      })
    })

    it('restores elevation with a project disableElevation of false', () => {
      renderThemed(<Button variant="contained">Save</Button>, {
        components: { MuiButton: { defaultProps: { disableElevation: false } } },
      })

      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('MuiButton-disableElevation')
      expect(button).not.toHaveStyle({ boxShadow: 'none' })
    })

    it('changes the outline with a project focusVisible object', async () => {
      renderThemed(<Button variant="contained">Save</Button>, {
        focusVisible: { outlineColor: '#aa0000' },
      })

      const button = await focusWithKeyboard()

      expect(button).toHaveStyle({ outlineStyle: 'solid', outlineColor: '#aa0000' })
    })

    it('removes the outline with a project focusVisible of false', async () => {
      renderThemed(<Button variant="contained">Save</Button>, { focusVisible: false })

      const button = await focusWithKeyboard()

      expect(button).toHaveClass('Mui-focusVisible')
      expect(button).not.toHaveStyle({ outlineStyle: 'solid' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<Button sx={{ textTransform: 'lowercase' }}>Save</Button>)

      expect(screen.getByRole('button')).toHaveStyle({ textTransform: 'lowercase' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { primary: { main: '#aa0000' } } })

      render(
        <ThemeProvider theme={theme}>
          <Button variant="contained">Save</Button>
        </ThemeProvider>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ backgroundColor: '#aa0000', textTransform: 'uppercase' })
      expect(button).not.toHaveClass('MuiButton-disableElevation')
      expect(button).not.toHaveStyle({ boxShadow: 'none' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Button component={RouterLink} to="/x" />,
      <Button href="/x" target="_blank" />,
    ]
    const rejected = [
      // @ts-expect-error: not a Button prop
      <Button unknownProp />,
      // @ts-expect-error: RouterLink requires `to`
      <Button component={RouterLink} />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(4)
  })
})
