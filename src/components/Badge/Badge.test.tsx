import MailIcon from '@mui/icons-material/Mail'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Badge } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const root = (testId = 'badge') => screen.getByTestId(testId)
const badge = (testId = 'badge') => root(testId).querySelector<HTMLElement>('.MuiBadge-badge')!
const isHidden = (testId = 'badge') => badge(testId).classList.contains('MuiBadge-invisible')

const Mail = () => <MailIcon data-testid="child" />

describe('Badge', () => {
  it('renders the child and a badge showing badgeContent', () => {
    render(
      <Badge data-testid="badge" badgeContent={4}>
        <Mail />
      </Badge>,
    )

    expect(root()).toContainElement(screen.getByTestId('child'))
    expect(badge()).toHaveTextContent('4')
    expect(isHidden()).toBe(false)
  })

  it('hides the badge from screen readers', () => {
    render(
      <Badge data-testid="badge" badgeContent={4}>
        <Mail />
      </Badge>,
    )

    expect(badge()).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([
    [100, undefined, '99+'],
    [99, undefined, '99'],
    [11, 10, '10+'],
  ])('shows badgeContent=%s with max=%s as %s', (badgeContent, max, text) => {
    render(
      <Badge data-testid="badge" badgeContent={badgeContent} max={max}>
        <Mail />
      </Badge>,
    )

    expect(badge()).toHaveTextContent(text)
  })

  it('does not cap content that is not a number', () => {
    render(
      <Badge data-testid="badge" badgeContent="New" max={1}>
        <Mail />
      </Badge>,
    )

    expect(badge()).toHaveTextContent('New')
  })

  it('hides a badgeContent of 0, unless showZero is set', () => {
    render(
      <>
        <Badge data-testid="zero" badgeContent={0}>
          <Mail />
        </Badge>
        <Badge data-testid="shown" badgeContent={0} showZero>
          <Mail />
        </Badge>
      </>,
    )

    expect(isHidden('zero')).toBe(true)
    expect(isHidden('shown')).toBe(false)
    expect(badge('shown')).toHaveTextContent('0')
  })

  it('hides the badge with invisible', () => {
    render(
      <Badge data-testid="badge" badgeContent={4} invisible>
        <Mail />
      </Badge>,
    )

    expect(isHidden()).toBe(true)
  })

  it('shows a dot with no content for variant="dot"', () => {
    render(
      <Badge data-testid="badge" variant="dot" badgeContent={4}>
        <Mail />
      </Badge>,
    )

    expect(badge()).toHaveClass('MuiBadge-dot')
    expect(badge()).toBeEmptyDOMElement()
    expect(isHidden()).toBe(false)
  })

  it('places the badge for a round child with overlap="circular"', () => {
    render(
      <Badge data-testid="badge" variant="dot" overlap="circular">
        <Avatar alt="Ana Ruiz" src="/ana.jpg" />
      </Badge>,
    )

    expect(badge()).toHaveClass('MuiBadge-overlapCircular')
    expect(badge().style.getPropertyValue('--Badge-inset')).toBe('14% 14% auto auto')
  })

  it('passes ref to the root span', () => {
    const ref = createRef<HTMLSpanElement>()
    render(
      <Badge ref={ref} data-testid="badge" badgeContent={4}>
        <Mail />
      </Badge>,
    )

    expect(ref.current).toBe(root())
    expect(ref.current?.tagName).toBe('SPAN')
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <Badge data-testid="badge" className="custom" sx={{ marginTop: '7px' }} badgeContent={4}>
        <Mail />
      </Badge>,
    )

    expect(root()).toHaveClass('custom')
    expect(root()).toHaveStyle({ marginTop: '7px' })
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <Badge
        data-testid="badge"
        badgeContent={4}
        slotProps={{ root: { className: 'root' }, badge: { className: 'badge' } }}
      >
        <Mail />
      </Badge>,
    )

    expect(root()).toHaveClass('root')
    expect(badge()).toHaveClass('badge')
  })

  describe('under the library theme', () => {
    it('uses error.main and error.contrastText without color', () => {
      renderThemed(
        <Badge data-testid="badge" badgeContent={4}>
          <Mail />
        </Badge>,
      )

      expect(badge()).toHaveClass('MuiBadge-colorError')
      expect(badge()).toHaveStyle({
        backgroundColor: light.error.main,
        color: light.error.contrastText,
      })
    })

    it('uses the given color', () => {
      renderThemed(
        <Badge data-testid="badge" badgeContent={4} color="success">
          <Mail />
        </Badge>,
      )

      expect(badge()).toHaveStyle({ backgroundColor: light.success.main })
    })
  })

  describe('with overrides', () => {
    it('changes the default color with a project-level MuiBadge.defaultProps.color', () => {
      renderThemed(
        <Badge data-testid="badge" badgeContent={4}>
          <Mail />
        </Badge>,
        { components: { MuiBadge: { defaultProps: { color: 'primary' } } } },
      )

      expect(badge()).toHaveStyle({ backgroundColor: light.primary.main })
    })

    it('applies a project-level MuiBadge styleOverrides.badge object', () => {
      renderThemed(
        <Badge data-testid="badge" badgeContent={4}>
          <Mail />
        </Badge>,
        { components: { MuiBadge: { styleOverrides: { badge: { fontWeight: 700 } } } } },
      )

      expect(badge()).toHaveStyle({ fontWeight: '700', backgroundColor: light.error.main })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Badge
          data-testid="badge"
          badgeContent={4}
          sx={{ '& .MuiBadge-badge': { backgroundColor: 'rgb(170, 0, 0)' } }}
        >
          <Mail />
        </Badge>,
      )

      expect(badge()).toHaveStyle({ backgroundColor: 'rgb(170, 0, 0)' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme and MUI’s default color', () => {
      const theme = createTheme({ palette: { error: { main: '#aa0000' } } })

      render(
        <ThemeProvider theme={theme}>
          <Badge data-testid="default" badgeContent={4}>
            <Mail />
          </Badge>
          <Badge data-testid="error" badgeContent={4} color="error">
            <Mail />
          </Badge>
        </ThemeProvider>,
      )

      expect(badge('default')).not.toHaveClass('MuiBadge-colorError')
      expect(badge('default')).not.toHaveStyle({ backgroundColor: '#aa0000' })
      expect(badge('error')).toHaveStyle({ backgroundColor: '#aa0000' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Badge badgeContent={4} max={9} showZero color="primary" overlap="circular" />,
      <Badge variant="dot" anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} />,
      <Badge component="div" slotProps={{ badge: { className: 'x' } }} />,
    ]
    const rejected = [
      // @ts-expect-error: not a Badge prop
      <Badge unknownProp />,
      // @ts-expect-error: not a Badge color
      <Badge color="danger" />,
      // @ts-expect-error: not a Badge variant
      <Badge variant="pill" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(6)
  })
})
