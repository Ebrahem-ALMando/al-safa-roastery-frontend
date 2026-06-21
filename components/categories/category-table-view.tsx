"use client"

import * as React from "react"
import { CheckCircle2, Edit, Plus, Trash2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { flattenCategoryRows } from "@/lib/lab-catalog-helpers"
import type { CategoryNode } from "@/lib/lab-catalog-types"
import { getCategoryIcon } from "@/components/categories/category-icons"
import { cn } from "@/lib/utils"

interface CategoryTableViewProps {
  categories: CategoryNode[]
  onAdd: (parentId?: string) => void
  onEdit: (category: CategoryNode) => void
  onDelete: (category: CategoryNode) => void
  restructureMode?: boolean
  onMoveAsChild?: (sourceId: string, targetId: string) => void
  onMoveToRoot?: (sourceId: string) => void
  onDragStateChange?: (dragging: boolean) => void
  isLoading?: boolean
  className?: string
}

export function CategoryTableView({
  categories,
  onAdd,
  onEdit,
  onDelete,
  restructureMode = false,
  onMoveAsChild,
  onMoveToRoot,
  onDragStateChange,
  isLoading = false,
  className,
}: CategoryTableViewProps) {
  const rows = React.useMemo(
    () => flattenCategoryRows(categories),
    [categories]
  )
  const [hoveredDropId, setHoveredDropId] = React.useState<string | null>(null)

  return (
    <div className={cn("w-full", className)} dir="rtl">
      {restructureMode ? (
        <div
          className="mb-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm text-primary"
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
          }}
          onDrop={(e) => {
            const sourceId = e.dataTransfer.getData("application/x-category-node-id")
            if (!sourceId || !onMoveToRoot) return
            onMoveToRoot(sourceId)
          }}
        >
          اسحب التصنيف هنا لتحويله إلى تصنيف رئيسي
        </div>
      ) : null}
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center font-semibold">#</TableHead>
            <TableHead className="min-w-[200px] text-start font-semibold">
              التصنيف
            </TableHead>
            <TableHead className="w-28 text-center font-semibold">الحالة</TableHead>
            <TableHead className="hidden text-start font-semibold sm:table-cell">
              المسار
            </TableHead>
            <TableHead className="w-24 text-center font-semibold">المستوى</TableHead>
            <TableHead className="w-24 text-center font-semibold">عدد التحاليل</TableHead>
            <TableHead className="w-28 text-center font-semibold">عدد الأفرع </TableHead>
            <TableHead className="w-[140px] text-center font-semibold">
              إجراءات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={`category-table-sk-${i}`}>
                <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                <TableCell><div className="flex items-center gap-2"><Skeleton className="size-8 rounded-lg" /><Skeleton className="h-4 w-44" /></div></TableCell>
                <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-16 rounded-full" /></TableCell>
                <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                <TableCell className="text-center"><Skeleton className="mx-auto h-8 w-28" /></TableCell>
              </TableRow>
            ))
          ) : null}
          {!isLoading ? rows.map(({ node, depth, label }, index) => {
            const Icon = getCategoryIcon(node.iconKey)
            const count = node.count ?? 0
            const childrenCount = node.children_count ?? 0
            const isRoot = node.parent_id == null
            return (
              <TableRow
                key={node.id}
                draggable={restructureMode}
                className={cn(
                  restructureMode ? "cursor-grab active:cursor-grabbing transition-all duration-200" : undefined,
                  hoveredDropId === node.id && restructureMode
                    ? "bg-emerald-50/60 ring-1 ring-emerald-300 shadow-sm"
                    : undefined
                )}
                onDragStart={(e) => {
                  if (!restructureMode) return
                  e.dataTransfer.effectAllowed = "move"
                  e.dataTransfer.setData("application/x-category-node-id", node.id)
                  onDragStateChange?.(true)
                }}
                onDragOver={(e) => {
                  if (!restructureMode) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "move"
                  setHoveredDropId(node.id)
                }}
                onDragLeave={() => {
                  if (!restructureMode) return
                  setHoveredDropId((prev) => (prev === node.id ? null : prev))
                }}
                onDragEnd={() => {
                  if (!restructureMode) return
                  setHoveredDropId(null)
                  onDragStateChange?.(false)
                }}
                onDrop={(e) => {
                  if (!restructureMode || !onMoveAsChild) return
                  e.preventDefault()
                  setHoveredDropId(null)
                  onDragStateChange?.(false)
                  const sourceId = e.dataTransfer.getData("application/x-category-node-id")
                  if (!sourceId || sourceId === node.id) return
                  onMoveAsChild(sourceId, node.id)
                }}
              >
                <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="text-start">
                  <div
                    className="relative flex items-center gap-2"
                    style={{
                      paddingInlineStart: `calc(${depth} * 0.75rem)`,
                    }}
                  >
                    {depth > 0 ? (
                      <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-stretch gap-2">
                        {Array.from({ length: depth }).map((_, levelIndex) => (
                          <span key={`${node.id}-guide-${levelIndex}`} className="h-full w-px bg-primary/20" />
                        ))}
                      </div>
                    ) : null}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium text-foreground">
                      {node.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {node.is_active ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
                      <CheckCircle2 className="size-3.5" />
                      نشط
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                      <XCircle className="size-3.5" />
                      غير نشط
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden max-w-[240px] truncate text-muted-foreground sm:table-cell">
                  {label}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      isRoot
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {isRoot ? "رئيسي" : "فرعي"}
                  </span>
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {count}
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {childrenCount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:text-primary"
                          onClick={() => onAdd(node.id)}
                          aria-label="إضافة فرع"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">إضافة فرع</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:text-primary"
                          onClick={() => onEdit(node)}
                          aria-label="تعديل"
                        >
                          <Edit className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">تعديل</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(node)}
                          aria-label="حذف"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">حذف</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          }) : null}
        </TableBody>
      </Table>
    </div>
  )
}
