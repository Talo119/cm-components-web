# cm-web-components

A React component library built on Material UI.

## Requirements

- React 19 and MUI 9, with Emotion
- ES modules only
- TypeScript consumers need `moduleResolution` set to `bundler`, `node16` or `nodenext`

## Theming

`CmThemeProvider` applies the default look. Use `createCmTheme` to override it for your project:

```tsx
import { Button, CmThemeProvider, createCmTheme } from '@cmotino/cm-web-components'

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

`CmThemeProvider` adds no global styles. Pass `baseline` to include MUI's `CssBaseline`. The theme uses `Inter, sans-serif` but doesn't load the font, so load Inter in your project, for example with `@fontsource/inter`.

**The default theme turns on MUI's keyboard focus ring for every MUI component.** Change it with `focusVisible`, or turn it off with `false`:

```ts
createCmTheme({ focusVisible: { outlineColor: '#0b6e4f' } })
createCmTheme({ focusVisible: false })
```

## Button

`Button` is MUI's `Button` with the library's default look: no uppercase text, no elevation and a keyboard focus ring. Every MUI prop works, including `loading`, `startIcon` and `component`:

```tsx
import { Button } from '@cmotino/cm-web-components'
import { Link as RouterLink } from 'react-router'

<Button variant="contained" loading={isSaving} onClick={handleSave}>Save</Button>

<Button component={RouterLink} to="/settings">Settings</Button>
```

**Use an object for `styleOverrides.root`.** An object merges with the library defaults. A function replaces them, so the label goes back to uppercase unless the function sets `textTransform` itself:

```ts
createCmTheme({
  components: {
    MuiButton: { styleOverrides: { root: { fontWeight: 700 } } },
  },
})
```

**`ButtonProps` describes the `<button>` form only.** A wrapper of your own around the link form needs to declare link props such as `target` itself.

The look comes from the theme, so without `CmThemeProvider` a `Button` renders with the surrounding MUI theme, and MUI's own `Button` used under the library theme gets the library look.

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
