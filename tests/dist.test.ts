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
  })

  it('keeps "use client" as the first statement of client modules', () => {
    expect(read('theme/CmThemeProvider.js')).toMatch(/^["']use client["'];?\s/)
  })

  it('does not mark modules that can run on the server as client code', () => {
    expect(read('theme/createCmTheme.js')).not.toContain('use client')
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

    expect(Object.keys(api).sort()).toEqual(['Button', 'CmThemeProvider', 'createCmTheme'])
  })
})
