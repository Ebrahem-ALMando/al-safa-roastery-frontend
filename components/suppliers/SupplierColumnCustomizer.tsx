"use client"

import { Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DEFAULT_VISIBLE_SUPPLIER_COLUMNS,
  SUPPLIER_TABLE_COLUMNS,
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

  function toggleColumn(id: SupplierTableColumnId) {
    const col = SUPPLIER_TABLE_COLUMNS.find((c) => c.id === id)
    if (col?.essential) return

    const next = new Set(visibleColumns)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    if (!next.has("name")) next.add("name")
    if (!next.has("actions")) next.add("actions")
    onChange(Array.from(next))
  }

  function showAll() {
    onChange(SUPPLIER_TABLE_COLUMNS.map((c) => c.id))
  }

  function hideAll() {
    onChange(["name", "actions"])
  }

  function restoreDefault() {
    onChange(DEFAULT_VISIBLE_SUPPLIER_COLUMNS)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Columns3 className="h-4 w-4" />
          تخصيص الأعمدة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>الأعمدة الظاهرة</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 space-y-2 overflow-y-auto px-2 py-1">
          {SUPPLIER_TABLE_COLUMNS.map((col) => (
            <label
              key={col.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
            >
              <span>{col.label}</span>
              <Checkbox
                checked={visibleSet.has(col.id)}
                disabled={col.essential}
                onCheckedChange={() => toggleColumn(col.id)}
              />
            </label>
          ))}
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
