/** Joins the class names that are set. Private: not exported from `src/index.ts`. */
export function classNames(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(' ')
}
