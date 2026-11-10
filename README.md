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

**Reset the value to `null` when `options` no longer include it.** MUI logs a warning for a value that isn't in the options, and the field shows nothing. The list isn't virtualized, so for long or searchable lists use Autocomplete.

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

## Slider

`Slider` is MUI's `Slider` with its label, helper text and error state built in, for a value where the position in a range matters more than the exact number, such as volume or a price range. It takes `label`, `helperText`, `error` and `disabled` as Checkbox does, but not `required`, because a slider always has a value:

```tsx
import { Slider } from '@cmotino/cm-web-components'

<Slider label="Volume" defaultValue={30} />

<Slider
  label="Price"
  value={price}
  onChange={(_, value) => setPrice(value)}
  onChangeCommitted={(_, value) => search({ price: value })}
  min={0}
  max={500}
  step={10}
  getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
  getAriaValueText={(value) => `${value} dollars`}
/>
```

**`onChange` gets the same kind of value you pass:** a number for a number, an array for an array. It fires on every step while dragging, so send requests from `onChangeCommitted`, which fires once when the user lets go or presses a key.

**Name both thumbs of a range with `getAriaLabel`.** The root then becomes a group named by the `label`, so screen readers announce "Price" and then "Minimum price". A single thumb is named by `label`, or by `aria-label` or `aria-labelledby` without one. Pass `getAriaValueText` or `aria-valuetext` when the number alone isn't clear.

**The root is a `FormControl` `<div>` that fills its container.** `ref`, `sx`, `className`, `style` and `data-*` props reach it. `aria-label`, `aria-labelledby` and `aria-describedby` reach every thumb's `<input>`, and `error` sets `aria-invalid` on them. `name` submits one value per thumb. A vertical slider needs a height on the root. Other MUI props, such as `tabIndex`, go through `slotProps.control`, and MUI's `thumb`, `rail`, `track`, `mark` and `valueLabel` slots through `slotProps.control.slotProps`. The slots are `formLabel`, `control`, `htmlInput` for every thumb's `<input>`, and `formHelperText`. Style it with `MuiSlider`, `MuiFormControl`, `MuiFormLabel` and `MuiFormHelperText`.

**The rail is `grey[500]` and opaque, not MUI's translucent color,** because MUI's rail is below the 3:1 that WCAG 2.2 AA asks for the parts of a control. This applies to every MUI `Slider` under the library theme, including MUI's own. Disabled and inverted rails keep MUI's styles. **A project's own `rail` in `MuiSlider.styleOverrides` replaces the library's rule,** because style functions don't merge, so keep the rail at 3:1 or more if you replace it:

```ts
createCmTheme({
  components: {
    MuiSlider: { styleOverrides: { rail: { backgroundColor: '#5b6b7f', opacity: 1 } } },
  },
})
```

## Rating

`Rating` is MUI's star rating with `label`, `helperText`, `error`, `required` and `disabled` built in, for collecting or showing a score on a small fixed scale. Its group is named by the `label`:

```tsx
import { Rating } from '@cmotino/cm-web-components'

<Rating label="How was your order?" defaultValue={null} name="order-rating" />

<Rating
  label="Quality"
  value={quality}
  onChange={(_, value) => setQuality(value)}
  required
  error={submitted && quality == null}
  helperText={submitted && quality == null ? 'Choose a rating' : ' '}
/>

<Rating label="Average rating" value={4.5} precision={0.5} readOnly size="small" />
```

**`onChange` can report `null`.** Picking the current value again clears it, as in MUI. Ignore `null` in `onChange` if a rating can't be cleared. `onChangeActive` reports the hovered value, and `-1` when the pointer leaves.

**`required` doesn't stop a native form submit.** It shows the asterisk and sets `aria-required` on the group, but MUI checks a hidden "Empty" radio when there's no value, so the browser always sees an answer. Check the value yourself before submitting, as in the second example. An empty rating submits an empty string under `name`.

**A read-only rating is an image, not a group.** It has no inputs, and it's named by the `label` and the value, so screen readers announce "Average rating, 4.5 Stars". Without a `label`, it's named by `getLabelText` only, so write one that gives the context, or pass `aria-label`. The names are in English, so projects in other languages pass `getLabelText` and `emptyLabelText`.

**The root is a `FormControl` `<div>`.** `ref`, `sx`, `className`, `style` and `data-*` props reach it. `aria-label`, `aria-labelledby` and `aria-describedby` reach the element with `role="radiogroup"`, or `role="img"` when `readOnly`. Other MUI props, such as `component`, go through `slotProps.control`, and MUI's `label`, `icon` and `decimal` slots through `slotProps.control.slotProps`. The slots are `formLabel`, `control` and `formHelperText`. Style it with `MuiRating`, `MuiFormControl`, `MuiFormLabel` and `MuiFormHelperText`.

**Filled stars are `warning.main` and empty stars `grey[500]`,** instead of MUI's hard-coded `#faaf00` and its `action.disabled` outline, which can't be seen against the background. A project that changes `palette.warning` changes the stars too. This applies to every MUI `Rating` under the library theme, including MUI's own. In light mode, `warning.main` is 2.71:1 on the background, below 3:1. Empty stars are outlined and filled ones solid, so the score doesn't rely on color alone. **A project's own `root` or `iconEmpty` in `MuiRating.styleOverrides` replaces the library's color,** because style functions don't merge:

```ts
createCmTheme({
  components: {
    MuiRating: { styleOverrides: { root: ({ theme }) => ({ color: (theme.vars || theme).palette.primary.main }) } },
  },
})
```

**`error` colors aren't readable in dark mode.** `error.main` is 2.15:1 on the dark background, so error helper text and labels on TextField, Checkbox, Select, Radio group, Switch, Slider and Rating fail 4.5:1 there. This is an open question in [spec 0005](./docs/specs/0005-inputs.md#open-questions).

## Avatar

`Avatar` is MUI's `Avatar`, for the photo, initials or icon of a person or thing. Every MUI prop works. When the image fails to load, it shows the children, then the first letter of `alt`, then a person icon:

```tsx
import { Avatar } from '@cmotino/cm-web-components'
import FolderIcon from '@mui/icons-material/Folder'

<Avatar src={user.photoUrl} alt={user.name} />

<Avatar role="img" aria-label="Jane Doe">JD</Avatar>

<Avatar variant="rounded"><FolderIcon /></Avatar>

<Avatar src={user.photoUrl} alt={user.name} sx={{ width: 24, height: 24, fontSize: '0.75rem' }} />
```

**Name it for screen readers.** Pass the person's name in `alt`, or `alt=""` when the name is shown next to the avatar. Screen readers read initials as letters, such as "J D", so an avatar that stands alone gets `role="img"` and `aria-label` with the full name, and one next to the name gets `aria-hidden`. A clickable avatar goes inside a Button or a link.

**Sizes are set with `sx`.** The default is 40px. Set `fontSize` too, because initials keep their 20px font otherwise, and pass at most two letters. A color per person goes in `sx={{ bgcolor }}`, and must keep 4.5:1 with the text.

**Initials, icons and the fallback are white on `grey[500]`,** instead of MUI's colors, which are below 4.5:1 on both color schemes. Avatars with a working image aren't affected. This applies to every MUI `Avatar` under the library theme, including MUI's own. **A project's own `colorDefault` in `MuiAvatar.styleOverrides` replaces the library's colors,** because style functions don't merge. A `root` object merges with them.

## Badge

`Badge` is MUI's `Badge`, for a count or dot on the corner of another element. Every MUI prop works, including `max`, `showZero`, `invisible` and `variant="dot"`:

```tsx
import { Avatar, Badge } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'
import MailIcon from '@mui/icons-material/Mail'

<IconButton aria-label={`Messages, ${unread} unread`}>
  <Badge badgeContent={unread}>
    <MailIcon />
  </Badge>
</IconButton>

<Badge variant="dot" color="success" overlap="circular">
  <Avatar src={user.photoUrl} alt={`${user.name}, online`} />
</Badge>
```

**Screen readers never read the badge.** It's `aria-hidden`, so put its information in the child's accessible name, as in both examples. A count that changes while the user is on the page isn't announced.

**The default color is `error`, not MUI's `default`,** which draws the number with no background. `error` is the only theme color whose text meets 4.5:1 on both color schemes: `primary` and `info` are below it in both, and `warning` in dark mode. This applies to every MUI `Badge` under the library theme, including MUI's own. A project changes it with:

```ts
createCmTheme({
  components: {
    MuiBadge: { defaultProps: { color: 'primary' } },
  },
})
```

A count above `max`, 99 by default, shows as "99+". A count of 0 hides the badge unless `showZero` is set. A parent with `overflow: hidden` can clip the badge.

## Chip

`Chip` is MUI's `Chip`, for a tag, a status, a filter or a selected value. Every MUI prop works. The text goes in `label`, and `icon`, `avatar` and `deleteIcon` must be elements:

```tsx
import { Avatar, Chip } from '@cmotino/cm-web-components'
import DoneIcon from '@mui/icons-material/Done'

<Chip label="Paid" color="success" variant="outlined" />

<Chip
  label="Only open"
  icon={onlyOpen ? <DoneIcon /> : undefined}
  variant={onlyOpen ? 'filled' : 'outlined'}
  onClick={() => setOnlyOpen(!onlyOpen)}
  aria-pressed={onlyOpen}
/>

<Chip
  label={user.name}
  avatar={<Avatar src={user.photoUrl} alt="" />}
  onDelete={() => removeRecipient(user.id)}
/>
```

**Clickable and deletable chips are buttons.** `Tab` reaches them, `Enter` and `Space` call `onClick`, and `Backspace` and `Delete` call `onDelete`. Clicking the delete icon only calls `onDelete`. The delete icon isn't announced, so tell keyboard users that `Backspace` removes a chip, such as in helper text. Chip doesn't remove itself or move focus after a delete, so move focus to the next chip or the field yourself. Pass `aria-pressed` on a chip used as a filter toggle.

**The delete icon of a default chip is `text.secondary`, and `text.primary` on hover,** because MUI's translucent icon is below the 3:1 that WCAG 2.2 AA asks for a control. **Initials in its avatar are white,** because MUI's `grey[700]` is below 4.5:1 on the avatar's `grey[500]`. Colored chips keep MUI's colors, and their contrast depends on the palette: filled `primary` and `info` labels are below 4.5:1. These rules apply to every MUI `Chip` under the library theme, including MUI's own and the tags in MUI's `Autocomplete`. **A project's own `deleteIcon` or `avatar` in `MuiChip.styleOverrides` replaces the library's rule,** because style functions don't merge. A `root` object merges with them.

**Disabled chips are out of the tab order.** MUI leaves a disabled chip with only `onDelete` focusable, so `Backspace` would still delete it. The library theme sets `MuiChip.defaultProps.skipFocusWhenDisabled` to `true`, which gives it `tabindex="-1"`. Don't focus disabled chips from code, because `Backspace` still deletes them then. A project that wants MUI's behavior back passes:

```ts
createCmTheme({
  components: {
    MuiChip: { defaultProps: { skipFocusWhenDisabled: false } },
  },
})
```

Long labels are cut off with an ellipsis, so set a `maxWidth` with `sx` and give the full text another way. Several chips need a flex container from you to wrap with gaps.

## Autocomplete

`Autocomplete` lets the user pick one or several values from a list by typing to filter it, with the label, helper text and error state of a TextField. It takes an `options` array shaped like Select's, except that each `label` is a string, and keeps the type of the values:

```tsx
import { Autocomplete } from '@cmotino/cm-web-components'
import type { AutocompleteOption } from '@cmotino/cm-web-components'

const countries: AutocompleteOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
]

<Autocomplete label="Country" options={countries} defaultValue="es" name="country" />

<Autocomplete
  label="Tags"
  multiple
  options={tagOptions}
  value={tags}
  onChange={(_, value) => setTags(value)}
  helperText="Press Backspace to remove the last tag"
/>
```

**`onChange` receives `(event, value, reason)`,** where `value` is the option's value with its type, an array with `multiple`, or `null` when cleared. `reason` is MUI's, such as `'selectOption'`, `'removeOption'` or `'clear'`. MUI's other props work, such as `loading`, `onInputChange`, `filterOptions`, `limitTags` and `renderOption`, except `renderInput`, the option getters, `freeSolo` and `groupBy`. `ref`, `sx` and `className` reach the root `<div>`, and `aria-label`, `aria-labelledby` and `aria-describedby` reach the combobox. `slotProps.textField` reaches the TextField, and MUI's slots, such as `chip` and `listbox`, work as in MUI.

**With `name`, a hidden `<input>` per selected value submits the values,** not the labels, as Select does. `required` with `multiple` passes native validation once a value is selected.

**Keep the selected options in `options` when searching on the server.** A value that isn't in `options` shows as an empty input or a chip with no label. Pass `filterOptions={(options) => options}`, so MUI doesn't filter the results a second time.

## Tooltip

`Tooltip` is MUI's `Tooltip`, with no changes. It opens on hover, keyboard focus and long press, and `Escape` closes it:

```tsx
import { Button, Tooltip } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

<Tooltip title="Delete">
  <IconButton onClick={handleDelete}>
    <DeleteIcon />
  </IconButton>
</Tooltip>

<Tooltip title="Saves without publishing" describeChild>
  <Button>Save draft</Button>
</Tooltip>
```

**Without `describeChild`, a string `title` becomes the child's `aria-label`,** which names an icon-only button. A child with visible text needs `describeChild`, or its name becomes the tooltip's text. Keep `title` a string. A disabled button doesn't get pointer events or focus, so wrap it in a `<span>`, and show a reason that matters somewhere visible. `ref`, `className` and other props reach the child, and the tooltip itself is styled through `slotProps.tooltip`. Don't put links or buttons in a tooltip.

## Progress

`LinearProgress` and `CircularProgress` are MUI's, for loading with no end or a measured amount of a known total:

```tsx
import { CircularProgress, LinearProgress } from '@cmotino/cm-web-components'

<LinearProgress aria-label="Loading orders" />

<LinearProgress variant="determinate" value={uploaded} aria-label="Upload progress" />

<CircularProgress variant="determinate" value={step} min={0} max={5} aria-label="Setup progress" />
```

**Name every indicator** with `aria-label`, or `aria-labelledby` pointing at visible text, because MUI gives a `progressbar` no name. Pass `aria-valuetext` when a percentage isn't meaningful, such as "Step 3 of 5". A region that's loading sets `aria-busy` and points at its indicator with `aria-describedby`. For a loading Button, use Button's `loading` prop.

**LinearProgress's track is `divider`,** because MUI's tint of the bar's color is below the 3:1 that WCAG 2.2 AA asks for against a `primary` bar. `primary` and `secondary` meet 3:1 against it on both color schemes, and the other colors depend on the palette. The `buffer` variant keeps MUI's colors. This applies to every MUI `LinearProgress` under the library theme, including MUI's own. **A project's own `root` in `MuiLinearProgress.styleOverrides` replaces the library's track,** because style functions don't merge. A `bar1` object keeps it.

## Alert

`Alert` and `AlertTitle` are MUI's, for a short message about a task or the page:

```tsx
import { Alert, AlertTitle, Button } from '@cmotino/cm-web-components'

<Alert severity="error" action={<Button color="inherit" size="small" onClick={retry}>Retry</Button>}>
  <AlertTitle>Payment failed</AlertTitle>
  Your card was declined. Try another card or contact your bank.
</Alert>

<Alert severity="success" role="status">Upload complete.</Alert>
```

**Choose the role.** The default `role="alert"` interrupts screen readers, which suits errors. Pass `role="status"` for messages that aren't urgent, such as "Saved", and `role="none"` for permanent notes. Screen readers announce a live region more reliably when it's already on the page, so keep a container with the role mounted and put the Alert inside it. Alert reports `onClose` and doesn't hide itself, and `action` replaces the close button. Name the close button in your language with `closeText`.

**The icon of standard and outlined alerts is drawn in the text color,** because MUI's severity colors are below 3:1 there for most severities. Filled alerts keep MUI's colors. This applies to every MUI `Alert` under the library theme, including MUI's own. A project's `root` object in `MuiAlert.styleOverrides` merges with the rule, and **a `root` function replaces it,** because style functions don't merge.

## Card

`Card` groups the content and actions about one subject. It builds MUI's `Card` from props, so you don't assemble `CardHeader`, `CardMedia`, `CardContent` and `CardActions` yourself:

```tsx
import { Button, Card, Link, Typography } from '@cmotino/cm-web-components'

<Card
  component="article"
  image={{ src: product.photoUrl, alt: '', height: 180 }}
  title={<Link href={`/products/${product.id}`}>{product.name}</Link>}
  subheader={product.price}
  actions={<Button size="small" onClick={() => addToCart(product.id)}>Add to cart</Button>}
  slotProps={{ title: { component: 'h3' } }}
>
  <Typography variant="body2" color="text.secondary">{product.summary}</Typography>
</Card>
```

**The parts are always in this order:** `image`, then the header from `title`, `subheader`, `avatar` and `headerAction`, then `children` inside the padded content, then `actions`. Each part is only rendered when its props are set. MUI's `Card` props, such as `variant="outlined"`, `raised` and `component`, reach the root, and `slotProps` reaches each part. The image's `alt` is required, and is `''` when the image repeats the title. Pass `height` in a grid, so the layout doesn't move as images load.

**The title is a `<span>`,** so pass `slotProps.title={{ component: 'h3' }}`, with the level that fits the page, to put cards in the heading outline. Buttons that repeat on every card, such as "Add to cart", should say which item they're for.

## Tabs

`Tabs` splits related content into panels that share one place on the page. It takes an `items` array, renders a panel for each item's `content`, and links each tab to its panel:

```tsx
import { Tabs } from '@cmotino/cm-web-components'
import type { TabItem } from '@cmotino/cm-web-components'

const items: TabItem[] = [
  { id: 'details', label: 'Details', content: <ProjectDetails /> },
  { id: 'activity', label: 'Activity', content: <ActivityFeed /> },
  { id: 'settings', label: 'Settings', content: <ProjectSettings />, disabled: !canEdit },
]

<Tabs aria-label="Project" items={items} value={tab} onChange={(_, id) => setTab(id)} />

<nav aria-label="Settings">
  <Tabs
    items={[
      { id: '/settings/profile', label: 'Profile', href: '/settings/profile' },
      { id: '/settings/billing', label: 'Billing', href: '/settings/billing' },
    ]}
    value={pathname}
  />
</nav>
```

**`onChange` receives `(event, id)`,** with the item's `id` and its type. Uncontrolled, the first enabled item is selected, and `null` selects none. `aria-label` and `aria-labelledby` name the tab list. Only the selected panel is rendered, so switching tabs unmounts the others and loses their state. Pass `keepMounted` to keep every panel in the DOM, hidden. `variant`, `orientation`, `centered`, `scrollButtons` and `selectionFollowsFocus` work as in MUI. Use `variant="scrollable"` for more than about four tabs or narrow screens. `slotProps.tabs`, `slotProps.tab` and `slotProps.panel` reach MUI's `Tabs`, every `Tab` and every panel.

**An item with `href` is a link tab,** rendered through the router set in `MuiButtonBase.defaultProps.LinkComponent`, as for Link. It has no panel, and the selected one has `aria-current="page"`. Pass the current route as `value`.

**Tabs has its own theme key, `CmTabs`,** for default props, `variants`, and the `root`, `tabs` and `panel` slots, which also get the `CmTabs-root`, `CmTabs-tabs` and `CmTabs-panel` classes:

```ts
createCmTheme({
  components: {
    CmTabs: {
      defaultProps: { variant: 'scrollable' },
      styleOverrides: { panel: ({ theme }) => ({ padding: theme.spacing(3) }) },
    },
  },
})
```

**A selected tab's label is `primary.dark` in light mode and `primary.main` in dark mode,** because `primary.main` is below 4.5:1 on the light backgrounds. This applies to every MUI `Tab` under the library theme, including MUI's own. A project's `root` object in `MuiTab.styleOverrides` merges with the rule, and **a `root` function replaces it,** because style functions don't merge.

## List

`List` shows a vertical list built from an `items` array. Each item has a `primary` line and can have `secondary`, `icon` or `avatar`, `end` content and an `action`:

```tsx
import { List } from '@cmotino/cm-web-components'
import type { ListItemData } from '@cmotino/cm-web-components'

<List
  aria-label="Conversations"
  items={conversations.map((c) => ({ id: c.id, primary: c.subject, secondary: c.preview, end: c.time }))}
  value={selectedId}
  onChange={(_, id) => setSelectedId(id)}
/>

const settings: ListItemData[] = [
  { id: 'profile', primary: 'Profile', href: '/settings/profile' },
  {
    id: 'billing',
    primary: 'Billing',
    children: [{ id: 'invoices', primary: 'Invoices', href: '/settings/billing/invoices' }],
  },
]

<nav aria-label="Settings">
  <List subheader="Settings" items={settings} value={currentId} />
</nav>
```

**How an item renders depends on its data.** With `href`, it's a link through `MuiButtonBase.defaultProps.LinkComponent`, as for Link. With `onClick`, or when the List has `onChange`, `value` or `defaultValue`, it's a button. With `children`, it's a parent that expands and collapses its nested items. Otherwise it's static. `action` sits outside the item's button, so it can hold an icon button. `end` is inside it and must not be interactive.

**A List tracks a selected item only with `value` or `defaultValue`.** The selected item gets a `primary.main` bar on its start edge and `aria-current`: `"page"` for a link, `"true"` for a button. Uncontrolled, the parents of the selected item start expanded. `expanded`, `defaultExpanded` and `onExpandedChange` control that. Without `aria-label`, a `subheader` names the list.

**List has its own theme key, `CmList`,** with the slots `root`, `item`, `itemButton` and `nested`, which also get the `CmList-*` classes.

## Menu

`Menu` opens a list of actions or links from a `trigger` button. It keeps the open state, puts `aria-haspopup`, `aria-expanded` and `aria-controls` on the trigger, and closes after each choice:

```tsx
import { Button, Menu } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'

<Menu
  trigger={<Button>Export</Button>}
  items={[
    { id: 'csv', label: 'CSV' },
    { id: 'pdf', label: 'PDF' },
  ]}
  onItemClick={(_, id) => exportAs(id)}
/>

<Menu
  trigger={<IconButton aria-label="Options for Apollo"><MoreVertIcon /></IconButton>}
  placement="bottom-end"
  items={[
    { id: 'edit', label: 'Edit', icon: <EditIcon />, href: '/projects/1/edit' },
    { id: 'delete', label: 'Delete', disabled: !canDelete, onClick: confirmDelete },
  ]}
/>
```

**The trigger must render a focusable element that accepts `onClick`, `onKeyDown` and `ref`,** such as Button or MUI's `IconButton`. Its own `onClick`, `id` and `ref` keep working, and `preventDefault()` in its `onClick` stops the menu from opening. `ArrowDown` and `ArrowUp` on the trigger open the menu on the first or last item. Choosing an item calls its `onClick`, then `onItemClick(event, id)`. Items with `href` are links through the router set in the theme, and `current` marks one as the current page. `open`, `defaultOpen` and `onOpenChange` control the open state.

**`sx`, `className` and `ref` reach the menu's paper,** because Menu has no element of its own around the trigger. MUI's `Menu` props go in `slotProps.menu`. The theme key is `CmMenu`, with the slots `root`, `paper` and `item`.

## Form

`Form` builds a form from field definitions, using the library's field components. It keeps the values, validates them, shows each error under its field, moves focus to the first invalid field, and calls `onSubmit` with the values:

```tsx
import { Button, Form } from '@cmotino/cm-web-components'
import type { FormField } from '@cmotino/cm-web-components'

interface Profile {
  name: string
  email: string
  role: string | null
  newsletter: boolean
}

const fields: FormField<Profile>[] = [
  { name: 'name', type: 'text', label: 'Name', required: true },
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'role', type: 'select', label: 'Role', options: [{ value: 'admin', label: 'Admin' }] },
  { name: 'newsletter', type: 'switch', label: 'Send me the newsletter', span: 2 },
]

<Form
  aria-label="Profile"
  fields={fields}
  defaultValues={{ name: '', email: '', role: null, newsletter: false }}
  columns={2}
  submitLabel="Save"
  actions={<Button variant="text" onClick={onCancel}>Cancel</Button>}
  errors={serverErrors}
  onSubmit={async (values) => saveProfile(values)}
/>
```

**Each field's `type` picks a component and must fit its value's type,** or it fails to compile: `text`, `email`, `password`, `tel`, `url` and `textarea` for a `string`, `number` and `rating` for a `number | null`, `slider` for a `number`, `select`, `radio` and `autocomplete` for one of their options' values, `autocomplete` with `multiple` for an array, and `checkbox` and `switch` for a `boolean`. `required`, `minLength`, `maxLength`, `min`, `max`, and the format of `email` and `url` are checked first, then `validate(value, values)`. `validateOn` chooses whether errors first show on submit, the default, on blur or on change. `errors` shows errors from outside Form, such as the server's. `messages` replaces the English messages.

**While the promise from `onSubmit` is pending,** the submit button shows a spinner and a second submit is ignored. `submitting` controls that instead. `values` and `onValuesChange` make Form controlled. A `<button type="reset">` in `actions` resets uncontrolled values. `hidden` hides a field without dropping its value.

**Form keeps its state itself, with no form library.** For forms with repeating groups, steps or validation schemas, use the field components directly with React Hook Form's `Controller`, as each one takes `value`, `onChange`, `error` and `helperText`. The theme key is `CmForm`, with the slots `root`, `fields`, `field` and `actions`.

## Table

`Table` shows `rows` in `columns`, with sorting, pagination, row selection and an actions Menu per row:

```tsx
import { Table } from '@cmotino/cm-web-components'
import type { TableColumn } from '@cmotino/cm-web-components'

const columns: TableColumn<Order>[] = [
  { id: 'number', header: 'Order', field: 'number', sortable: true },
  { id: 'total', header: 'Total', field: 'total', sortable: true, align: 'right', render: (row) => formatMoney(row.total) },
]

<Table
  aria-label="Orders"
  columns={columns}
  rows={orders}
  defaultSort={{ columnId: 'number', direction: 'desc' }}
  selectable
  onSelectionChange={setSelectedIds}
  rowActions={(row) => [{ id: 'view', label: 'View', href: `/orders/${row.id}` }]}
  getRowLabel={(row) => `Order ${row.number}`}
/>

<Table
  aria-label="Orders"
  mode="server"
  columns={columns}
  rows={data.items}
  rowCount={data.total}
  loading={isFetching}
  sort={sort}
  onSortChange={setSort}
  page={page}
  onPageChange={(_, next) => setPage(next)}
/>
```

**In `client` mode, the default, Table sorts and paginates every row it's given.** Strings sort numerically, so "Item 2" comes before "Item 10", and empty values come last. In `server` mode, `rows` is the current page and `rowCount` is required: Table only reports `onSortChange`, `onPageChange` and `onPageSizeChange`. Changing the sort or the page size goes back to the first page. Filtering is the consumer's, with fields in `toolbar`, in both modes.

**Rows need an `id`, or `getRowId`.** `getRowLabel` names each row's checkbox and actions button, and defaults to the first column's value. Sort, page, page size and selection each work controlled and uncontrolled. `labels` replaces the English text Table adds. Table is built on MUI's `Table`, not MUI X DataGrid, so it adds no dependency and doesn't virtualize. The theme key is `CmTable`, with the slots `root`, `toolbar`, `container`, `headerCell`, `row`, `cell`, `empty` and `pagination`.

## AppBar

`AppBar` is MUI's `AppBar` with its `Toolbar` already inside, so its children get the bar's height and padding:

```tsx
import { AppBar, Typography } from '@cmotino/cm-web-components'
import IconButton from '@mui/material/IconButton'

<AppBar>
  <IconButton edge="start" aria-label="Open navigation" onClick={openSidebar}>
    <MenuIcon />
  </IconButton>
  <Typography variant="h6" component="p" sx={{ flexGrow: 1 }}>
    Dashboard
  </Typography>
</AppBar>
```

**Under the library theme, every MUI `AppBar` is sticky, on `background.paper`, with a `divider` line and no shadow.** The theme sets `MuiAppBar.defaultProps` to `{ color: 'default', elevation: 0, position: 'sticky' }`, and `palette.AppBar.defaultBg` to each scheme's paper color. A sticky bar needs no spacer, but doesn't stick under an ancestor with `overflow: hidden`. A project that wants MUI's bar sets `MuiAppBar.defaultProps` back, such as `{ color: 'primary', position: 'fixed' }`. **`color="primary"` is below 4.5:1 for normal text** under the library theme, so keep its text large or bold. `slotProps.toolbar` reaches the `Toolbar`, such as `{ variant: 'dense' }`.

## Navbar

`Navbar` is a site's main navigation in an AppBar, built from `items`. Groups open a Menu, the current page is marked, and below `collapseBelow`, `md` by default, the links move into a Menu behind a button:

```tsx
import { Navbar } from '@cmotino/cm-web-components'
import type { NavbarItem } from '@cmotino/cm-web-components'

const items: NavbarItem[] = [
  { id: 'products', label: 'Products', href: '/products' },
  {
    id: 'resources',
    label: 'Resources',
    children: [
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'blog', label: 'Blog', href: '/blog' },
    ],
  },
]

<Navbar
  brand={<img src="/logo.svg" alt="Acme" height={28} />}
  brandHref="/"
  items={items}
  value={currentSectionId}
  actions={<AccountMenu />}
/>
```

**Links use the router set in the theme,** as for Link: the brand through `MuiLink.defaultProps.component`, and the items through `MuiButtonBase.defaultProps.LinkComponent`. The item matching `value` gets `aria-current="page"`, a `primary` label and a line under it, and a group holding it shows as current too. Map the route to `value` yourself. Both layouts are rendered and CSS hides one, so the server's HTML already matches the screen. The `<nav>` is named "Main". Pass `labels` for another name or language. Navbar takes AppBar's props, such as `position` and `color`. The theme key is `CmNavbar`, with the slots `root`, `brand`, `nav`, `item` and `actions`.

## Sidebar

`Sidebar` is an app's main navigation in a column at the side, built on MUI's `Drawer` and List. With `variant="responsive"`, the default, it's permanent from `breakpoint` up, `md` by default, and a temporary drawer below:

```tsx
import { AppBar, Sidebar } from '@cmotino/cm-web-components'
import type { SidebarSection } from '@cmotino/cm-web-components'
import Box from '@mui/material/Box'

const sections: SidebarSection[] = [
  { id: 'main', items: [{ id: 'orders', label: 'Orders', icon: <ReceiptIcon />, href: '/orders', end: 12 }] },
  { id: 'admin', title: 'Admin', items: [{ id: 'settings', label: 'Settings', href: '/settings' }] },
]

<Box sx={{ display: 'flex' }}>
  <Sidebar
    sections={sections}
    value={currentPageId}
    open={open}
    onOpenChange={(_, next) => setOpen(next)}
    header={<Logo />}
  />
  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
    <AppBar>{/* a button with sx={{ display: { md: 'none' } }} that calls setOpen(true) */}</AppBar>
    <Box component="main">{children}</Box>
  </Box>
</Box>
```

**Place it first in a flex row,** where its root takes `width` while it's permanent. The permanent drawer's paper is fixed to the full height of the window, so put the AppBar in the content column. Following a link in the temporary drawer calls `onItemClick`, then `onOpenChange(event, false)`, and the drawer also closes when the screen widens past `breakpoint`. The button that opens it is yours. Items are links or parents with `children`, and `items` makes one section without a title. The theme key is `CmSidebar`, with the slots `root`, `paper`, `header`, `nav` and `footer`.

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
