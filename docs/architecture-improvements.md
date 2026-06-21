# Architecture Improvements

هذا الملف يحدد التحسينات البنيوية المطلوبة في المشروع الحالي من أجل:

- فصل منطق العمل عن طبقة العرض
- تقليل التكرار
- تسهيل صيانة المشروع وتسليمه لمهندسين آخرين
- جعل تدفقات القراءة والكتابة أكثر قابلية للاختبار والتوسع

الوثيقة تصف **الوضع الحالي** و**المشكلة** و**الاتجاه المقترح** لكل محور.

## Priority summary

الأولوية الأعلى حالياً:

1. نقل منطق الأعمال والتحويلات من Views وroute-local hooks إلى طبقة feature services/helpers واضحة.
2. توحيد منطق page state المشترك بين صفحات القوائم.
3. إزالة التكرار بين مسارات CRUD المتشابهة، خصوصاً المرضى والفحوصات والطلبات والنتائج.
4. توحيد عقد البيئة وطبقة الوصول للخلفية.
5. إيقاف إخفاء أخطاء TypeScript في البناء.

## 1. Separate business logic from presentation

### Problem

حالياً يوجد منطق مجال وتجهيز payload وتحويلات بيانات داخل طبقة الواجهة نفسها، خصوصاً داخل:

- `app/(protected)/dashboard/orders/new/_hooks/use-new-order-page.ts`
- `components/tests/map-lab-test-form-to-api.ts`
- بعض Views التي تنسق عمليات حذف/تحديث وتفتح dialogs وتبني تفاصيل السلوك في نفس الملف

هذا يسبب:

- تضخم ملفات العرض
- صعوبة الاختبار
- صعوبة إعادة الاستخدام
- صعوبة معرفة أين ينتهي "UI logic" وأين يبدأ "business/application logic"

### Files that should be refactored first

#### A. `use-new-order-page.ts`

حالياً يحتوي على عدة مسؤوليات دفعة واحدة:

- mapping لبيانات المرضى والأطباء
- ranking للبحث عن الفحوصات
- hydration لحالة edit mode
- بناء payload الإرسال
- تنسيق الطباعة والنسخ
- orchestration لإنشاء/تحديث الطلب

#### Proposed split

انقل هذا الملف إلى وحدات أوضح داخل `src/features/orders/`:

```text
src/features/orders/
├── hooks/
│   ├── useOrderEditor.ts
│   ├── useOrderPatientSelection.ts
│   ├── useOrderTestSelection.ts
│   └── useOrderSubmission.ts
├── lib/
│   ├── map-patient-to-picker-row.ts
│   ├── map-doctor-to-picker-row.ts
│   ├── rank-tests.ts
│   ├── build-order-payload.ts
│   └── order-print-options.ts
└── services/
    └── order-editor.service.ts
```

#### B. `components/tests/map-lab-test-form-to-api.ts`

هذا الملف ليس Presentation logic؛ بل هو mapper بين نموذج واجهة وعقد backend. لذلك موقعه الأنسب:

```text
src/features/tests/lib/map-test-form-to-api.ts
```

ويفضّل تقسيمه إلى:

- parser للـ reference ranges
- normalizer للـ advanced ranges
- builder منفصل للحقول
- mapper علوي للإنشاء/التحديث

#### C. Mutation orchestration داخل Views

في ملفات مثل:

- `components/orders/OrdersView.tsx`
- `components/tests/TestsView.tsx`

يوجد ربط مباشر بين:

- state dialogs
- mutation calls
- mutate/invalidate logic

هذا مقبول جزئياً، لكن عند زيادة التعقيد يفضّل وجود hook وسيط مثل:

- `useOrdersViewModel`
- `useTestsViewModel`

بحيث يبقى View أقرب إلى مكوّن Presentation/Composition.

## 2. Introduce a clearer feature service layer

### Problem

المشروع يملك `hooks` و`lib` لكنه لا يملك طبقة خدمية واضحة داخل الميزات. النتيجة:

- بعض الـ hooks أصبحت خدمات فعلية
- بعض الـ mappers وcalculators أصبحت مشتتة بين `components/` و`lib/`

### Proposed structure

أضف طبقة اختيارية داخل كل ميزة معقدة:

```text
src/features/<domain>/
├── hooks/
├── lib/
├── services/
├── state/
├── types/
└── index.ts
```

### Recommended responsibilities

- `hooks/`: ربط React وSWR والأحداث
- `lib/`: helpers pure صغيرة
- `services/`: orchestration domain/application logic
- `state/`: factories أو reducers أو adapters للحالة المركبة

هذا مناسب خصوصاً لـ:

- `orders`
- `results`
- `tests`
- `reports`

## 3. Remove duplicated page-state logic

### Problem

الملفات التالية تكرر نمطاً متشابهاً جداً:

- `src/features/orders/hooks/useOrdersPage.ts`
- `src/features/results/hooks/useResultsPage.ts`
- `src/features/patients/hooks/usePatientsPage.ts`
- `src/features/tests/hooks/useTestsPage.ts`
- `src/features/reports/hooks/useReportsPage.ts`

التكرار يشمل:

- `readConfig()` مع `localStorage`
- `defaultConfig`
- `page` state
- reset page عند تغير الفلاتر
- حساب `isTrueEmpty` و`isFilteredNoHits`
- حساب `currentPage`, `lastPage`, `canPrev`, `canNext`
- toggles الخاصة بـ showKPI/showFilters/viewMode

### Proposed solution

أنشئ طبقة مشتركة مثل:

```text
lib/page-state/
├── create-page-config-storage.ts
├── usePersistedPageConfig.ts
├── usePaginatedListState.ts
└── derive-empty-list-state.ts
```

أو داخل `src/features/shared/`:

```text
src/features/shared/page/
├── useListPageState.ts
├── usePageDisplayConfig.ts
└── pagination-state.ts
```

### Expected result

كل hook صفحة يصبح مسؤولاً فقط عن:

- تعريف فلاتره الخاصة
- ربط Hook البيانات الخاص به
- تحديد view modes الخاصة به

بدلاً من إعادة كتابة كل السلوك الميكانيكي في كل مرة.

## 4. Merge duplicated CRUD action hooks

### Problem

الملفان التاليان متشابهان جداً:

- `src/features/tests/hooks/useTestActions.ts`
- `src/features/patients/hooks/usePatientActions.ts`

ومن المتوقع وجود أو الحاجة إلى أنماط شبيهة في ميزات أخرى.

التكرار يشمل:

- تكوين actionId
- استدعاء `execute`
- التحقق من صحة `res.data`
- `reportAction`
- `invalidateList`
- `revalidateDetail`

### Proposed solution

أضف helper مشترك مثل:

```text
src/features/shared/actions/
├── createCrudActions.ts
├── swr-key-utils.ts
└── mutation-response.ts
```

أو service مشترك يبنى عليه كل domain hook:

```ts
createCrudActions({
  entityName: "tests",
  listKeyPrefix: "tests:",
  detailKey: (id) => `test:${id}`,
})
```

### Additional issue

يوجد debug log مباشر في:

- `src/features/patients/hooks/usePatientActions.ts`

السطر الذي يطبع `FINAL PAYLOAD` يجب اعتباره بقايا تطويرية وحذفه في أول جولة تنظيف كود.

## 5. Reduce duplication between Orders and Results pages

### Problem

`OrdersView` و`ResultsView` وكذلك `useOrdersPage` و`useResultsPage` متشابهان جداً:

- نفس فلاتر الطلبات تقريباً
- نفس النطاق التشغيلي
- نفس pagination
- نفس ViewToggle
- نفس OrderDetailsDialog
- نفس بنية الهيدر

لكن الفرق الحقيقي هو:

- الرسائل والنصوص
- الـ Summary component
- الـ DataView component
- بعض الإجراءات المتاحة

### Proposed solution

استخرج scaffold مشترك مثل:

```text
components/orders-shared/
├── LabOrdersWorkbench.tsx
├── LabOrdersFiltersPanel.tsx
└── useLabOrdersPageBase.ts
```

ثم اجعل:

- Orders page تركّب scaffold مع أوامر الإدارة
- Results page تركّب scaffold مع أوامر الإدخال
- Reports page قد يستفيد جزئياً من نفس النموذج لاحقاً

## 6. Unify environment variables and backend access contract

### Problem

هناك أكثر من نقطة تعريف لعنوان الخلفية:

- `NEXT_PUBLIC_API_BASE_URL` في `lib/config/apiConfig.ts`
- `LAB_API_BASE_URL` في `lib/lab-api.ts`
- `env.example` لا يوثق المتغيرات المستخدمة فعلياً بالكامل

هذا يسبب:

- غموضاً عند إعداد المشروع محلياً
- أخطاء سهلة الوقوع عند onboarding
- احتمال اختلاف مسار الـ API بين browser/server

### Proposed solution

اعتماد عقدة بيئية واحدة واضحة، مثلاً:

- `LARAVEL_API_BASE_URL` لاستهلاك السيرفر
- `NEXT_PUBLIC_BFF_BASE_URL` فقط إذا احتجنا كسر الافتراض `/api/bff`

أو الإبقاء على متغيرين لكن بتوثيق صارم:

- `LARAVEL_APP_BASE_URL`
- `LARAVEL_API_V1_BASE_URL`

مع تحديث:

- `env.example`
- `docs/architecture.md`
- `docs/workflow-rules.md`

## 7. Clarify ownership between `components`, `src/components`, `lib`, and `src/features`

### Problem

البنية الحالية تعمل، لكنها ليست بديهية دائماً لمهندس جديد:

- `components/` و`src/components/` كلاهما يحوي مكونات React
- بعض domain logic في `components/`
- بعض shared logic في `lib/`
- بعض domain logic في `src/features/`

### Proposed rule

- `components/`: العرض فقط
- `src/components/`: shell/providers/layout على مستوى التطبيق
- `src/features/`: كل ما يخص مجالاً معيناً من hooks/types/mappers/services
- `lib/`: المشتركات الحقيقية عبر المجالات

### Migration approach

ابدأ بالملفات الأوضح:

- انقل `components/tests/map-lab-test-form-to-api.ts` إلى `src/features/tests/lib`
- انقل أي helper domain داخل `components/orders/*helpers*` أو `components/results/*helpers*` إلى features المناسبة إن لم يكن عرضياً بحتاً

## 8. Add reusable view-model or controller hooks for complex views

### Problem

بعض Views أصبحت تحتوي على:

- state dialogs
- callbacks متعددة
- mutation orchestration
- navigation
- derived UI state

هذا يجعل الملف كبيراً وصعب القراءة.

### Proposed solution

لكل View مركب جداً، أضف hook واحداً وسيطاً:

- `useOrdersViewModel`
- `useTestsViewModel`
- `useResultsViewModel`

ثم:

- الـ View يعرض فقط
- hook ينسق الأحداث
- feature hooks/services توفر البيانات والأوامر

## 9. Standardize response adapters per domain

### Problem

الواجهة تعتمد كثيراً على shapes القادمة من Laravel مباشرة. هذا جيد للسرعة، لكنه يجعل التغييرات الخلفية مكلفة.

### Proposed solution

لكل feature رئيسي أضف adapter اختياري:

```text
src/features/<domain>/lib/
├── map-api-<domain>.ts
└── map-<domain>-to-view-model.ts
```

استخدمه خصوصاً عندما:

- تكون الاستجابة متداخلة
- تحتاج تسمية أو تطبيعاً
- يوجد فرق بين data contract وview contract

## 10. Improve typing and build safety

### Problem

`next.config.mjs` يحتوي:

- `typescript.ignoreBuildErrors = true`

وهذا يسمح بإنتاج build حتى عند وجود أخطاء types قد تكسر التدفق فعلياً.

### Proposed action

على مرحلتين:

1. تنظيف الأخطاء الحالية تدريجياً.
2. تعطيل `ignoreBuildErrors` بعد الوصول إلى بناء نظيف.

كما يفضّل:

- توسيع استخدام الأنواع المركزية للعقود
- تقليل castات `as`
- إضافة adapters typed بدلاً من تمرير `unknown` أو أشكال ضمنية عند الإمكان

## 11. Standardize package manager usage

### Problem

وجود:

- `package-lock.json`
- `pnpm-lock.yaml`

يعني أن المشروع لا يفرض مدير حزم واحداً.

### Proposed action

- اعتماد npm أو pnpm فقط
- حذف lockfile الآخر
- توثيق ذلك في onboarding

## 12. Testing improvements

### Current state

لا يظهر من البنية الحالية وجود طبقة اختبار واجهة أمامية واضحة أو موثقة داخل المشروع.

### Recommendation

لا تبدأ باختبارات UI شاملة عشوائياً. ابدأ باختبارات تستحق الكلفة، مثل:

- pure helpers الخاصة بتحويل payload
- منطق ranking/normalization
- adapters الحساسة بين frontend/backend
- منطق date-scope المشترك

أما الـ Views الثقيلة، فاختبرها مبدئياً عبر smoke tests موجهة فقط للمسارات الحساسة.

## 13. Recommended phased execution plan

### Phase 1: low-risk cleanup

- توحيد env variables وتحديث `env.example`
- نقل mappers الواضحة من `components/` إلى `src/features/*/lib`
- حذف debug logs
- توحيد naming وأماكن helpers

### Phase 2: page-state deduplication

- استخراج hooks/utility مشتركة لإعدادات الصفحات
- تقليل التكرار بين `use*Page`

### Phase 3: service layer introduction

- إدخال `services/` في `orders`, `results`, `tests`
- نقل orchestration من views/hooks المتضخمة

### Phase 4: view-model extraction

- إضافة hooks وسيطة للصفحات الثقيلة
- تبسيط Views الكبيرة

### Phase 5: stricter quality gates

- إزالة `ignoreBuildErrors`
- توحيد package manager
- إضافة اختبارات مركزة للطبقات النقية

## Final target architecture

الهدف المقترح ليس إدخال تعقيد enterprise زائد، بل الوصول إلى شكل واضح:

**Page -> View -> ViewModel hook -> Feature service/hook -> Shared API layer -> BFF -> Laravel**

مع القواعد التالية:

- لا منطق أعمال داخل JSX
- لا payload mappers داخل `components/`
- لا page state boilerplate مكرر في كل feature
- لا غموض في متغيرات البيئة أو طبقات المسؤولية
