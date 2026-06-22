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
  DEFAULT_VISIBLE_ITEM_COLUMNS,
  ITEM_TABLE_COLUMNS,
  getItemColumnLabel,
  insertItemColumnBeforeActions,
  normalizeItemVisibleColumns,
  type ItemTableColumnId,
} from "@/features/items"

interface ItemColumnCustomizerProps {
  visibleColumns: ItemTableColumnId[]
  onChange: (columns: ItemTableColumnId[]) => void
}

export function ItemColumnCustomizer({ visibleColumns, onChange }: ItemColumnCustomizerProps) {
  const visibleSet = new Set(visibleColumns)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const hiddenColumns = ITEM_TABLE_COLUMNS.filter((c) => !visibleSet.has(c.id))

  function toggleColumn(id: ItemTableColumnId) {
    const col = ITEM_TABLE_COLUMNS.find((c) => c.id === id)
    if (col?.essential) return

    if (visibleSet.has(id)) {
      onChange(normalizeItemVisibleColumns(visibleColumns.filter((c) => c !== id)))
      return
    }
    onChange(insertItemColumnBeforeActions(visibleColumns, id))
  }

  function showAll() {
    onChange(normalizeItemVisibleColumns(ITEM_TABLE_COLUMNS.map((c) => c.id)))
  }

  function hideAll() {
    onChange(normalizeItemVisibleColumns(["item_name", "actions"]))
  }

  function restoreDefault() {
    onChange(DEFAULT_VISIBLE_ITEM_COLUMNS)
  }

  function reorderColumns(from: number, to: number) {
    if (from === to) return
    const col = ITEM_TABLE_COLUMNS.find((c) => c.id === visibleColumns[from])
    if (col?.essential && (from === 0 || to === 0)) return
    if (visibleColumns[from] === "actions" || visibleColumns[to] === "actions") return

    const next = [...visibleColumns]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(normalizeItemVisibleColumns(next))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Columns3 className="h-4 w-4" />
          تخصيص الأعمدة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" dir="rtl" className="w-72 text-right">
        <DropdownMenuLabel className="text-right font-medium">
          الأعمدة الظاهرة — اسحب لإعادة الترتيب
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-72 space-y-1 overflow-y-auto px-2 py-1">
          {visibleColumns.map((id, index) => {
            const col = ITEM_TABLE_COLUMNS.find((c) => c.id === id)
            const canDrag = col?.id !== "actions" && col?.id !== "item_name"
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
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  dragOverIndex === index && dragIndex !== index && "bg-primary/10 ring-1 ring-primary/30",
                  canDrag ? "cursor-grab active:cursor-grabbing hover:bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <Checkbox
                  checked
                  disabled={col?.essential}
                  onCheckedChange={() => toggleColumn(id)}
                  className="shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-right">{getItemColumnLabel(id)}</span>
                {canDrag ? (
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                  <span className="size-4 shrink-0" />
                )}
              </div>
            )
          })}

          {hiddenColumns.length > 0 ? (
            <>
              <DropdownMenuSeparator className="my-2" />
              <p className="px-2 py-1 text-right text-xs text-muted-foreground">أعمدة مخفية</p>
              {hiddenColumns.map((col) => (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <Checkbox checked={false} onCheckedChange={() => toggleColumn(col.id)} className="shrink-0" />
                  <span className="min-w-0 flex-1 text-right">{col.label}</span>
                </label>
              ))}
            </>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 p-2">
          <Button variant="ghost" size="sm" className="justify-start" onClick={showAll}>
            إظهار الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" onClick={hideAll}>
            إخفاء الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" onClick={restoreDefault}>
            استعادة الافتراضي
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
