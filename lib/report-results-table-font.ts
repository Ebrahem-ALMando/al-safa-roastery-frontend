/** ترويسة أعمدة جدول «نتائج التحاليل» (بكسل) — يُحمّى بين 9 و 15 */
export const RESULTS_TABLE_HEADER_PX_DEFAULT = 11
/** خلايا جدول النتائج (بكسل) — يُحمّى بين 10 و 17 */
export const RESULTS_TABLE_BODY_PX_DEFAULT = 12

export function clampResultsTableHeaderFontPx(n: unknown): number {
  const v =
    typeof n === "number" && Number.isFinite(n) ? n : RESULTS_TABLE_HEADER_PX_DEFAULT
  return Math.min(15, Math.max(9, Math.round(v)))
}

export function clampResultsTableBodyFontPx(n: unknown): number {
  const v =
    typeof n === "number" && Number.isFinite(n) ? n : RESULTS_TABLE_BODY_PX_DEFAULT
  return Math.min(17, Math.max(10, Math.round(v)))
}
