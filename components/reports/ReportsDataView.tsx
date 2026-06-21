"use client"

import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import { ReportsTableView } from "./ReportsTableView"

interface ReportsDataViewProps {
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
}

/** فصل المنطق عن العرض — مطابقة فكرة PatientsDataView للجدول الوحيد. */
export function ReportsDataView(props: ReportsDataViewProps) {
  return <ReportsTableView {...props} />
}
