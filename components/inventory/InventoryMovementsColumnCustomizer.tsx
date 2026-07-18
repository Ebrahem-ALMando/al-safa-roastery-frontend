"use client"

import { TableColumnCustomizer } from "@/components/shared/TableColumnCustomizer"
import {
  DEFAULT_VISIBLE_INVENTORY_MOVEMENT_COLUMNS,
  INVENTORY_MOVEMENT_TABLE_COLUMNS,
  normalizeInventoryMovementColumns,
  type InventoryMovementTableColumnId,
} from "@/src/features/inventory"

const CONTEXT_COLUMNS: InventoryMovementTableColumnId[] = ["movement_date", "item", "source"]

export function InventoryMovementsColumnCustomizer({
  visibleColumns,
  onChange,
}: {
  visibleColumns: InventoryMovementTableColumnId[]
  onChange: (columns: InventoryMovementTableColumnId[]) => void
}) {
  return (
    <TableColumnCustomizer
      columns={INVENTORY_MOVEMENT_TABLE_COLUMNS}
      visibleColumns={visibleColumns}
      defaultVisibleColumns={DEFAULT_VISIBLE_INVENTORY_MOVEMENT_COLUMNS}
      onChange={onChange}
      normalize={normalizeInventoryMovementColumns}
      contextColumns={CONTEXT_COLUMNS}
    />
  )
}
