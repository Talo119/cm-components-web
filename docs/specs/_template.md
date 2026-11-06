# NNNN: ComponentName

- **Status:** Draft
- **Date:** YYYY-MM-DD
- **Kind:** Simple | Composite
- **Depends on:** other specs, or None

> Copy this file to `NNNN-<component>.md`. Fill in every section, write "None" where nothing applies, and delete this note. Only record what differs from or adds to [`0000-architecture.md`](./0000-architecture.md). Shared rules, such as `sx` and `ref` support, don't need repeating.

## Purpose

What this component does, and which problem it solves for a consuming project.

**Use it for:** typical cases.

**Don't use it for:** cases where something else fits better, and what to use instead.

## Usage

```tsx
// The most common use, showing the props a consumer actually passes.
```

## API

Props added or changed by this library. For simple components, state which MUI props are extended and list any that are removed.

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `example` | `string` | `undefined` | No | What it does |

## Data shapes

Types for any data the component receives. Write "None" for most simple components.

```ts
// export interface ExampleItem { id: string; label: string }
```

## Variants and states

| Variant or state | Behavior or appearance |
| --- | --- |
| Default | |
| Hover, focus, active | |
| Disabled | |
| Loading, empty, error | Only where they apply |

## Styling hooks

- **Theme key:** `components.Mui<Name>` for simple components, `components.Cm<Name>` for composites.
- **Slots:** the slot names accepted by `slotProps`, and which element each one targets.
- **Default look:** how this component differs from plain MUI.

## Accessibility

- **Semantics:** the element or ARIA role used.
- **Keyboard:** each key and what it does.
- **Naming:** how the component gets its accessible name.
- **Focus:** where focus goes, including when opening and closing, if relevant.

## Behavior and edge cases

Long text, empty data, very large data sets, narrow screens, and anything else that can go wrong.

## Acceptance criteria

Specific, testable statements. Each maps to at least one test.

- [ ] Renders ...
- [ ] Calling ... does ...
- [ ] A project-level theme override changes ...
- [ ] An instance-level `sx` value overrides the theme.
- [ ] Works with the keyboard as listed under Accessibility.

## Out of scope

Features deliberately left out of this version, so that adding them later is a decision.
