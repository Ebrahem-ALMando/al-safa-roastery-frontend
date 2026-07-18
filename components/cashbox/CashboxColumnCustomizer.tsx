"use client"

import { TableColumnCustomizer } from "@/components/shared/TableColumnCustomizer"
import {
  CASHBOX_CONTEXT_COLUMNS,
  CASHBOX_TABLE_COLUMNS,
  DEFAULT_VISIBLE_CASHBOX_COLUMNS,
  normalizeCashboxColumns,
  type CashboxTableColumnId,
} from "@/src/features/cashbox"

export function CashboxColumnCustomizer({
  visibleColumns,
  onChange,
}: {
  visibleColumns: CashboxTableColumnId[]
  onChange: (columns: CashboxTableColumnId[]) => void
}) {
  return (
    <TableColumnCustomizer
      columns={CASHBOX_TABLE_COLUMNS}
      visibleColumns={visibleColumns}
      defaultVisibleColumns={DEFAULT_VISIBLE_CASHBOX_COLUMNS}
      onChange={onChange}
      normalize={normalizeCashboxColumns}
      contextColumns={CASHBOX_CONTEXT_COLUMNS}
      nonDraggableColumns={["actions"]}
    />
  )
}
