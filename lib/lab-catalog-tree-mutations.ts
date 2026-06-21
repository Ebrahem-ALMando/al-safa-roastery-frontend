import type { CategoryNode } from "./lab-catalog-types"
import {
  cloneCategoryTree,
  findCategoryNode,
  newCategoryId,
} from "./lab-catalog-helpers"

export function addChildCategory(
  tree: CategoryNode[],
  parentId: string | null,
  name: string,
  iconKey?: string
): CategoryNode[] {
  const next = cloneCategoryTree(tree)
  const node: CategoryNode = {
    id: newCategoryId(),
    name,
    iconKey: iconKey ?? "default",
    children: undefined,
  }
  if (parentId === null) {
    return [...next, node]
  }
  const parent = findCategoryNode(next, parentId)
  if (!parent) return tree
  parent.children = [...(parent.children ?? []), node]
  return next
}

export function renameCategory(
  tree: CategoryNode[],
  id: string,
  name: string,
  iconKey?: string
): CategoryNode[] {
  const next = cloneCategoryTree(tree)
  const n = findCategoryNode(next, id)
  if (n) {
    n.name = name
    if (iconKey !== undefined) n.iconKey = iconKey
  }
  return next
}

export function removeCategoryNode(tree: CategoryNode[], id: string): CategoryNode[] {
  const filterOut = (nodes: CategoryNode[]): CategoryNode[] =>
    nodes
      .filter((n) => n.id !== id)
      .map((n) => ({
        ...n,
        children: n.children?.length ? filterOut(n.children) : undefined,
      }))
  return filterOut(cloneCategoryTree(tree))
}

/** Reorder among siblings with same parent (root if parentId null) */
export function reorderSibling(
  tree: CategoryNode[],
  parentId: string | null,
  fromIndex: number,
  toIndex: number
): CategoryNode[] {
  const next = cloneCategoryTree(tree)
  const list =
    parentId === null
      ? next
      : findCategoryNode(next, parentId)?.children
  if (!list || fromIndex === toIndex) return next
  const copy = [...list]
  const [moved] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, moved)
  list.length = 0
  list.push(...copy)
  return next
}
