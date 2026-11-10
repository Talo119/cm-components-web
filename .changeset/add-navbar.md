---
'@cmotino/cm-web-components': minor
---

Add `Navbar`, a site's main navigation built on AppBar from an `items` array of links with `href` and groups with `children`, which open a Menu. The item matching `value` gets `aria-current="page"`, a `primary` label and a line under it, and a group holding it shows as current too. `brand` with `brandHref` is a link at the start, and `actions` sit at the end on every screen size. Below `collapseBelow`, `md` by default, the links move into a Menu behind a button. Both layouts are rendered and CSS hides one, so the server's HTML already matches the screen. Links use the project's router through the theme, as for Link. `labels` replaces the English names of the `<nav>` and the menu button. The theme key is `components.CmNavbar`, with the `root`, `brand`, `nav`, `item` and `actions` slots.
