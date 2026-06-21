"use client"

import * as React from "react"
import { Search, Tag, Plus, ChevronLeft, Info, CheckCircle2, X, FolderTree, Layers, ArrowLeftRight, MousePointer2 } from "lucide-react"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useCategories } from "@/src/features/categories/hooks/useCategories"
import { categoriesToTree } from "@/src/features/categories/utils/categoriesToTree"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { CategoryNode, CategoryIconKey } from "@/lib/lab-catalog-types"
import { CategoryTree } from "@/components/categories/category-tree"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { useCategoryActions } from "@/src/features/categories/hooks/useCategoryActions"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { findCategoryNode, flattenCategories } from "@/lib/lab-catalog-helpers"
import { getCategoryIcon } from "@/components/categories/category-icons"

interface AdvancedCategoryPickerProps {
  nodes: CategoryNode[]
  value: string
  onChange: (categoryId: string) => void
  className?: string
  /** نسخة مضغوطة للحالات مثل صف الفلاتر */
  compact?: boolean
}

/** تصفية الشجرة بناءً على نص البحث */
function filterTreeByQuery(nodes: CategoryNode[], q: string): CategoryNode[] {
  const s = q.trim().toLowerCase()
  if (!s) return nodes
  const walk = (list: CategoryNode[]): CategoryNode[] => {
    const result: CategoryNode[] = []
    for (const n of list) {
      const sub = n.children?.length ? walk(n.children) : []
      const selfMatch = n.name.toLowerCase().includes(s)
      if (selfMatch) {
        result.push({ ...n, children: n.children })
      } else if (sub.length) {
        result.push({ ...n, children: sub })
      }
    }
    return result
  }
  return walk(nodes)
}

/** الحصول على المسار الهرمي للتصنيف (خبز المسار) */
function getCategoryBreadcrumbs(nodes: CategoryNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const currentPath = [...path, node.name]
    if (node.id === targetId) {
      return currentPath
    }
    if (node.children?.length) {
      const foundPath = getCategoryBreadcrumbs(node.children, targetId, currentPath)
      if (foundPath) return foundPath
    }
  }
  return null
}

/** حساب إجمالي عدد الأصناف في الشجرة (بما في ذلك الأصناف الفرعية) */
function countAllNodes(nodes: CategoryNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1 // الصنف الحالي
    if (node.children?.length) {
      count += countAllNodes(node.children) // الأصناف الفرعية
    }
  }
  return count
}

export function AdvancedCategoryPicker({
  nodes,
  value,
  onChange,
  className,
  compact = false,
}: AdvancedCategoryPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 400)
  const [isAddingCategory, setIsAddingCategory] = React.useState(false)
  const [parentForAdd, setParentForAdd] = React.useState<string | null>(null)
  
  const { createCategory } = useCategoryActions()

  // البحث على مستوى الخادم
  const { categories: searchResults, isLoading: isSearching } = useCategories({
    page: 1,
    search: debouncedSearch,
    filters: { is_active: true },
    dateRange: null,
  })

  // الصنف المختار حالياً لعرضه في الزر
  const selectedNode = React.useMemo(() => {
    if (!value) return null
    return findCategoryNode(nodes, value)
  }, [nodes, value])

  const selectedPath = React.useMemo(() => {
    if (!value) return ""
    const pathArr = getCategoryBreadcrumbs(nodes, value)
    return pathArr ? pathArr.join(" / ") : ""
  }, [nodes, value])

  const displayNodes = React.useMemo(() => {
    if (!debouncedSearch.trim()) return nodes
    return categoriesToTree(searchResults)
  }, [nodes, searchResults, debouncedSearch])

  const handleSelect = (category: CategoryNode) => {
    onChange(category.id)
    setOpen(false)
    // toast.success("تم اختيار التصنيف", {
    //   description: `تم اختيار "${category.name}" بنجاح`,
    //   icon: <CheckCircle2 className="size-5 text-emerald-500" />
    // })
  }

  const handleOpenAdd = (parentId?: string) => {
    setParentForAdd(parentId ?? null)
    setIsAddingCategory(true)
  }

  const handleCreateCategory = async (payload: { name: string; iconKey: CategoryIconKey; isActive: boolean }) => {
    try {
      const newCat = await createCategory({
        name: payload.name,
        icon_name: payload.iconKey === "default" ? null : payload.iconKey,
        is_active: payload.isActive,
        parent_id: parentForAdd ? Number(parentForAdd) : null
      })
      
      if (newCat) {
        setIsAddingCategory(false)
        // عند إضافة صنف جديد، نقوم باختياره تلقائياً
        handleSelect({
          id: String(newCat.id),
          name: newCat.name,
          iconKey: newCat.icon_key ?? "default",
          is_active: newCat.is_active,
        })
      }
    } catch (error) {
      // الخطأ يتم معالجته في useCategoryActions
    }
  }

  const totalNodesCount = React.useMemo(() => countAllNodes(nodes), [nodes])

  const SelectedIcon = selectedNode ? getCategoryIcon(selectedNode.iconKey) : Tag

  return (
    <div className={cn("space-y-3 ", className)} dir="rtl">
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className={cn(
            "group relative flex w-full items-center justify-between overflow-hidden transition-all duration-300",
            compact
              ? "h-10 rounded-xl border px-3"
              : "h-16 rounded-2xl border-2 px-4",
            "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.99]",
            selectedNode ? "border-primary/20 bg-primary/5" : "border-dashed border-muted-foreground/20"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center transition-all duration-300 group-hover:scale-110",
              compact ? "size-7 rounded-lg" : "size-10 rounded-xl",
              selectedNode ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <SelectedIcon className={cn(compact ? "size-4" : "size-5")} />
            </div>
            <div className="flex flex-col items-start gap-0.5 text-right">
              {!compact ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">تصنيف الفحص</span>
              ) : null}
              <span className={cn(
                "font-bold tracking-tight transition-colors",
                compact ? "text-sm" : "text-base",
                selectedNode ? "text-foreground" : "text-muted-foreground"
              )}>
                {selectedNode ? selectedNode.name : compact ? "كل التصنيفات" : "اضغط لاختيار صنف"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary">
            {!compact ? (
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-[10px] font-medium opacity-0 transition-all translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">فتح الشجرة</span>
              <span className="text-xs font-bold">تغيير</span>
            </div>
            ) : null}
            <ArrowLeftRight className={cn("transition-transform group-hover:rotate-180", compact ? "size-3.5" : "size-4")} />
          </div>
        </Button>

        <AnimatePresence>
          {selectedPath && !compact && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-2"
            >
              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[13px] font-medium text-muted-foreground">
                المسار الحالي: <span className="text-primary font-bold">{selectedPath}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="flex max-h-[92vh] w-[98vw] max-w-[1200px] flex-col gap-0 overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl sm:max-w-[90vw] lg:max-w-[700px] xl:max-w-[800px]"
          dir="rtl"
        >
          {/* ترويسة أنيقة مستوحاة من إضافة مريض */}
          <div className="relative z-10 shrink-0 border-b border-border/40 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-6 pt-8 backdrop-blur-md sm:px-10">
            <DialogHeader className="flex flex-row items-start justify-between gap-6 space-y-0 text-right">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner"
                >
                  <FolderTree className="size-7" />
                </motion.div>
                <div className="flex flex-col gap-1.5">
                  <DialogTitle className="text-2xl font-black tracking-tight text-foreground sm:text-2xl text-right ">
                    هيكلية الأصناف
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-base text-right">
                    قم بإدارة واختيار التصنيف المناسب، أو أضف تصنيفات فرعية جديدة لبناء شجرة فحوصات منظمة
                  </DialogDescription>
                </div>
              </div>
              
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={() => handleOpenAdd()}
                className="hidden h-12 gap-2 rounded-2xl px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 sm:flex"
              >
                <Plus className="size-5" />
                <span>تصنيف رئيسي جديد</span>
              </Button>
            </DialogHeader>

            <div className="mt-8 relative group">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-5 text-muted-foreground transition-colors group-focus-within:text-primary">
                {isSearching ? <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Search className="size-5" />}
              </div>
              <Input
                placeholder="ابحث عن تصنيف بالاسم (البحث ذكي وعلى مستوى الخادم)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-border/60 bg-muted/30 ps-14 text-lg font-medium transition-all focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 shadow-sm"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 end-0 flex items-center pe-5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto bg-muted/5 px-4 py-8 sm:px-10">
            {isSearching ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-background p-4">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[40%]" />
                      <Skeleton className="h-3 w-[20%]" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : displayNodes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-80 flex-col items-center justify-center gap-6 text-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-primary/5 animate-ping" />
                  <div className="relative flex size-20 items-center justify-center rounded-[2rem] bg-background text-muted-foreground/30 shadow-xl ring-1 ring-border">
                    <Layers className="size-10" />
                  </div>
                </div>
                <div className="space-y-2 max-w-xs">
                  <p className="text-xl font-black text-foreground">لم نجد أي نتائج</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    لا يوجد تصنيف بهذا الاسم حالياً. يمكنك مسح البحث أو إضافة هذا التصنيف كصنف جديد.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSearch("")}
                    className="rounded-xl px-6 font-bold h-11"
                  >
                    مسح البحث
                  </Button>
                  <Button 
                    onClick={() => handleOpenAdd()}
                    className="rounded-xl px-6 font-bold h-11"
                  >
                    إضافة كصنف جديد
                  </Button>
                </div>
              </motion.div>
            ) : (
              <TooltipProvider delayDuration={400}>
                <div className="space-y-2 pb-6">
                  <CategoryTree
                    categories={displayNodes}
                    selectedId={value}
                    onSelect={handleSelect}
                    onAdd={handleOpenAdd}
                    readOnly={false}
                    countMode="tests"
                    className="border-none p-0 bg-transparent"
                  />
                </div>
              </TooltipProvider>
            )}
          </div>
          
          <div className="shrink-0 border-t border-border/40 bg-background/80 px-6 py-6 backdrop-blur-md sm:px-10">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-1.5 text-primary">
                  <MousePointer2 className="size-4" />
                  <span className="text-xs font-bold">اختر لتأكيد الصنف</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <p className="text-[13px] font-medium text-muted-foreground">
                  إجمالي الأصناف المتاحة: <span className="text-foreground font-bold">{totalNodesCount}</span>
                </p>
              </div>
              <div className="flex w-full gap-3 sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl font-bold h-11 sm:w-32"
                >
                  إلغاء
                </Button>
                <Button
                  variant="default"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl font-black h-11 shadow-lg shadow-primary/10 sm:w-40"
                >
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CategoryFormDialog
        open={isAddingCategory}
        onOpenChange={setIsAddingCategory}
        mode="add"
        parentForAdd={parentForAdd}
        editingCategory={null}
        onSubmit={handleCreateCategory}
      />
    </div>
  )
}
