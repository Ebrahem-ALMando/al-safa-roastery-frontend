"use client"

import { Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DEFAULT_VISIBLE_INVENTORY_COLUMNS, INVENTORY_TABLE_COLUMNS, normalizeInventoryColumns, type InventoryTableColumnId } from "@/src/features/inventory"

export function InventoryColumnCustomizer({ visibleColumns, onChange }: { visibleColumns: InventoryTableColumnId[]; onChange: (columns: InventoryTableColumnId[]) => void }) {
  function toggle(id: InventoryTableColumnId) { const column = INVENTORY_TABLE_COLUMNS.find((c) => c.id === id); if (column?.essential) return; onChange(normalizeInventoryColumns(visibleColumns.includes(id) ? visibleColumns.filter((value) => value !== id) : [...visibleColumns.filter((value) => value !== "actions"), id, "actions"])) }
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-xl"><Columns3 className="size-4" />تخصيص الأعمدة</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64 text-right"><DropdownMenuLabel>الأعمدة الظاهرة</DropdownMenuLabel><DropdownMenuSeparator /><div className="max-h-72 overflow-y-auto p-2">{INVENTORY_TABLE_COLUMNS.map((column) => <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"><Checkbox checked={visibleColumns.includes(column.id)} disabled={column.essential} onCheckedChange={() => toggle(column.id)} /><span>{column.label}</span></label>)}</div><DropdownMenuSeparator /><div className="flex gap-1 p-2"><Button variant="ghost" size="sm" onClick={() => onChange(INVENTORY_TABLE_COLUMNS.map((c) => c.id))}>إظهار الكل</Button><Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_VISIBLE_INVENTORY_COLUMNS)}>الافتراضي</Button></div></DropdownMenuContent></DropdownMenu>
}
