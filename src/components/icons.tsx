import { createSvgIcon } from '@mui/material/utils'

// Icons the library draws itself, so `@mui/icons-material` stays a dev
// dependency. Private: not exported from `src/index.ts`.

/** A chevron pointing down. Rotate it to point up. */
export const ChevronDownIcon = createSvgIcon(
  <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />,
  'ChevronDown',
)

/** Three horizontal lines, for a button that opens navigation. */
export const HamburgerIcon = createSvgIcon(
  <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />,
  'Hamburger',
)

/** Three vertical dots, for a button that opens more actions. */
export const MoreVerticalIcon = createSvgIcon(
  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2" />,
  'MoreVertical',
)
