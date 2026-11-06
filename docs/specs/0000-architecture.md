# 0000: Library architecture

- **Status:** Accepted
- **Date:** 2026-11-06
- **Applies to:** every component and the build, test and release setup

## 1. Goals and non-goals

**Goals**

- Publish a React component library on npm, built on Material UI.
- Let projects use a component by passing props and data, without assembling MUI parts themselves.
- Provide a good default look that each project can override.
- Keep components small, typed, accessible and individually tree-shakeable.

**Non-goals**

- Wrapping every MUI component. A component is added only when it is on the [roadmap](./roadmap.md).
- Supporting styling engines other than Emotion.
- Hiding MUI completely. MUI is a visible part of the API, and consumers can keep using it directly.
- Providing data fetching, routing or global state. Components receive data and report events.

## 2. API conventions

Components use a hybrid API.

| Kind | Examples | Props |
| --- | --- | --- |
| Simple | Button, Card, inputs | Extend the matching MUI props, adding only what the library needs |
| Composite | Table, Menu, List, Navbar, Sidebar, Form | Own data-driven props such as `columns`, `rows` and `items` |

**Every component:**

- Accepts `sx` and `className`, applied to the root element.
- Accepts `slotProps` for inner parts. Composites define their own slot names in their spec.
- Accepts `ref`, passed to the root DOM element. React 19 treats `ref` as a normal prop, so `forwardRef` isn't used.
- Passes remaining props to its root element.

**Naming and types:**

- Components are exported without a prefix: `import { Button } from '@cmotino/cm-web-components'`. Consumers who also use MUI's `Button` can alias the import.
- Prop types are exported as `<Component>Props`.
- Composites that hold typed data are generic, such as `Table<Row>`. Public types don't use `any`.
- Every item in a data array has a stable `id`, or the component accepts a `getItemId` function.
- Icons are passed as `ReactNode`, so consumers can use any icon set.

**State:**

- Stateful props follow React's pattern: `value`, `defaultValue` and `onChange`. Named state uses the same shape: `open`, `defaultOpen`, `onOpenChange`.
- Every stateful component works both controlled and uncontrolled.
- Events report what happened, and the consumer decides what to do. For example, a server-paginated Table reports `onPageChange` and doesn't fetch anything.

## 3. Styling and theming

Styling can be overridden at three levels. Narrower levels win.

| Level | Mechanism | Use it for |
| --- | --- | --- |
| Library | Default theme, built with MUI `createTheme` | The default look |
| Project | `createCmTheme(overrides)` with `CmThemeProvider` | A project's brand |
| Instance | `sx`, `className`, `slotProps` | One-off changes |

```tsx
import { CmThemeProvider, createCmTheme, Button } from '@cmotino/cm-web-components'

const theme = createCmTheme({
  palette: { primary: { main: '#0b6e4f' } },
  shape: { borderRadius: 4 },
})

export function App() {
  return (
    <CmThemeProvider theme={theme}>
      <Button sx={{ mt: 2 }}>Save</Button>
    </CmThemeProvider>
  )
}
```

**`createCmTheme`** must deep-merge overrides into the default options before calling `createTheme`:

```ts
createTheme(deepmerge(defaultThemeOptions, overrides))
```

Don't use `createTheme(defaultThemeOptions, overrides)`. With color schemes defined, that form silently ignores a `palette` override. This was confirmed against MUI 9.5.0 (see [Verified behavior](#verified-behavior)). The acceptance tests must cover this case.

**Color schemes:** the default theme enables `cssVariables: true` and defines `light` and `dark` color schemes. A top-level `palette` override applies to the default scheme only (light). To change dark mode, consumers override `colorSchemes.dark`. The documentation must state this clearly.

By default the colors follow the operating system, because MUI uses the `media` color scheme selector when both schemes exist. `defaultMode` and `setMode` don't change the colors under that selector. A project with a manual toggle sets a selector: `createCmTheme({ cssVariables: { colorSchemeSelector: 'class' } })`.

**`CmThemeProvider`:**

- Wraps MUI's `ThemeProvider`. `theme` is optional and defaults to the library theme.
- Is required for the default look, but components still work without it. Under another MUI theme they render with that theme.
- Doesn't add global styles by default. A `baseline` prop (default `false`) opts in to `CssBaseline`.

**Where styles live:**

- Simple components get their default look from `components.Mui<Name>` in the default theme, so consumers override them the normal MUI way.
- Composites use Emotion through MUI's `styled`, with a `name` of `Cm<Component>` and a `slot`, plus `useThemeProps`. This gives each one a `components.Cm<Component>` theme key, declared through TypeScript module augmentation.
- Custom style code reads tokens with `(theme.vars || theme)`, as MUI does, because a component may render under a theme without CSS variables.
- Colors, spacing and radii come from the theme and aren't hard-coded.

The library ships no global CSS. The tokens in `src/index.css` belong to the template app and aren't part of the library.

## 4. Dependencies

| Package | Type | Notes |
| --- | --- | --- |
| `react`, `react-dom` | Peer, `^19.0.0` | |
| `@mui/material` | Peer, `^9.0.0` | |
| `@emotion/react`, `@emotion/styled` | Peer, `^11` | MUI's own peers |
| `@mui/utils` | Dependency, `^9.0.0` | For `deepmerge`, which `@mui/material/utils` doesn't export |

**Removed:** `styled-components` and `@mui/styled-engine-sc`. Neither is used in `src`, and the adapter would require a bundler alias in every consuming project.

**Moved to dev dependencies:** `@fontsource/roboto`, for Storybook only. Consumers choose and load their own fonts.

**Moved to dev dependencies:** `@mui/icons-material`, for stories only. It isn't a dependency or peer of the library, because it takes 172 MB on disk and icons are passed as `ReactNode`. Icons the library needs internally, such as a chevron, are made with `createSvgIcon` from `@mui/material/utils`.

## 5. Build and packaging

- **Build:** Vite library mode, ES modules only, with `preserveModules` so bundlers can tree-shake per component.
- **External:** all peer dependencies and their subpaths, including `react/jsx-runtime`, `react/compiler-runtime`, `@mui/*` and `@emotion/*`.
- **Types:** a new `tsconfig.build.json` covers library source and excludes tests and stories. It emits declarations only, because `tsconfig.app.json` sets `noEmit`.
- **Import paths:** the `.ts` and `.tsx` extensions stay in emitted declarations. Consumers resolve them correctly (see [Verified behavior](#verified-behavior)), so nothing needs rewriting.
- **React Compiler:** published output is compiled. This project doesn't write `useMemo`, `useCallback` or `memo` by hand, so uncompiled output would have no memoization, and consumers' compilers don't usually process `node_modules`. Compiled code imports `react/compiler-runtime`, which React 19 provides, and that fits the supported range.
- **Server Components:** components that use hooks or browser APIs ship with a `"use client"` directive, so they work in frameworks such as Next.js. Rolldown keeps the directive when `preserveModules` is on, so no plugin is needed. `tests/dist.test.ts` confirms it survives.

`package.json` for publishing:

```jsonc
{
  "name": "@cmotino/cm-web-components",
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./package.json": "./package.json"
  },
  "publishConfig": { "access": "public" }
}
```

`publishConfig.access` is required, because scoped packages are private on npm by default.

## 6. Folder structure

```
docs/specs/                  specifications
src/
  components/
    Button/
      Button.tsx             component
      Button.types.ts        public prop types
      Button.test.tsx        tests
      Button.stories.tsx     Storybook stories
      index.ts               exports for this component
  theme/
    defaultTheme.ts          default theme options
    createCmTheme.ts
    CmThemeProvider.tsx
    index.ts
  index.ts                   public entry point
```

- **Public API:** only what `src/index.ts` exports is public. Nothing else may be imported by consumers.
- **Helpers:** a `.tsx` file exports only components, as `eslint-plugin-react-refresh` requires. Other code goes in a separate `.ts` file, such as `Table.utils.ts`.
- **Imports:** local imports keep their file extension, and components import each other through that component's `index.ts`.
- **Template files:** `src/App.tsx`, `src/App.css`, `src/main.tsx`, `src/index.css`, `src/assets/`, `public/` and `index.html` are removed during scaffolding, once Storybook replaces them.

## 7. Quality

- **Unit tests:** Vitest with Testing Library, querying by accessible role where possible. Each acceptance criterion maps to at least one test.
- **Build tests:** `npm run test:dist` runs `tests/dist.test.ts` against `dist`, after a build.
- **Storybook:** the development environment and public documentation. Each component has a story for every variant and state, and one showing a theme override.
- **Accessibility:** every interactive component works with a keyboard, has an accessible name and shows visible focus. `@storybook/addon-a11y` runs automated checks. The target is WCAG 2.2 AA.
- **Definition of done:** lint, type-check, tests, build and build tests pass; stories exist; every acceptance criterion is met; the spec is `Implemented`.

## 8. Release process

- **Versioning:** semantic versioning. Stay on `0.x` until the core components settle, then release `1.0.0`. On `0.x`, breaking changes bump the minor version.
- **Changelog:** every user-facing pull request adds a Changesets entry.
- **CI:** GitHub Actions runs lint, type-check, test, build and build tests on each pull request. Publishing happens from CI when a release is merged, and needs an `NPM_TOKEN` repository secret.

## 9. Compatibility

- **React:** 19 only. **MUI:** 9 only. These match the versions the repo uses now. Widening the range later is not a breaking change, so it's safer to start narrow.
- **Module format:** ES modules only, without CommonJS output.
- **TypeScript:** consumers need `moduleResolution` set to `bundler`, `node16` or `nodenext`, because the package relies on its `exports` map.
- **Node:** developing this repo needs the version in `.nvmrc`, currently 24, because Vitest, jsdom, jest-dom and Changesets no longer support Node 20. Consumers' Node version isn't affected, since these are dev dependencies.

## Verified behavior

Tested on 2026-11-06 with MUI 9.5.0 and TypeScript 6.0. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| `createTheme(defaults, { palette })`, with `colorSchemes` and `cssVariables` set | The override is silently ignored |
| `createTheme(deepmerge(defaults, { palette }))` | The override applies to light; dark keeps its default |
| Same deep merge with `shape` and `components` overrides | Overrides apply, and sibling default values are kept |
| Declarations with `.ts` and `.tsx` import paths, consumed under `bundler`, `node16` and `nodenext` with `skipLibCheck: false` | Types resolve correctly under all three, from a packed tarball |
| Build with Vite 8 (Rolldown) and `preserveModules` | `"use client"` stays the first statement of the module |
| Importing only `createCmTheme` from the built package, bundled with esbuild | `CmThemeProvider` and MUI's `ThemeProvider` are tree-shaken out |
| `renderToString` of `CmThemeProvider` from the built package | Renders on the server, including the override |

Tool versions confirmed compatible with Vite 8 and TypeScript 6: Storybook 10.6, Vitest 5.1, jsdom 31, Changesets 3.0 with `changesets/action` v2.

## Open questions

None.
