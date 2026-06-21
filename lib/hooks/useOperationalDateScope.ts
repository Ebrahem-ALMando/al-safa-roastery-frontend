"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { OPERATIONAL_DATE_SCOPE_DEFAULT_PRESET } from "@/lib/date-scope/operational-date-scope.defaults"
import { getOperationalDateScopeStorageKey } from "@/lib/date-scope/date-scope-storage-keys"
import type { OperationalDateScopePageId, OperationalDateScopePreset } from "@/lib/date-scope/operational-date-scope.types"
import {
  resolveOperationalDateRange,
  isOperationalDateScopePreset,
} from "@/lib/date-scope/resolve-operational-date-range"

function readStoredPreset(key: string, fallback: OperationalDateScopePreset): OperationalDateScopePreset {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)?.trim()
    if (raw && isOperationalDateScopePreset(raw)) return raw
  } catch {
    /* ignore */
  }
  return fallback
}

/**
 * نطاق زمني تشغيلي محفوظ لكل صفحة — بدون مشاركة عبر التطبيق.
 * `@see` عمليات الدقة والبارامترات في `resolveOperationalDateRange` و helpers الاستعلام.
 */
export function useOperationalDateScope(pageId: OperationalDateScopePageId) {
  const defaultPreset = OPERATIONAL_DATE_SCOPE_DEFAULT_PRESET[pageId]
  const storageKey = getOperationalDateScopeStorageKey(pageId)

  const [preset, setPreset] = useState<OperationalDateScopePreset>(() =>
    readStoredPreset(storageKey, defaultPreset)
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(storageKey, preset)
    } catch {
      /* ignore quota */
    }
  }, [storageKey, preset])

  const setPresetCb = useCallback((next: OperationalDateScopePreset) => {
    setPreset(next)
  }, [])

  const dateRange = useMemo(() => resolveOperationalDateRange(preset), [preset])

  return {
    preset,
    setPreset: setPresetCb,
    dateRange,
    storageKey,
  }
}
