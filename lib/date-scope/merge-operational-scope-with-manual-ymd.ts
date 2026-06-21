import type { ResolvedOperationalDateRange } from "./operational-date-scope.types"

function norm(v: string | undefined | null): string | undefined {
  const t = v?.trim()
  return t === "" ? undefined : t
}

function maxYmd(a: string, b: string): string {
  return a >= b ? a : b
}

function minYmd(a: string, b: string): string {
  return a <= b ? a : b
}

/**
 * يضيق نطاق العمليات التشغيلي مع فلاتر تواريخ يدوية (YYYY-MM-DD).
 * مثال: الطلبات — دمج النطاق التشغيلي مع `ordered_from` / `ordered_to` من الفلاتر.
 */
export function mergeOperationalScopeWithManualYmd(
  scope: ResolvedOperationalDateRange | null,
  manualFrom: string | undefined,
  manualTo: string | undefined
): { from?: string; to?: string } | undefined {
  const mf = norm(manualFrom)
  const mt = norm(manualTo)

  if (!scope) {
    if (!mf && !mt) return undefined
    const o: { from?: string; to?: string } = {}
    if (mf) o.from = mf
    if (mt) o.to = mt
    return o
  }

  const from = mf ? maxYmd(scope.from, mf) : scope.from
  const to = mt ? minYmd(scope.to, mt) : scope.to

  return { from, to }
}
