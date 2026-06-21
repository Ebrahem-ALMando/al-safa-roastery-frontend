/**
 * نطاق زمني تشغيلي للقوائم (ليست فلترة عامة مشتركة بين الصفحات).
 * «الكل» يُخزَّن كقيمة صريحة ولا يُعرض داخل القائمة المنسدلة.
 */
export type OperationalDateScopePreset =
  | "all"
  | "today"
  | "yesterday"
  | "current_week"
  | "current_month"

/** معرّف الصفحة — مفتاح تخزين `lab.<id>.date_scope` */
export type OperationalDateScopePageId =
  | "patients"
  | "orders"
  | "tests"
  | "test_categories"
  | "results"
  | "reports"

export type ResolvedOperationalDateRange = {
  /** YYYY-MM-DD بالتقويم المحلي للمستخدم */
  from: string
  to: string
}
