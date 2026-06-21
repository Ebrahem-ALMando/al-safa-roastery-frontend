import type { ReportPrintOptions } from "@/components/reports/report-template"

/** تمرير تفضيلات الطباعة في عنوان URL لصفحة /print (مثلاً لـ PDF). */
export function encodeReportPrintPrefsForUrl(prefs: ReportPrintOptions): string {
  try {
    const json = JSON.stringify(prefs)
    return btoa(unescape(encodeURIComponent(json)))
  } catch {
    return ""
  }
}

export function decodeReportPrintPrefsFromBase64(
  b64: string | null | undefined
): Partial<ReportPrintOptions> | null {
  if (!b64?.trim()) return null
  try {
    const json = decodeURIComponent(escape(atob(b64.trim())))
    const o = JSON.parse(json) as unknown
    return o && typeof o === "object" ? (o as Partial<ReportPrintOptions>) : null
  } catch {
    return null
  }
}
