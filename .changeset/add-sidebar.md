---
'@cmotino/cm-web-components': minor
---

Add `Sidebar`, an app's main navigation in a column at the side, built on MUI's `Drawer` and List, from `items` or titled `sections` of links and parents with nested links. The item matching `value` gets `aria-current="page"` and List's selected style, and its parents start expanded. With `variant="responsive"`, the default, it's permanent from `breakpoint` up and a temporary drawer below, both rendered and switched by CSS, so the server's HTML already matches the screen. `variant="permanent"` and `"temporary"` render only one. The temporary drawer works controlled with `open` and `onOpenChange` or uncontrolled with `defaultOpen`, traps focus, and closes when a link is followed or the screen widens past `breakpoint`. `width`, `anchor`, `header` and `footer` set the panel. The theme key is `components.CmSidebar`, with the `root`, `paper`, `header`, `nav` and `footer` slots.
