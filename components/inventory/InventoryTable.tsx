"use client"

import { MoreHorizontal, PackageSearch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatInventoryCost, formatInventoryDate, formatInventoryMoney, formatInventoryQuantity, INVENTORY_ITEM_TYPE_LABELS_AR, INVENTORY_TABLE_COLUMNS, inventoryNumber, type InventoryItem, type InventoryPaginationMeta, type InventoryTableColumnId } from "@/src/features/inventory"
import { InventoryStockStatusBadge } from "./InventoryStockStatusBadge"
import { InventoryRowActionsMenuContent, InventoryRowContextMenuContent, type InventoryRowActionCallbacks } from "./inventory-row-actions-menu"

type Props = { items: InventoryItem[]; meta?: InventoryPaginationMeta; visibleColumns: InventoryTableColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void; actions: (item: InventoryItem) => InventoryRowActionCallbacks }
export function InventoryTable({ items, meta, visibleColumns, isLoading, page, onPageChange, actions }: Props) {
  const perPage = meta?.per_page ?? 15; const lastPage = meta?.last_page ?? 1
  function cell(column: InventoryTableColumnId, item: InventoryItem, index: number) {
    const activity = item.last_activity
    switch (column) {
      case "row_number": return (page - 1) * perPage + index + 1
      case "item": return <div className="text-right"><p className="font-semibold">{item.name}</p><p className="font-mono text-xs text-muted-foreground" dir="ltr">{item.code}</p></div>
      case "item_type": return <Badge variant="secondary">{INVENTORY_ITEM_TYPE_LABELS_AR[item.item_type]}</Badge>
      case "current_quantity": return <span dir="ltr">{formatInventoryQuantity(item.current_quantity_kg)}</span>
      case "average_cost": return <span dir="ltr">{formatInventoryCost(item.average_cost)}</span>
      case "stock_value": return <span dir="ltr">{formatInventoryMoney(item.stock_value)}</span>
      case "minimum_quantity": return inventoryNumber(item.minimum_quantity_kg) > 0 ? <span dir="ltr">{formatInventoryQuantity(item.minimum_quantity_kg)}</span> : <span className="text-muted-foreground">غير محدد</span>
      case "stock_status": return <InventoryStockStatusBadge item={item} reorderLabel />
      case "last_activity": return activity ? <div><p>{activity.label}{activity.number ? ` · ${activity.number}` : ""}</p><p className="text-xs text-muted-foreground">{formatInventoryDate(activity.date)}</p></div> : <span className="text-muted-foreground">لا توجد حركة بعد</span>
      case "code": return <span className="font-mono" dir="ltr">{item.code}</span>
      case "last_purchase_price": return <span dir="ltr">{formatInventoryCost(item.last_purchase_price)}</span>
      case "movements_count_in_period": return item.movements_count_in_period ?? 0
      case "created_at": return formatInventoryDate(item.created_at)
      case "updated_at": return formatInventoryDate(item.updated_at)
      case "actions": return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="size-4" /><span className="sr-only">الإجراءات</span></Button></DropdownMenuTrigger><InventoryRowActionsMenuContent {...actions(item)} /></DropdownMenu>
    }
  }
  return <div>{isLoading ? <Table dir="rtl"><TableHeader><TableRow>{visibleColumns.map((id) => <TableHead key={id} className="text-center">{INVENTORY_TABLE_COLUMNS.find((c) => c.id === id)?.label}</TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{visibleColumns.map((id) => <TableCell key={id}><Skeleton className="mx-auto h-5 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table> : items.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground"><PackageSearch className="size-10" /><p>لا توجد أصناف ضمن الفلاتر الحالية.</p></div> : <Table dir="rtl"><TableHeader><TableRow>{visibleColumns.map((id) => <TableHead key={id} className="whitespace-nowrap text-center font-semibold">{INVENTORY_TABLE_COLUMNS.find((c) => c.id === id)?.label}</TableHead>)}</TableRow></TableHeader><TableBody>{items.map((item, index) => <ContextMenu key={item.id}><ContextMenuTrigger asChild><TableRow className="cursor-pointer" onClick={actions(item).onDetails}>{visibleColumns.map((column) => <TableCell key={column} className="text-center text-sm">{cell(column, item, index)}</TableCell>)}</TableRow></ContextMenuTrigger><InventoryRowContextMenuContent {...actions(item)} /></ContextMenu>)}</TableBody></Table>}
    {!isLoading && items.length > 0 && lastPage > 1 ? <div className="flex items-center justify-between border-t p-3"><p className="text-sm text-muted-foreground">{meta?.total ?? items.length} صنف · صفحة {page} من {lastPage}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</Button><Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>التالي</Button></div></div> : null}</div>
}
