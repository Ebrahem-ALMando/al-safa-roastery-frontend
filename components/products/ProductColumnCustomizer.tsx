"use client"

import { useState } from "react"
import { Columns3, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  DEFAULT_VISIBLE_PRODUCT_COLUMNS,
  PRODUCT_TABLE_COLUMNS,
  getProductColumnLabel,
  insertProductColumnBeforeActions,
  normalizeProductVisibleColumns,
  type ProductTableColumnId,
} from "@/features/products"

type ProductColumnCustomizerProps = {
  visibleColumns: ProductTableColumnId[]
  onChange: (columns: ProductTableColumnId[]) => void
}

export function ProductColumnCustomizer({ visibleColumns, onChange }: ProductColumnCustomizerProps) {
  const visibleSet = new Set(visibleColumns)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const hiddenColumns = PRODUCT_TABLE_COLUMNS.filter((column) => !visibleSet.has(column.id))

  function toggleColumn(id: ProductTableColumnId) {
    const column = PRODUCT_TABLE_COLUMNS.find((c) => c.id === id)
    if (column?.essential) return
    if (visibleSet.has(id)) {
      onChange(normalizeProductVisibleColumns(visibleColumns.filter((columnId) => columnId !== id)))
      return
    }
    onChange(insertProductColumnBeforeActions(visibleColumns, id))
  }

  function reorderColumns(from: number, to: number) {
    if (from === to) return
    if (visibleColumns[from] === "actions" || visibleColumns[to] === "actions") return
    const next = [...visibleColumns]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(normalizeProductVisibleColumns(next))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Columns3 className="h-4 w-4" />
          تخصيص الأعمدة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 text-right" data-dir="rtl">
        <DropdownMenuLabel className="text-right font-medium">
          الأعمدة الظاهرة - اسحب لإعادة الترتيب
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-72 space-y-1 overflow-y-auto px-2 py-1">
          {visibleColumns.map((id, index) => {
            const column = PRODUCT_TABLE_COLUMNS.find((c) => c.id === id)
            const canDrag = id !== "actions" && id !== "product"
            return (
              <div
                key={id}
                draggable={canDrag}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOverIndex(index)
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(event) => {
                  event.preventDefault()
                  if (dragIndex != null) reorderColumns(dragIndex, index)
                  setDragIndex(null)
                  setDragOverIndex(null)
                }}
                onDragEnd={() => {
                  setDragIndex(null)
                  setDragOverIndex(null)
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  dragOverIndex === index && dragIndex !== index && "bg-primary/10 ring-1 ring-primary/30",
                  canDrag ? "cursor-grab active:cursor-grabbing hover:bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <Checkbox checked disabled={column?.essential} onCheckedChange={() => toggleColumn(id)} />
                <span className="min-w-0 flex-1 truncate text-right">{getProductColumnLabel(id)}</span>
                {canDrag ? <GripVertical className="size-4 shrink-0 text-muted-foreground" /> : <span className="size-4" />}
              </div>
            )
          })}
          {hiddenColumns.length > 0 ? (
            <>
              <DropdownMenuSeparator className="my-2" />
              <p className="px-2 py-1 text-right text-xs text-muted-foreground">أعمدة مخفية</p>
              {hiddenColumns.map((column) => (
                <label
                  key={column.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <Checkbox checked={false} onCheckedChange={() => toggleColumn(column.id)} />
                  <span className="min-w-0 flex-1 text-right">{column.label}</span>
                </label>
              ))}
            </>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 p-2">
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => onChange(normalizeProductVisibleColumns(PRODUCT_TABLE_COLUMNS.map((c) => c.id)))}>
            إظهار الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => onChange(normalizeProductVisibleColumns(["product", "actions"]))}>
            إخفاء الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => onChange(DEFAULT_VISIBLE_PRODUCT_COLUMNS)}>
            استعادة الافتراضي
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
