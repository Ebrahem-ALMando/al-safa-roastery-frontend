"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildStatementQuery, statementEndpoint } from "../lib/statements.api"
import type { StatementEntityType, StatementQuery, StatementResponse } from "../types/statement.types"

export function useStatement(type: StatementEntityType, entityId: number | null, filters: StatementQuery, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildStatementQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated && entityId !== null
  const endpoint = entityId ? statementEndpoint(type, entityId) : ""
  const query = useApiQuery<StatementResponse>(
    ready ? `statement:${type}:${entityId}:${JSON.stringify(queryParams)}` : null,
    endpoint,
    { queryParams },
  )
  return {
    statement: query.data,
    isLoading: authLoading || (enabled && entityId !== null && query.isLoading),
    error: query.error,
    mutate: query.mutate,
  }
}
