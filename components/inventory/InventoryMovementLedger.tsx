"use client"

import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { type InventoryDateRange, type InventoryMovementTableColumnId, useInventoryMovements } from "@/src/features/inventory"
import { InventoryMovementFilters, type MovementFilterValue } from "./InventoryMovementFilters"
import { InventoryMovementsTable } from "./InventoryMovementsTable"

const DEFAULT_FILTERS: MovementFilterValue = { search: "", movementType: "all", direction: "all", sourceType: "all" }
const ITEM_LEDGER_COLUMNS: InventoryMovementTableColumnId[] = ["movement_date", "movement_type", "source", "incoming", "outgoing", "unit_cost", "balance_after", "user", "notes"]

export function InventoryMovementLedger({ itemId, dateRange }: { itemId: number; dateRange: InventoryDateRange }) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const query = useMemo(() => ({
    item_id: itemId,
    page,
    per_page: 15,
    search: filters.search || undefined,
    movement_type: filters.movementType === "all" ? undefined : filters.movementType,
    direction: filters.direction === "all" ? undefined : filters.direction,
    source_type: filters.sourceType === "all" ? undefined : filters.sourceType,
    date_from: dateRange?.from,
    date_to: dateRange?.to,
    sort_by: "movement_date",
    sort_direction: "desc" as const,
  }), [itemId, page, filters, dateRange])
  const result = useInventoryMovements(query, true)

  return <div className="space-y-4">
    <InventoryMovementFilters value={filters} onChange={(next) => { setFilters(next); setPage(1) }} />
    {result.error ? <div className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive"><AlertCircle className="size-4" />تعذر تحميل حركات الصنف.</div> : null}
    <div className="overflow-hidden rounded-xl border"><InventoryMovementsTable movements={result.movements} meta={result.meta} visibleColumns={ITEM_LEDGER_COLUMNS} isLoading={result.isLoading} page={page} onPageChange={setPage} emptyMessage="لا توجد حركات لهذا الصنف ضمن الفلاتر الحالية." /></div>
  </div>
}
