# Specifications

Everything in this library is built from a written spec. Specs are built one at a time, in the order set by the [roadmap](./roadmap.md).

| File | Purpose |
| --- | --- |
| [`0000-architecture.md`](./0000-architecture.md) | Decisions that apply to the whole library |
| [`_template.md`](./_template.md) | Starting point for each component spec |
| [`roadmap.md`](./roadmap.md) | Build order, dependencies and status |
| `NNNN-<component>.md` | One spec per component, such as `0001-button.md` |

## Lifecycle

| Status | Meaning |
| --- | --- |
| `Draft` | Being written. Anything can change. |
| `Accepted` | Reviewed and approved. Work can start. |
| `Implemented` | Built, and every acceptance criterion passes. |
| `Superseded` | Replaced. The header links to the replacement. |

## Rules

1. Only build a component from an `Accepted` spec.
2. Component specs follow `0000-architecture.md`. To deviate, change the architecture spec first or record the exception and the reason in the component spec.
3. Update the spec before changing a component's public API. The public API is the props, data shapes, theme keys and exports.
4. Internal changes that keep the public API the same don't need a spec change.
5. Keep "Out of scope" sections current. They stop components from growing without a decision.

## Adding a component

1. Copy `_template.md` to `NNNN-<component>.md`, using the next free number.
2. Fill in every section, and write "None" where a section has nothing to say.
3. Set the status to `Accepted` once reviewed, and update the roadmap.
4. Build the component and tests against the acceptance criteria.
5. Set the status to `Implemented` and update the roadmap.
