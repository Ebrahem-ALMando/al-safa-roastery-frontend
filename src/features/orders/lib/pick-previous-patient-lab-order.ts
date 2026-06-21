import type { LabOrder } from "../types/order.types"

/**
 * أحدث طلب لنفس المريض بتاريخ سابق للطلب الحالي (أو نفس اليوم بمعرّف أصغر)،
 * من حالات التقرير النموذجية فقط.
 */
export function pickPreviousPatientLabOrder(
  orders: LabOrder[],
  current: LabOrder
): LabOrder | null {
  const t0 = current.ordered_at ? new Date(current.ordered_at).getTime() : Number.MAX_SAFE_INTEGER

  const candidates = orders.filter((o) => {
    if (o.id === current.id) return false
    if (o.status !== "completed" && o.status !== "approved") return false
    const t = o.ordered_at ? new Date(o.ordered_at).getTime() : 0
    if (t < t0) return true
    if (t === t0 && o.id < current.id) return true
    return false
  })

  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    const tb = b.ordered_at ? new Date(b.ordered_at).getTime() : 0
    const ta = a.ordered_at ? new Date(a.ordered_at).getTime() : 0
    if (tb !== ta) return tb - ta
    return b.id - a.id
  })

  return candidates[0] ?? null
}
