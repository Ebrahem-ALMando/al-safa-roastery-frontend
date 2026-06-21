# Operational date scope (dashboard lists)

## Pattern

1. **Header**: `DashboardPageHeader` + `OperationalDateScopeControls`. Do not add ad‑hoc date pickers in the page header.
2. **State**: `useOperationalDateScope(pageId)` — one storage key per page (`lab.<pageId>.date_scope`).
3. **Merge**: `mergeOperationalScopeWithManualYmd(scope, manualFrom, manualTo)` narrows the operational range with column filters that use YYYY‑MM‑DD (e.g. `ordered_from` / `ordered_to` on Orders / Results).
4. **Query mapping**: `OPERATIONAL_DATE_SCOPE_QUERY_BINDING` in `lib/date-scope/operational-date-scope-query-mapping.ts` documents which API keys each page uses:
   - **Orders, Results, Reports** → `ordered_from` / `ordered_to` (server: `ordered_at`).
   - **Patients, Tests, Test categories** → `created_from` / `created_to` (record creation).
5. **Shared builder**: `buildLabOrdersQueryParams` must be the single source for `GET lab-orders` list parameters (table + any KPI scan over the same population).

## KPI alignment

- **Patients, Orders, Results** (صفحات القائمة): البطاقات تتبع نفس النمط — **`meta.total`** للإجمالي والمؤشرات من **صفحة النتائج الحالية** مثل **`PatientsSummary`** / **`OrdersSummary`** / **`ResultsSummary`**.
- **Reports** لا تزال بطاقاتها مبنية على `buildLabOrdersQueryParams` + `useApiQuery` / مسح يشمل **search** وحالة **completed** مثل الجدول.
- عند الحاجة لاحقاً لاحصائيات على كامل المجموعة المصفّاة (وليس الصفحة الحالية)، يمكن استخدام المساعد الاختياري **`useLabOrdersFilteredAggregates`** (بحد أمان `LAB_ORDERS_AGGREGATE_SCAN_MAX_PAGES`).

## Effective date hint

- نصوص عربية جاهزة: `effectiveLabOrdersDateMergeFootnoteAr` / `effectiveLabOrdersDateMergeTooltipAr` — تُمرَّر اختيارياً إلى **`OperationalDateScopeControls`** (مثلاً في **التقارير**).

## New listing page checklist

- [ ] Add `OperationalDateScopePageId` + binding row if the page is date‑scoped.
- [ ] Use `DashboardPageHeader` + `OperationalDateScopeControls`؛ إيضاح المدى الفعلي اختياري حسب الصفحة.
- [ ] Build list queries through shared helpers; avoid duplicating date logic.
- [ ] List pages: pass **`dateRange`** into the data hook (مثل `usePatients` / `useOrders`).
