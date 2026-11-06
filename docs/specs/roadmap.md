# Roadmap

Components are built in this order, so each one can reuse those before it. Spec numbers are assigned when a spec is written. Change this order whenever a consuming project needs something sooner.

**Status values:** `Not started`, then the [spec lifecycle](./README.md#lifecycle): `Draft`, `Accepted`, `Implemented`.

| # | Item | Kind | Depends on | Spec | Status |
| --- | --- | --- | --- | --- | --- |
| 0 | Library scaffolding | Setup | Architecture spec accepted | [0000](./0000-architecture.md) | Implemented |
| 1 | Theme and provider | Foundation | Scaffolding | [0000](./0000-architecture.md), section 3 | Implemented |
| 2 | Button | Simple | Theme | None yet (planned as `0001`) | Not started |
| 3 | Inputs: text, select, checkbox | Simple | Theme | None yet | Not started |
| 4 | Card | Simple | Theme, Button | None yet | Not started |
| 5 | List | Composite | Theme | None yet | Not started |
| 6 | Menu | Composite | Button, List | None yet | Not started |
| 7 | Form | Composite | Inputs, Button | None yet | Not started |
| 8 | Table | Composite | Inputs, Button, Menu | None yet | Not started |
| 9 | Navbar | Composite | Button, Menu | None yet | Not started |
| 10 | Sidebar | Composite | List | None yet | Not started |

## Questions for later specs

- **Form:** whether to integrate with a form library such as React Hook Form or manage state internally.
- **Table:** whether to use MUI's `Table` or the separate MUI X DataGrid, which adds a dependency and has paid tiers for advanced features. The answer depends on whether sorting, filtering and pagination run on the client, the server or both.
- **Navbar and Sidebar:** how links work with each project's router. Accepting a link component as a prop would keep the library independent of any router.
