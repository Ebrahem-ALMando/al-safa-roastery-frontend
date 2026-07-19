"use client"

import { TableColumnCustomizer } from "@/components/shared/TableColumnCustomizer"
import { DEFAULT_VISIBLE_PRODUCTION_COLUMNS, PRODUCTION_TABLE_COLUMNS, normalizeProductionColumns, type ProductionTableColumnId } from "@/src/features/production"

export function ProductionColumnCustomizer({ visibleColumns, onChange }: { visibleColumns: ProductionTableColumnId[]; onChange: (columns: ProductionTableColumnId[]) => void }) {
  return <TableColumnCustomizer columns={PRODUCTION_TABLE_COLUMNS} visibleColumns={visibleColumns} defaultVisibleColumns={DEFAULT_VISIBLE_PRODUCTION_COLUMNS} onChange={onChange} normalize={normalizeProductionColumns} nonDraggableColumns={["batch_number", "actions"]} />
}
