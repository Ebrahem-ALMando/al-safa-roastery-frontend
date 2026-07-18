"use client"

import { TableColumnCustomizer } from "@/components/shared/TableColumnCustomizer"
import {
  DEFAULT_VISIBLE_INVENTORY_ITEM_MOVEMENT_COLUMNS,
  INVENTORY_MOVEMENT_TABLE_COLUMNS,
  normalizeInventoryItemMovementColumns,
  type InventoryMovementTableColumnId,
} from "@/src/features/inventory"

const AVAILABLE_COLUMNS = INVENTORY_MOVEMENT_TABLE_COLUMNS.filter((column) => column.id !== "item" && column.id !== "row_number")
const CONTEXT_COLUMNS: InventoryMovementTableColumnId[] = ["movement_date", "movement_type", "source", "balance_after"]

export function InventoryItemMovementsColumnCustomizer({ visibleColumns, onChange }: {
  visibleColumns: InventoryMovementTableColumnId[]
  onChange: (columns: InventoryMovementTableColumnId[]) => void
}) {
  return (
    <TableColumnCustomizer
      columns={AVAILABLE_COLUMNS}
      visibleColumns={visibleColumns}
      defaultVisibleColumns={DEFAULT_VISIBLE_INVENTORY_ITEM_MOVEMENT_COLUMNS}
      onChange={onChange}
      normalize={normalizeInventoryItemMovementColumns}
      contextColumns={CONTEXT_COLUMNS}
    />
  )
}
