"use client"

import type { LabOrder, LabOrdersListMeta, OrdersViewMode } from "@/features/orders"
import { OrdersCardsView } from "./OrdersCardsView"
import { OrdersTableView } from "./OrdersTableView"

interface OrdersDataViewProps {
  viewMode: OrdersViewMode
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
  onAddOrder: () => void
  onViewOrderDetails: (orderId: number) => void
  onEditOrder: (orderId: number) => void
  onDeleteOrder: (order: LabOrder) => void
  onChangeOrderStatus: (order: LabOrder) => void
}

export function OrdersDataView(props: OrdersDataViewProps) {
  if (props.viewMode === "cards") {
    return <OrdersCardsView orders={props.orders} isLoading={props.isLoading} />
  }

  return (
    <OrdersTableView
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
      onAddOrder={props.onAddOrder}
      onViewOrderDetails={props.onViewOrderDetails}
      onEditOrder={props.onEditOrder}
      onDeleteOrder={props.onDeleteOrder}
      onChangeOrderStatus={props.onChangeOrderStatus}
    />
  )
}
