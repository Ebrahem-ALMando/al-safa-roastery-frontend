"use client"

import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import type { ResultsViewMode } from "@/features/results"
import { ResultsCardsView } from "./ResultsCardsView"
import { ResultsTableView } from "./ResultsTableView"

interface ResultsDataViewProps {
  viewMode: ResultsViewMode
  orders: LabOrder[]
  meta?: LabOrdersListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onViewOrderDetails: (orderId: number) => void
}

export function ResultsDataView(props: ResultsDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <ResultsCardsView
        orders={props.orders}
        isLoading={props.isLoading}
        onViewOrderDetails={props.onViewOrderDetails}
      />
    )
  }

  return (
    <ResultsTableView
      orders={props.orders}
      meta={props.meta}
      isLoading={props.isLoading}
      isFilteredNoHits={props.isFilteredNoHits}
      isTrueEmpty={props.isTrueEmpty}
      currentPage={props.currentPage}
      lastPage={props.lastPage}
      canPrev={props.canPrev}
      canNext={props.canNext}
      onPageChange={props.onPageChange}
      onViewOrderDetails={props.onViewOrderDetails}
    />
  )
}
