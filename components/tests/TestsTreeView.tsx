"use client"

import { useMemo, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Info,
  LayoutGrid,
  LayoutList,
  List,
  MoreHorizontal,
  Plus,
  Search,
  TestTubes,
  Trash2,
} from "lucide-react"
import { CategoryTree } from "@/components/categories/category-tree"
import { TestCard } from "@/components/cards/test-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCategoriesTree } from "@/features/categories"
import type { Test, TestsListMeta, TestsTreeInnerView } from "@/features/tests"
import {
  cloneCategoryTree,
  filterCategoryIdsForSelection,
  withCounts,
} from "@/lib/lab-catalog-helpers"
import type { CategoryNode, LabTest } from "@/lib/lab-catalog-types"
import {
  firstFieldRef,
  firstFieldUnit,
  groupTestsByCategoryBreadcrumb,
  allPriceLabels,
  getTestIcon,
  toTestCardData,
} from "./tests-helpers"
import { cn } from "@/lib/utils"

const MotionTr = motion("tr")

interface TestsTreeViewProps {
  tests: Test[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  onAddTest: () => void
  onAddTestInCategory: (categoryId: string) => void
  onViewDetails: (test: Test) => void
  onEdit: (test: Test) => void
  onDelete: (test: Test) => void
  meta?: TestsListMeta
  currentPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  treeInnerView: TestsTreeInnerView
  onTreeInnerViewChange: (v: TestsTreeInnerView) => void
  /** محتوى اختياري بجانب العنوان (مثل أزرار إضافية) — مثل `sharedHeaderActions` */
  headerActions?: ReactNode
}

function testsToLabRefs(tests: Test[]): LabTest[] {
  return tests.map(
    (t) =>
      ({
        categoryId: String(t.category_id),
      }) as LabTest
  )
}

function countTreeNodes(nodes: CategoryNode[]): number {
  let count = 0
  for (const n of nodes) {
    count += 1
    if (n.children?.length) count += countTreeNodes(n.children)
  }
  return count
}

function filterByQuery(tests: Test[], q: string): Test[] {
  const s = q.trim().toLowerCase()
  if (!s) return tests
  return tests.filter(
    (t) =>
      t.name.toLowerCase().includes(s) ||
      t.code.toLowerCase().includes(s) ||
      (t.notes?.toLowerCase().includes(s) ?? false)
  )
}

function PriceBadges({ test }: { test: Test }) {
  const labels = allPriceLabels(test.prices)
  if (!labels.length) return <Badge variant="outline" className="text-[11px]">—</Badge>
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {labels.slice(0, 2).map((price) => (
        <Badge key={`${test.id}-${price}`} variant="secondary" className="text-[11px] font-mono" dir="ltr">
          {price}
        </Badge>
      ))}
      {labels.length > 2 ? (
        <Badge variant="outline" className="text-[11px]">+{labels.length - 2}</Badge>
      ) : null}
    </div>
  )
}

export function TestsTreeView({
  tests,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  onAddTest,
  onAddTestInCategory: _onAddTestInCategory,
  onViewDetails,
  onEdit,
  onDelete,
  meta,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
  treeInnerView,
  onTreeInnerViewChange,
  headerActions,
}: TestsTreeViewProps) {
  void _onAddTestInCategory
  const { categoryTree, isLoading: treeLoading } = useCategoriesTree(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">("all")
  const [localQuery, setLocalQuery] = useState("")

  const labLike = useMemo(() => testsToLabRefs(tests), [tests])

  const treeWithTestCounts = useMemo((): CategoryNode[] => {
    if (!categoryTree.length) return []
    return withCounts(cloneCategoryTree(categoryTree), labLike)
  }, [categoryTree, labLike])

  const visibleTests = useMemo(() => {
    if (selectedCategoryId === "all") return tests
    const inSubtree = filterCategoryIdsForSelection(categoryTree, selectedCategoryId)
    if (!inSubtree) return tests
    return tests.filter((t) => inSubtree.has(String(t.category_id)))
  }, [tests, selectedCategoryId, categoryTree])

  const displayTests = useMemo(
    () => filterByQuery(visibleTests, localQuery),
    [visibleTests, localQuery]
  )

  const groupedTree = useMemo(
    () => groupTestsByCategoryBreadcrumb(displayTests, treeWithTestCounts),
    [displayTests, treeWithTestCounts]
  )
  const treeNodesCount = useMemo(() => countTreeNodes(treeWithTestCounts), [treeWithTestCounts])

  if (isLoading) {
    return (
      <div className="p-4" dir="rtl" lang="ar">
        <div className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_1fr]">
          <div className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="min-w-0">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isFilteredNoHits) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground" dir="rtl">
        لم يتم العثور على نتائج
      </div>
    )
  }

  if (isTrueEmpty) {
    return (
      <Empty className="min-h-[280px] border-0" dir="rtl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TestTubes />
          </EmptyMedia>
          <EmptyTitle>لا توجد فحوصات</EmptyTitle>
          <EmptyDescription>أضف فحصاً جديداً من الزر أعلاه</EmptyDescription>
        </EmptyHeader>
        <Button className="rounded-xl" onClick={onAddTest}>
          إضافة فحص
        </Button>
      </Empty>
    )
  }

  return (
    <div className="min-w-0" dir="rtl" lang="ar">
      <div className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3 lg:sticky lg:top-0 lg:self-start"
        >
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="border-b bg-muted/15 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <LayoutList className="size-4 text-primary" />
                التنقل السريع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <Badge variant="outline" className="text-[11px]">
                  التصنيفات: {treeNodesCount}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  الفحوصات: {tests.length}
                </Badge>
              </div>
              <Button
                type="button"
                variant={selectedCategoryId === "all" ? "secondary" : "outline"}
                size="sm"
                className="w-full justify-center rounded-xl"
                onClick={() => setSelectedCategoryId("all")}
              >
                جميع التصنيفات
              </Button>
              {treeLoading && !treeWithTestCounts.length ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[min(55vh,420px)] pe-2">
                  <CategoryTree
                    categories={treeWithTestCounts}
                    selectedId={selectedCategoryId === "all" ? undefined : selectedCategoryId}
                    onSelect={(c) => setSelectedCategoryId(c.id)}
                    onReorderSibling={() => {}}
                    enableDragReorder
                    readOnly
                    countMode="tests"
                  />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.aside>

        <div className="min-w-0 space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <TestTubes className="size-5 shrink-0 text-primary" />
                    <span className="truncate">الفحوصات ({displayTests.length})</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
                    <span className="px-2 text-xs text-muted-foreground">عرض مجمّع:</span>
                    <Button
                      type="button"
                      variant={treeInnerView === "table" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg"
                      onClick={() => onTreeInnerViewChange("table")}
                    >
                      <List className="size-3.5" />
                      جدول
                    </Button>
                    <Button
                      type="button"
                      variant={treeInnerView === "cards" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg"
                      onClick={() => onTreeInnerViewChange("cards")}
                    >
                      <LayoutGrid className="size-3.5" />
                      بطاقات
                    </Button>
                  </div>
                </div>
                {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
              </div>
              <div className="relative pt-1">
                <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder="بحث بالاسم أو الرمز…"
                  className="h-9 rounded-lg bg-background pr-9 text-sm"
                  dir="rtl"
                />
                {localQuery.trim() ? (
                  <button
                    type="button"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
                    onClick={() => setLocalQuery("")}
                    aria-label="مسح البحث"
                  >
                    <Plus className="size-3.5 rotate-45" />
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant="outline" className="text-xs">
                  مجموعات مصنفة: {groupedTree.length}
                </Badge>
                {selectedCategoryId !== "all" ? (
                  <Badge variant="secondary" className="text-xs">تمت تصفية الشجرة</Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant="outline" className="text-xs">
                  مجموعات مصنفة: {groupedTree.length}
                </Badge>
                {selectedCategoryId !== "all" ? (
                  <Badge variant="secondary" className="text-xs">
                    تصنيف محدد
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    كل التصنيفات
                  </Badge>
                )}
                {selectedCategoryId !== "all" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-lg px-2 text-xs"
                    onClick={() => setSelectedCategoryId("all")}
                  >
                    إلغاء التصفية
                  </Button>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Info className="size-3.5" />
                تظهر النتائج حسب التصنيف المحدد وبحث الاسم/الرمز
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {displayTests.length === 0 ? (
                <Empty className="min-h-[280px] border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <TestTubes />
                    </EmptyMedia>
                    <EmptyTitle>لا توجد فحوصات</EmptyTitle>
                    <EmptyDescription>
                      غيّر البحث أو التصنيف، أو أضف فحصاً جديداً
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button className="rounded-xl" onClick={onAddTest} type="button">
                    <Plus className="ms-2 size-4" />
                    إضافة فحص
                  </Button>
                </Empty>
              ) : (
                <AnimatePresence mode="wait">
                  {treeInnerView === "table" ? (
                    <motion.div
                      key="tree-table"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      {groupedTree.map((group, gi) => (
                        <div key={group.label} className="space-y-2">
                          <div className="flex items-center gap-2 px-4 pt-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {group.label}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                            <Badge variant="secondary" className="tabular-nums">
                              {group.items.length}
                            </Badge>
                          </div>
                          <div className="overflow-x-auto px-2 pb-2">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="min-w-[180px] text-start">الفحص</TableHead>
                                  <TableHead className="whitespace-nowrap text-start">وحدة</TableHead>
                                  <TableHead className="whitespace-nowrap text-start">المعدل</TableHead>
                                  <TableHead className="whitespace-nowrap text-start">السعر</TableHead>
                                  <TableHead className="whitespace-nowrap text-start">الحالة</TableHead>
                                  <TableHead className="w-[70px] text-start" />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.items.map((test, index) => (
                                  <MotionTr
                                    key={test.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: gi * 0.03 + index * 0.02 }}
                                    className="border-b transition-colors hover:bg-muted/50"
                                  >
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                          {(() => {
                                            const Icon = getTestIcon(test.icon_name)
                                            return <Icon className="size-4" />
                                          })()}
                                        </span>
                                        <div>
                                        <p className="font-medium">{test.name}</p>
                                        <p className="font-mono text-xs text-muted-foreground text-right" dir="ltr">
                                          {test.code}
                                        </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                      {firstFieldUnit(test)}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                      {firstFieldRef(test.fields?.[0])}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap font-medium text-right">
                                      <PriceBadges test={test} />
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "font-medium",
                                          test.is_active
                                            ? "border-success/20 bg-success/10 text-success"
                                            : "bg-muted text-muted-foreground"
                                        )}
                                      >
                                        {test.is_active ? "نشط" : "غير نشط"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="rounded-lg"
                                          >
                                            <MoreHorizontal className="size-4" />
                                            <span className="sr-only">قائمة</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                          <DropdownMenuItem
                                            className="cursor-pointer gap-2"
                                            onClick={() => onViewDetails(test)}
                                          >
                                            <Eye className="size-4" />
                                            عرض التفاصيل
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="cursor-pointer gap-2"
                                            onClick={() => onEdit(test)}
                                          >
                                            <Edit className="size-4" />
                                            تعديل
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                                            onClick={() => onDelete(test)}
                                          >
                                            <Trash2 className="size-4" />
                                            حذف
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </MotionTr>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tree-cards"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8 p-4"
                    >
                      {groupedTree.map((group) => (
                        <div key={group.label} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{group.label}</span>
                            <Badge variant="outline" className="tabular-nums">
                              {group.items.length}
                            </Badge>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {group.items.map((test, index) => (
                              <TestCard
                                key={test.id}
                                test={toTestCardData(test)}
                                index={index}
                                onViewDetails={() => onViewDetails(test)}
                                onEdit={() => onEdit(test)}
                                onDelete={() => onDelete(test)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-0 py-3 sm:flex-row sm:items-center">
          <p className="text-center text-sm text-muted-foreground sm:text-start" dir="ltr">
            {meta.total} — صفحة {currentPage} من {meta.last_page}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!canPrev}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!canNext}
              onClick={() => onPageChange(currentPage + 1)}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
