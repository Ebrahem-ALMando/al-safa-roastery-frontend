import type { QueryParams } from "@/lib/api"
import type { StatementDataTab, StatementEntityType, StatementQuery, StatementTabQuery } from "../types/statement.types"

export function statementEndpoint(type: StatementEntityType, entityId: number): string {
  return type === "customer"
    ? `customers/${entityId}/statement`
    : `suppliers/${entityId}/statement`
}

export function buildStatementQuery(query: StatementQuery): QueryParams {
  const params: QueryParams = {}
  if (query.date_from) params.date_from = query.date_from
  if (query.date_to) params.date_to = query.date_to
  return params
}

export function statementTabEndpoint(type: StatementEntityType, entityId: number, tab: StatementDataTab): string {
  return `statements/${type === "customer" ? "customers" : "suppliers"}/${entityId}/${tab}`
}

export function buildStatementTabQuery(query: StatementTabQuery): QueryParams {
  const params = buildStatementQuery(query)
  if (query.search) params.search = query.search
  if (query.page) params.page = query.page
  if (query.per_page) params.per_page = query.per_page
  if (query.sort_by) params.sort_by = query.sort_by
  if (query.sort_direction) params.sort_direction = query.sort_direction
  if (query.status) params.status = query.status
  if (query.payment_status) params.payment_status = query.payment_status
  if (query.payment_method) params.payment_method = query.payment_method
  return params
}
