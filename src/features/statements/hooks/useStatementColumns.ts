"use client"

import { useCallback, useEffect, useState } from "react"
import type { StatementColumnDefinition, StatementColumnId } from "../types/statement.types"

function defaults<TId extends StatementColumnId>(definitions: StatementColumnDefinition<TId>[]): TId[] {
  return definitions.filter((column) => column.defaultVisible).map((column) => column.id)
}

function normalize<TId extends StatementColumnId>(values: unknown, definitions: StatementColumnDefinition<TId>[]): TId[] {
  const valid = new Set(definitions.map((column) => column.id))
  const requested = Array.isArray(values) ? values.filter((value): value is TId => typeof value === "string" && valid.has(value as TId)) : defaults(definitions)
  const next = [...new Set(requested)]
  definitions.filter((column) => column.protected).forEach((column) => {
    if (!next.includes(column.id)) next.push(column.id)
  })
  return next.length ? next : defaults(definitions)
}

export function useStatementColumns<TId extends StatementColumnId>(storageKey: string, definitions: StatementColumnDefinition<TId>[]) {
  const [visibleColumns, setVisibleColumnsState] = useState<TId[]>(() => defaults(definitions))

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setVisibleColumnsState(normalize(JSON.parse(localStorage.getItem(storageKey) ?? "null"), definitions))
      } catch {
        setVisibleColumnsState(defaults(definitions))
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [storageKey, definitions])

  const setVisibleColumns = useCallback((columns: TId[]) => {
    const next = normalize(columns, definitions)
    setVisibleColumnsState(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }, [storageKey, definitions])

  return { visibleColumns, setVisibleColumns, resetColumns: () => setVisibleColumns(defaults(definitions)) }
}
