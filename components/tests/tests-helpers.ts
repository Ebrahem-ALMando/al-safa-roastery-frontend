import type { Test, TestField, TestPrice } from "@/features/tests"
import { formatCatalogFieldReferenceCompact } from "@/lib/reference-range-format"
import { getCategoryBreadcrumb } from "@/lib/lab-catalog-helpers"
import type { CategoryNode } from "@/lib/lab-catalog-types"
import { getCategoryIcon } from "@/components/categories/category-icons"
import { TestTubes } from "lucide-react"

export function firstPriceLabel(prices: TestPrice[] | undefined): string {
  if (!prices?.length) return "—"
  const p = prices[0]
  return `${p.amount} ${p.currency_code}`
}

export function allPriceLabels(prices: TestPrice[] | undefined): string[] {
  if (!prices?.length) return []
  return prices.map((p) => `${p.amount} ${p.currency_code}`)
}

export function getTestIcon(iconName?: string | null) {
  if (!iconName) return TestTubes
  return getCategoryIcon(iconName) ?? TestTubes
}

export function fieldsCount(fields: TestField[] | undefined): number {
  return fields?.length ?? 0
}

export function firstFieldRef(field: TestField | undefined): string {
  if (!field) return "—"
  return formatCatalogFieldReferenceCompact(field)
}

export function firstFieldUnit(test: Test): string {
  return test.fields?.[0]?.unit?.trim() || "—"
}

export function toTestCardData(test: Test) {
  const f = test.fields?.[0]
  const resultType: "number" | "select" | "text" =
    f == null
      ? "number"
      : f.field_type === "select"
        ? "select"
        : f.field_type === "text"
          ? "text"
          : "number"
  return {
    id: String(test.id),
    name: test.name,
    code: test.code,
    category: test.category?.name ?? "—",
    icon: getTestIcon(test.icon_name),
    prices: allPriceLabels(test.prices),
    price: test.prices?.[0]?.amount ?? 0,
    unit: firstFieldUnit(test),
    referenceRange: firstFieldRef(f),
    resultType,
    isActive: test.is_active,
  }
}

export function groupTestsByCategoryName(tests: Test[]): { label: string; items: Test[] }[] {
  const map = new Map<string, Test[]>()
  for (const t of tests) {
    const label = t.category?.name ?? "بدون تصنيف"
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(t)
  }
  return Array.from(map.entries())
    .map(([label, items]) => ({ label, items }))
    .sort((a, b) => a.label.localeCompare(b.label, "ar"))
}

/** تجميع حسب المسار الكامل في الشجرة (مثل: أ > ب > ج) */
export function groupTestsByCategoryBreadcrumb(
  tests: Test[],
  categoryTree: CategoryNode[]
): { label: string; items: Test[] }[] {
  const map = new Map<string, Test[]>()
  for (const t of tests) {
    const path =
      getCategoryBreadcrumb(categoryTree, String(t.category_id)) ||
      t.category?.name ||
      "بدون تصنيف"
    if (!map.has(path)) map.set(path, [])
    map.get(path)!.push(t)
  }
  return Array.from(map.entries())
    .map(([label, items]) => ({ label, items }))
    .sort((a, b) => a.label.localeCompare(b.label, "ar"))
}
