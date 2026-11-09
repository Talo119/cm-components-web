---
'@cmotino/cm-web-components': minor
---

Add `Avatar`, a re-export of MUI's `Avatar` for the photo, initials or icon of a person or thing. When the image fails to load, it shows the children, then the first letter of `alt`, then a person icon. The default theme now draws every MUI `Avatar`'s initials, icons and fallback in `common.white` on `grey[500]`, instead of MUI's colors, which are below 4.5:1 on both color schemes. Avatars with a working image aren't affected. This also applies to MUI's own `Avatar` under the library theme. A project's own `MuiAvatar` `colorDefault` style override replaces these colors.
