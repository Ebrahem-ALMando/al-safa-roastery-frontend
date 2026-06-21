"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, FolderTree, MousePointerClick, Plus, Settings2, Table2 } from "lucide-react"
import { DashboardPageHeader, OperationalDateScopeControls } from "@/components/dashboard"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { CategoryTableView } from "@/components/categories/category-table-view"
import { CategoryTree } from "@/components/categories/category-tree"
import { CategoriesFilters } from "@/components/categories/categories-filters"
import { CategoriesSummary } from "@/components/categories/categories-summary"
import { CategoriesViewToggle } from "@/components/categories/categories-view-toggle"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { findCategoryNode } from "@/lib/lab-catalog-helpers"
import type { CategoryNode, CategoryIconKey } from "@/lib/lab-catalog-types"
import { useCategoriesPage, useCategoryActions, type Category } from "@/features/categories"

function toCategoryTree(categories: Category[]): CategoryNode[] {
  const nodeById = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const category of categories) {
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

  for (const category of categories) {
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

  const sortByOrder = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => Number(a.id) - Number(b.id))
    nodes.forEach((node) => {
      if (node.children?.length) sortByOrder(node.children)
    })
  }
  sortByOrder(roots)

  return roots
}

function collectDescendants(nodes: CategoryNode[], id: string): Set<string> {
  const map = new Map<string, CategoryNode>()
  const walk = (list: CategoryNode[]) => {
    for (const item of list) {
      map.set(item.id, item)
      if (item.children?.length) walk(item.children)
    }
  }
  walk(nodes)
  const root = map.get(id)
  const result = new Set<string>()
  if (!root) return result
  const queue = [...(root.children ?? [])]
  while (queue.length) {
    const node = queue.shift()!
    result.add(node.id)
    if (node.children?.length) queue.push(...node.children)
  }
  return result
}

export function CategoriesView() {
  const {
    dateScopePreset,
    setDateScopePreset,
    search,
    setSearch,
    isActive,
    setIsActive,
    categoryType,
    setCategoryType,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    categories,
    isLoading,
    error,
    mutate,
    currentPage,
    lastPage,
    canPrev,
    canNext,
    setPage,
    meta,
  } = useCategoriesPage()

  const { createCategory, updateCategory, deleteCategory } = useCategoryActions()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add")
  const [parentForAdd, setParentForAdd] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryNode | null>(null)
  const [restructureMode, setRestructureMode] = React.useState(false)
  const [isDraggingNode, setIsDraggingNode] = React.useState(false)
  const [restructureCursorPos, setRestructureCursorPos] = React.useState<{ x: number; y: number } | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const treeWithCounts = React.useMemo(() => toCategoryTree(categories), [categories])

  const editingCategory = React.useMemo(() => {
    if (!editingId) return null
    return findCategoryNode(treeWithCounts, editingId) ?? null
  }, [treeWithCounts, editingId])

  const openAdd = (parentId?: string) => {
    setDialogMode("add")
    setParentForAdd(parentId ?? null)
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (cat: CategoryNode) => {
    setDialogMode("edit")
    setEditingId(cat.id)
    setParentForAdd(null)
    setDialogOpen(true)
  }

  const handleCategorySubmit = async (payload: { name: string; iconKey: CategoryIconKey; isActive: boolean }) => {
    if (dialogMode === "add") {
      await createCategory({
        name: payload.name,
        icon_name: payload.iconKey === "default" ? null : payload.iconKey,
        parent_id: parentForAdd ? Number(parentForAdd) : null,
        is_active: payload.isActive,
      })
    } else if (editingId) {
      await updateCategory(Number(editingId), {
        name: payload.name,
        icon_name: payload.iconKey === "default" ? null : payload.iconKey,
        is_active: payload.isActive,
      })
    }
    void mutate()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(Number(deleteTarget.id))
      setDeleteTarget(null)
      void mutate()
    } finally {
      setDeleting(false)
    }
  }

  const handleMoveAsChild = React.useCallback(
    async (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return
      const descendants = collectDescendants(treeWithCounts, sourceId)
      if (descendants.has(targetId)) return
      await updateCategory(Number(sourceId), { parent_id: Number(targetId) })
      void mutate()
    },
    [treeWithCounts, updateCategory, mutate]
  )

  const handleMoveToRoot = React.useCallback(
    async (sourceId: string) => {
      await updateCategory(Number(sourceId), { parent_id: null })
      void mutate()
    },
    [updateCategory, mutate]
  )

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            تصنيفات الفحوصات
            /
            <p className="text-md text-muted-foreground">إدارة تصنيفات الفحوصات</p>
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>إعادة تنظيم التصنيفات</span>
            <Switch checked={restructureMode} onCheckedChange={setRestructureMode} />
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary">
              <MousePointerClick className="h-3.5 w-3.5" />
              {restructureMode ? "فعال" : "معطل"}
            </span>
          </div>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <OperationalDateScopeControls preset={dateScopePreset} onPresetChange={setDateScopePreset} />
          <Button className="gap-2 rounded-xl" onClick={() => openAdd()}>
            <Plus className="h-4 w-4" />
            إضافة تصنيف
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings2 className="h-4 w-4" />
                تخصيص الصفحة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>خيارات العرض</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={config.showKPI}
                onCheckedChange={(checked) => toggleShowKPI(Boolean(checked))}
              >
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={config.showFilters}
                onCheckedChange={(checked) => toggleShowFilters(Boolean(checked))}
              >
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CategoriesViewToggle value={config.viewMode} onChange={setViewMode} />
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? (
        <CategoriesSummary categories={categories} meta={meta} isLoading={isLoading} />
      ) : null}

      {config.showFilters ? (
        <CategoriesFilters
          value={{ search, isActive, categoryType }}
          onChange={(next) => {
            setSearch(next.search)
            setIsActive(next.isActive)
            setCategoryType(next.categoryType)
          }}
          isLoading={isLoading}
        />
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onMouseMove={(event) => {
          if (!restructureMode) return
          setRestructureCursorPos({ x: event.clientX, y: event.clientY })
        }}
        onMouseLeave={() => {
          setRestructureCursorPos(null)
          setIsDraggingNode(false)
        }}
        className={restructureMode ? "**:cursor-none!" : undefined}
      >
        <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm">
          <div className="border-b bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {config.viewMode === "tree" ? (
                  <FolderTree className="size-5" />
                ) : (
                  <Table2 className="size-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {config.viewMode === "tree" ? "شجرة التصنيفات" : "جدول التصنيفات"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {config.viewMode === "tree"
                    ? "انقر للتوسيع، وانقر بالزر الأيمن للقائمة"
                    : "عرض مسطح لجميع التصنيفات مع المسار والمستوى والعدد"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-0">
            {error && !isLoading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">تعذر تحميل البيانات. حاول مرة أخرى.</p>
            ) : null}

            {isLoading ? (
              config.viewMode === "tree" ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`tree-sk-${i}`} className="flex items-center gap-2 rounded-xl border border-border/40 p-3">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <CategoryTableView
                    categories={[]}
                    onAdd={(parentId) => openAdd(parentId)}
                    onEdit={openEdit}
                    onDelete={(c) => setDeleteTarget(c)}
                    restructureMode={restructureMode}
                    onMoveAsChild={(sourceId, targetId) => {
                      void handleMoveAsChild(sourceId, targetId)
                    }}
                    onMoveToRoot={(sourceId) => {
                      void handleMoveToRoot(sourceId)
                    }}
                    onDragStateChange={setIsDraggingNode}
                    isLoading
                  />
                </div>
              )
            ) : treeWithCounts.length === 0 ? (
              <Empty className="min-h-[220px] border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderTree />
                  </EmptyMedia>
                  <EmptyTitle>لا توجد تصنيفات</EmptyTitle>
                  <EmptyDescription>أضف تصنيفاً رئيسياً للبدء في تنظيم الفحوصات</EmptyDescription>
                </EmptyHeader>
                <Button className="rounded-xl" onClick={() => openAdd()}>
                  <Plus className="size-4 ms-2" />
                  إضافة تصنيف
                </Button>
              </Empty>
            ) : config.viewMode === "tree" ? (
              <ScrollArea className="h-[min(70vh,520px)]">
                <div className="p-4">
                  {restructureMode ? (
                    <div
                      className="mb-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm text-primary"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = "move"
                      }}
                      onDrop={(e) => {
                        const sourceId = e.dataTransfer.getData("application/x-category-node-id")
                        if (!sourceId) return
                        void handleMoveToRoot(sourceId)
                      }}
                    >
                      اسحب التصنيف هنا لتحويله إلى تصنيف رئيسي
                    </div>
                  ) : null}
                  <CategoryTree
                    categories={treeWithCounts}
                    onAdd={(parentId) => openAdd(parentId)}
                    onEdit={openEdit}
                    onDelete={(c) => setDeleteTarget(c)}
                    restructureMode={restructureMode}
                    onMoveAsChild={(sourceId, targetId) => {
                      void handleMoveAsChild(sourceId, targetId)
                    }}
                    onDragStateChange={setIsDraggingNode}
                  />
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-[min(70vh,520px)]">
                <div className="p-2 sm:p-4">
                  <CategoryTableView
                    categories={treeWithCounts}
                    onAdd={(parentId) => openAdd(parentId)}
                    onEdit={openEdit}
                    onDelete={(c) => setDeleteTarget(c)}
                    restructureMode={restructureMode}
                    onMoveAsChild={(sourceId, targetId) => {
                      void handleMoveAsChild(sourceId, targetId)
                    }}
                    onMoveToRoot={(sourceId) => {
                      void handleMoveToRoot(sourceId)
                    }}
                    onDragStateChange={setIsDraggingNode}
                  />
                </div>
              </ScrollArea>
            )}

            {!isLoading && categories.length > 0 && meta != null && lastPage > 1 ? (
              <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
                <p className="text-center text-sm text-muted-foreground sm:text-start" dir="ltr">
                  {meta.total} — صفحة {currentPage} من {lastPage}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={!canPrev}
                  >
                    <ChevronRight className="size-4" />
                    السابق
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={!canNext}
                  >
                    التالي
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {restructureMode && !isDraggingNode && restructureCursorPos ? (
        <div
          className="pointer-events-none fixed z-9999 text-slate-700 dark:text-slate-300"
          style={{
            left: restructureCursorPos.x,
            top: restructureCursorPos.y,
            transform: "translate(2px, 2px)",
          }}
          aria-hidden
        >
          <MousePointerClick className="h-5 w-5" />
        </div>
      ) : null}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        parentForAdd={parentForAdd}
        editingCategory={editingCategory}
        onSubmit={handleCategorySubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!deleting && !o) setDeleteTarget(null)
        }}
        title="حذف التصنيف؟"
        description={
          deleteTarget
            ? `سيتم حذف «${deleteTarget.name}» فقط إذا لم يكن مرتبطاً بفحوصات أو تصنيفات فرعية.`
            : ""
        }
        onConfirm={() => {
          void confirmDelete()
        }}
        isLoading={deleting}
        loadingLabel="جار الحذف"
        icon={FolderTree}
      />
    </div>
  )
}
