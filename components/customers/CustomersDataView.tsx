"use client"

import type { Customer, CustomerTableColumnId, CustomersListMeta, CustomersViewMode } from "@/features/customers"
import { CustomersTable } from "./CustomersTable"
import { CustomersCards } from "./CustomersCards"

interface CustomersDataViewProps {
  viewMode: CustomersViewMode
  customers: Customer[]
  meta?: CustomersListMeta
  visibleColumns: CustomerTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddCustomer: () => void
  onViewDetails: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onToggleActive: (customer: Customer) => void
}

export function CustomersDataView(props: CustomersDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <CustomersCards
        customers={props.customers}
        meta={props.meta}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onAddCustomer={props.onAddCustomer}
        onViewDetails={props.onViewDetails}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        onToggleActive={props.onToggleActive}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
      />
    )
  }

  return (
    <CustomersTable
      customers={props.customers}
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
      onAddCustomer={props.onAddCustomer}
      onViewDetails={props.onViewDetails}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onToggleActive={props.onToggleActive}
    />
  )
}
