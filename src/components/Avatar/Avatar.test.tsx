import FolderIcon from '@mui/icons-material/Folder'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CmThemeProvider } from '../../theme/CmThemeProvider.tsx'
import { createCmTheme } from '../../theme/createCmTheme.ts'
import { Avatar } from './index.ts'

const renderThemed = (ui: ReactElement, overrides?: ThemeOptions) =>
  render(<CmThemeProvider theme={createCmTheme(overrides)}>{ui}</CmThemeProvider>)

const light = createCmTheme().colorSchemes.light!.palette

const avatar = (testId = 'avatar') => screen.getByTestId(testId)
const fallbackIcon = (root: HTMLElement) => root.querySelector('.MuiAvatar-fallback')

/**
 * jsdom never loads images, so MUI's `new Image()` never settles and an
 * avatar with `src` keeps showing its `<img>`. This stub settles every image
 * the way a browser would for a working or a broken URL.
 */
function stubImages(result: (src: string) => 'load' | 'error') {
  vi.stubGlobal(
    'Image',
    class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin: string | null = null
      referrerPolicy = ''
      srcset = ''
      set src(value: string) {
        setTimeout(() => (result(value) === 'load' ? this.onload : this.onerror)?.())
      }
    },
  )
}

const libraryFallbackColors = { color: light.common.white, backgroundColor: light.grey[500] }

describe('Avatar', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders an img with the given src and alt', () => {
    render(<Avatar src="/ana.jpg" alt="Ana Ruiz" />)

    const img = screen.getByRole('img', { name: 'Ana Ruiz' })
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', '/ana.jpg')
  })

  it('renders its children', () => {
    render(
      <>
        <Avatar data-testid="initials">JD</Avatar>
        <Avatar data-testid="icon">
          <FolderIcon data-testid="folder" />
        </Avatar>
      </>,
    )

    expect(avatar('initials')).toHaveTextContent('JD')
    expect(fallbackIcon(avatar('initials'))).toBeNull()
    expect(avatar('icon')).toContainElement(screen.getByTestId('folder'))
  })

  it('renders the hidden fallback icon without an image or children', () => {
    render(<Avatar data-testid="avatar" />)

    const icon = fallbackIcon(avatar())
    expect(icon?.tagName).toBe('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  describe('when the image fails to load', () => {
    it.each([
      ['the children', <Avatar data-testid="avatar" src="/broken.jpg" alt="Ana Ruiz">AR</Avatar>, 'AR'],
      ['the first letter of alt', <Avatar data-testid="avatar" src="/broken.jpg" alt="Ana Ruiz" />, 'A'],
    ])('renders %s', async (_, ui, text) => {
      stubImages(() => 'error')
      render(ui)

      expect(await screen.findByText(text)).toBe(avatar())
      expect(avatar().querySelector('img')).toBeNull()
    })

    it('renders the fallback icon without children or alt', async () => {
      stubImages(() => 'error')
      render(<Avatar data-testid="avatar" src="/broken.jpg" />)

      await vi.waitFor(() => expect(fallbackIcon(avatar())).not.toBeNull())
      expect(avatar().querySelector('img')).toBeNull()
    })

    it('shows the image again when a later src loads', async () => {
      stubImages((src) => (src.includes('broken') ? 'error' : 'load'))
      const { rerender } = render(<Avatar data-testid="avatar" src="/broken.jpg" alt="Ana Ruiz" />)
      await screen.findByText('A')

      rerender(<Avatar data-testid="avatar" src="/ana.jpg" alt="Ana Ruiz" />)

      expect(await screen.findByRole('img', { name: 'Ana Ruiz' })).toHaveAttribute('src', '/ana.jpg')
    })
  })

  it.each([
    ['circular', '50%'],
    ['rounded', '8px'],
    ['square', '0'],
  ] as const)('gives variant="%s" a radius of %s', (variant, borderRadius) => {
    renderThemed(
      <Avatar data-testid="avatar" variant={variant}>
        JD
      </Avatar>,
    )

    expect(avatar()).toHaveClass(`MuiAvatar-${variant}`)
    expect(avatar()).toHaveStyle({ borderRadius })
  })

  it('passes ref to the root div', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Avatar ref={ref} data-testid="avatar">
        JD
      </Avatar>,
    )

    expect(ref.current).toBe(avatar())
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('passes className, sx, style and other props to the root element', () => {
    render(
      <Avatar
        data-testid="avatar"
        className="custom"
        sx={{ width: '24px' }}
        style={{ marginTop: '7px' }}
        role="img"
        aria-label="Jane Doe"
      >
        JD
      </Avatar>,
    )

    const root = screen.getByRole('img', { name: 'Jane Doe' })
    expect(root).toBe(avatar())
    expect(root).toHaveClass('custom')
    expect(root).toHaveStyle({ width: '24px', marginTop: '7px' })
  })

  it('passes each slot in slotProps to its element', () => {
    render(
      <>
        <Avatar
          data-testid="with-image"
          src="/ana.jpg"
          alt="Ana Ruiz"
          slotProps={{ root: { className: 'root' }, img: { className: 'img', loading: 'lazy' } }}
        />
        <Avatar data-testid="without-image" slotProps={{ fallback: { className: 'fallback' } }} />
      </>,
    )

    expect(avatar('with-image')).toHaveClass('root')
    expect(screen.getByRole('img')).toHaveClass('img')
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
    expect(fallbackIcon(avatar('without-image'))).toHaveClass('fallback')
  })

  describe('under the library theme', () => {
    it('draws the fallback in common.white on grey[500] on both color schemes', () => {
      // A class selector puts both schemes on one page, which jsdom can't do
      // with the default `prefers-color-scheme` media query.
      renderThemed(
        <>
          <Avatar data-testid="light">JD</Avatar>
          <div className="dark">
            <Avatar data-testid="dark" />
          </div>
        </>,
        { cssVariables: { colorSchemeSelector: 'class' } },
      )

      // MUI's default fallback background is a per-scheme variable, so this
      // also checks that the library's rule replaces it in dark mode.
      expect(avatar('light')).toHaveStyle(libraryFallbackColors)
      expect(avatar('dark')).toHaveStyle(libraryFallbackColors)
    })

    it('draws the fallback colors after a failing image', async () => {
      stubImages(() => 'error')
      renderThemed(<Avatar data-testid="avatar" src="/broken.jpg" alt="Ana Ruiz" />)

      await screen.findByText('A')

      expect(avatar()).toHaveStyle(libraryFallbackColors)
    })

    it('does not give an avatar with a working image the fallback colors', async () => {
      stubImages(() => 'load')
      renderThemed(<Avatar data-testid="avatar" src="/ana.jpg" alt="Ana Ruiz" />)

      // Wait past the load, so the check runs once MUI has settled the image.
      await new Promise((resolve) => setTimeout(resolve))

      expect(screen.getByRole('img')).toBeInTheDocument()
      expect(avatar()).not.toHaveClass('MuiAvatar-colorDefault')
      expect(avatar()).not.toHaveStyle({ backgroundColor: light.grey[500] })
    })
  })

  describe('with overrides', () => {
    it('merges a project styleOverrides.root object and keeps the library’s fallback colors', () => {
      renderThemed(<Avatar data-testid="avatar">JD</Avatar>, {
        components: { MuiAvatar: { styleOverrides: { root: { letterSpacing: '3px' } } } },
      })

      expect(avatar()).toHaveStyle({ letterSpacing: '3px', ...libraryFallbackColors })
    })

    it('lets an instance-level sx value override the theme', () => {
      renderThemed(
        <Avatar data-testid="avatar" sx={{ bgcolor: 'rgb(170, 0, 0)' }}>
          JD
        </Avatar>,
      )

      expect(avatar()).toHaveStyle({ backgroundColor: 'rgb(170, 0, 0)', color: light.common.white })
    })
  })

  describe('without CmThemeProvider', () => {
    it('renders with the surrounding MUI theme', () => {
      const theme = createTheme({ palette: { grey: { 400: '#aa0000' } } })

      render(
        <ThemeProvider theme={theme}>
          <Avatar data-testid="avatar">JD</Avatar>
        </ThemeProvider>,
      )

      expect(avatar()).toHaveStyle({ backgroundColor: '#aa0000' })
    })
  })

  // Checked by `npm run typecheck`, which covers this file. Never rendered.
  it('has the expected prop types', () => {
    const accepted = [
      <Avatar src="/a.jpg" alt="A" srcSet="/a.jpg 1x" sizes="40px" variant="rounded" />,
      <Avatar component="span">JD</Avatar>,
      <Avatar slotProps={{ img: { loading: 'lazy' } }} />,
    ]
    const rejected = [
      // @ts-expect-error: not an Avatar prop
      <Avatar unknownProp />,
      // @ts-expect-error: not a variant
      <Avatar variant="oval" />,
      // @ts-expect-error: sizes are set with sx
      <Avatar size="small" />,
    ]

    expect([...accepted, ...rejected]).toHaveLength(6)
  })
})
