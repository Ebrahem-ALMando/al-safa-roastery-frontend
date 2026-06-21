# Frontend Current Structure

هذا الملف يسجل البنية الحالية الفعلية لمشروع الواجهة الأمامية كما هي الآن، بهدف تمكين أي مهندس من فهم نقاط الدخول، أماكن المنطق، ونقاط التكامل مع الخلفية بسرعة.

## Architecture context

الواجهة الأمامية مبنية على:

- **Next.js 16**
- **React 19**
- **TypeScript**
- **SWR** للقراءة والتخزين المؤقت
- **Radix UI + shadcn-style components**
- **React Hook Form + Zod** في النماذج
- **Puppeteer Core** لتوليد PDF

التدفق العام:

`app route -> components view -> src/features hooks/lib -> lib/api -> app/api -> Laravel`

## Top-level structure

### `app/`

يحوي:

- الصفحات العامة والمحميّة
- layouts
- route handlers
- صفحات الطباعة والتحقق

أهم الأقسام:

- `app/(protected)` صفحات اللوحة الداخلية
- `app/api/auth` مصادقة وجلسة
- `app/api/bff` ممر عام إلى Laravel
- `app/api/reports/[id]/pdf` توليد PDF
- `app/login`
- `app/verify/[order_number]`
- `app/print/report/[id]`

### `components/`

يحوي طبقة العرض الأساسية:

- domain views لكل نطاق
- dialogs/forms
- UI primitives
- shared components

### `src/features/`

يحوي طبقة المنطق الخاصة بالمجالات:

- hooks
- types
- query builders
- data mappers
- domain utilities

### `lib/`

يحوي المنطق المشترك:

- API client
- config
- error mapping
- date scope
- barcode/report/print helpers

### `src/components/`

يحوي عناصر shell والتخطيط العام:

- AppShell
- Header
- Sidebar
- status providers
- barcode listener على مستوى التطبيق

## Route map

### Protected dashboard routes

- `dashboard/page.tsx`
- `dashboard/categories/page.tsx`
- `dashboard/orders/page.tsx`
- `dashboard/orders/new/page.tsx`
- `dashboard/patients/page.tsx`
- `dashboard/patients/[id]/page.tsx`
- `dashboard/reports/page.tsx`
- `dashboard/reports/[id]/page.tsx`
- `dashboard/results/page.tsx`
- `dashboard/results/[id]/page.tsx`
- `dashboard/settings/page.tsx`
- `dashboard/tests/page.tsx`
- صفحات اختبار/تشخيص للباركود

### Public routes

- `login/page.tsx`
- `verify/[order_number]/page.tsx`
- `print/report/[id]/page.tsx`

### API routes

- `api/auth/login`
- `api/auth/logout`
- `api/auth/me`
- `api/auth/profile`
- `api/auth/change-password`
- `api/auth/upload-avatar`
- `api/bff/[...path]`
- `api/reports/[id]/pdf`

## Shared application shell

الطبقة المشتركة للتطبيق موزعة بين:

- `app/layout.tsx`
- `src/components/layout/AppShell/*`
- `src/components/layout/Header/*`
- `src/components/layout/Sidebar/*`
- `src/components/layout/UserProfile/*`
- `src/components/status/*`

المسؤوليات الرئيسية:

- الخطوط والـ theme
- Analytics
- providers
- shell الخاص باللوحة
- حالة الإشعارات والعمليات
- listeners مثل barcode scanner

## Authentication files

أهم الملفات:

- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/hooks/useAuthActions.ts`
- `proxy.ts`

الدور الحالي:

- login route يرسل بيانات الاعتماد إلى Laravel ويحفظ `access_token` في cookie
- `useAuth` يحدد حالة المستخدم
- `proxy.ts` يحمي المسارات الداخلية

## API client layer

أهم الملفات:

- `lib/config/apiConfig.ts`
- `lib/api/api.types.ts`
- `lib/api/apiClient.ts`
- `lib/api/apiExecutor.ts`
- `lib/hooks/useApiQuery.ts`
- `lib/hooks/useAction.ts`
- `lib/errors/mapApiError.ts`

المسؤوليات:

- بناء base URL
- تنفيذ الطلبات
- parsing للأخطاء
- دعم timeout
- توحيد القراءة والكتابة
- ربط toasts بالحالات الكتابية

## Feature modules

### `src/features/auth`

المحتوى:

- `auth.constants.ts`
- `hooks/useAuth.ts`
- `hooks/useAuthActions.ts`
- `types/auth.types.ts`

المسؤولية:

- جلب المستخدم الحالي
- تنفيذ عمليات auth الموجهة للواجهة

### `src/features/categories`

المحتوى:

- `hooks/useCategories.ts`
- `hooks/useCategoriesPage.ts`
- `hooks/useCategoriesTree.ts`
- `hooks/useCategoryActions.ts`
- `types/category.types.ts`
- `utils/categoriesToTree.ts`

المسؤولية:

- قراءة الشجرة/القوائم
- إدارة حالة صفحة التصنيفات
- تنفيذ عمليات الإنشاء/التعديل/الحذف

### `src/features/orders`

المحتوى:

- `hooks/useOrders.ts`
- `hooks/useLabOrder.ts`
- `hooks/useOrdersPage.ts`
- `hooks/usePreviousPatientLabOrder.ts`
- `hooks/useLabOrdersFilteredAggregates.ts`
- `lib/build-lab-orders-query-params.ts`
- `lib/pick-previous-patient-lab-order.ts`
- `types/order.types.ts`

المسؤولية:

- قوائم الطلبات وتفاصيلها
- فلاتر الطلبات
- المؤشرات المصفاة
- منطق query params

ملاحظة: تدفق إنشاء/تعديل الطلب الجديد ما يزال موزعاً جزئياً خارج feature داخل route-local hook.

### `src/features/patients`

المحتوى:

- `hooks/usePatients.ts`
- `hooks/usePatient.ts`
- `hooks/usePatientActions.ts`
- `hooks/usePatientPickerList.ts`
- `hooks/usePatientsPage.ts`
- `types/patient.types.ts`

المسؤولية:

- قراءة القوائم والتفاصيل
- عمليات CRUD
- حالة صفحة المرضى
- تزويد منتقي المرضى

### `src/features/profile`

المحتوى:

- `hooks/useProfile.ts`
- `hooks/useProfileActions.ts`
- `types/profile.types.ts`

المسؤولية:

- الملف الشخصي
- تعديل البيانات والصورة وكلمة المرور

### `src/features/reports`

المحتوى:

- `hooks/useReports.ts`
- `hooks/useReportsPage.ts`

المسؤولية:

- قوائم التقارير
- حالة الصفحة

### `src/features/results`

المحتوى:

- `hooks/useResultEntry.ts`
- `hooks/useResultsPage.ts`
- `hooks/useOrderTestCatalogEnrichment.ts`
- `hooks/useOrdersTestCatalogEnrichment.ts`
- `lib/build-results-payload.ts`
- `lib/enrich-order-test-catalog.ts`
- `lib/order-item-result-sections.ts`
- `lib/order-test-metadata.ts`
- `lib/report-result-inclusion.ts`
- `lib/result-entry-reference.ts`
- `lib/select-options.ts`

المسؤولية:

- إدخال النتائج
- إثراء بنية الطلب ببيانات الفحوصات والحقول
- بناء payload حفظ النتائج
- تقسيمات العرض الخاصة بالنتائج

### `src/features/tests`

المحتوى:

- `hooks/useTests.ts`
- `hooks/useTestDetails.ts`
- `hooks/useTestActions.ts`
- `hooks/useTestsExcelExport.ts`
- `hooks/useTestsPage.ts`
- `lib/build-tests-query-params.ts`
- `lib/fetch-all-filtered-tests.ts`
- `lib/export-tests-excel.ts`
- `lib/map-test-to-export-row.ts`
- `lib/test-template-helpers.ts`
- `types/test.types.ts`

المسؤولية:

- قوائم الفحوصات
- تفاصيل الفحص
- CRUD
- التصدير إلى Excel
- منطق العرض الجدولي/الشجري

### `src/features/users`

المحتوى:

- `hooks/useDoctorPickerList.ts`
- `types/user.types.ts`

المسؤولية:

- تزويد قوائم الأطباء/المستخدمين للاختيار

## Domain view components

الصفحات الأساسية لكل نطاق تميل إلى التوزيع التالي:

- `components/<domain>/<Domain>View.tsx`
- `components/<domain>/<Domain>Filters.tsx`
- `components/<domain>/<Domain>Summary.tsx`
- `components/<domain>/<Domain>DataView.tsx`
- table/cards/tree variants

أمثلة:

- `components/orders/OrdersView.tsx`
- `components/patients/PatientsView.tsx`
- `components/tests/TestsView.tsx`
- `components/results/ResultsView.tsx`
- `components/reports/ReportsView.tsx`

## Complex subdomains

### New order flow

الملفات المهمة:

- `app/(protected)/dashboard/orders/new/new-order-page-content.tsx`
- `app/(protected)/dashboard/orders/new/_hooks/use-new-order-page.ts`
- `app/(protected)/dashboard/orders/new/_components/*`

هذا التدفق يحتوي حالياً على:

- اختيار المريض
- اختيار الطبيب
- البحث الذكي عن الفحوصات
- بناء العناصر المختارة
- إعداد النسخ الخاصة بطباعة الباركود
- إنشاء/تحديث الطلب

وهو واحد من أكثر أجزاء المشروع كثافة في المنطق.

### Results entry

الملفات المهمة:

- `components/results/result-entry/*`
- `src/features/results/hooks/useResultEntry.ts`
- `src/features/results/lib/*`

المسؤولية:

- تجهيز الحقول المطلوبة
- عرض وتجميع النتائج
- بناء payload الكتابة
- إثراء المرجعيات وبيانات الفحص

### Reports and printing

الملفات المهمة:

- `components/reports/*`
- `app/print/report/[id]/page.tsx`
- `app/api/reports/[id]/pdf/route.ts`
- `lib/report-*`

المسؤولية:

- عرض التقرير
- تخصيص الثيم والطباعة
- توليد PDF

## Current cross-cutting helpers

أهم العائلات المشتركة:

- `lib/date-scope/*`
- `lib/report-*`
- `lib/barcode-*`
- `lib/reference-*`
- `lib/utils.ts`
- `lib/messages/form.ts`

هذه الطبقة تتضمن helpers حقيقية مشتركة، لكنها تضم أيضاً بعض المنطق الذي يمكن لاحقاً نقله إلى features أكثر تخصصاً.

## State and persistence locations

المشروع يستخدم حالياً أكثر من طبقة حفظ للحالة:

- React state للواجهات المحلية
- SWR cache لبيانات API
- localStorage لإعدادات الصفحات وبعض التفضيلات
- cookies للجلسة

أمثلة مباشرة:

- page config داخل `useOrdersPage`, `usePatientsPage`, `useTestsPage`, `useResultsPage`, `useReportsPage`
- session عبر `access_token`
- report/barcode prefs داخل ملفات `lib/*prefs*`

## Notable technical decisions

- `next.config.mjs` يضبط `typescript.ignoreBuildErrors = true`
- الصور غير محسنة `images.unoptimized = true`
- `puppeteer-core` معرف ضمن `serverExternalPackages`
- المسارات الداخلية محمية افتراضياً عبر `proxy.ts`
- صفحات App Router نفسها تبقى قصيرة غالباً

## Known structure gaps

من خلال البنية الحالية يمكن ملاحظة:

- تكرار واضح في page hooks
- تكرار جزئي في domain views بين الطلبات والنتائج
- منطق أعمال وتحويلات موجود داخل:
  - route-local hooks
  - بعض ملفات `components/`
  - بعض hooks التي تضخمت مسؤولياتها
- عدم توحيد كامل بين:
  - `components/`
  - `src/components/`
  - `lib/`
  - `src/features/`

التفاصيل العلاجية موثقة في:

- `docs/architecture-improvements.md`
