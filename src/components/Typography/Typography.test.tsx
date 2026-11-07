import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Button } from '../Button/index.ts'
import { Typography } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const text = (content: string) => screen.getByText(content)

// jsdom resolves `rem` against a 16px root, so sizes are checked in px.
const variants = [
  ['h1', 'H1', '48px', '600'],
  ['h2', 'H2', '36px', '600'],
  ['h3', 'H3', '30px', '400'],
  ['h4', 'H4', '24px', '600'],
  ['h5', 'H5', '20px', '600'],
  ['h6', 'H6', '18px', '600'],
  ['subtitle1', 'P', '18px', '400'],
  ['subtitle2', 'P', '14px', '500'],
  ['body1', 'P', '14px', '400'],
  ['body2', 'P', '14px', '400'],
  ['caption', 'SPAN', '12px', '400'],
  ['overline', 'SPAN', '12px', '400'],
  ['button', 'SPAN', '14px', '500'],
] as const

describe('Typography', () => {
  it('renders a paragraph with the body1 variant by default', () => {
    render(<Typography>Body text</Typography>)

    const paragraph = text('Body text')
    expect(paragraph.tagName).toBe('P')
    expect(paragraph).toHaveClass('MuiTypography-body1')
  })

  it('renders the given component without changing the variant’s style', () => {
    renderThemed(
      <Typography variant="h4" component="h2">
        Recent orders
      </Typography>,
    )

    const heading = screen.getByRole('heading', { level: 2, name: 'Recent orders' })
    expect(heading).toHaveClass('MuiTypography-h4')
    expect(heading).toHaveStyle({ fontSize: '24px', fontWeight: '600' })
  })

  it('passes ref to the DOM element', () => {
    const ref = createRef<HTMLParagraphElement>()
    render(<Typography ref={ref}>Body text</Typography>)

    expect(ref.current).toBe(text('Body text'))
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <Typography
        className="custom"
        sx={{ marginTop: '7px' }}
        id="intro"
        data-testid="intro"
        aria-describedby="hint"
      >
        Body text
      </Typography>,
    )

    const paragraph = text('Body text')
    expect(paragraph).toHaveClass('custom')
    expect(paragraph).toHaveStyle({ marginTop: '7px' })
    expect(paragraph).toHaveAttribute('id', 'intro')
    expect(paragraph).toHaveAttribute('data-testid', 'intro')
    expect(paragraph).toHaveAttribute('aria-describedby', 'hint')
  })

  it.each([
    ['align="center"', { align: 'center' }, 'MuiTypography-alignCenter', { textAlign: 'center' }],
    // 0.35em of MUI's default 16px body1.
    ['gutterBottom', { gutterBottom: true }, 'MuiTypography-gutterBottom', { marginBottom: '5.6px' }],
    [
      'noWrap',
      { noWrap: true },
      'MuiTypography-noWrap',
      { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    ],
  ] as const)('adds its class and styles for %s', (_, props, className, style) => {
    render(<Typography {...props}>Body text</Typography>)

    const paragraph = text('Body text')
    expect(paragraph).toHaveClass(className)
    expect(paragraph).toHaveStyle(style)
  })

  it('takes the parent’s font size with variant="inherit"', () => {
    renderThemed(
      <div style={{ fontSize: '27px' }}>
        <Typography variant="inherit">Inherited</Typography>
      </div>,
    )

    const paragraph = text('Inherited')
    expect(paragraph.tagName).toBe('P')
    expect(paragraph).toHaveStyle({ fontSize: '27px' })
  })

  it('is not focusable', async () => {
    renderThemed(
      <>
        <Typography variant="h1">Dashboard</Typography>
        <Typography>Body text</Typography>
      </>,
    )

    await userEvent.tab()

    expect(document.body).toHaveFocus()
    expect(screen.getByRole('heading')).not.toHaveAttribute('tabindex')
    expect(text('Body text')).not.toHaveAttribute('tabindex')
  })

  describe('under the library theme', () => {
    it.each(variants)(
      'renders %s as a <%s> of size %s and weight %s in Inter',
      (variant, tagName, fontSize, fontWeight) => {
        renderThemed(<Typography variant={variant}>Sample</Typography>)

        const element = text('Sample')
        expect(element.tagName).toBe(tagName)
        expect(element).toHaveStyle({ fontSize, fontWeight, fontFamily: 'Inter, sans-serif' })
      },
    )

    it('keeps the button variant’s case and makes overline uppercase', () => {
      renderThemed(
        <>
          <Typography variant="button">Button text</Typography>
          <Typography variant="overline">Overline text</Typography>
        </>,
      )

      expect(text('Button text')).toHaveStyle({ textTransform: 'none' })
      expect(text('Overline text')).toHaveStyle({ textTransform: 'uppercase' })
    })

    it.each([
      ['primary', createCmTheme().palette.primary.main],
      ['textSecondary', createCmTheme().palette.text.secondary],
    ] as const)('applies the palette color for color="%s"', (color, value) => {
      renderThemed(<Typography color={color}>Colored</Typography>)

      expect(text('Colored')).toHaveStyle({ color: value })
    })

    it('sets no color without the color prop, so the text inherits', () => {
      renderThemed(
        <div style={{ color: 'rgb(170, 0, 0)' }}>
          <Typography>Inherited</Typography>
        </div>,
      )

      expect(text('Inherited')).toHaveStyle({ color: 'rgb(170, 0, 0)' })
    })
  })

  describe('with overrides', () => {
    it('changes h1’s size with a project typography.h1 and keeps the library’s weight', () => {
      renderThemed(<Typography variant="h1">Dashboard</Typography>, {
        typography: { h1: { fontSize: '4rem' } },
      })

      expect(screen.getByRole('heading')).toHaveStyle({ fontSize: '64px', fontWeight: '600' })
    })

    it('merges a project variantMapping with the library’s', () => {
      renderThemed(
        <>
          <Typography variant="subtitle1">First</Typography>
          <Typography variant="subtitle2">Second</Typography>
        </>,
        {
          components: {
            MuiTypography: { defaultProps: { variantMapping: { subtitle1: 'h6' } } },
          },
        },
      )

      expect(text('First').tagName).toBe('H6')
      expect(text('Second').tagName).toBe('P')
    })

    it('makes the button variant uppercase with a project typography.button, but not Button', () => {
      renderThemed(
        <>
          <Typography variant="button">Button text</Typography>
          <Button>Save</Button>
        </>,
        { typography: { button: { textTransform: 'uppercase' } } },
      )

      expect(text('Button text')).toHaveStyle({ textTransform: 'uppercase' })
      expect(screen.getByRole('button', { name: 'Save' })).toHaveStyle({ textTransform: 'none' })
    })

    it('changes every Typography with a project styleOverrides.root object', () => {
      renderThemed(
        <>
          <Typography variant="h2">Heading</Typography>
          <Typography>Body text</Typography>
        </>,
        { components: { MuiTypography: { styleOverrides: { root: { letterSpacing: '3px' } } } } },
      )

      expect(screen.getByRole('heading')).toHaveStyle({ letterSpacing: '3px' })
      expect(text('Body text')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Typography variant="h1" sx={{ fontWeight: 300 }}>
          Dashboard
        </Typography>,
      )

      expect(screen.getByRole('heading')).toHaveStyle({ fontWeight: '300' })
    })

    it('replaces the theme’s mapping with an instance-level variantMapping', () => {
      renderThemed(
        <Typography variant="subtitle1" variantMapping={{ body1: 'div' }}>
          Subtitle
        </Typography>,
      )

      expect(text('Subtitle').tagName).toBe('H6')
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme, with subtitles as <h6>', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <Typography>Body text</Typography>
          <Typography variant="subtitle1">First</Typography>
          <Typography variant="subtitle2">Second</Typography>
          <Typography variant="button">Button text</Typography>
        </ThemeProvider>,
      )

      expect(text('Body text')).toHaveStyle({ fontSize: '16px' })
      expect(getComputedStyle(text('Body text')).fontFamily).toMatch(/^"?Roboto/)
      expect(text('First').tagName).toBe('H6')
      expect(text('Second').tagName).toBe('H6')
      expect(text('Button text')).toHaveStyle({ textTransform: 'uppercase' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Typography component="h2" variant="h4" />,
      <Typography color="textSecondary" align="center" gutterBottom noWrap />,
    ]
    const rejected = [
      // @ts-expect-error: not a Typography prop
      <Typography unknownProp />,
      // @ts-expect-error: MUI's Typography has no slotProps
      <Typography slotProps={{}} />,
      // @ts-expect-error: MUI 9 removed the paragraph prop
      <Typography paragraph />,
      // @ts-expect-error: not a variant
      <Typography variant="h7" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(6)
  })
})
