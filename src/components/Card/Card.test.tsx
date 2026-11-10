import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from '../Avatar/index.ts'
import { Button } from '../Button/index.ts'
import { Link } from '../Link/index.ts'
import { Card } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const libraryTheme = createCmTheme()
const light = libraryTheme.colorSchemes.light!.palette

const card = () => screen.getByTestId('card')
type Part =
  | 'MuiCardHeader-root'
  | 'MuiCardHeader-title'
  | 'MuiCardHeader-subheader'
  | 'MuiCardHeader-avatar'
  | 'MuiCardHeader-action'
  | 'MuiCardMedia-root'
  | 'MuiCardContent-root'
  | 'MuiCardActions-root'
const noSpaces = (value: string) => value.replace(/\s+/g, '')
const paperShadow = () => noSpaces(getComputedStyle(card()).getPropertyValue('--Paper-shadow'))
const part = (name: Part) => card().querySelector<HTMLElement>(`.${name}`)

const photo = { src: 'https://example.com/lamp.jpg', alt: 'A brass desk lamp', height: 180 }

describe('Card', () => {
  it('renders title and subheader inside the header, with the subheader in text.secondary', () => {
    renderThemed(<Card data-testid="card" title="Revenue" subheader="This month" />)

    const header = part('MuiCardHeader-root')!
    expect(header).toContainElement(screen.getByText('Revenue'))
    expect(header).toContainElement(screen.getByText('This month'))
    expect(part('MuiCardHeader-subheader')).toHaveStyle({ color: light.text.secondary })
    expect(part('MuiCardHeader-title')).toHaveClass('MuiTypography-h5')
  })

  it('renders avatar before the title and headerAction after it', () => {
    render(
      <Card
        data-testid="card"
        avatar={<Avatar data-testid="avatar" alt="" />}
        title="Ana Ruiz"
        subheader="Designer"
        headerAction={
          <IconButton aria-label="Options for Ana Ruiz">
            <MoreVertIcon />
          </IconButton>
        }
      />,
    )

    const header = part('MuiCardHeader-root')!
    const [first, , last] = header.children
    expect(first).toHaveClass('MuiCardHeader-avatar')
    expect(first).toContainElement(screen.getByTestId('avatar'))
    expect(last).toHaveClass('MuiCardHeader-action')
    expect(last).toContainElement(screen.getByRole('button', { name: 'Options for Ana Ruiz' }))
    // With an avatar, MUI makes the title body2.
    expect(part('MuiCardHeader-title')).toHaveClass('MuiTypography-body2')
  })

  it('renders image as an <img> with src, alt and height, before the header', () => {
    render(<Card data-testid="card" image={photo} title="Desk lamp" />)

    const img = screen.getByRole('img', { name: 'A brass desk lamp' })
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', photo.src)
    expect(img).toHaveStyle({ height: '180px', objectFit: 'cover', width: '100%' })
    expect(card().firstElementChild).toBe(img)
    expect(img.nextElementSibling).toBe(part('MuiCardHeader-root'))
  })

  it('accepts any CSS length as the image height', () => {
    render(<Card data-testid="card" image={{ ...photo, height: '12rem' }} />)

    expect(screen.getByRole('img').style.height).toBe('12rem')
  })

  it('hides a decorative image from screen readers with alt=""', () => {
    render(<Card data-testid="card" image={{ src: photo.src, alt: '' }} title="Desk lamp" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(part('MuiCardMedia-root')).toHaveAttribute('alt', '')
  })

  it('renders children inside CardContent, and actions inside CardActions after it', () => {
    render(
      <Card data-testid="card" title="Desk lamp" actions={<Button size="small">Add to cart</Button>}>
        <p>A lamp for reading.</p>
      </Card>,
    )

    const content = part('MuiCardContent-root')!
    const actions = part('MuiCardActions-root')!
    expect(content).toContainElement(screen.getByText('A lamp for reading.'))
    expect(actions).toContainElement(screen.getByRole('button', { name: 'Add to cart' }))
    expect(part('MuiCardHeader-root')!.nextElementSibling).toBe(content)
    expect(content.nextElementSibling).toBe(actions)
  })

  it('renders only the parts whose props are set', () => {
    render(
      <Card data-testid="card">
        <p>Body</p>
      </Card>,
    )

    expect(part('MuiCardContent-root')).toBeInTheDocument()
    expect(part('MuiCardHeader-root')).not.toBeInTheDocument()
    expect(part('MuiCardMedia-root')).not.toBeInTheDocument()
    expect(part('MuiCardActions-root')).not.toBeInTheDocument()
  })

  it.each([
    ['subheader', { subheader: 'This month' }],
    ['avatar', { avatar: <Avatar alt="" /> }],
    ['headerAction', { headerAction: <button type="button">Options</button> }],
  ])('renders the header with only %s', (_, props) => {
    render(<Card data-testid="card" {...props} />)

    expect(part('MuiCardHeader-root')).toBeInTheDocument()
  })

  it('renders an empty box with no props', () => {
    render(<Card data-testid="card" />)

    expect(card()).toBeEmptyDOMElement()
  })

  it('renders the title as a heading with slotProps.title', () => {
    render(
      <Card
        data-testid="card"
        title={<Link href="/products/1">Desk lamp</Link>}
        subheader="$49"
        slotProps={{ title: { component: 'h3' }, subheader: { component: 'p' } }}
      />,
    )

    const heading = screen.getByRole('heading', { level: 3, name: 'Desk lamp' })
    expect(heading).toContainElement(screen.getByRole('link', { name: 'Desk lamp' }))
    expect(part('MuiCardHeader-subheader')!.tagName).toBe('P')
  })

  it('renders the root as an <article> with component="article"', () => {
    render(<Card data-testid="card" component="article" title="Desk lamp" />)

    expect(card().tagName).toBe('ARTICLE')
    expect(screen.getByRole('article')).toBe(card())
  })

  it('renders a border and no shadow with variant="outlined"', () => {
    renderThemed(<Card data-testid="card" variant="outlined" />)

    expect(card()).toHaveClass('MuiPaper-outlined')
    expect(card()).toHaveStyle({ borderStyle: 'solid', borderWidth: '1px' })
    expect(card()).not.toHaveClass('MuiPaper-elevation1')
  })

  it('passes ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref} data-testid="card" title="Revenue" />)

    expect(ref.current).toBe(card())
  })

  it('passes className, sx and other props to the root element', () => {
    render(
      <>
        <h2 id="billing">Billing</h2>
        <Card
          data-testid="card"
          component="section"
          aria-labelledby="billing"
          className="custom"
          sx={{ marginTop: '7px' }}
        />
      </>,
    )

    expect(card()).toHaveClass('custom', 'MuiCard-root')
    expect(card()).toHaveStyle({ marginTop: '7px' })
    expect(screen.getByRole('region', { name: 'Billing' })).toBe(card())
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <Card
        data-testid="card"
        image={photo}
        title="Desk lamp"
        subheader="$49"
        actions={<Button>Add</Button>}
        slotProps={{
          header: { className: 'header' },
          title: { className: 'title' },
          subheader: { className: 'subheader' },
          media: { className: 'media' },
          content: { className: 'content' },
          actions: { className: 'actions', disableSpacing: true },
        }}
      >
        Body
      </Card>,
    )

    expect(part('MuiCardHeader-root')).toHaveClass('header')
    expect(part('MuiCardHeader-title')).toHaveClass('title')
    expect(part('MuiCardHeader-subheader')).toHaveClass('subheader')
    expect(part('MuiCardMedia-root')).toHaveClass('media')
    expect(part('MuiCardContent-root')).toHaveClass('content')
    expect(part('MuiCardActions-root')).toHaveClass('actions')
  })

  it('keeps the header’s own slotProps when slotProps.title isn’t set', () => {
    render(
      <Card
        data-testid="card"
        title="Desk lamp"
        slotProps={{ header: { slotProps: { title: { className: 'from-header' } } } }}
      />,
    )

    expect(part('MuiCardHeader-title')).toHaveClass('from-header')
  })

  it('merges slotProps.media.style with the image height', () => {
    render(
      <Card data-testid="card" image={photo} slotProps={{ media: { style: { opacity: 0.5 } } }} />,
    )

    expect(screen.getByRole('img')).toHaveStyle({ height: '180px', opacity: '0.5' })
  })

  describe('under the library theme', () => {
    it('has background.paper, shadows[1] and the 8px radius', () => {
      renderThemed(<Card data-testid="card" title="Revenue" />)

      expect(card()).toHaveStyle({ backgroundColor: light.background.paper, borderRadius: '8px' })
      expect(card()).toHaveClass('MuiPaper-elevation1')
      // jsdom resolves `shadows[1]`, the `baseShadow` variable, to its value.
      expect(paperShadow()).toBe(noSpaces(light.baseShadow))
    })

    it('uses shadows[8] when raised', () => {
      renderThemed(<Card data-testid="card" raised />)

      expect(paperShadow()).toBe(noSpaces(libraryTheme.shadows[8]))
    })
  })

  describe('with overrides', () => {
    it('applies a project-level MuiCard styleOverrides.root object', () => {
      renderThemed(<Card data-testid="card" />, {
        components: { MuiCard: { styleOverrides: { root: { borderRadius: '3px' } } } },
      })

      expect(card()).toHaveStyle({ borderRadius: '3px' })
    })

    it('applies a project-level MuiCardHeader styleOverrides.title object', () => {
      renderThemed(<Card data-testid="card" title="Revenue" />, {
        components: { MuiCardHeader: { styleOverrides: { title: { letterSpacing: '3px' } } } },
      })

      expect(part('MuiCardHeader-title')).toHaveStyle({ letterSpacing: '3px' })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(<Card data-testid="card" sx={{ borderRadius: '2px' }} />, {
        components: { MuiCard: { styleOverrides: { root: { borderRadius: '3px' } } } },
      })

      expect(card()).toHaveStyle({ borderRadius: '2px' })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({
        palette: { background: { paper: '#eeffee' } },
        shape: { borderRadius: 3 },
      })

      render(
        <ThemeProvider theme={theme}>
          <Card data-testid="card" title="Revenue" />
        </ThemeProvider>,
      )

      expect(card()).toHaveStyle({ backgroundColor: '#eeffee', borderRadius: '3px' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Card title={<b>x</b>} subheader="x" avatar={<Avatar />} headerAction={<b>x</b>} />,
      <Card image={{ src: 'x', alt: '' }} actions={<Button>x</Button>} variant="outlined" />,
      <Card component="article" raised slotProps={{ title: { component: 'h3' } }} />,
    ]
    const rejected = [
      // @ts-expect-error: alt is required
      <Card image={{ src: 'x' }} />,
      // @ts-expect-error: image takes a CardImage, not a URL
      <Card image="x.jpg" />,
      // @ts-expect-error: the header's title is set with the title prop
      <Card slotProps={{ header: { title: 'x' } }} />,
      // @ts-expect-error: not a Card variant
      <Card variant="filled" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(7)
  })
})
