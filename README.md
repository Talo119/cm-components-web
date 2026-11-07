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

**Use an object for `styleOverrides.root`.** An object merges with the library defaults. A function replaces them, so the label follows `typography.button` instead, and goes back to uppercase if a project makes that uppercase, unless the function sets `textTransform` itself:

```ts
createCmTheme({
  components: {
    MuiButton: { styleOverrides: { root: { fontWeight: 700 } } },
  },
})
```

**`ButtonProps` describes the `<button>` form only.** A wrapper of your own around the link form needs to declare link props such as `target` itself.

The look comes from the theme, so without `CmThemeProvider` a `Button` renders with the surrounding MUI theme, and MUI's own `Button` used under the library theme gets the library look.

## Button group

`ButtonGroup` is MUI's `ButtonGroup` with the library's default look. It joins related buttons and passes them a shared `variant`, `color`, `size` and `disabled`. A prop set on a single `Button` wins over the group's value:

```tsx
import { Button, ButtonGroup } from '@cmotino/cm-web-components'

<ButtonGroup variant="contained" aria-label="Pagination">
  <Button onClick={goBack}>Previous</Button>
  <Button onClick={goForward}>Next</Button>
</ButtonGroup>
```

**Give every group an `aria-label` or `aria-labelledby`**, so screen readers announce what the buttons have in common. MUI's default variant for a group is `outlined`, while `Button`'s is `text`.

**Pass buttons as direct children or as an array, not inside a fragment.** A fragment counts as one child, which breaks the joined borders. `false` and `null` children are skipped, so `{canDelete && <Button>Delete</Button>}` works.

**Inside a group, the group's values replace `MuiButton.defaultProps`** for the props it shares: `color`, `disabled`, `disableElevation`, `disableFocusRipple`, `disableRipple`, `fullWidth`, `size` and `variant`. Set those defaults on `MuiButtonGroup` too. The library does this for `disableElevation`, and a project restores the shadow on groups with:

```ts
createCmTheme({
  components: {
    MuiButtonGroup: { defaultProps: { disableElevation: false } },
  },
})
```

Style every button in a group with `styleOverrides.grouped`, or by position with `firstButton`, `middleButton` and `lastButton`. The group doesn't wrap on narrow screens, so use `orientation="vertical"` or fewer buttons there.

## Typography

`Typography` is MUI's `Typography` with the library's type scale, in `Inter, sans-serif`. Choose the heading level from the page outline and the look from the design:

```tsx
import { Typography } from '@cmotino/cm-web-components'

<Typography variant="h4" component="h2" gutterBottom>Recent orders</Typography>
<Typography>Body text, rendered as a paragraph.</Typography>
<Typography variant="body2" color="textSecondary">Updated 5 minutes ago</Typography>
```

**Use `color="textSecondary"`, not `color="text.secondary"`.** The dotted form, common in older MUI examples, compiles but has no effect in MUI 9, which removed system props. `sx={{ color: 'text.secondary' }}` also works.

**Subtitles render `<p>`, not MUI's `<h6>`,** so they don't show up as headings for screen reader users. For a heading that looks like a subtitle, set the level: `<Typography variant="subtitle1" component="h3">`. A project restores MUI's mapping with:

```ts
createCmTheme({
  components: {
    MuiTypography: { defaultProps: { variantMapping: { subtitle1: 'h6', subtitle2: 'h6' } } },
  },
})
```

A `variantMapping` prop on one instance replaces the theme's mapping rather than merging with it, so use `component` to change one element. The `button` variant isn't uppercase, matching `Button`.

**Typography sets no color by default,** so it takes its container's color. Use `<CmThemeProvider baseline>` or set a color on a container, or text on the dark scheme stays the browser's default black.

Not every `color` is readable as text. Contrast ratios against `background.default` and `background.paper`, where WCAG 2.2 AA asks for 4.5:1 for normal text and 3:1 for large text:

| `color` | Light | Dark | Use for |
| --- | --- | --- | --- |
| Inherited, `textPrimary` | 18.0 or more | 19.1 or more | Any text |
| `textSecondary` | 7.15 or more | 7.25 or more | Any text |
| `secondary` | 5.82 or more | 7.98 or more | Any text |
| `error` | 5.82 or more | 2.04 or more | Any text in light mode only |
| `primary` | 3.84 or more | 4.60 or more | Large text only, such as `h1` to `h4` |
| `warning` | 2.58 or more | 5.33 or more | Not for text in light mode |
| `success`, `info` | 2.24 or more | 2.80 or more | Not for text |

`body1`, `body2`, the subtitles and `inherit` render `<p>`, so give a Typography inside another one `component="span"`. `noWrap` needs a block with a width, so `caption`, `overline` and `button`, which render `<span>`, also need `sx={{ display: 'block' }}`. Sizes don't change across breakpoints.

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
