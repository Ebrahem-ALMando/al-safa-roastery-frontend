import type { CategoryNode } from "@/lib/lab-catalog-types"
import type { Category } from "../types/category.types"

/** يبني شجرة تصنيفات للواجهات (مثل `CategoryTreePicker`) من قائمة مسطّحة من الـ API. */
export function categoriesToTree(categories: Category[]): CategoryNode[] {
  const sorted = [...categories].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return a.name.localeCompare(b.name, "ar")
  })

  const nodeById = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const category of sorted) {
    nodeById.set(String(category.id), {
      id: String(category.id),
      name: category.name,
      parent_id: category.parent_id,
      iconKey: category.icon_name || "default",
      is_active: category.is_active,
      count: category.count ?? 0,
      children_count: category.children_count ?? 0,
      children: [],
    })
  }

  for (const category of sorted) {
    const id = String(category.id)
    const node = nodeById.get(id)
    if (!node) continue

    if (category.parent_id == null) {
      roots.push(node)
      continue
    }

    const parent = nodeById.get(String(category.parent_id))
    if (!parent) {
      roots.push(node)
      continue
    }
    if (!parent.children) parent.children = []
    parent.children.push(node)
  }

  return roots
}
