# Conventions

## General rules

- استخدم **TypeScript** في جميع الملفات الجديدة.
- اجعل ملفات `app/` خفيفة ومقتصرة على Composition وربط View جاهز.
- اجعل استدعاءات API عبر `lib/api` و`useApiQuery` و`useAction` أو عبر wrappers داخل `src/features`.
- لا تضع استدعاءات `fetch` المباشرة داخل مكونات العرض إلا في Route Handlers أو حالات سيرفرية مبررة.
- لا تربط مكونات العرض مباشرة بعقد Laravel الخام إذا كان بالإمكان تغليفها في types/helpers داخل الميزة.

## Import aliases and paths

المشروع يستخدم alias رئيسياً:

- `@/*` -> جذر المشروع
- `@/features/*` -> `src/features/*`

النمط العملي الحالي:

- `@/components/...` لمكونات العرض
- `@/src/components/...` لمكونات shell/status/layout المشتركة على مستوى التطبيق
- `@/lib/...` للمساعدات المشتركة
- `@/features/...` لمنطق الميزات

عند إضافة ملفات جديدة، استخدم alias بدلاً من المسارات النسبية الطويلة متى كان ذلك يزيد الوضوح.

## Naming

### Pages and routes

- ملفات الصفحة: `page.tsx`
- ملفات Layout: `layout.tsx`
- ملفات التحميل: `loading.tsx`
- Route handlers: `route.ts`

أمثلة:

- `app/(protected)/dashboard/orders/page.tsx`
- `app/api/auth/login/route.ts`

### Components

- استخدم **PascalCase** لمكونات React.
- اجعل الاسم معبراً عن الدور وليس التقنية فقط.

أمثلة:

- `OrdersView`
- `OrderDetailsDialog`
- `OperationalDateScopeControls`

### Hooks

- جميع الخطافات تبدأ بـ `use`.
- Hook الصفحة يجمع حالة الصفحة ويكون عادة بصيغة `use<Domain>Page`.
- Hook البيانات يركز على استدعاء واحد أو مسؤولية واضحة.

أمثلة:

- `useOrdersPage`
- `usePatients`
- `useTestActions`
- `useOperationalDateScope`

### Types

- ضع أنواع الميزة داخل `src/features/<feature>/types`.
- استخدم أسماء واضحة مرتبطة بعقد Laravel أو بعرض الواجهة.

أمثلة:

- `LabOrder`
- `CreatePatientInput`
- `LaravelSuccessResponse`

## Recommended ownership boundaries

### `app/`

يجب أن يحتوي على:

- تعريف المسار
- اختيار الـ Layout
- استدعاء View واحد أو Composition بسيط
- Route Handlers السيرفرية

يجب ألا يحتوي على:

- منطق فلترة معقد
- تحويلات payload كبيرة
- قواعد مجال domain طويلة

### `components/`

يجب أن يحتوي على:

- JSX
- تنسيق العرض
- ربط أحداث المستخدم
- حوارات ونماذج وعناصر مرئية

#### Canonical Administrative Form Pattern

**Add Patient dialog** (`components/patients/add-patient-dialog.tsx` + `components/patients/patient-form-fields.tsx`) is the canonical UI/UX reference for all administrative create/edit forms.

Every new administrative form (suppliers, customers, employees, items, etc.) must:

- Reuse the same dialog shell (header gradient, scroll body, sticky footer, motion stagger).
- Reuse the same header hierarchy: icon badge, title, description, required-note line with red `*`.
- Reuse the same section/card grouping via `components/shared/forms/FormSection.tsx` and tokens in `administrative-form-styles.ts`.
- Reuse the same typography, label sizes (`text-sm font-bold`), required-star styling (`text-destructive`), input height (`h-11` / `h-10`), borders, focus rings, placeholders, and footer buttons.
- Change domain fields and business logic only — do not invent a separate visual language per module.

Reference implementations:

- Patient: `add-patient-dialog.tsx`, `edit-patient-dialog.tsx`, `patient-form-fields.tsx`
- Supplier: `SupplierFormDialog.tsx`, `supplier-form-fields.tsx`

ويمكن أن يحتوي على:

- منطق عرض خفيف مشتق من props

لكن يجب تجنب وضع:

- تحويلات API
- خوارزميات ranking ثقيلة
- بناء payload النهائي للكتابة إذا كان قابلاً للنقل إلى feature service/helper

### `src/features/`

هو الموقع الافتراضي لـ:

- hooks الخاصة بالقراءة والكتابة
- types
- query builders
- data mappers
- helpers الخاصة بمجال واحد

إذا كان هناك منطق يخص مجالاً واحداً فقط، فالمكان الأول الذي يجب التفكير فيه هو `src/features/<feature>`.

### `lib/`

هو للمشترك عبر أكثر من ميزة:

- HTTP client
- config
- error mapping
- utilities عامة
- barcode/report/date-scope helpers المستهلكة من أكثر من نطاق

القاعدة: إذا أصبح helper معبراً عن لغة مجال محدد مثل orders أو tests فقط، ففكر في نقله إلى feature المعني.

## API call conventions

- الاستدعاءات القرائية تستخدم `useApiQuery` أو Hook مخصص فوقها.
- الاستدعاءات الكتابية تستخدم `useAction`.
- لا تعرض Toast نجاح/فشل يدوياً في كل مكان إذا كان `useAction` أو `useActionToast` يغطي ذلك.
- استخدم مفاتيح SWR مستقرة وقابلة للتصفية من أجل invalidate/revalidate.

أمثلة حالية جيدة جزئياً:

- مفاتيح تبدأ بـ `tests:`
- مفاتيح تبدأ بـ `patients:`
- مفاتيح التفاصيل مثل `test:<id>`

## Response conventions

واجهة المستخدم تتوقع envelope لارافيل بالشكل:

```json
{
  "status": 200,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

وفي الأخطاء:

```json
{
  "status": 422,
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": {
    "field": ["message"]
  }
}
```

أي endpoint جديد من الخلفية يجب أن يحافظ على هذا النمط أو يُوثَّق استثناؤه بوضوح.

## Local storage conventions

الإعدادات المحلية للصفحات تستخدم حالياً مفاتيح صريحة مثل:

- `orders-page-config`
- `patients-page-config`
- `tests-page-config`
- `results-page-config`
- `reports-page-config`

يفضل في الإضافات الجديدة:

- اسم ثابت وواضح
- JSON بسيط
- fallbacks آمنة عند فشل `JSON.parse`

## Date scope conventions

عند بناء صفحة قائمة جديدة مرتبطة بتاريخ:

- استخدم `useOperationalDateScope(pageId)`
- لا تضف date picker مخصصاً خارج النمط المشترك إلا لسبب واضح
- اربط الفلاتر اليدوية مع النطاق التشغيلي عبر helpers الحالية

راجع:

- `docs/dashboard-operational-date-scope.md`

## Auth and session conventions

- الكوكي المعتمد حالياً هو `access_token`.
- المتصفح لا يتعامل مباشرة مع Bearer token.
- مسارات `/api/auth/*` و`/api/bff/*` هي نقطة الدخول المفضلة من الواجهة.
- أي Route Handler جديد يحتاج المرور إلى Laravel يجب أن يحافظ على:
  - تمرير Authorization عند وجود token
  - إعادة status/content-type بشكل صحيح
  - عدم تسريب أسرار أو تفاصيل حساسة

## UI and language conventions

- اللغة الأساسية للمنتج عربية مع `dir="rtl"` في معظم الشاشات.
- النصوص الظاهرة للمستخدم يجب أن تكون عربية وواضحة ومتسقة.
- استخدم أسماء متغيرات ودوال بالإنجليزية، ونصوص الواجهة بالعربية.
- عند وجود رموز أو أكواد فنية مثل order number أو test code، حافظ على `dir="ltr"` عند الحاجة لسهولة القراءة.

## Dependency conventions

المكتبات الأساسية الحالية:

- `next`, `react`, `react-dom`
- `swr`
- `react-hook-form`, `zod`
- `@radix-ui/*`
- `lucide-react`
- `recharts`
- `exceljs`, `file-saver`
- `puppeteer-core`

إضافة مكتبة جديدة يجب أن تكون مبررة بأحد الأسباب التالية:

- سد فجوة لا تغطيها الأدوات الحالية
- تقليل تعقيد واضح في الكود
- دعم ميزة تشغيلية مطلوبة

ويجب تجنب إضافة مكتبات تؤدي إلى:

- تكرار ما توفره React/SWR/Next حالياً
- إنشاء طبقة state ثانية غير لازمة
- زيادة حجم الحزمة من أجل استخدام محدود جداً

## Build and quality

- الأمر الحالي للتحقق الثابت هو `npm run lint`.
- يوجد خطر تقني مهم: `next.config.mjs` يفعّل `typescript.ignoreBuildErrors`.
- لا ينبغي الاعتماد على البناء الناجح وحده كمؤشر صحة.

قبل دمج تغييرات كبيرة:

- شغّل lint
- راجع المسارات الجديدة
- اختبر أهم تدفقات الصفحة يدوياً
- تحقق من تكامل Laravel عبر البيئة المحلية

## Documentation rule

عند إدخال نمط معماري جديد أو helper مشترك جديد أو عقد API جديد:

- حدّث ملفاً مناسباً داخل `docs/` في نفس التغيير.
- إذا كانت الإضافة تخص النطاق الزمني أو الطباعة أو المصادقة أو الربط مع الخلفية، فحدّث الوثيقة المتخصصة ذات الصلة.
