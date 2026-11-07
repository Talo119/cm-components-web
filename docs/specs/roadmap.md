# Roadmap

Components are built in this order, so each one can reuse those before it. Spec numbers are assigned when a spec is written. Change this order whenever a consuming project needs something sooner.

**Status values:** `Not started`, then the [spec lifecycle](./README.md#lifecycle): `Draft`, `Accepted`, `Implemented`.

| # | Item | Kind | Depends on | Spec | Status |
| --- | --- | --- | --- | --- | --- |
| 0 | Library scaffolding | Setup | Architecture spec accepted | [0000](./0000-architecture.md) | Implemented |
| 1 | Theme and provider | Foundation | Scaffolding | [0000](./0000-architecture.md), section 3 | Implemented |
| 2 | Button | Simple | Theme | None yet (planned as `0001`) | Not started |
| 3 | Button group | Simple | Button | None yet | Not started |
| 4 | Typography | Simple | Theme | None yet | Not started |
| 5 | Link | Simple | Typography | None yet | Not started |
| 6 | Inputs: text, checkbox | Simple | Theme | None yet | Not started |
| 7 | Select | Simple | Inputs | None yet | Not started |
| 8 | Radio group | Simple | Theme | None yet | Not started |
| 9 | Switch | Simple | Theme | None yet | Not started |
| 10 | Slider | Simple | Theme | None yet | Not started |
| 11 | Rating | Simple | Theme | None yet | Not started |
| 12 | Avatar | Simple | Theme | None yet | Not started |
| 13 | Badge | Simple | Theme | None yet | Not started |
| 14 | Chip | Simple | Avatar | None yet | Not started |
| 15 | Autocomplete | Simple | Inputs, Chip | None yet | Not started |
| 16 | Tooltip | Simple | Theme | None yet | Not started |
| 17 | Progress | Simple | Theme | None yet | Not started |
| 18 | Alert | Simple | Theme, Button | None yet | Not started |
| 19 | Card | Simple | Theme, Button | None yet | Not started |
| 20 | Tabs | Composite | Theme | None yet | Not started |
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
- **Link, Tabs, Navbar and Sidebar:** how links work with each project's router. Accepting a link component as a prop would keep the library independent of any router.
- **AppBar and Navbar:** where the line between them falls. The current plan is that AppBar is the thin MUI wrapper and Navbar is the data-driven composite built on it.
