import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

// Checks the published output, so `npm run build` must run first.
const dist = join(import.meta.dirname, '../dist')
const pkg = JSON.parse(readFileSync(join(import.meta.dirname, '../package.json'), 'utf8'))

const read = (file: string) => readFileSync(join(dist, file), 'utf8')
const bareImports = (code: string) =>
  [...code.matchAll(/(?:from\s*|import\s*)["']([^."'][^"']*)["']/g)].map((match) => match[1])

describe('built output', () => {
  let files: string[]

  beforeAll(() => {
    if (!existsSync(dist)) {
      throw new Error('dist is missing. Run `npm run build` first.')
    }
    files = readdirSync(dist, { recursive: true, encoding: 'utf8' })
  })

  it('has every file named in the exports map', () => {
    const entry = pkg.exports['.']

    expect(existsSync(join(dist, '..', entry.import))).toBe(true)
    expect(existsSync(join(dist, '..', entry.types))).toBe(true)
  })

  it('keeps one module per source file', () => {
    expect(files).toContain('theme/CmThemeProvider.js')
    expect(files).toContain('theme/createCmTheme.js')
    expect(files).toContain('components/AppBar/AppBar.js')
    expect(files).toContain('components/Autocomplete/Autocomplete.js')
    expect(files).toContain('components/Card/Card.js')
    expect(files).toContain('components/Checkbox/Checkbox.js')
    expect(files).toContain('components/Form/Form.js')
    expect(files).toContain('components/List/List.js')
    expect(files).toContain('components/Menu/Menu.js')
    expect(files).toContain('components/Navbar/Navbar.js')
    expect(files).toContain('components/Sidebar/Sidebar.js')
    expect(files).toContain('components/Table/Table.js')
    expect(files).toContain('components/icons.js')
    expect(files).toContain('components/Select/Select.js')
    expect(files).toContain('components/RadioGroup/RadioGroup.js')
    expect(files).toContain('components/Rating/Rating.js')
    expect(files).toContain('components/Slider/Slider.js')
    expect(files).toContain('components/Switch/Switch.js')
    expect(files).toContain('components/Tabs/Tabs.js')
    expect(files).toContain('components/ToggleField.js')
  })

  it.each([
    'theme/CmThemeProvider.js',
    'components/Autocomplete/Autocomplete.js',
    'components/Checkbox/Checkbox.js',
    'components/Form/Form.js',
    'components/List/List.js',
    'components/Menu/Menu.js',
    'components/Navbar/Navbar.js',
    'components/RadioGroup/RadioGroup.js',
    'components/Rating/Rating.js',
    'components/Select/Select.js',
    'components/Sidebar/Sidebar.js',
    'components/Slider/Slider.js',
    'components/Switch/Switch.js',
    'components/Table/Table.js',
    'components/Tabs/Tabs.js',
    'components/ToggleField.js',
  ])(
    'keeps "use client" as the first statement of the client module %s',
    (file) => {
      expect(read(file)).toMatch(/^["']use client["'];?\s/)
    },
  )

  it('does not mark modules that can run on the server as client code', () => {
    expect(read('theme/createCmTheme.js')).not.toContain('use client')
    expect(read('components/Card/Card.js')).not.toContain('use client')
    expect(read('components/AppBar/AppBar.js')).not.toContain('use client')
  })

  it('is compiled by the React Compiler', () => {
    expect(read('theme/CmThemeProvider.js')).toContain('react/compiler-runtime')
  })

  it('imports only declared dependencies', () => {
    const declared = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })
    const imports = files
      .filter((file) => file.endsWith('.js'))
      .flatMap((file) => bareImports(read(file)))

    expect(imports.length).toBeGreaterThan(0)
    for (const name of imports) {
      expect(declared.some((dep) => name === dep || name.startsWith(`${dep}/`))).toBe(true)
    }
  })

  it('bundles no dependencies and ships no CSS, tests or stories', () => {
    expect(files.some((file) => file.startsWith('node_modules'))).toBe(false)
    expect(files.filter((file) => /\.css$|\.test\.|\.stories\.|test-setup/.test(file))).toEqual([])
  })

  it('exposes only the public API', async () => {
    const api = await import(join(dist, 'index.js'))

    expect(Object.keys(api).sort()).toEqual([
      'Alert',
      'AlertTitle',
      'AppBar',
      'Autocomplete',
      'Avatar',
      'Badge',
      'Button',
      'ButtonGroup',
      'Card',
      'Checkbox',
      'Chip',
      'CircularProgress',
      'CmThemeProvider',
      'Form',
      'LinearProgress',
      'Link',
      'List',
      'Menu',
      'Navbar',
      'RadioGroup',
      'Rating',
      'Select',
      'Sidebar',
      'Slider',
      'Switch',
      'Table',
      'Tabs',
      'TextField',
      'Tooltip',
      'Typography',
      'createCmTheme',
    ])
  })
})
