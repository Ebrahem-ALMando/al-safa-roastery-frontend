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
  DEFAULT_VISIBLE_SUPPLIER_COLUMNS,
  SUPPLIER_TABLE_COLUMNS,
  getSupplierColumnLabel,
  insertSupplierColumnBeforeActions,
  normalizeSupplierVisibleColumns,
  type SupplierTableColumnId,
} from "@/features/suppliers"

interface SupplierColumnCustomizerProps {
  visibleColumns: SupplierTableColumnId[]
  onChange: (columns: SupplierTableColumnId[]) => void
}

export function SupplierColumnCustomizer({
  visibleColumns,
  onChange,
}: SupplierColumnCustomizerProps) {
  const visibleSet = new Set(visibleColumns)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const hiddenColumns = SUPPLIER_TABLE_COLUMNS.filter((c) => !visibleSet.has(c.id))

  function toggleColumn(id: SupplierTableColumnId) {
    const col = SUPPLIER_TABLE_COLUMNS.find((c) => c.id === id)
    if (col?.essential) return

    if (visibleSet.has(id)) {
      onChange(normalizeSupplierVisibleColumns(visibleColumns.filter((c) => c !== id)))
      return
    }
    onChange(insertSupplierColumnBeforeActions(visibleColumns, id))
  }

  function showAll() {
    onChange(normalizeSupplierVisibleColumns(SUPPLIER_TABLE_COLUMNS.map((c) => c.id)))
  }

  function hideAll() {
    onChange(normalizeSupplierVisibleColumns(["supplier_name", "actions"]))
  }

  function restoreDefault() {
    onChange(DEFAULT_VISIBLE_SUPPLIER_COLUMNS)
  }

  function reorderColumns(from: number, to: number) {
    if (from === to) return
    const col = SUPPLIER_TABLE_COLUMNS.find((c) => c.id === visibleColumns[from])
    if (col?.essential && (from === 0 || to === 0)) return
    if (visibleColumns[from] === "actions" || visibleColumns[to] === "actions") return

    const next = [...visibleColumns]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(normalizeSupplierVisibleColumns(next))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Columns3 className="h-4 w-4" />
          تخصيص الأعمدة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>الأعمدة الظاهرة — اسحب لإعادة الترتيب</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-72 space-y-1 overflow-y-auto px-2 py-1">
          {visibleColumns.map((id, index) => {
            const col = SUPPLIER_TABLE_COLUMNS.find((c) => c.id === id)
            const canDrag = col?.id !== "actions" && col?.id !== "supplier_name"
            return (
              <div
                key={id}
                draggable={canDrag}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverIndex(index)
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragIndex != null) reorderColumns(dragIndex, index)
                  setDragIndex(null)
                  setDragOverIndex(null)
                }}
                onDragEnd={() => {
                  setDragIndex(null)
                  setDragOverIndex(null)
                }}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm",
                  dragOverIndex === index && dragIndex !== index && "bg-primary/10 ring-1 ring-primary/30",
                  canDrag ? "cursor-grab active:cursor-grabbing hover:bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {canDrag ? (
                    <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" />
                  )}
                  <span className="truncate">{getSupplierColumnLabel(id)}</span>
                </div>
                <Checkbox
                  checked
                  disabled={col?.essential}
                  onCheckedChange={() => toggleColumn(id)}
                />
              </div>
            )
          })}

          {hiddenColumns.length > 0 ? (
            <>
              <DropdownMenuSeparator className="my-2" />
              <p className="px-2 py-1 text-xs text-muted-foreground">أعمدة مخفية</p>
              {hiddenColumns.map((col) => (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <span>{col.label}</span>
                  <Checkbox checked={false} onCheckedChange={() => toggleColumn(col.id)} />
                </label>
              ))}
            </>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 p-2">
          <Button variant="ghost" size="sm" className="justify-end" onClick={showAll}>
            إظهار الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-end" onClick={hideAll}>
            إخفاء الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-end" onClick={restoreDefault}>
            استعادة الافتراضي
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
