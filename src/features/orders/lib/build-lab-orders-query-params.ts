import type { QueryParams } from "@/lib/api"
import type { LabOrdersListFilters } from "../types/order.types"

/** طلب قائمة الطلبات (lab-orders) — يستخدمه الجدول ومسح KPI حتى يبقيا متطابقَين بالكامل مع الفلاتر. */
export function buildLabOrdersQueryParams(
  page: number,
  filters: Omit<LabOrdersListFilters, "page">
): QueryParams {
  const q: QueryParams = { page }
  if (filters.search != null && String(filters.search).trim() !== "") q.search = String(filters.search).trim()
  if (filters.order_number != null && String(filters.order_number).trim() !== "") {
    q.order_number = String(filters.order_number).trim()
  }
  if (typeof filters.patient_id === "number") q.patient_id = filters.patient_id
  if (filters.status != null && String(filters.status).trim() !== "") q.status = String(filters.status)
  if (typeof filters.created_by === "number") q.created_by = filters.created_by
  if (typeof filters.requested_by === "number") q.requested_by = filters.requested_by
  if (filters.ordered_from != null && String(filters.ordered_from).trim() !== "") {
    q.ordered_from = String(filters.ordered_from).trim()
  }
  if (filters.ordered_to != null && String(filters.ordered_to).trim() !== "") q.ordered_to = String(filters.ordered_to).trim()
  return q
}
