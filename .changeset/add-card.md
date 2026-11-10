---
'@cmotino/cm-web-components': minor
---

Add `Card`, which builds MUI's `Card` from `title`, `subheader`, `avatar`, `headerAction`, `image` (`{ src, alt, height? }`), `children` and `actions`, in that order: the image, the header, the content, then the actions. Each part is only rendered when its props are set. MUI's `Card` props, such as `variant`, `raised` and `component`, reach the root. `slotProps` reaches the header, the title and subheader `Typography`, the image, the content and the actions. The title is a `<span>` unless `slotProps.title` sets a heading, such as `{ component: 'h3' }`.
