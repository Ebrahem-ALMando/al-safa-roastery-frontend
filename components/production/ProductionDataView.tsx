"use client"

import type { ProductionBatch, ProductionListMeta, ProductionTableColumnId, ProductionViewMode } from "@/src/features/production"
import { ProductionCards } from "./ProductionCards"
import { ProductionTable } from "./ProductionTable"

export type ProductionDataViewProps = {
  viewMode: ProductionViewMode
  batches: ProductionBatch[]
  meta?: ProductionListMeta
  visibleColumns: ProductionTableColumnId[]
  isLoading: boolean
  isTrueEmpty: boolean
  isFilteredNoHits: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onView: (batch: ProductionBatch) => void
  onEdit: (batch: ProductionBatch) => void
  onComplete: (batch: ProductionBatch) => void
  onCancel: (batch: ProductionBatch) => void
  onDelete: (batch: ProductionBatch) => void
}

export function ProductionDataView(props: ProductionDataViewProps) {
  return props.viewMode === "cards" ? <ProductionCards {...props} /> : <ProductionTable {...props} />
}
