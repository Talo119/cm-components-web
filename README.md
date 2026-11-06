# cm-web-components

A React component library built on Material UI. It isn't published to npm yet, and the package name will change before the first release.

## Requirements

- React 19 and MUI 9, with Emotion
- ES modules only
- TypeScript consumers need `moduleResolution` set to `bundler`, `node16` or `nodenext`

## Theming

`CmThemeProvider` applies the default look. Use `createCmTheme` to override it for your project:

```tsx
import Button from '@mui/material/Button'
import { CmThemeProvider, createCmTheme } from 'cm-web-components'

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

**A top-level `palette` override only changes light mode.** To change dark mode, override `colorSchemes.dark`:

```ts
createCmTheme({
  palette: { primary: { main: '#0b6e4f' } },
  colorSchemes: { dark: { palette: { primary: { main: '#7fd8b6' } } } },
})
```

**Colors follow the operating system by default.** For a manual light and dark toggle, set a color scheme selector:

```ts
createCmTheme({ cssVariables: { colorSchemeSelector: 'class' } })
```

`CmThemeProvider` adds no global styles. Pass `baseline` to include MUI's `CssBaseline`. Fonts are up to your project.

## Development

Use the Node version in `.nvmrc`, then:

```sh
npm install
npm run dev
```

`npm run dev` starts Storybook. Before opening a pull request, run:

```sh
npm run lint && npm run typecheck && npm test && npm run build && npm run test:dist
```

Pull requests with user-facing changes need a changelog entry from `npm run changeset`.

Design decisions are in [`docs/specs`](./docs/specs/README.md). Start with the [architecture spec](./docs/specs/0000-architecture.md) and the [roadmap](./docs/specs/roadmap.md).
