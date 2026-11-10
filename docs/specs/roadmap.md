# Roadmap

Components are built in this order, so each one can reuse those before it. Spec numbers are assigned when a spec is written. Change this order whenever a consuming project needs something sooner.

**Status values:** `Not started`, then the [spec lifecycle](./README.md#lifecycle): `Draft`, `Accepted`, `Implemented`.

| # | Item | Kind | Depends on | Spec | Status |
| --- | --- | --- | --- | --- | --- |
| 0 | Library scaffolding | Setup | Architecture spec accepted | [0000](./0000-architecture.md) | Implemented |
| 1 | Theme and provider | Foundation | Scaffolding | [0000](./0000-architecture.md), section 3 | Implemented |
| 2 | Button | Simple | Theme | [0001](./0001-button.md) | Implemented |
| 3 | Button group | Simple | Button | [0002](./0002-button-group.md) | Implemented |
| 4 | Typography | Simple | Theme | [0003](./0003-typography.md) | Implemented |
| 5 | Link | Simple | Typography | [0004](./0004-link.md) | Implemented |
| 6 | Inputs: text, checkbox | Simple | Theme | [0005](./0005-inputs.md) | Implemented |
| 7 | Select | Simple | Inputs | [0006](./0006-select.md) | Implemented |
| 8 | Radio group | Simple | Inputs | [0007](./0007-radio-group.md) | Implemented |
| 9 | Switch | Simple | Inputs | [0008](./0008-switch.md) | Implemented |
| 10 | Slider | Simple | Inputs | [0009](./0009-slider.md) | Implemented |
| 11 | Rating | Simple | Inputs | [0010](./0010-rating.md) | Implemented |
| 12 | Avatar | Simple | Theme | [0011](./0011-avatar.md) | Implemented |
| 13 | Badge | Simple | Theme | [0012](./0012-badge.md) | Implemented |
| 14 | Chip | Simple | Avatar | [0013](./0013-chip.md) | Implemented |
| 15 | Autocomplete | Simple | Inputs, Chip | [0014](./0014-autocomplete.md) | Implemented |
| 16 | Tooltip | Simple | Theme | [0015](./0015-tooltip.md) | Implemented |
| 17 | Progress | Simple | Theme | [0016](./0016-progress.md) | Implemented |
| 18 | Alert | Simple | Theme, Button | [0017](./0017-alert.md) | Implemented |
| 19 | Card | Simple | Theme, Button | [0018](./0018-card.md) | Implemented |
| 20 | Tabs | Composite | Theme, Link | [0019](./0019-tabs.md) | Implemented |
| 21 | List | Composite | Theme | None yet | Not started |
| 22 | Menu | Composite | Button, List | None yet | Not started |
| 23 | Form | Composite | Inputs, Select, Radio group, Switch, Slider, Rating, Autocomplete, Button | None yet | Not started |
| 24 | Table | Composite | Inputs, Select, Button, Menu | None yet | Not started |
| 25 | AppBar | Simple | Theme | None yet | Not started |
| 26 | Navbar | Composite | AppBar, Button, Menu, Link | None yet | Not started |
| 27 | Sidebar | Composite | List, Link | None yet | Not started |

## Questions for later specs

- **Form:** whether to integrate with a form library such as React Hook Form or manage state internally.
- **Table:** whether to use MUI's `Table` or the separate MUI X DataGrid, which adds a dependency and has paid tiers for advanced features. The answer depends on whether sorting, filtering and pagination run on the client, the server or both.
- **Navbar and Sidebar:** how links work with each project's router. [0004](./0004-link.md#usage) answers this for Link: the library doesn't depend on a router, and a project sets its router once through `MuiLink.defaultProps.component` and `MuiButtonBase.defaultProps.LinkComponent`. [0019](./0019-tabs.md#api) reuses it for link tabs. Navbar and Sidebar should too.
- **AppBar and Navbar:** where the line between them falls. The current plan is that AppBar is the thin MUI wrapper and Navbar is the data-driven composite built on it.
