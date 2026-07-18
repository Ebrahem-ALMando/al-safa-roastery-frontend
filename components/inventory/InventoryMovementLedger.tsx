"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import {
  DEFAULT_VISIBLE_INVENTORY_ITEM_MOVEMENT_COLUMNS,
  INVENTORY_ITEM_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY,
  normalizeInventoryItemMovementColumns,
  type InventoryDateRange,
  type InventoryMovementTableColumnId,
  useInventoryMovements,
} from "@/src/features/inventory"
import { InventoryItemMovementsColumnCustomizer } from "./InventoryItemMovementsColumnCustomizer"
import { InventoryMovementFilters, type MovementFilterValue } from "./InventoryMovementFilters"
import { InventoryMovementsTable } from "./InventoryMovementsTable"

const DEFAULT_FILTERS: MovementFilterValue = { search: "", movementType: "all", direction: "all", sourceType: "all" }

export function InventoryMovementLedger({ itemId, dateRange }: { itemId: number; dateRange: InventoryDateRange }) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [visibleColumns, setVisibleColumns] = useState<InventoryMovementTableColumnId[]>(DEFAULT_VISIBLE_INVENTORY_ITEM_MOVEMENT_COLUMNS)
  const [columnsHydrated, setColumnsHydrated] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(INVENTORY_ITEM_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY)
        if (stored) setVisibleColumns(normalizeInventoryItemMovementColumns(JSON.parse(stored)))
      } catch {
        // Keep defaults when saved preferences are invalid.
      }
      setColumnsHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (columnsHydrated) localStorage.setItem(INVENTORY_ITEM_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [columnsHydrated, visibleColumns])

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <InventoryMovementFilters value={filters} onChange={(next) => { setFilters(next); setPage(1) }} />
        </div>
        <InventoryItemMovementsColumnCustomizer visibleColumns={visibleColumns} onChange={(columns) => setVisibleColumns(normalizeInventoryItemMovementColumns(columns))} />
      </div>
      {result.error ? <div className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive"><AlertCircle className="size-4" />تعذر تحميل حركات الصنف.</div> : null}
      <div className="overflow-hidden rounded-xl border">
        <InventoryMovementsTable movements={result.movements} meta={result.meta} visibleColumns={visibleColumns} isLoading={result.isLoading} page={page} onPageChange={setPage} emptyMessage="لا توجد حركات لهذا الصنف ضمن الفلاتر الحالية." />
      </div>
    </div>
  )
}
