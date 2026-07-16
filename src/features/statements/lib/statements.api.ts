import type { QueryParams } from "@/lib/api"
import type { StatementEntityType, StatementQuery } from "../types/statement.types"

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
