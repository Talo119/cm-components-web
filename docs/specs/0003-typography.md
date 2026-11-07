# 0003: Typography

- **Status:** Implemented
- **Date:** 2026-11-07
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

Gives projects one component for headings, body text, captions and labels, using the library's type scale. The type scale already lives in the default theme (see [section 3 of the architecture spec](./0000-architecture.md#3-styling-and-theming)), and MUI's `Typography` already applies it, so this library adds a stable import, a semantic default for subtitles and a button-text style that matches Button, rather than new behavior.

**Use it for:** page and section headings, paragraphs, secondary text such as timestamps, captions, and short labels that need a variant from the type scale.

**Don't use it for:**

- Links, inside text or on their own. Use Link, which is next on the [roadmap](./roadmap.md) and builds on Typography.
- Rich content such as Markdown or HTML from a CMS. Render that with the project's own styles.
- Layout. Spacing between blocks belongs to the parent, through `Stack`, `sx` or the parent's own styles. `gutterBottom` only covers the common case of a heading over text.
- Labels of form fields, buttons or other components. Those components style their own text.

## Usage

```tsx
import { Typography } from '@cmotino/cm-web-components'

<Typography variant="h1">Dashboard</Typography>

<Typography variant="h4" component="h2" gutterBottom>Recent orders</Typography>

<Typography>Body text, rendered as a paragraph.</Typography>

<Typography variant="body2" color="textSecondary">Updated 5 minutes ago</Typography>

<Typography variant="subtitle1">A subtitle that isn't a heading</Typography>

<Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 200 }}>
  quarterly-report-final-version-2.pdf
</Typography>
```

## API

`Typography` is MUI's `Typography`, re-exported from `src/components/Typography/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as Typography } from '@mui/material/Typography'
export type { TypographyProps } from '@mui/material/Typography'
```

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `variantMapping` | `Partial<Record<Variant, string>>` | `{ subtitle1: 'p', subtitle2: 'p' }` under the library theme, MUI's mapping otherwise | No | The only default that differs from MUI. It's set in the theme, not in the component. Variants not listed fall back to MUI's mapping |

The props a consumer uses most are `variant`, `component`, `color`, `align`, `gutterBottom` and `noWrap`. MUI 9 removed the `paragraph` prop and the system props, so `color` is the only style shortcut left. See [Behavior and edge cases](#behavior-and-edge-cases) for what that means for `color="text.secondary"`.

**Why a re-export and not a wrapper:** the same reasons as in [0001](./0001-button.md#api). `Typography` is an `OverridableComponent`, so a wrapper typed as `(props: TypographyProps)` would lose the typing of the `component` prop, which is how a consumer sets the heading level apart from the visual variant. Link will also build on MUI's `Typography`, and a wrapper would add a layer with no logic. If a later version needs its own props, a wrapper with the same type can replace the re-export without breaking consumers.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: every component accepts `slotProps` | Typography has no `slotProps` | MUI's `Typography` has a single root element and no slots in 9.5 |
| Section 6: `Typography.tsx` and `Typography.types.ts` | Neither file exists. The folder holds `index.ts`, `Typography.test.tsx` and `Typography.stories.tsx` | There is no component code or type of our own to put in them |

No `'use client'` directive is needed, because this module has no hooks and MUI's `Typography` module carries its own.

## Data shapes

None. Text is passed as `children`.

## Variants and states

Sizes, weights and line heights under the library theme. Sizes and weights come from the reference theme. Values the reference doesn't set, such as every line height after `h4`, are MUI's. Sizes are in `rem`, so they follow the user's browser font size, and the `px` values below assume the usual 16px root.

| Variant | Element | Size | Weight | Line height | Notes |
| --- | --- | --- | --- | --- | --- |
| `h1` | `<h1>` | 3rem (48px) | 600 | 1.2 | Letter spacing `-0.5px` |
| `h2` | `<h2>` | 2.25rem (36px) | 600 | 1.2 | |
| `h3` | `<h3>` | 1.875rem (30px) | 400 | 1.2 | The reference sets no weight, so MUI's 400 applies. See [Open questions](#open-questions) |
| `h4` | `<h4>` | 1.5rem (24px) | 600 | 1.5 | |
| `h5` | `<h5>` | 1.25rem (20px) | 600 | 1.334 | |
| `h6` | `<h6>` | 1.125rem (18px) | 600 | 1.6 | |
| `subtitle1` | `<p>` | 1.125rem (18px) | 400 | 1.75 | MUI renders `<h6>`. See Styling hooks |
| `subtitle2` | `<p>` | 0.875rem (14px) | 500 | 1.57 | MUI renders `<h6>`. See Styling hooks |
| `body1` | `<p>` | 0.875rem (14px) | 400 | 1.5 | The default variant |
| `body2` | `<p>` | 0.875rem (14px) | 400 | 1.43 | Same size as `body1`, as in the reference. Only the line height differs |
| `caption` | `<span>` | 0.75rem (12px) | 400 | 1.66 | |
| `overline` | `<span>` | 0.75rem (12px) | 400 | 2.66 | Uppercase, as in MUI |
| `button` | `<span>` | 0.875rem (14px) | 500 | 1.75 | Not uppercase, matching Button. See Styling hooks |
| `inherit` | `<p>` | Parent's | Parent's | Parent's | Takes the parent's font, line height and letter spacing |

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | `body1` as a `<p>`, in the theme's font, with no margin. The color is inherited from the parent |
| `color` | `primary`, `secondary`, `success`, `error`, `info` and `warning` use that palette color's `main`. `textPrimary`, `textSecondary` and `textDisabled` use the matching `text` color. Each follows the active color scheme |
| `align` | Sets `text-align`. The default, `inherit`, sets nothing |
| `gutterBottom` | Adds a bottom margin of `0.35em` |
| `noWrap` | One line, cut off with an ellipsis |
| Hover, focus, active | Don't apply. Typography isn't interactive |
| Disabled, loading, empty, error | Don't apply. `color="textDisabled"` only changes the color |

## Styling hooks

- **Theme key:** `components.MuiTypography`, plus the variant styles in `theme.typography`. New variants use MUI's `TypographyPropsVariantOverrides` and new colors `TypographyPropsColorOverrides`, augmented on `@mui/material/Typography`. A new variant also needs its styles in `theme.typography` and, if it isn't a `<span>`, an entry in `variantMapping`.
- **Slots:** None. The root element is reached with `classes` or `styleOverrides` keys: `root`, one key per variant (such as `h1` or `body2`), `alignLeft`, `alignCenter`, `alignRight`, `alignJustify`, `gutterBottom` and `noWrap`.
- **Default look:** the type scale from the library's design tokens, as listed under Variants and states, in `Inter, sans-serif`. `src/theme/defaultTheme.ts` gains:

```ts
export const defaultThemeOptions: ThemeOptions = {
  // ...
  typography: {
    // ...type scale from the reference, unchanged
    button: { textTransform: 'none' },
  },
  components: {
    // ...MuiButton and MuiButtonGroup, unchanged
    MuiTypography: {
      defaultProps: {
        variantMapping: { subtitle1: 'p', subtitle2: 'p' },
      },
    },
  },
}
```

**Why subtitles render `<p>`:** MUI maps both subtitle variants to `<h6>`, so every subtitle becomes a heading that screen reader users meet when they jump between headings, usually at a level that doesn't fit the page (WCAG 1.3.1). A subtitle in this library is styled text. A consumer who needs a heading that looks like a subtitle sets the level explicitly, as in `<Typography variant="subtitle1" component="h3">`. A project restores MUI's mapping with `createCmTheme({ components: { MuiTypography: { defaultProps: { variantMapping: { subtitle1: 'h6', subtitle2: 'h6' } } } } })`, because `createCmTheme` deep-merges the mapping.

**Why `button` isn't uppercase:** Button's label isn't uppercase under the library theme (see [0001](./0001-button.md#styling-hooks)), so `<Typography variant="button">` shouldn't be either. Setting it in `theme.typography.button` also covers other MUI components that use this style, such as `Tab` and `ToggleButton`, which keeps future specs such as Tabs consistent. Button keeps its own `textTransform: 'none'` override from 0001, so a project that sets `typography.button.textTransform: 'uppercase'` changes Typography and those components, but not Button. A project that replaces Button's root override with a function no longer gets an uppercase label, since the base style is now `none`, so 0001's test for that sets `typography.button` to uppercase.

**Why Typography sets no color:** text inherits its color, so Typography inside a `contained` Button, an Alert or a colored container takes that container's color. Setting `text.primary` by default would break that. The page's base color comes from `CmThemeProvider`'s `baseline` prop, or from the project's own styles.

## Accessibility

- **Semantics:** the element in the Variants and states table, or the element given by `component`. Choose the heading level from the document outline and the variant from the design: `<Typography variant="h4" component="h2">`. Don't skip levels just to get a size.
- **Keyboard:** None. Typography isn't interactive and doesn't take focus.
- **Naming:** Typography has no accessible name of its own. A heading is named by its text.
- **Focus:** None.
- **Contrast:** measured against `background.default` and `background.paper` in both color schemes. WCAG 2.2 AA asks for 4.5:1 for normal text and 3:1 for large text, which is at least 24px, or 18.66px in bold.

| `color` | Light | Dark | Use for |
| --- | --- | --- | --- |
| Inherited `text.primary`, `textPrimary` | 18.0 or more | 19.1 or more | Any text |
| `textSecondary` | 7.15 or more | 7.25 or more | Any text |
| `secondary` | 5.82 or more | 7.98 or more | Any text |
| `error` | 5.82 or more | 2.04 or more | Any text in light mode only. Fails 3:1 in dark mode |
| `primary` | 3.84 or more | 4.60 or more | Large text only, such as `h1` to `h4` |
| `warning` | 2.58 or more | 5.33 or more | Not for text in light mode |
| `success`, `info` | 2.24 or more | 2.80 or more | Not for text |

These ratios come from the palette, not from Typography, and changing the palette is out of scope here. The documentation must show this table, so projects know which colors are safe for body text.

## Behavior and edge cases

- **`color="text.secondary"`:** compiles, because `color` also accepts any string, but has no effect in MUI 9, which removed system props. Use `color="textSecondary"`, or `sx={{ color: 'text.secondary' }}`. Many older MUI examples use the dotted form. The documentation must state this.
- **No base color:** without `baseline` and without a color on a parent, text uses the browser's default black, which can't be read on the dark scheme's background. Use `<CmThemeProvider baseline>`, or set a color on a container.
- **Nesting:** `body1`, `body2`, the subtitles and `inherit` render `<p>`. A Typography inside another one would put a `<p>` inside a `<p>`, which is invalid HTML and causes hydration errors in React. Give the inner one `component="span"`.
- **`variantMapping` on one instance:** replaces the theme's mapping for that instance rather than merging with it, so variants it doesn't list go back to MUI's mapping and subtitles render `<h6>` again. Use `component` to change one element.
- **`noWrap`:** cuts off text only when the element is a block or inline-block with a width. `caption`, `overline` and `button` render `<span>`, so they also need `sx={{ display: 'block' }}` or a width. Text cut off this way is still read in full by screen readers, but sighted users can't see it, so give them another way to read it, such as a tooltip or a details view.
- **Long words and URLs:** they don't break and can overflow narrow containers. Add `sx={{ overflowWrap: 'anywhere' }}` where that can happen.
- **Several lines with an ellipsis:** not covered by a prop. Use `sx` with `WebkitLineClamp`, `display: '-webkit-box'` and `WebkitBoxOrient: 'vertical'`.
- **Narrow screens:** sizes don't change across breakpoints, so `h1` stays 48px on a phone. Responsive sizes are out of scope for this version.
- **Fonts:** the library doesn't load Inter, as described in [section 3 of the architecture spec](./0000-architecture.md#3-styling-and-theming). Without it, text falls back to the browser's sans-serif font and wraps differently.
- **`body1` and `body2`:** look nearly the same under the library theme, because the reference gives both 14px. Use `body2` for the reference's denser text, not to get smaller text.
- **Without the library theme:** Typography renders with the surrounding MUI theme, such as Roboto at 16px for `body1`, with subtitles as `<h6>` and an uppercase `button` variant.
- **Server Components:** Typography can be rendered from a Server Component, with the same limit as Button on function props, such as a function `sx`.

## Acceptance criteria

- [x] Renders a `<p>` with the `body1` variant by default.
- [x] Each variant renders the element listed under Variants and states under the library theme, including `<p>` for `subtitle1` and `subtitle2`, and `<span>` for `caption`, `overline` and `button`.
- [x] `component` sets the element without changing the variant's style, such as `variant="h4" component="h2"`.
- [x] `ref` reaches the DOM element.
- [x] `className`, `sx` and other props, such as `id`, `data-*` and `aria-*`, reach the root element.
- [x] Under the library theme, each variant has the size and weight listed under Variants and states, in `Inter, sans-serif`.
- [x] Under the library theme, the `button` variant has `text-transform: none`, and `overline` stays uppercase.
- [x] `color="primary"` and `color="textSecondary"` apply the palette's `primary.main` and `text.secondary`.
- [x] Without `color`, Typography sets no color and inherits its parent's.
- [x] `align`, `gutterBottom` and `noWrap` add their classes and styles.
- [x] `variant="inherit"` takes the parent's font size.
- [x] A project-level `typography.h1` override changes `h1`'s size and keeps the library's weight.
- [x] A project-level `variantMapping` of `subtitle1: 'h6'` makes `subtitle1` render `<h6>`, while `subtitle2` keeps the library's `<p>`.
- [x] A project-level `typography.button.textTransform: 'uppercase'` makes the `button` variant uppercase, and Button's label stays as it was.
- [x] A project-level `styleOverrides.root` object changes the look of every Typography.
- [x] An instance-level `sx` value overrides the theme.
- [x] Under another MUI theme, without `CmThemeProvider`, Typography renders with that theme, with subtitles as `<h6>`.
- [x] Button's existing tests still pass with the `typography.button` change, with the function `styleOverrides.root` test updated as described under Styling hooks.
- [x] Typography isn't focusable, as listed under Accessibility.
- [x] Storybook has a story with every variant, one with every `color`, one for `noWrap`, and one showing a theme override. Each heading story sets a sensible level with `component`, so the a11y addon reports no heading-order issues.
- [x] `Typography` is exported from `src/index.ts` and added to the public API list in `tests/dist.test.ts`.

## Out of scope

- Props, variants or colors beyond those in MUI.
- Responsive font sizes, through MUI's `responsiveFontSizes` or breakpoint values in the theme.
- A prop for truncating after several lines.
- Loading fonts, or shipping a font with the library.
- Changing palette colors to improve the contrast ratios listed under Accessibility. That belongs to a change in the architecture spec's tokens.
- Enforcing a heading order or a heading level through types.
- Components built on Typography, such as Link, which has its own spec.

## Open questions

- **`h3` weight:** the reference sets no weight for `h3`, so it's 400 while `h2` and `h4` are 600. This looks like an omission in the reference, but this spec keeps it, because section 3 of the architecture spec takes the type scale from the reference. If the design calls for 600, add `fontWeight: 600` to `h3` in `src/theme/defaultTheme.ts` and update the Variants and states table before the spec is accepted.

## Verified behavior

Tested on 2026-11-07 with MUI 9.5.0 and TypeScript 6.0, using jsdom and not real browsers, with MUI's `Typography` under `CmThemeProvider` and the current default theme, before the changes in this spec. Recheck these when upgrading either one.

| Test | Result |
| --- | --- |
| `slotProps` and `paragraph` in `Typography.d.ts` | Not present |
| Elements by variant, with MUI's mapping | `h1` to `h6` render their heading, `subtitle1` and `subtitle2` render `<h6>`, `body1`, `body2` and `inherit` render `<p>`, and `caption`, `overline` and `button` render `<span>` |
| Sizes and weights under the library theme | As listed under Variants and states, in `Inter, sans-serif`. `h3` has weight 400 |
| `button` and `overline` under the library theme | Both are `text-transform: uppercase` |
| No `color` prop | No color is set, and the text inherits |
| `color="textSecondary"` and `color="primary"` | The palette's `text.secondary` and `primary.main` |
| `color="text.secondary"` | No color is set |
| `variantMapping: { subtitle1: 'p' }` in `MuiTypography.defaultProps` | `subtitle1` renders `<p>`. `subtitle2` keeps `<h6>` and `h2` keeps `<h2>`, because unlisted variants fall back to MUI's mapping |
| Same theme, with `variantMapping` on the instance | The instance's mapping replaces the theme's, so `subtitle1` renders `<h6>` |
| `gutterBottom` | A bottom margin of `0.35em` |
| Without `CmThemeProvider` | `body1` in Roboto at 16px |
| Contrast ratios with MUI's `getContrastRatio` | As listed under Accessibility |
