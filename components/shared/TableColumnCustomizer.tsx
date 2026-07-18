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

type ColumnDefinition<T extends string> = {
  id: T
  label: string
  essential?: boolean
}

type TableColumnCustomizerProps<T extends string> = {
  columns: readonly ColumnDefinition<T>[]
  visibleColumns: T[]
  defaultVisibleColumns: T[]
  onChange: (columns: T[]) => void
  normalize: (columns: T[]) => T[]
  contextColumns?: readonly T[]
  nonDraggableColumns?: readonly T[]
}

export function TableColumnCustomizer<T extends string>({
  columns,
  visibleColumns,
  defaultVisibleColumns,
  onChange,
  normalize,
  contextColumns = [],
  nonDraggableColumns = [],
}: TableColumnCustomizerProps<T>) {
  const visibleSet = new Set(visibleColumns)
  const nonDraggable = new Set(nonDraggableColumns)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const hiddenColumns = columns.filter((column) => !visibleSet.has(column.id))

  function canHide(id: T): boolean {
    const column = columns.find((candidate) => candidate.id === id)
    if (column?.essential) return false
    if (!contextColumns.includes(id)) return true
    return visibleColumns.filter((columnId) => contextColumns.includes(columnId)).length > 1
  }

  function toggleColumn(id: T) {
    if (visibleSet.has(id)) {
      if (!canHide(id)) return
      onChange(normalize(visibleColumns.filter((columnId) => columnId !== id)))
      return
    }
    onChange(normalize([...visibleColumns, id]))
  }

  function reorderColumns(from: number, to: number) {
    if (from === to) return
    const fromId = visibleColumns[from]
    const toId = visibleColumns[to]
    if (!fromId || !toId || nonDraggable.has(fromId) || nonDraggable.has(toId)) return
    const next = [...visibleColumns]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(normalize(next))
  }

  function hideAll() {
    const required = columns.filter((column) => column.essential).map((column) => column.id)
    if (contextColumns.length > 0 && !required.some((id) => contextColumns.includes(id))) {
      required.push(contextColumns[0])
    }
    onChange(normalize(required))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Columns3 className="size-4" />
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
            const column = columns.find((candidate) => candidate.id === id)
            if (!column) return null
            const canDrag = !column.essential && !nonDraggable.has(id)
            const hideDisabled = !canHide(id)

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
                  if (dragIndex !== null) reorderColumns(dragIndex, index)
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
                <Checkbox checked disabled={hideDisabled} onCheckedChange={() => toggleColumn(id)} />
                <span className="min-w-0 flex-1 truncate text-right">{column.label}</span>
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
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => onChange(normalize(columns.map((column) => column.id)))}>
            إظهار الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" onClick={hideAll}>
            إخفاء الكل
          </Button>
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => onChange(defaultVisibleColumns)}>
            استعادة الافتراضي
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
