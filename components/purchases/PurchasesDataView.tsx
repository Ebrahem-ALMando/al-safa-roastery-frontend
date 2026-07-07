"use client"

import type {
  PurchaseInvoice,
  PurchaseTableColumnId,
  PurchasesListMeta,
  PurchasesViewMode,
} from "@/features/purchases"
import { PurchasesTable } from "./PurchasesTable"
import { PurchasesCards } from "./PurchasesCards"

interface PurchasesDataViewProps {
  viewMode: PurchasesViewMode
  purchases: PurchaseInvoice[]
  meta?: PurchasesListMeta
  visibleColumns: PurchaseTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onViewDetails: (purchase: PurchaseInvoice) => void
  onEdit: (purchase: PurchaseInvoice) => void
  onPrint: (purchase: PurchaseInvoice) => void
  onCancel: (purchase: PurchaseInvoice) => void
  onDelete: (purchase: PurchaseInvoice) => void
}

export function PurchasesDataView(props: PurchasesDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <PurchasesCards
        purchases={props.purchases}
        meta={props.meta}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onViewDetails={props.onViewDetails}
        onEdit={props.onEdit}
        onPrint={props.onPrint}
        onCancel={props.onCancel}
        onDelete={props.onDelete}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
      />
    )
  }

  return (
    <PurchasesTable
      purchases={props.purchases}
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
      onViewDetails={props.onViewDetails}
      onEdit={props.onEdit}
      onPrint={props.onPrint}
      onCancel={props.onCancel}
      onDelete={props.onDelete}
    />
  )
}
