"use client"

import { Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { StatementColumnDefinition, StatementColumnId } from "@/src/features/statements"

export function StatementColumnCustomizer<TId extends StatementColumnId>({ definitions, visibleColumns, onChange }: { definitions: StatementColumnDefinition<TId>[]; visibleColumns: TId[]; onChange: (columns: TId[]) => void }) {
  const defaults = definitions.filter((column) => column.defaultVisible).map((column) => column.id)
  const toggle = (column: StatementColumnDefinition<TId>) => {
    if (column.protected) return
    onChange(visibleColumns.includes(column.id) ? visibleColumns.filter((id) => id !== column.id) : [...visibleColumns, column.id])
  }

  return <DropdownMenu dir="rtl"><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-2 rounded-xl"><Columns3 className="size-4" />تخصيص الأعمدة</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64 text-right"><DropdownMenuLabel>الأعمدة الظاهرة</DropdownMenuLabel><DropdownMenuSeparator /><div className="max-h-72 overflow-y-auto p-2">{definitions.map((column) => <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"><Checkbox checked={visibleColumns.includes(column.id)} disabled={column.protected} onCheckedChange={() => toggle(column)} /><span>{column.label}</span></label>)}</div><DropdownMenuSeparator /><div className="flex gap-1 p-2"><Button variant="ghost" size="sm" onClick={() => onChange(definitions.map((column) => column.id))}>إظهار الكل</Button><Button variant="ghost" size="sm" onClick={() => onChange(defaults)}>الافتراضي</Button></div></DropdownMenuContent></DropdownMenu>
}
