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

## Link

`Link` is MUI's `Link` with the library's type scale and a link color that passes WCAG 2.2 AA contrast. It underlines by default and takes the font of the text around it:

```tsx
import { Link, Typography } from '@cmotino/cm-web-components'
import { Link as RouterLink } from 'react-router'

<Typography>
  Read the <Link href="/terms">terms of service</Link> before you continue.
</Typography>

<Link component={RouterLink} to="/settings">Settings</Link>
```

**`color="primary"` uses `primary.dark` in light mode and `primary.main` in dark mode,** because `primary.main` doesn't reach 4.5:1 on the light backgrounds. A project that changes `palette.primary` changes the link color too, so its `primary.dark` must still reach 4.5:1 in light mode, and its `primary.main` in dark mode. Other `color` values keep MUI's look, with the contrast listed under Typography.

**Set a router once for the whole project** in the theme, then write `href` as usual. `MuiLink` covers Link, and `MuiButtonBase` covers Button with `href` and other components built on `ButtonBase`:

```tsx
import { createCmTheme } from '@cmotino/cm-web-components'
import { Link as RouterLink } from 'react-router'
import type { ComponentProps, Ref } from 'react'

// Maps `href` to the router's `to`.
function LinkBehavior({ href, ref, ...props }: ComponentProps<'a'> & { ref?: Ref<HTMLAnchorElement> }) {
  return <RouterLink ref={ref} to={href ?? ''} {...props} />
}

const theme = createCmTheme({
  components: {
    MuiLink: { defaultProps: { component: LinkBehavior } },
    MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } },
  },
})
```

The component must accept `ref` and spread its props onto the `<a>`. It receives every `href`, including `https://` and `mailto:` addresses, so render a plain `<a>` for those if your router doesn't. Router-only props, such as `replace` or `state`, still need `component={RouterLink}` on the instance. Create the theme in a client component, because `LinkBehavior` is a function.

**Use an object for `styleOverrides.root`, without `variants`.** An object merges with the library's link color. Two cases replace it:

- A `root.variants` array of your own replaces the library's, because arrays don't merge. Copy the library's rule into your array to keep the link color:

  ```ts
  {
    props: { color: 'primary' },
    style: ({ theme }) => ({
      color: (theme.vars || theme).palette.primary.dark,
      ...theme.applyStyles('dark', { color: (theme.vars || theme).palette.primary.main }),
    }),
  }
  ```

- A function in `root` replaces the whole object, as with Button.

**Keep the underline on links inside text.** The link color reaches only 2.85:1 against `text.primary` in light mode, so without the underline it can't be told apart by color alone (WCAG 1.4.1). Use `underline="hover"` or `"none"` only where the link is clearly a link, such as a list of links.

**`component="button"` renders a `<button>` with no `type`,** so inside a form it submits the form. Pass `type="button"`, or use Button with `variant="text"`, which fits most actions better. Links can't be disabled: remove `href`, or render plain text, when a link isn't available. `target="_blank"` isn't announced, so say so in the text where it matters. Long URLs as link text don't break, so add `sx={{ overflowWrap: 'anywhere' }}` in narrow containers.

## TextField

`TextField` is MUI's `TextField`. It puts the label, input, helper text and error state together, and links them for screen readers. Every MUI prop works:

```tsx
import { TextField } from '@cmotino/cm-web-components'

<TextField label="Email" type="email" required />

<TextField
  label="Name"
  value={name}
  onChange={(event) => setName(event.target.value)}
  error={!name}
  helperText={!name ? 'Enter your name' : ' '}
/>
```

**The outlined border is `grey[500]`, not MUI's translucent color,** because MUI's border is below the 3:1 that WCAG 2.2 AA asks for the edge of a control. This applies to every outlined input under the library theme, including MUI's own `Select` and `Autocomplete`. Hover, focus, error and disabled borders keep MUI's colors. The `filled` and `standard` variants keep MUI's underline.

**A project's own `notchedOutline` or `root` in `MuiOutlinedInput.styleOverrides` replaces the library's border rule,** because style functions don't merge. If you replace `root`, set the hover border inside `@media (hover: none)` too, or touch screens show MUI's translucent border on tap:

```ts
import { outlinedInputClasses } from '@mui/material/OutlinedInput'

createCmTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: '#5b6b7f' },
        root: {
          '@media (hover: none)': {
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: { borderColor: '#5b6b7f' },
          },
        },
      },
    },
  },
})
```

Pass `helperText=" "` to keep the helper text's space reserved, so content below doesn't move when an error appears. Placeholders don't reach 4.5:1, so put needed information in `label` or `helperText`. Without a `label`, name the input with `slotProps={{ htmlInput: { 'aria-label': 'Search' } }}`. Without `fullWidth`, the field takes the browser's default width. For whole numbers, `type="text"` with `slotProps={{ htmlInput: { inputMode: 'numeric' } }}` avoids the quirks of `type="number"`.

## Checkbox

`Checkbox` is MUI's `Checkbox` with its label, helper text and error state built in, so you don't put `FormControl`, `FormControlLabel` and `FormHelperText` together yourself:

```tsx
import { Checkbox } from '@cmotino/cm-web-components'

<Checkbox label="Remember me" defaultChecked />

<Checkbox
  label="I accept the terms"
  checked={accepted}
  onChange={(_, checked) => setAccepted(checked)}
  required
  error={submitted && !accepted}
  helperText={submitted && !accepted ? 'You must accept the terms' : undefined}
/>

<Checkbox aria-label="Select row" checked={selected} onChange={toggleRow} />
```

**The root is a `FormControl` `<div>`, not MUI's checkbox.** `ref`, `sx`, `className`, `style` and `data-*` props reach the root. `inputRef` reaches the `<input>`, and `aria-label`, `aria-labelledby` and `aria-describedby` reach it too, so a checkbox without a `label` still gets a name. A consumer's `aria-describedby` is joined with the helper text's id.

`checked`, `defaultChecked`, `onChange`, `indeterminate`, `name`, `value`, `id`, `color`, `size`, the icons, `autoFocus`, `disableRipple`, `onFocus` and `onBlur` work as on MUI's `Checkbox`. Other MUI props, such as `edge` and `readOnly`, go through `slotProps.control`. The other slots are `htmlInput`, `formControlLabel` and `formHelperText`. Style it with the MUI theme keys of its parts: `MuiCheckbox`, `MuiFormControlLabel`, `MuiFormControl` and `MuiFormHelperText`.

**Keep `label` set, or unset, for the life of the checkbox.** Turning `error` and `helperText` on and off keeps the `<input>`, its state and its focus, but adding or removing `label` remounts it, so an uncontrolled checkbox loses its state.

For several related checkboxes with a shared label, group them in a MUI `FormControl` with a `FormLabel` and a `FormGroup`. For a setting that applies as soon as it changes, use Switch.

## Select

`Select` lets the user pick one value from a short list, with the label, helper text and error state of a TextField. It takes an `options` array instead of `MenuItem` children, keeps the type of the values, and uses `null` for "nothing selected":

```tsx
import { Select } from '@cmotino/cm-web-components'
import type { SelectOption } from '@cmotino/cm-web-components'

const countries: SelectOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States', disabled: true },
]

<Select label="Country" options={countries} defaultValue="es" name="country" />

<Select<number>
  label="Rows per page"
  options={[10, 25, 50].map((n) => ({ value: n, label: String(n) }))}
  value={pageSize}
  onChange={(_, value) => setPageSize(value)}
/>
```

**`onChange` receives `(event, value)`,** where `value` is the option's value with its type, so number values arrive as numbers. The value type is inferred from `options`, or set with `<Select<number>>`. An option with `value: ''` lets the user clear the selection.

TextField's props work as on TextField, except those for typing text: `select`, `children`, `type`, `multiline`, the row props and `placeholder`. `ref`, `sx` and `className` reach the root `FormControl`. `aria-label` names the combobox when there's no `label`. `name` reaches a hidden `<input>`, so forms submit the value as text. TextField's `slotProps` work as in MUI, and `slotProps.option` reaches every `MenuItem`. Popup props, such as `MenuProps`, go through `slotProps.select`. Choosing several values and MUI's native `<select>` aren't supported.

**Reset the value to `null` when `options` no longer include it.** MUI logs a warning for a value that isn't in the options, and the field shows nothing. The list isn't virtualized, so for long or searchable lists use Autocomplete, which is on the roadmap.

## Radio group

`RadioGroup` lets the user pick one value from a few options that stay visible. It takes an `options` array and the same `label`, `helperText`, `error`, `required` and `disabled` as Checkbox, and links the group label and helper text for screen readers:

```tsx
import { RadioGroup } from '@cmotino/cm-web-components'

<RadioGroup
  label="Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team', disabled: !canUseTeams },
  ]}
  value={plan}
  onChange={(_, value) => setPlan(value)}
/>

<RadioGroup label="Delivery" name="delivery" options={deliveryOptions} defaultValue="standard" row required />
```

**Values are strings, and their type is inferred from `options`.** With inline options, `onChange` reports `'free' | 'pro' | 'team'`, and a `value` outside them is a type error. Convert numeric ids with `String(id)`. `null` means nothing is selected, in `value` and `defaultValue`. Once something is selected, a user can't clear the group, so add an option such as "None" if clearing is needed.

**The root is a `FormControl` `<div>`.** `ref`, `sx`, `className`, `style` and `data-*` props reach it. `aria-label`, `aria-labelledby` and `aria-describedby` reach the element with `role="radiogroup"`, so a group without a `label` still gets a name. `error` and `required` set `aria-invalid` and `aria-required` on the group, and `required` also sets `required` on every radio input, so the browser's validation stops on a group with nothing selected. `name` is generated when not passed. Pass it when a submitted form needs a specific key.

`row` lays the options out side by side, wrapping when there isn't room. `color` and `size` reach every `Radio`. The slots are `formLabel`, `radioGroup`, `formControlLabel`, `control` for every `Radio`, and `formHelperText`. Style it with the MUI theme keys of its parts: `MuiFormControl`, `MuiFormLabel`, `MuiRadioGroup`, `MuiFormGroup`, `MuiFormControlLabel`, `MuiRadio` and `MuiFormHelperText`. For more than about seven options, use Select.

## Switch

`Switch` is MUI's `Switch` with its label, helper text and error state built in, for a setting that applies as soon as it changes. It takes the same props as Checkbox, except `indeterminate` and the icons:

```tsx
import { Switch } from '@cmotino/cm-web-components'

<Switch label="Email notifications" defaultChecked />

<Switch
  label="Public profile"
  checked={isPublic}
  onChange={(_, checked) => savePublic(checked)}
  disabled={isSaving}
  error={saveFailed}
  helperText={saveFailed ? 'Could not save. Try again.' : undefined}
/>
```

**Use Checkbox for a choice that only applies when a form is submitted,** such as accepting terms. Name a switch after the setting, such as "Dark mode", not its state, because screen readers announce the state. Switch doesn't wait for a save: disable it while saving, and on failure set `checked` back and show `error` and `helperText`.

The root, `ref`, `inputRef`, the naming props and the `label` rule work as on Checkbox. Other MUI props, such as `edge`, go through `slotProps.control`, and MUI's own `track`, `thumb` and `switchBase` slots through `slotProps.control.slotProps`. Style it with `MuiSwitch`, `MuiFormControlLabel`, `MuiFormControl` and `MuiFormHelperText`.

**The off track is `grey[500]` and opaque, not MUI's translucent color,** because MUI's track is below the 3:1 that WCAG 2.2 AA asks for the parts of a control, against the background and the thumb. This applies to every MUI `Switch` under the library theme, including MUI's own. The on and disabled tracks keep MUI's colors. **A project's own `track` in `MuiSwitch.styleOverrides` replaces the library's rule,** because style functions don't merge, so keep the off track at 3:1 or more if you replace it:

```ts
createCmTheme({
  components: {
    MuiSwitch: { styleOverrides: { track: { backgroundColor: '#5b6b7f', opacity: 1 } } },
  },
})
```

**`error` colors aren't readable in dark mode.** `error.main` is 2.15:1 on the dark background, so error helper text and labels on TextField, Checkbox, Select, Radio group and Switch fail 4.5:1 there. This is an open question in [spec 0005](./docs/specs/0005-inputs.md#open-questions).

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
