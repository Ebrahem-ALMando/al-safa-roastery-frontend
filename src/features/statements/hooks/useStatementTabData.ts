"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildStatementTabQuery, statementTabEndpoint } from "../lib/statements.api"
import type { StatementDataTab, StatementEntityType, StatementTabQuery, StatementTabResponse } from "../types/statement.types"

export function useStatementTabData<TItem, TSummary>(
  type: StatementEntityType,
  entityId: number | null,
  tab: StatementDataTab,
  filters: StatementTabQuery,
  enabled: boolean,
) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildStatementTabQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated && entityId !== null
  const endpoint = entityId ? statementTabEndpoint(type, entityId, tab) : ""
  const query = useApiQuery<StatementTabResponse<TItem, TSummary>>(
    ready ? `statement-tab:${type}:${entityId}:${tab}:${JSON.stringify(queryParams)}` : null,
    endpoint,
    { queryParams },
  )

  return {
    data: query.data,
    isLoading: ready && query.isLoading,
    error: query.error,
    mutate: query.mutate,
  }
}
