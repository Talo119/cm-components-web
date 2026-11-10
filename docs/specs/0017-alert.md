# 0017: Alert

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md), [0001](./0001-button.md), [0003](./0003-typography.md)

## Purpose

Shows a short message about a task or the page, with a severity of success, info, warning or error, an icon, an optional title, and optional actions such as "Retry" or a close button. MUI's `Alert` and `AlertTitle` already cover the behavior, so this library re-exports both and changes one color: under the library theme, MUI's severity icons on standard and outlined alerts are below the contrast WCAG 2.2 AA asks for a meaningful graphic.

**Use it for:** the result of an action, such as "Changes saved" or "Payment failed". Warnings about the page, such as "Your trial ends in 3 days". A summary of form errors above the form.

**Don't use it for:**

- An error on one field. Use the field's `error` and `helperText`, from [0005](./0005-inputs.md).
- A message that appears for a few seconds and goes away. That's a snackbar or toast, which isn't on the [roadmap](./roadmap.md). Alert stays until the consumer removes it.
- A decision the user must make before going on. That's a dialog, which isn't on the roadmap.
- A count or dot on an icon. Use Badge.

## Usage

```tsx
import { Alert, AlertTitle, Button } from '@cmotino/cm-web-components'

<Alert severity="success">Changes saved.</Alert>

<Alert severity="error" action={<Button color="inherit" size="small" onClick={retry}>Retry</Button>}>
  <AlertTitle>Payment failed</AlertTitle>
  Your card was declined. Try another card or contact your bank.
</Alert>

<Alert severity="info" variant="outlined" onClose={() => setShowTip(false)}>
  You can drag rows to reorder them.
</Alert>

// A message that isn't urgent, announced when it appears without interrupting.
<Alert severity="success" role="status">Upload complete.</Alert>
```

## API

`Alert` and `AlertTitle` are MUI's, re-exported from `src/components/Alert/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed, and no defaults change.

```ts
export { default as Alert } from '@mui/material/Alert'
export type { AlertProps } from '@mui/material/Alert'
export { default as AlertTitle } from '@mui/material/AlertTitle'
export type { AlertTitleProps } from '@mui/material/AlertTitle'
```

The props a consumer uses most are `severity`, `variant`, `children`, `action`, `onClose`, `closeText`, `icon`, `iconMapping`, `role`, `color` and `slotProps`. MUI's defaults are kept: `severity="success"`, `variant="standard"`, `role="alert"` and `closeText="Close"`. `color` defaults to the severity.

**Why a re-export and not a wrapper:** the same reasons as Button in [0001](./0001-button.md#api). MUI's `Alert` has `slotProps` for every inner part and no logic for this library to add.

**Why `AlertTitle` is exported:** a title is the usual way to name an alert with more than one sentence, and without it a consumer would need a second import from MUI for a common case.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: icons are passed as `ReactNode` | `icon` is a `ReactNode`, but `false` hides it | MUI's API. `false` is the only way to remove the default icon |
| Section 6: `Alert.tsx` and `Alert.types.ts` | Neither file exists. The folder holds `index.ts`, `Alert.test.tsx` and `Alert.stories.tsx`, covering both components | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's modules carry their own.

## Data shapes

None.

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default (`standard`) | A tinted background with dark text in light mode and light text in dark mode, from MUI's `palette.Alert` colors. The icon is drawn in the text color. See Styling hooks |
| `outlined` | A transparent background with a 1px border in the severity's `light` color. The text and icon are as on `standard` |
| `filled` | A solid background, the severity's `main` in light mode and `dark` in dark mode, with medium-weight text, as in MUI |
| `severity` | `success`, `info`, `warning` or `error`, each with MUI's outlined icon: a check, an "i", a triangle or an exclamation mark |
| With `AlertTitle` | A medium-weight title above the message, in `body1` |
| With `onClose` | A small close button at the end, named by `closeText` |
| With `action` | The action at the end, in place of the close button |
| `icon={false}` | No icon. The message starts at the edge |
| Keyboard focus on the close button or an action | The theme's focus ring, from [0001](./0001-button.md#styling-hooks) |
| Hover, disabled | Don't apply to the alert itself. Its buttons have their own states |

The radius is the theme's 8px, and the message uses `body2`.

## Styling hooks

- **Theme keys:** `components.MuiAlert` and `components.MuiAlertTitle`. New variants, colors and severities use MUI's `AlertPropsVariantOverrides` and `AlertPropsColorOverrides`, augmented on `@mui/material/Alert`.
- **Slots:** `root`, `icon`, `message`, `action`, `closeButton` and `closeIcon`, as in MUI. AlertTitle is a single `Typography` with no slots.
- **Default look:** MUI's alert, with colors from the library's design tokens, and the icon of standard and outlined alerts drawn in the text color. `src/theme/defaultTheme.ts` gains:

```ts
import { alertClasses } from '@mui/material/Alert'

components: {
  // ...earlier components, unchanged
  // MUI draws the severity icon in the severity's `main` color, which is
  // below 3:1 on standard and outlined alerts for most severities. The text
  // color passes on both schemes, so the icon inherits it. Filled alerts
  // already draw the icon in their text color. Kept as an object, so a
  // project's `root` object merges with it.
  MuiAlert: {
    styleOverrides: {
      root: {
        variants: [
          { props: { variant: 'standard' }, style: { [`& .${alertClasses.icon}`]: { color: 'inherit' } } },
          { props: { variant: 'outlined' }, style: { [`& .${alertClasses.icon}`]: { color: 'inherit' } } },
        ],
      },
    },
  },
},
```

**Why the icon:** the icon shows the severity, so WCAG 2.2 AA asks for 3:1 against its background (1.4.11). MUI draws it in `<severity>.main` at 90% opacity. On a standard alert that's 2.14 for `success`, 2.27 for `info` and 2.41 for `warning` in light mode, and 3.07, 2.55, 4.53 and 1.94 for `success`, `info`, `warning` and `error` in dark mode. The text color at 90% opacity gives 4.14 to 8.12 in light mode and 7.17 to 11.64 in dark mode. Outlined alerts give nearly the same values against the page. The icon and the text then have the same color, and the severity still shows through the icon's shape and the background.

**The rule applies to every MUI `Alert`** under the library theme. A project's own `root` object in `MuiAlert.styleOverrides` merges with it. A function replaces it, because `deepmerge` doesn't merge functions. The documentation must state this.

## Accessibility

- **Semantics:** the root is a `<div>` with `role="alert"` by default. That's a live region with `aria-live="assertive"`: screen readers interrupt what they're reading to announce it when it appears or changes.
  - Use the default for errors and urgent warnings that appear after an action.
  - Pass `role="status"` for messages that aren't urgent, such as "Saved", so they're announced politely, as in the last example.
  - An alert already on the page when it loads is usually not announced, whatever its role. Pass `role="none"` for permanent notes, such as a warning at the top of a settings page, so they're read in order.
- **Live regions need to exist first:** screen readers announce changes to a live region more reliably when the region is already in the DOM. For messages that come and go, keep an empty container with the role mounted, and put the Alert inside it, or render the Alert and change its children.
- **Severity:** the icon is decorative to screen readers, because MUI's icons are `aria-hidden`. The words must say what happened, such as "Payment failed", not only the color and icon. An `AlertTitle` helps.
- **Keyboard:** `Tab` reaches the close button and actions. The alert itself doesn't take focus, and appearing doesn't move focus.
- **Naming:** the close button is named by `closeText`, "Close" by default, and also gets it as `title`. A project in another language passes its own. An icon-only action needs `aria-label`.
- **Focus:** after the user closes an alert, focus is lost unless the consumer moves it, such as to the element that triggered the message.
- **Contrast:** the text meets 4.5:1 on every variant and severity, on both schemes, as listed under Verified behavior. The icon meets 3:1 once the library's rule applies. See [Open questions](#open-questions) for the alert's background.

## Behavior and edge cases

- **Closing:** Alert reports `onClose` and doesn't hide itself. The consumer removes it from the page. MUI's `Collapse` around it animates the removal.
- **`action` and `onClose` together:** only `action` is shown, as in MUI. To show both, put a close button in `action` yourself.
- **Long text:** wraps. The icon and action stay at the top.
- **Content that's too wide,** such as a long URL or a table: the message scrolls horizontally, because MUI gives it `overflow: auto`.
- **Several alerts:** they stack with no gap. Spacing between them is the consumer's, with a flex container or `sx`.
- **Narrow screens:** the icon, message and action stay in one row, so a long action label squeezes the message. Use short action labels.
- **Without the library theme:** Alert renders with the surrounding MUI theme and MUI's icon colors.
- **Server Components:** Alert can be rendered from a Server Component, but `onClose` and actions with `onClick` must come from a client component.

## Acceptance criteria

- [ ] Renders the message inside an element with `role="alert"`.
- [ ] `role="status"` replaces the role.
- [ ] Each `severity` shows its icon, and `icon={false}` hides it.
- [ ] `AlertTitle` renders the title above the message.
- [ ] With `onClose`, renders a button named "Close", and clicking it calls `onClose`.
- [ ] `closeText` renames the close button.
- [ ] `action` renders in place of the close button.
- [ ] `ref` reaches the root element.
- [ ] `className`, `sx` and other props, such as `data-*` and `id`, reach the root element.
- [ ] Each slot in `slotProps` reaches its element.
- [ ] Under the library theme, the icon of a standard and an outlined alert has the alert's text color, for each severity, on both schemes.
- [ ] Under the library theme, a filled alert keeps MUI's colors.
- [ ] Under the library theme, keyboard focus on the close button shows the focus ring.
- [ ] A project-level `MuiAlert` `styleOverrides.root` object changes the look and keeps the library's icon color.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, Alert renders with that theme.
- [ ] Storybook has a story for every variant and severity, one with a title, one with an action Button, one with a close button, one showing a live `role="status"` message that appears after an action, and one showing a theme override.
- [ ] `Alert`, `AlertProps`, `AlertTitle` and `AlertTitleProps` are exported from `src/index.ts`, and both components are added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Hiding itself on close, or closing after a delay. That's a snackbar.
- A snackbar or toast, and a queue of messages.
- Showing an action and the close button together.
- Severity text for screen readers, such as a hidden "Error:".
- Moving focus after closing.
- Exporting MUI's `Collapse` or `IconButton`. Consumers import them from MUI until a spec adds them.

## Open questions

- **Standard alert background:** the tinted background of a standard alert is 1.01 to 1.10:1 against the light background, and 1.00 to 1.06:1 against the dark one, so the alert barely shows as a box. The outlined border is 1.19 to 1.47:1 in light mode for `success`, `info` and `warning`. WCAG doesn't require the box to show, but the design should confirm it, or choose a stronger tint, which the reference theme doesn't define.
- **Default role:** `role="alert"` interrupts screen readers, which suits errors but is loud for "Saved". Confirm that the library keeps MUI's default and documents `role="status"`, or decide to default to `status` and ask for `alert` on errors.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`, with the icon's 90% opacity blended over its background. The rows from the source were rechecked on implementing, and the rendered rows are covered by `Alert.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| Slots in `Alert.d.ts` | `root`, `icon`, `message`, `action`, `closeButton` and `closeIcon` |
| Defaults in `Alert.js` | `severity="success"`, `variant="standard"`, `role="alert"`, `closeText="Close"`. `color` falls back to `severity` |
| Root in `Alert.js` | MUI's `Paper` with `elevation={0}` and the `role`, styled with `body2`, `padding: 6px 16px` and the theme's radius |
| Close button in `Alert.js` | An `IconButton`, `size="small"`, `color="inherit"`, with `aria-label` and `title` set to `closeText`. Only rendered when `onClose` is set and `action` isn't |
| Icon colors in `Alert.js` | On `standard` and `outlined`, set on the root as `& .MuiAlert-icon` with `palette.Alert.<severity>IconColor`, which MUI sets to `<severity>.main`. The icon has `opacity: 0.9`. On `filled`, the icon inherits the text color |
| AlertTitle in `AlertTitle.js` | `Typography` with `gutterBottom`, `component="div"`, `fontWeightMedium` and `marginTop: -2` |
| Text on standard alerts | Light: `success` 5.00, `info` 6.20, `warning` 5.65, `error` 9.73. Dark: 13.55, 10.75, 14.31, 8.75 |
| Text on outlined alerts, against the page | Light: 5.04, 6.16, 5.75, 10.66. Dark: 14.33, 10.96, 15.13, 8.75 |
| Text on filled alerts | Light: 7.61, 7.21, 6.61, 6.29. Dark: 10.94, 12.07, 8.27, 14.58 |
| MUI's icon on standard alerts | Light: 2.14, 2.27, 2.41, 5.05. Dark: 3.07, 2.55, 4.53, 1.94 |
| The library's icon on standard alerts | Light: 4.14, 5.07, 4.57, 8.12. Dark: 11.05, 8.85, 11.64, 7.17 |
| The library's icon on outlined alerts, against the page | Light: 4.18, 5.04, 4.61, 8.82. Dark: 11.60, 8.94, 12.27, 7.19 |
| Standard background against the page | Light: 1.01, 1.01, 1.02, 1.10. Dark: 1.06, 1.02, 1.06, 1.00 |
| Outlined border against the page | Light: 1.40, 1.19, 1.47, 3.23. Dark: 8.35, 3.90, 7.25, 3.21 |
| Rendered: the default variant | `variant: 'standard'` in `styleOverrides.root.variants` matches an Alert with no `variant` prop, because MUI matches against the resolved owner state |
| Rendered: icon color | On standard and outlined alerts, for every severity, the icon's computed color equals the alert's, on both schemes. Without the library theme it differs. Removing the rule fails 13 tests |
| Rendered: icons | `SuccessOutlinedIcon`, `InfoOutlinedIcon`, `ReportProblemOutlinedIcon` and `ErrorOutlineIcon`, each with `aria-hidden="true"` |
| Rendered: close button | Named "Close", or `closeText`. Gets the 2px focus ring with `Mui-focusVisible`. Not rendered when `action` is set |
