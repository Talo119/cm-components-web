/** The shape of a tree of items that List, and Sidebar through it, walk. */
interface TreeItem<Id> {
  id: Id
  children?: readonly TreeItem<Id>[]
}

/** Whether `id` is anywhere in the tree. */
export function containsId<Id>(items: readonly TreeItem<Id>[], id: Id): boolean {
  return items.some((item) => item.id === id || (item.children !== undefined && containsId(item.children, id)))
}

/** The ids of the parents of `id`, outermost first. Empty if it isn't in the tree. */
export function ancestorsOf<Id>(items: readonly TreeItem<Id>[], id: Id | null): Id[] {
  if (id === null) return []
  for (const item of items) {
    if (item.id === id) return []
    if (item.children !== undefined) {
      if (item.children.some((child) => child.id === id)) return [item.id]
      const nested = ancestorsOf(item.children, id)
      if (nested.length > 0) return [item.id, ...nested]
    }
  }
  return []
}
