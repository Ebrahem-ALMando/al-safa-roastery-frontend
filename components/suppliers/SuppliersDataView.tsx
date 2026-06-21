"use client"

import type { Supplier, SupplierTableColumnId, SuppliersListMeta, SuppliersViewMode } from "@/features/suppliers"
import { SuppliersTable } from "./SuppliersTable"
import { SuppliersCards } from "./SuppliersCards"

interface SuppliersDataViewProps {
  viewMode: SuppliersViewMode
  suppliers: Supplier[]
  meta?: SuppliersListMeta
  visibleColumns: SupplierTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddSupplier: () => void
  onViewDetails: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onToggleActive: (supplier: Supplier) => void
}

export function SuppliersDataView(props: SuppliersDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <SuppliersCards
        suppliers={props.suppliers}
        meta={props.meta}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onAddSupplier={props.onAddSupplier}
        onViewDetails={props.onViewDetails}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
      />
    )
  }

  return (
    <SuppliersTable
      suppliers={props.suppliers}
      meta={props.meta}
      visibleColumns={props.visibleColumns}
      isLoading={props.isLoading}
      isFilteredNoHits={props.isFilteredNoHits}
      isTrueEmpty={props.isTrueEmpty}
      currentPage={props.currentPage}
      lastPage={props.lastPage}
      canPrev={props.canPrev}
      canNext={props.canNext}
      onPageChange={props.onPageChange}
      onAddSupplier={props.onAddSupplier}
      onViewDetails={props.onViewDetails}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onToggleActive={props.onToggleActive}
    />
  )
}
