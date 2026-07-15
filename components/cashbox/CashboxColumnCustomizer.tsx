"use client"

import { Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CASHBOX_CONTEXT_COLUMNS,
  CASHBOX_TABLE_COLUMNS,
  DEFAULT_VISIBLE_CASHBOX_COLUMNS,
  normalizeCashboxColumns,
  type CashboxTableColumnId,
} from "@/src/features/cashbox"

export function CashboxColumnCustomizer({ visibleColumns, onChange }: { visibleColumns: CashboxTableColumnId[]; onChange: (columns: CashboxTableColumnId[]) => void }) {
  function toggle(id: CashboxTableColumnId) {
    if (visibleColumns.includes(id)) {
      const next = visibleColumns.filter((value) => value !== id)
      if (CASHBOX_CONTEXT_COLUMNS.includes(id) && !next.some((value) => CASHBOX_CONTEXT_COLUMNS.includes(value))) return
      onChange(normalizeCashboxColumns(next))
      return
    }
    onChange(normalizeCashboxColumns([...visibleColumns, id]))
  }

  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-xl"><Columns3 className="size-4" />تخصيص الأعمدة</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64 text-right"><DropdownMenuLabel>الأعمدة الظاهرة</DropdownMenuLabel><DropdownMenuSeparator /><div className="max-h-72 overflow-y-auto p-2">{CASHBOX_TABLE_COLUMNS.map((column) => { const lastContext = visibleColumns.includes(column.id) && CASHBOX_CONTEXT_COLUMNS.includes(column.id) && visibleColumns.filter((id) => CASHBOX_CONTEXT_COLUMNS.includes(id)).length === 1; return <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"><Checkbox checked={visibleColumns.includes(column.id)} disabled={lastContext} onCheckedChange={() => toggle(column.id)} /><span>{column.label}</span></label> })}</div><DropdownMenuSeparator /><div className="flex gap-1 p-2"><Button variant="ghost" size="sm" onClick={() => onChange(CASHBOX_TABLE_COLUMNS.map((column) => column.id))}>إظهار الكل</Button><Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_VISIBLE_CASHBOX_COLUMNS)}>الافتراضي</Button></div></DropdownMenuContent></DropdownMenu>
}
