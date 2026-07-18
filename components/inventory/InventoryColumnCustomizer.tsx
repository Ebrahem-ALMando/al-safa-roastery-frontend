"use client"

import { TableColumnCustomizer } from "@/components/shared/TableColumnCustomizer"
import {
  DEFAULT_VISIBLE_INVENTORY_COLUMNS,
  INVENTORY_TABLE_COLUMNS,
  normalizeInventoryColumns,
  type InventoryTableColumnId,
} from "@/src/features/inventory"

export function InventoryColumnCustomizer({
  visibleColumns,
  onChange,
}: {
  visibleColumns: InventoryTableColumnId[]
  onChange: (columns: InventoryTableColumnId[]) => void
}) {
  return (
    <TableColumnCustomizer
      columns={INVENTORY_TABLE_COLUMNS}
      visibleColumns={visibleColumns}
      defaultVisibleColumns={DEFAULT_VISIBLE_INVENTORY_COLUMNS}
      onChange={onChange}
      normalize={normalizeInventoryColumns}
      nonDraggableColumns={["item", "actions"]}
    />
  )
}
