# 0016: Progress

- **Status:** Implemented
- **Date:** 2026-11-10
- **Kind:** Simple
- **Depends on:** [0000](./0000-architecture.md)

## Purpose

Shows that something is loading or running, either as an animation with no end (indeterminate) or as a measured amount of a known total (determinate). MUI already provides both shapes, `LinearProgress` and `CircularProgress`, with the `progressbar` role and its values, so this library re-exports both under their MUI names. It changes one color: MUI's linear track is too close to the bar for a determinate value to be read under the library theme.

**Use it for:**

- `LinearProgress`: progress of a task with a known size, such as an upload, and loading at the top of a page or a card.
- `CircularProgress`: loading a small area, such as a card, a table or the inside of a button.

**Don't use it for:**

- A loading Button. Use Button's `loading` prop from [0001](./0001-button.md), which already shows a CircularProgress and disables the button.
- Placeholders that show the shape of the content while it loads. That's a skeleton, which isn't on the [roadmap](./roadmap.md).
- A value the user sets. Use Slider.
- A score or level that isn't progress toward finishing something, such as a password's strength. Use text, or a meter, which isn't on the roadmap.

## Usage

```tsx
import { CircularProgress, LinearProgress } from '@cmotino/cm-web-components'

<LinearProgress aria-label="Loading orders" />

<LinearProgress variant="determinate" value={uploaded} aria-label="Upload progress" />

<CircularProgress aria-label="Loading comments" />

<CircularProgress variant="determinate" value={step} min={0} max={5} aria-label="Setup progress" />

// A region that's loading points at its indicator and sets `aria-busy`.
<section aria-busy={loading} aria-describedby={loading ? 'orders-progress' : undefined}>
  {loading ? <LinearProgress id="orders-progress" aria-label="Loading orders" /> : <OrdersTable />}
</section>
```

## API

`LinearProgress` and `CircularProgress` are MUI's, re-exported from `src/components/Progress/index.ts`. Every MUI prop works as documented by MUI 9. No props are added or removed.

```ts
export { default as LinearProgress } from '@mui/material/LinearProgress'
export type { LinearProgressProps } from '@mui/material/LinearProgress'
export { default as CircularProgress } from '@mui/material/CircularProgress'
export type { CircularProgressProps } from '@mui/material/CircularProgress'
```

The props a consumer uses most are `variant`, `value`, `min`, `max`, `color`, `aria-label` and `aria-labelledby`, plus `valueBuffer` on LinearProgress and `size`, `thickness` and `enableTrackSlot` on CircularProgress. MUI's defaults are kept: `variant="indeterminate"`, `color="primary"`, `min={0}` and `max={100}`, and on CircularProgress `size={40}` and `thickness={3.6}`.

**Why two components and not one `Progress`:** a single component with a `shape` prop would have to merge two prop types that differ, such as `valueBuffer` and `size`, and would add a layer with no logic. MUI's names are already known to consumers, and Button's loading indicator is a CircularProgress.

**Why a re-export and not a wrapper:** the same reasons as Button in [0001](./0001-button.md#api). Neither component has logic for this library to add. The missing accessible name, described under Accessibility, can't be added by a wrapper, because only the consumer knows what is loading.

### Exceptions to the architecture spec

| Rule | Exception | Reason |
| --- | --- | --- |
| Section 2: every component accepts `slotProps` | Neither component has `slotProps` | MUI's have none in 9.5. Use `classes` or the theme for inner parts, as listed under Styling hooks |
| Section 6: one folder per component, named after it | One `Progress` folder holds both components, with `index.ts`, `LinearProgress.test.tsx`, `CircularProgress.test.tsx` and `Progress.stories.tsx` | They're one roadmap item and share a spec and a story file. There is no component code or type of our own, so no `.tsx` or `.types.ts` files exist |

No `'use client'` directive is needed, because this module has no hooks and MUI's modules carry their own.

## Data shapes

None.

## Variants and states

### LinearProgress

| Variant or state | Behavior or appearance |
| --- | --- |
| Default (`indeterminate`) | A 4px bar in `primary.main` that slides across a track in `divider`. See Styling hooks |
| `determinate` | The bar fills the track up to `value`, between `min` and `max` |
| `buffer` | The bar up to `value`, a lighter buffer bar up to `valueBuffer`, and a dashed line after it, as in MUI. The track keeps MUI's colors |
| `query` | As `indeterminate`, moving the other way |
| `color` | `primary`, `secondary`, `info`, `success`, `warning`, `error` or `inherit`. The track is `divider` for all of them. See Open questions |

### CircularProgress

| Variant or state | Behavior or appearance |
| --- | --- |
| Default (`indeterminate`) | A 40px spinning arc in `primary.main` with no track, as in MUI |
| `determinate` | An arc from the top, clockwise, up to `value` between `min` and `max` |
| `enableTrackSlot` | A full circle behind the arc, in the arc's color at the theme's `activatedOpacity` |
| `size`, `thickness` | The diameter in pixels or any CSS length, and the stroke width |
| `color` | As on LinearProgress |

Neither component has hover, focus, disabled or error states. They aren't interactive.

## Styling hooks

- **Theme keys:** `components.MuiLinearProgress` and `components.MuiCircularProgress`. New colors use MUI's `LinearProgressPropsColorOverrides` and `CircularProgressPropsColorOverrides`. New variants use `LinearProgressPropsVariantOverrides` and `CircularProgressPropsVariantOverrides`.
- **Slots:** None. Inner parts are reached with `classes` or `styleOverrides` keys: `bar1`, `bar2` and `dashed` on LinearProgress, and `svg`, `track` and `circle` on CircularProgress.
- **Default look:** MUI's progress, with colors from the library's design tokens, and a new track color for LinearProgress. `src/theme/defaultTheme.ts` gains:

```ts
components: {
  // ...earlier components, unchanged
  // MUI's track is a light tint of the bar's color, and `primary.main` is
  // below 3:1 against it on both schemes. `divider` is translucent and close
  // to the page, so the bar stands out from it on both. The buffer variant
  // draws its own track from the buffer bar and keeps MUI's colors.
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme, ownerState }) =>
        ownerState.variant === 'buffer'
          ? {}
          : { backgroundColor: (theme.vars || theme).palette.divider },
    },
  },
},
```

**Why `divider`:** a determinate bar is a graphic that shows a value, so WCAG 2.2 AA asks for 3:1 between the bar and what's next to it (1.4.11). MUI's track, `palette.LinearProgress.primaryBg`, is `primary.main` lightened by 62% in light mode and darkened by 50% in dark mode. The bar is 2.48:1 against it in light mode and 2.61:1 in dark mode. Against `divider` over the page it's 3.38 and 3.26 in light mode, on `background.default` and `background.paper`, and 3.61 and 3.47 in dark mode. `grey[300]` would make the track easier to see, but leaves the bar at 2.49.

**The track is faint.** `divider` is 1.20:1 against the light background and 1.35:1 against the dark one, so the full length of the bar is hard to see before it fills. WCAG doesn't require the track to show, but the design should confirm it. See [Open questions](#open-questions).

**This rule applies to every MUI `LinearProgress`** under the library theme. A project's own `root` in `MuiLinearProgress.styleOverrides` replaces it, because `deepmerge` doesn't merge functions. The documentation must state this.

CircularProgress needs no change. Its arc is 4.04:1 against the light background, 3.84:1 against light paper, and 4.87 and 4.60 in dark mode. With `enableTrackSlot`, the arc against its track is 3.46 and 3.30 in light mode and 3.83 and 3.51 in dark mode.

## Accessibility

- **Semantics:** the root has `role="progressbar"`. A determinate one has `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, so screen readers announce the value as a percentage of the range. An indeterminate one has no value, which tells screen readers it's busy.
- **Naming:** neither component has a name by default, and a `progressbar` needs one. Pass `aria-label`, or `aria-labelledby` pointing at visible text, as in every example. Automated checks such as `@storybook/addon-a11y` report a missing name.
- **Value text:** when a percentage isn't meaningful, such as "Step 3 of 5", pass `aria-valuetext`.
- **Keyboard:** None. Progress indicators can't take focus.
- **Loading regions:** a region that's loading sets `aria-busy="true"` and points at its indicator with `aria-describedby`, as in the last example, as MUI's docs advise. The library doesn't do this, because the region belongs to the consumer.
- **Changes:** value changes aren't announced as they happen. Announcing "Upload complete" belongs in a live region, such as an Alert with `role="status"`.
- **Motion:** the indeterminate animations keep running when the operating system asks for reduced motion, because MUI's `theme.motion.reducedMotion` defaults to `'never'`. See [Open questions](#open-questions).
- **Contrast:** described under Styling hooks, for `primary`. Other colors depend on the palette.

## Behavior and edge cases

- **Values out of range:** a `value` below `min` or above `max`, or a `min` that isn't below `max`, logs an error from MUI, and the indicator isn't guaranteed to draw correctly. Clamp values before passing them.
- **Missing value:** a `determinate` or `buffer` LinearProgress without `value` logs an error from MUI and shows an empty bar. A `determinate` CircularProgress without `value` shows `min`.
- **`min` and `max` on indeterminate:** MUI logs a warning, because they have no effect.
- **Width:** LinearProgress is a block that fills its container. Give the container a width.
- **Fast loads:** an indicator that shows for a split second flickers. Waiting a short time, such as 300ms, before showing it is up to the consumer.
- **Right-to-left:** LinearProgress fills from the right under a right-to-left theme, as in MUI.
- **Without the library theme:** both render with the surrounding MUI theme, and LinearProgress has MUI's tinted track.
- **Server Components:** both can be rendered from a Server Component.

## Acceptance criteria

- [ ] Each renders an element with `role="progressbar"`, named by `aria-label`.
- [ ] `aria-labelledby` names it from visible text.
- [ ] A `determinate` one with `value`, `min` and `max` sets `aria-valuenow`, `aria-valuemin` and `aria-valuemax`.
- [ ] An `indeterminate` one has no `aria-valuenow`.
- [ ] `aria-valuetext` reaches the root.
- [ ] A determinate LinearProgress draws its bar in proportion to `value`, and a determinate CircularProgress its arc.
- [ ] `ref` reaches the root element of each.
- [ ] `className`, `sx` and other props, such as `data-*` and `id`, reach the root element of each.
- [ ] Under the library theme, LinearProgress's track is `divider` for the `indeterminate`, `determinate` and `query` variants, and keeps MUI's colors for `buffer`.
- [ ] Under the library theme, CircularProgress keeps MUI's colors.
- [ ] A project-level `MuiLinearProgress` `styleOverrides.bar1` object changes the bar and keeps the library's track.
- [ ] A project-level `MuiCircularProgress` `styleOverrides.circle` object changes the arc.
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Under another MUI theme, without `CmThemeProvider`, both render with that theme.
- [ ] Button's `loading` indicator still renders and is still labelled by the button.
- [ ] Storybook has a story for every variant and color of each, one with `min` and `max`, one with `enableTrackSlot`, one showing a loading region with `aria-busy`, and one showing a theme override.
- [ ] `LinearProgress`, `LinearProgressProps`, `CircularProgress` and `CircularProgressProps` are exported from `src/index.ts`, and both components are added to the public API list in `tests/dist.test.ts`.

## Out of scope

- A visible label or percentage next to the indicator. Consumers render it with Typography and link it with `aria-labelledby`.
- A single `Progress` component.
- A delay before showing the indicator.
- Skeletons.
- Announcing value changes.
- Changing the track of the `buffer` variant.

## Open questions

- **Track visibility:** the `divider` track is barely visible against the page in light mode. Confirm that the design accepts a faint track. The alternatives found are `grey[200]` in light mode, 1.31:1 against the page with the bar at 3.08, with `grey[800]` in dark mode, bar at 4.69, which takes a rule per scheme. Or a darker bar, `primary.dark`, which reaches 4.10 against `grey[300]` but changes the bar's color in light mode only.
- **Other colors:** only `primary` and `secondary` reach 3:1 against the `divider` track on both schemes. `success`, `info` and `warning` are below 3:1 in light mode (1.97, 2.08 and 2.27), and `success`, `info` and `error` are below it in dark mode (2.76, 2.20 and 1.60). This comes from the palette, as for Chip in [0013](./0013-chip.md#open-questions). Decide whether to fix it in the palette, through the architecture spec, or to document `primary` only.
- **Reduced motion:** setting `motion: { reducedMotion: 'system' }` in the default theme would stop indeterminate animations, and every MUI transition, when the operating system asks for reduced motion. It's a theme-wide change, so it belongs in the architecture spec. Decide there.

## Verified behavior

Checked on 2026-11-10 against the source of MUI 9.5.0 in `node_modules`, with contrast computed with MUI's `getContrastRatio` on the palette of `createCmTheme()`, with translucent colors blended over the page. The rows from the source were rechecked on implementing, and the rendered rows are covered by `LinearProgress.test.tsx` and `CircularProgress.test.tsx` in jsdom. Recheck when upgrading MUI.

| Check | Result |
| --- | --- |
| `slots` and `slotProps` in `LinearProgress.d.ts` and `CircularProgress.d.ts` | Not present. Both have `classes` |
| Root in both | `role="progressbar"`, with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` only for `determinate` and `buffer`. No accessible name is set. Other props are spread after these |
| `min` and `max` in both | Default to 0 and 100. Out-of-range values log an error once. On indeterminate variants they log a warning |
| Linear track in `LinearProgress.js` | Root `backgroundColor` is `palette.LinearProgress.<color>Bg`, set by MUI to `<color>.main` lightened by 0.62 in light mode and darkened by 0.5 in dark mode. `buffer` makes the root transparent and draws the dashed line and `bar2` from the same color |
| Circular track in `CircularProgress.js` | Only with `enableTrackSlot`: `currentColor` at `action.activatedOpacity`, which is 0.12 in light mode and 0.24 in dark mode |
| Reduced motion in `createMotion.js` | `theme.motion.reducedMotion` defaults to `'never'`, so `prefers-reduced-motion` doesn't stop the animations |
| `primary.main` against MUI's linear track | 2.48 light, 2.61 dark |
| `primary.main` against `divider` over the page | 3.38 and 3.26 light, 3.61 and 3.47 dark, on `background.default` and `background.paper` |
| `divider` over the page against the page | 1.20 and 1.18 light, 1.35 and 1.33 dark |
| `primary.main` against grey tracks | `grey[300]` 2.49, `grey[200]` 3.08, `grey[800]` 4.69. `primary.dark` against `grey[300]`: 4.10 |
| Grey tracks against the page | `grey[200]` 1.31 light, `grey[800]` 1.04 dark |
| `primary.main` against the page | 4.04 and 3.84 light, 4.87 and 4.60 dark |
| Arc against its track, with `enableTrackSlot` | 3.46 and 3.30 light, 3.83 and 3.51 dark |
| Other colors against `divider`, light | `secondary` 5.12, `error` 5.12, `success` 1.97, `info` 2.08, `warning` 2.27 |
| Other colors against `divider`, dark | `secondary` 6.27, `warning` 4.19, `success` 2.76, `info` 2.20, `error` 1.60 |
| Rendered: linear bar | `bar1` gets `transform: translateX(<(value - min) / (max - min) * 100 - 100>%)`, such as `-40%` for 3 of 5 |
| Rendered: circular arc | The circle gets `stroke-dasharray` of its circumference and `stroke-dashoffset` of `(max - value) / (max - min)` of it, in px. The root is rotated by -90° |
| Rendered: linear track | `divider` for `indeterminate`, `determinate` and `query`, for every color. `buffer` keeps MUI's. A project's `root` replaces the library's track, and a `bar1` object keeps it |
| Rendered: Button's `loading` | Still a CircularProgress, named by the button's text through `aria-labelledby` |
