import type { CategoryNode, LabTest } from "./lab-catalog-types"

/** Flatten tree depth-first for selects */
export function flattenCategories(
  nodes: CategoryNode[],
  depth = 0,
  prefix = ""
): { id: string; name: string; depth: number; label: string }[] {
  const out: { id: string; name: string; depth: number; label: string }[] = []
  for (const n of nodes) {
    const label = prefix ? `${prefix} › ${n.name}` : n.name
    out.push({ id: n.id, name: n.name, depth, label })
    if (n.children?.length) {
      out.push(...flattenCategories(n.children, depth + 1, label))
    }
  }
  return out
}

/** Flatten tree with node refs for table UI */
export function flattenCategoryRows(
  nodes: CategoryNode[],
  depth = 0,
  prefix = ""
): { node: CategoryNode; depth: number; label: string }[] {
  const out: { node: CategoryNode; depth: number; label: string }[] = []
  for (const n of nodes) {
    const label = prefix ? `${prefix} › ${n.name}` : n.name
    out.push({ node: n, depth, label })
    if (n.children?.length) {
      out.push(...flattenCategoryRows(n.children, depth + 1, label))
    }
  }
  return out
}

/** Collect this node id + all descendant ids */
export function collectDescendantIds(node: CategoryNode): string[] {
  const ids = [node.id]
  if (node.children?.length) {
    for (const c of node.children) {
      ids.push(...collectDescendantIds(c))
    }
  }
  return ids
}

/** Find node by id in tree */
export function findCategoryNode(
  nodes: CategoryNode[],
  id: string
): CategoryNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const f = findCategoryNode(n.children, id)
      if (f) return f
    }
  }
  return undefined
}

/** Ids to match when filtering by selected tree node (self + descendants) */
export function filterCategoryIdsForSelection(
  tree: CategoryNode[],
  selectedId: string | null
): Set<string> | null {
  if (!selectedId) return null
  const node = findCategoryNode(tree, selectedId)
  if (!node) return new Set([selectedId])
  return new Set(collectDescendantIds(node))
}

export function countTestsInSubtree(
  node: CategoryNode,
  tests: LabTest[]
): number {
  const ids = new Set(collectDescendantIds(node))
  return tests.filter((t) => ids.has(t.categoryId)).length
}

/** Annotate tree with test counts per node (subtree) */
export function withCounts(
  nodes: CategoryNode[],
  tests: LabTest[]
): CategoryNode[] {
  return nodes.map((n) => {
    const children = n.children?.length
      ? withCounts(n.children, tests)
      : undefined
    const base: CategoryNode = { ...n, children }
    const count = countTestsInSubtree(base, tests)
    return { ...base, count }
  })
}

/** Deep clone category tree */
export function cloneCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.map((n) => ({
    ...n,
    children: n.children?.length ? cloneCategoryTree(n.children) : undefined,
  }))
}

/** Generate unique id */
export function newCategoryId(): string {
  return `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function getCategoryLabel(
  nodes: CategoryNode[],
  categoryId: string
): string {
  const flat = flattenCategories(nodes)
  return flat.find((f) => f.id === categoryId)?.label ?? categoryId
}

/** مسار التصنيفات من الجذر إلى عقدة (أسماء مفصولة بـ « > ») */
export function getCategoryBreadcrumb(
  tree: CategoryNode[],
  categoryId: string | null
): string {
  if (!categoryId) return ""
  const path = findCategoryPathInternal(tree, categoryId, [])
  return path ? path.join(" > ") : ""
}

function findCategoryPathInternal(
  nodes: CategoryNode[],
  id: string,
  ancestors: string[]
): string[] | null {
  for (const n of nodes) {
    if (n.id === id) return [...ancestors, n.name]
    if (n.children?.length) {
      const f = findCategoryPathInternal(n.children, id, [...ancestors, n.name])
      if (f) return f
    }
  }
  return null
}
