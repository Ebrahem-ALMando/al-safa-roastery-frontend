"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CategoryNode } from "@/lib/lab-catalog-types"
import { getCategoryIcon } from "./category-icons"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CategoryTreeProps {
  categories: CategoryNode[]
  selectedId?: string
  onSelect?: (category: CategoryNode) => void
  onAdd?: (parentId?: string) => void
  onEdit?: (category: CategoryNode) => void
  onDelete?: (category: CategoryNode) => void
  onReorderSibling?: (
    parentId: string | null,
    fromIndex: number,
    toIndex: number
  ) => void
  enableDragReorder?: boolean
  restructureMode?: boolean
  onMoveAsChild?: (sourceId: string, targetId: string) => void
  onDragStateChange?: (dragging: boolean) => void
  className?: string
  /** إخفاء إجراءات التصنيف والقائمة — لعرض التصفية فقط (مثل صفحة فحوصات / شجرة) */
  readOnly?: boolean
  /**
   * ما يُعرض في الشارة: عدد الأبناء (إدارة التصنيفات) أو عدد الفحوصات في الجزء الشجري (يُملأ عبر `withCounts`).
   * @default "children"
   */
  countMode?: "children" | "tests"
}

interface TreeNodeProps {
  category: CategoryNode
  level: number
  parentId: string | null
  indexInParent: number
  selectedId?: string
  onSelect?: (category: CategoryNode) => void
  onAdd?: (parentId?: string) => void
  onEdit?: (category: CategoryNode) => void
  onDelete?: (category: CategoryNode) => void
  onReorderSibling?: (
    parentId: string | null,
    fromIndex: number,
    toIndex: number
  ) => void
  enableDragReorder?: boolean
  restructureMode?: boolean
  onMoveAsChild?: (sourceId: string, targetId: string) => void
  onDragStateChange?: (dragging: boolean) => void
  readOnly?: boolean
  countMode?: "children" | "tests"
}

const indentUnit = "1rem"

const TreeNodeInner = ({
  category,
  level,
  parentId,
  indexInParent,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onReorderSibling,
  enableDragReorder,
  restructureMode,
  onMoveAsChild,
  onDragStateChange,
  readOnly = false,
  countMode = "children",
}: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const hasChildren = Boolean(category.children?.length)
  const isSelected = selectedId === category.id
  const Icon = getCategoryIcon(category.iconKey)

  const padStart = `calc(${level} * ${indentUnit})`

  const onDragStart = (e: React.DragEvent) => {
    if (restructureMode) {
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("application/x-category-node-id", category.id)
      onDragStateChange?.(true)
      return
    }
    if (!enableDragReorder || !onReorderSibling) return
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData(
      "application/x-category",
      JSON.stringify({ parentId, index: indexInParent })
    )
  }

  const onDragOver = (e: React.DragEvent) => {
    if (restructureMode) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setIsDragOver(true)
      return
    }
    if (!enableDragReorder) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const onDrop = (e: React.DragEvent) => {
    if (restructureMode && onMoveAsChild) {
      e.preventDefault()
      setIsDragOver(false)
      onDragStateChange?.(false)
      const sourceId = e.dataTransfer.getData("application/x-category-node-id")
      if (!sourceId || sourceId === category.id) return
      onMoveAsChild(sourceId, category.id)
      return
    }
    if (!enableDragReorder || !onReorderSibling) return
    e.preventDefault()
    const raw = e.dataTransfer.getData("application/x-category")
    if (!raw) return
    try {
      const { parentId: fromParent, index: fromIndex } = JSON.parse(raw) as {
        parentId: string | null
        index: number
      }
      if (fromParent !== parentId) return
      if (fromIndex === indexInParent) return
      onReorderSibling(parentId, fromIndex, indexInParent)
    } catch {
      /* ignore */
    }
  }

  const rowContent = (
    <div
      draggable={Boolean(restructureMode || (enableDragReorder && onReorderSibling))}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ paddingInlineStart: padStart }}
      dir="rtl"
      className={cn(
        "group/row relative flex min-h-11 items-center gap-1 rounded-xl border py-1.5 ps-2 pe-1.5 transition-all duration-200",
        "hover:border-primary/15 hover:bg-muted/40 hover:shadow-sm",
        restructureMode && "cursor-grab active:cursor-grabbing",
        isDragOver && restructureMode && "border-emerald-400 bg-emerald-50/40 shadow-md ring-2 ring-emerald-200",
        isSelected &&
          "border-primary/30 bg-primary/8 font-medium text-primary shadow-sm ring-1 ring-primary/10",
        !isSelected && "border-transparent"
      )}
      onClick={() => onSelect?.(category)}
      onDragLeave={() => setIsDragOver(false)}
      onDragEnd={() => {
        setIsDragOver(false)
        onDragStateChange?.(false)
      }}
    >
      {/* خط الربط العمودي — بجانب بداية السطر (يمين في RTL) */}
      {level > 0 && (
        <span
          className="pointer-events-none absolute inset-y-1.5 border-s-2 border-primary/15"
          style={{
            insetInlineStart: `calc(${level} * ${indentUnit} - 0.4rem)`,
          }}
          aria-hidden
        />
      )}

      {/* ترتيب DOM لـ RTL: يمين ← يسار = طي ← أيقونة ← اسم ← عدد ← إجراءات ← سحب */}
      {hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "طي" : "توسيع"}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}

      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          hasChildren
            ? "bg-primary/12 text-primary"
            : "bg-muted/60 text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </div>

      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="min-w-0 flex-1 truncate ps-0.5 text-start text-sm font-medium leading-tight cursor-help">
              {category.name}
            </span>
          </TooltipTrigger>
          {/* <TooltipContent side="top" align="start" className="flex flex-col gap-1.5 p-3 rounded-xl border-primary/20 bg-background shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-3.5" />
              </div>
              <p className="font-bold text-sm">{category.name}</p>
            </div>
            <div className="space-y-1 border-t border-border/40 pt-1.5">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                المعرف الفريد: <span className="font-mono text-foreground/80">{category.id}</span>
              </p>
              {category.children_count !== undefined && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  الأصناف الفرعية: <span className="text-foreground/80">{category.children_count}</span>
                </p>
              )}
              {category.count !== undefined && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  إجمالي الفحوصات: <span className="text-foreground/80">{category.count}</span>
                </p>
              )}
            </div>
          </TooltipContent> */}
        </Tooltip>
      </TooltipProvider>

      {countMode === "tests" ? (
        <span
          className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary"
          title="عدد الفحوصات (شجرة التصنيف)"
        >
          {category.count ?? 0}
        </span>
      ) : (
        category.children_count !== undefined && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors",
              category.children_count > 0
                ? "bg-primary/15 text-primary"
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            {category.children_count}
          </span>
        )
      )}

      {/* إجراءات سريعة — تظهر بوضوح عند التمرير، ودائماً على الشاشات الأوسع */}
      {!readOnly && (onAdd || onEdit || onDelete) ? (
      <div
        className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-90  "
        onClick={(e) => e.stopPropagation()}
      >
        {onAdd && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                onClick={() => onAdd?.(category.id)}
              >
                <Plus className="size-3.5" />
                <span className="sr-only">إضافة فرعي</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              إضافة تصنيف فرعي
            </TooltipContent>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                onClick={() => onEdit?.(category)}
              >
                <Edit className="size-3.5" />
                <span className="sr-only">تعديل</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              تعديل التصنيف
            </TooltipContent>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete?.(category)}
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">حذف</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              حذف التصنيف
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      ) : null}

      {(enableDragReorder || restructureMode) && (
        <button
          type="button"
          className="touch-none shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-60 transition-all hover:bg-muted hover:opacity-100 cursor-grab active:cursor-grabbing"
          aria-label="سحب لإعادة الترتيب"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>
      )}
    </div>
  )

  const nodeBody = readOnly ? (
    rowContent
  ) : (
    <ContextMenu>
      <ContextMenuTrigger asChild>{rowContent}</ContextMenuTrigger>

      <ContextMenuContent className="rounded-xl p-0">
        <div dir="rtl" lang="ar" className="py-1">
          <ContextMenuItem
            className="gap-2 cursor-pointer text-right hover:bg-primary/10 hover:text-primary"
            onClick={() => onAdd?.(category.id)}
          >
            <Plus className="size-4" />
            إضافة تصنيف فرعي
          </ContextMenuItem>
          <ContextMenuItem
            className="gap-2 cursor-pointer text-right hover:bg-primary/10 hover:text-primary"
            onClick={() => onEdit?.(category)}
          >
            <Edit className="size-4" />
            تعديل
          </ContextMenuItem>
          <ContextMenuItem
            className="gap-2 cursor-pointer text-right text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive"
            onClick={() => onDelete?.(category)}
          >
            <Trash2 className="size-4" />
            حذف
          </ContextMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  )

  return (
    <div className="relative" role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      {nodeBody}

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {category.children!.map((child, i) => (
              <MemoTreeNode
                key={child.id}
                category={child}
                level={level + 1}
                parentId={category.id}
                indexInParent={i}
                selectedId={selectedId}
                onSelect={onSelect}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorderSibling={onReorderSibling}
                enableDragReorder={enableDragReorder}
                restructureMode={restructureMode}
                onMoveAsChild={onMoveAsChild}
                onDragStateChange={onDragStateChange}
                readOnly={readOnly}
                countMode={countMode}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MemoTreeNode = React.memo(TreeNodeInner)

export function CategoryTree({
  categories,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onReorderSibling,
  enableDragReorder,
  restructureMode,
  onMoveAsChild,
  onDragStateChange,
  className,
  readOnly = false,
  countMode = "children",
}: CategoryTreeProps) {
  return (
    <div
      className={cn("space-y-1", className)}
      role="tree"
      dir="rtl"
      lang="ar"
    >
      {categories.map((category, index) => (
        <MemoTreeNode
          key={category.id}
          category={category}
          level={0}
          parentId={null}
          indexInParent={index}
          selectedId={selectedId}
          onSelect={onSelect}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorderSibling={onReorderSibling}
          enableDragReorder={enableDragReorder}
          restructureMode={restructureMode}
          onMoveAsChild={onMoveAsChild}
          onDragStateChange={onDragStateChange}
          readOnly={readOnly}
          countMode={countMode}
        />
      ))}
    </div>
  )
}

/** @deprecated Use CategoryNode from @/lib/lab-catalog-types */
export type Category = CategoryNode
