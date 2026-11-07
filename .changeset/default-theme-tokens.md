---
'@cmotino/cm-web-components': minor
---

The default theme now has its own look: a blue `brand` primary color, gray text and backgrounds, and matching `info`, `success`, `warning` and `error` colors, each with light and dark values. Text uses `Inter, sans-serif` with new heading sizes, corners have an 8px radius, and `shadows[1]` is a soft shadow that changes with the color scheme through the new `palette.baseShadow` token. The library doesn't load Inter, so projects that want it should load it themselves, for example with `@fontsource/inter`.
