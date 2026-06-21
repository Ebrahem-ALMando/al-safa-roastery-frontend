"use client"

import * as React from "react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { CategoryNode, LabTest } from "@/lib/lab-catalog-types"
import { initialCategoryTree, initialTests } from "@/lib/lab-catalog-initial"
import {
  collectDescendantIds,
  findCategoryNode,
} from "@/lib/lab-catalog-helpers"
import {
  addChildCategory,
  removeCategoryNode,
  renameCategory,
  reorderSibling,
} from "@/lib/lab-catalog-tree-mutations"

interface LabCatalogContextValue {
  categoryTree: CategoryNode[]
  tests: LabTest[]
  addCategory: (
    parentId: string | null,
    name: string,
    iconKey?: string
  ) => void
  updateCategory: (id: string, name: string, iconKey?: string) => void
  deleteCategory: (id: string) => void
  reorderCategory: (
    parentId: string | null,
    fromIndex: number,
    toIndex: number
  ) => void
  addTest: (test: Omit<LabTest, "id">) => void
  updateTest: (id: string, patch: Partial<LabTest>) => void
  deleteTest: (id: string) => void
}

const LabCatalogContext = React.createContext<LabCatalogContextValue | null>(
  null
)

export function LabCatalogProvider({ children }: { children: React.ReactNode }) {
  const [categoryTree, setCategoryTree] =
    React.useState<CategoryNode[]>(initialCategoryTree)
  const [tests, setTests] = React.useState<LabTest[]>(initialTests)

  const addCategory = React.useCallback(
    (parentId: string | null, name: string, iconKey?: string) => {
      const trimmed = name.trim()
      if (!trimmed) {
        toast.error("أدخل اسم التصنيف")
        return
      }
      setCategoryTree((t) => addChildCategory(t, parentId, trimmed, iconKey))
      toast.success("تمت إضافة التصنيف")
    },
    []
  )

  const updateCategory = React.useCallback((id: string, name: string, iconKey?: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setCategoryTree((t) => renameCategory(t, id, trimmed, iconKey))
    toast.success("تم حفظ التصنيف")
  }, [])

  const deleteCategory = React.useCallback(
    (id: string) => {
      const node = findCategoryNode(categoryTree, id)
      if (!node) return
      if (node.children?.length) {
        toast.error("لا يمكن الحذف: يوجد تصنيفات فرعية")
        return
      }
      const desc = collectDescendantIds(node)
      const hasTests = tests.some((te) => desc.includes(te.categoryId))
      if (hasTests) {
        toast.error("لا يمكن الحذف: توجد فحوصات مرتبطة بهذا التصنيف")
        return
      }
      setCategoryTree((t) => removeCategoryNode(t, id))
      toast.success("تم حذف التصنيف")
    },
    [categoryTree, tests]
  )

  const reorderCategory = React.useCallback(
    (parentId: string | null, fromIndex: number, toIndex: number) => {
      setCategoryTree((t) => reorderSibling(t, parentId, fromIndex, toIndex))
    },
    []
  )

  const addTest = React.useCallback((test: Omit<LabTest, "id">) => {
    setTests((prev) => [
      ...prev,
      { ...test, id: `t-${Date.now().toString(36)}` },
    ])
    toast.success("تمت إضافة الفحص")
  }, [])

  const updateTest = React.useCallback((id: string, patch: Partial<LabTest>) => {
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    )
    toast.success("تم حفظ الفحص")
  }, [])

  const deleteTest = React.useCallback((id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id))
    toast.success("تم حذف الفحص")
  }, [])

  const value = React.useMemo(
    () => ({
      categoryTree,
      tests,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategory,
      addTest,
      updateTest,
      deleteTest,
    }),
    [
      categoryTree,
      tests,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategory,
      addTest,
      updateTest,
      deleteTest,
    ]
  )

  return (
    <LabCatalogContext.Provider value={value}>
      {children}
    </LabCatalogContext.Provider>
  )
}

export function useLabCatalog() {
  const ctx = React.useContext(LabCatalogContext)
  if (!ctx) {
    throw new Error("useLabCatalog must be used within LabCatalogProvider")
  }
  return ctx
}
