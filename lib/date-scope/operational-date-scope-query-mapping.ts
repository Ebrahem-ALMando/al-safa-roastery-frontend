import type { OperationalDateScopePageId } from "./operational-date-scope.types"

/**
 * دلالة الزمن الذي يقيّمه النطاق التشغيلي في الواجهة (وليس اسم عمود الجدول حرفياً —
 * ذلك يقرر في الخادم حسب الموارد).
 * • record_created_at — إنشاء السجل (`created_at` عادةً)
 * • order_ordered_at — وقت الطلب (`ordered_at`)
 * أمثلة لاحقة: استيراد حقول تقرير/إنجاز بتوسيع هذا النوع وربط بارامترات API مناسبة.
 */
export type OperationalDateRangeSemantics =
  | "record_created_at"
  | "order_ordered_at"
  /** حجوز مستقبلية — ربط مفاتيح الاستعلام عند ظهور النقاط */
  | "result_reported_at"
  | "order_completed_at"

/**
 * ربط صفحة القائمة ببارامترات GET الفعلية لنطاق التاريخ لهذا الـ endpoint.
 */
export type OperationalDateRangeQueryBinding = {
  semantics: OperationalDateRangeSemantics
  queryFromKey: string
  queryToKey: string
}

/** طلبات المختبر: `ListLabOrdersAction` يفلتر على `ordered_at` عبر ordered_from / ordered_to */
export const LAB_ORDER_OPERATIONAL_ORDERED_QUERY_BINDING = {
  semantics: "order_ordered_at",
  queryFromKey: "ordered_from",
  queryToKey: "ordered_to",
} satisfies OperationalDateRangeQueryBinding

/** ربط ثابت لكل صفحة تعتمد نطاق التاريخ التشغيلي اليوم */
export const OPERATIONAL_DATE_SCOPE_QUERY_BINDING = {
  patients: {
    semantics: "record_created_at",
    queryFromKey: "created_from",
    queryToKey: "created_to",
  },
  orders: LAB_ORDER_OPERATIONAL_ORDERED_QUERY_BINDING,
  results: LAB_ORDER_OPERATIONAL_ORDERED_QUERY_BINDING,
  reports: LAB_ORDER_OPERATIONAL_ORDERED_QUERY_BINDING,
  tests: {
    semantics: "record_created_at",
    queryFromKey: "created_from",
    queryToKey: "created_to",
  },
  test_categories: {
    semantics: "record_created_at",
    queryFromKey: "created_from",
    queryToKey: "created_to",
  },
} as const satisfies Record<OperationalDateScopePageId, OperationalDateRangeQueryBinding>

/** مفاتيح الاستعلام فقط للدمج مع `appendOperationalDateRangeToQueryParams` */
export type OperationalDateRangeQueryKeysPick = Pick<
  OperationalDateRangeQueryBinding,
  "queryFromKey" | "queryToKey"
>

export function operationalDateScopeQueryKeysForPage(
  pageId: OperationalDateScopePageId
): OperationalDateRangeQueryKeysPick {
  const b = OPERATIONAL_DATE_SCOPE_QUERY_BINDING[pageId]
  return { queryFromKey: b.queryFromKey, queryToKey: b.queryToKey }
}
