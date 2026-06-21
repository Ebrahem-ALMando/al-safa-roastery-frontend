# Module template

كل ميزة في الواجهة الأمامية يجب أن تكون قابلة للفهم والتنقل دون الحاجة إلى تتبع عشوائي بين `app` و`components` و`lib`. هذا القالب يعرّف الشكل الموصى به لأي **feature module** جديد داخل المشروع.

## Recommended layout

```text
app/(protected)/dashboard/{domain}/
├── page.tsx                  # route entry
└── [optional child routes]

components/{domain}/
├── {Domain}View.tsx          # main page view
├── {Domain}Filters.tsx       # filters panel
├── {Domain}Summary.tsx       # KPI cards
├── {Domain}DataView.tsx      # chooses table/cards/tree layouts
├── dialogs/...               # domain dialogs
└── helpers/...               # UI-only helpers if truly presentational

src/features/{domain}/
├── hooks/
│   ├── use{Domain}.ts        # read/list/detail hooks
│   ├── use{Domain}Page.ts    # page state hook
│   └── use{Domain}Actions.ts # write hooks
├── lib/
│   ├── build-{domain}-query-params.ts
│   ├── map-{domain}-to-api.ts
│   └── other domain helpers
├── types/
│   └── {domain}.types.ts
└── index.ts
```

## Responsibilities by layer

### `app/(...)/page.tsx`

المطلوب:

- ربط route بالـ View فقط
- إبقاء الملف قصيراً جداً

مثال مثالي:

```tsx
import { OrdersView } from "@/components/orders/OrdersView"

export default function OrdersPage() {
  return <OrdersView />
}
```

### `components/{domain}/`

المطلوب:

- بناء الواجهة
- تمرير props
- ربط الحوارات والأزرار
- استهلاك hooks الجاهزة

غير المفضل هنا:

- بناء payload domain كبير
- خوارزميات ranking/normalization طويلة
- استدعاءات `fetch` المباشرة

### `src/features/{domain}/hooks`

المطلوب:

- القراءة والكتابة
- إدارة حالة الصفحة
- SWR integration
- بناء طبقة استخدام قابلة لإعادة الاستعمال من الـ Views

أمثلة حالية:

- `useOrders`
- `useOrdersPage`
- `useTestActions`
- `usePatientsPage`

### `src/features/{domain}/lib`

هذا هو المكان المفضل لـ:

- query param builders
- payload mappers
- normalization helpers
- domain-specific calculators غير المرئية

أي helper يخص ميزة واحدة فقط ويمثل منطق أعمال أو تحويل بيانات يجب أن يكون هنا بدلاً من `components/`.

### `src/features/{domain}/types`

يجب أن يحتوي:

- أنواع الكيانات
- أنواع الإدخال والكتابة
- أنواع الفلاتر
- أنواع فرعية مرتبطة بالميزة

## Suggested file set for a CRUD-like module

```text
src/features/patients/
├── hooks/
│   ├── usePatients.ts
│   ├── usePatient.ts
│   ├── usePatientsPage.ts
│   └── usePatientActions.ts
├── types/
│   └── patient.types.ts
└── index.ts
```

ومقابله في العرض:

```text
components/patients/
├── PatientsView.tsx
├── PatientsFilters.tsx
├── PatientsSummary.tsx
├── PatientsDataView.tsx
├── PatientsTableView.tsx
├── PatientsCardsView.tsx
└── dialogs/forms...
```

## Suggested file set for a complex workflow module

للنطاقات الثقيلة مثل إنشاء الطلب أو إدخال النتائج:

```text
src/features/orders/
├── hooks/
│   ├── useOrders.ts
│   ├── useLabOrder.ts
│   ├── useOrdersPage.ts
│   └── useOrderActions.ts
├── lib/
│   ├── build-lab-orders-query-params.ts
│   ├── map-order-form-to-api.ts
│   ├── rank-tests.ts
│   └── derive-order-summary.ts
├── types/
│   └── order.types.ts
└── index.ts
```

وإذا وُجدت صفحة فرعية معقدة جداً داخل route، يمكن إضافة hook route-local مؤقت، لكن يفضّل أن يبقى خفيفاً ويعتمد على `src/features/orders`.

## Registration pattern

عند إضافة feature جديد:

1. أضف route في `app/`.
2. أضف View رئيسي في `components/<domain>/`.
3. أضف feature folder في `src/features/<domain>/`.
4. أضف `index.ts` لإعادة التصدير.
5. إن كان هناك تكامل backend جديد، حدّث `docs/api-response-format.md` أو الوثيقة المناسبة.

## Naming pattern

### Hooks

- `use{Plural}` للقوائم
- `use{Singular}` للتفاصيل
- `use{Domain}Page` لحالة الصفحة
- `use{Domain}Actions` للكتابة

### Views

- `{Domain}View`
- `{Domain}Filters`
- `{Domain}Summary`
- `{Domain}DataView`
- `{Domain}TableView`
- `{Domain}CardsView`

### Helpers

- `build-{domain}-query-params.ts`
- `map-{domain}-form-to-api.ts`
- `normalize-{domain}.ts`

## What should stay out of a module

لا تضع في module خاص:

- عناصر UI عامة جداً مثل buttons/tables/dialog wrappers
- helpers مشتركة حقاً بين أكثر من ميزة
- config عام للتطبيق

هذا النوع يجب أن يبقى في:

- `components/ui`
- `components/shared`
- `lib/`

## Current adaptation notes for this project

المشروع الحالي يطبّق هذا القالب جزئياً فقط:

- يوجد التزام جيد بوجود `src/features/<domain>/hooks` و`types`.
- بعض منطق التحويل ما يزال داخل `components/`.
- بعض التدفقات المعقدة ما تزال داخل route-local hooks مثل `app/(protected)/dashboard/orders/new/_hooks/use-new-order-page.ts`.

لذلك عند إنشاء وحدات جديدة، يفضّل استعمال هذا القالب بصيغته المحسنة لا الحالية فقط.
