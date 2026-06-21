/**
 * توضيحات عربية لنطاق التاريخ الفعلي المُطبَّق على قائمة الطلبات
 * (`ordered_from` / `ordered_to` → عمود وقت الطلب في الخادم).
 */

function parseLocalYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const dt = new Date(y, mo - 1, d)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function formatArBriefDayMonth(ymd: string): string {
  const dt = parseLocalYmd(ymd)
  if (!dt) return ymd
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "short" }).format(dt)
}

export type EffectiveLabOrdersDateMerge = {
  /** YYYY-MM-DD */
  from?: string
  to?: string
} | undefined

/** سطر واحد تحت وحدة النطاق الزمني (مختصر) */
export function effectiveLabOrdersDateMergeFootnoteAr(merged: EffectiveLabOrdersDateMerge): string | null {
  if (!merged?.from && !merged?.to) return null
  if (merged.from && merged.to) {
    if (merged.from === merged.to) {
      // return `تاريخ الطلب: ${formatArBriefDayMonth(merged.from)}`
      return null
    }
    return `${formatArBriefDayMonth(merged.from)} → ${formatArBriefDayMonth(merged.to)}`
  }
  if (merged.from) return `من ${formatArBriefDayMonth(merged.from)}`
  if (merged.to) return `حتى ${formatArBriefDayMonth(merged.to)}`
  return null
}

/** نص Tooltip أو aria — أوضح */
export function effectiveLabOrdersDateMergeTooltipAr(merged: EffectiveLabOrdersDateMerge): string {
  if (!merged?.from && !merged?.to) {
    // return "لا يُطبَّق تقييد بتاريخ الطلب لهذه القائمة. كل الفلاتر الأخرى تُطبَّق كما هي."
    return ""
  }
  const rangeLine = effectiveLabOrdersDateMergeFootnoteAr(merged) ?? ""
  // return `الطلبات المدرجة تُفلتر حسب وقت الطلب (ordered_at) ضمن المدى: ${rangeLine}. يتطابق هذا المدى مع البطاقات الإحصائية والجدول.`
  return ""
}
