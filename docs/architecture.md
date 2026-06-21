# Architecture

## Overview

هذا المشروع هو واجهة أمامية مبنية على **Next.js App Router** وتعمل كلوحة تشغيل داخلية لإدارة المختبر، مع صفحات عامة محدودة للتحقق والطباعة. المعمارية الحالية أقرب إلى **frontend monolith** منظم حول:

- **App Router** لتقسيم المسارات والصفحات.
- **Feature modules** داخل `src/features` لعزل منطق الوصول للبيانات والأنواع والخطافات.
- **Reusable UI components** داخل `components/` و`src/components/`.
- **BFF layer** داخل `app/api` لتمرير الطلبات إلى Laravel وتوحيد التعامل مع الجلسة والكوكيز.

الهدف المعماري العملي الحالي هو:

- إبقاء ملفات `app/` خفيفة قدر الإمكان.
- عزل استدعاءات API داخل خطافات وطبقات مساعدة.
- توحيد التعامل مع الاستجابات والأخطاء عبر `lib/api` و`lib/hooks`.
- حماية المسارات الداخلية على مستوى `proxy.ts` ثم على مستوى Layouts/Route Handlers.

## High-level flow

المسار الافتراضي لأي ميزة داخل اللوحة:

**Route page -> View component -> Feature hook(s) -> lib/api -> BFF route -> Laravel API**

التدفق التفصيلي الشائع:

1. ملف صفحة داخل `app/(protected)/dashboard/.../page.tsx` يمرر مباشرة إلى View رئيسي.
2. الـ View في `components/...` يجمع عناصر العرض، الحوارات، الفلاتر، وأحداث المستخدم.
3. الـ View يستهلك hook صفحة من `src/features/.../hooks` لإدارة:
   - حالة البحث والفلاتر
   - إعدادات العرض المحفوظة في `localStorage`
   - الاستدعاءات القرائية عبر SWR
   - الاستدعاءات الكتابية عبر `useAction`
4. الاستدعاءات تنتقل إلى:
   - `/api/bff/*` لمعظم واجهات Laravel المحمية
   - `/api/auth/*` لمسارات الجلسة المحلية
   - Route Handlers متخصصة مثل PDF أو رفع الصور
5. الخلفية Laravel تعيد Envelope موحداً من الشكل `{ status, code?, message, data, meta? }`.

## Runtime areas

### 1. Protected dashboard

المجلد `app/(protected)` يحتوي الصفحات الداخلية التي تتطلب وجود `access_token` داخل الكوكيز. الأمثلة الرئيسية:

- `dashboard/patients`
- `dashboard/tests`
- `dashboard/categories`
- `dashboard/orders`
- `dashboard/results`
- `dashboard/reports`
- `dashboard/settings`

هذه الصفحات تعتمد عادة على:

- Layout داخلي موحد
- مكونات Header/Sidebar
- مكونات View لكل مجال

### 2. Public and semi-public routes

المسارات غير المحمية أو الأقل تقييداً:

- `app/login` لتسجيل الدخول
- `app/verify/[order_number]` لعرض تحقق عام من الطلب
- `app/print/report/[id]` لسطح الطباعة
- بعض Route Handlers داخل `app/api`

الملف `proxy.ts` يحدد المسارات العامة ويمنع الوصول لأي مسار آخر عند غياب `access_token`.

### 3. API/BFF layer

يوجد ثلاث طبقات تكامل رئيسية مع الخلفية:

- **`app/api/auth/*`**: تدير تسجيل الدخول، تسجيل الخروج، جلب المستخدم الحالي، الملف الشخصي، ورفع الصورة.
- **`app/api/bff/[...path]/route.ts`**: ممر عام يضيف Bearer token من الكوكيز ويمرر الطلب إلى Laravel.
- **Route Handlers متخصصة** مثل `app/api/reports/[id]/pdf/route.ts` التي تنفذ منطق Node.js خاصاً بالتوليد أو التحويل.

### 4. Shared libraries

مجلد `lib/` هو الطبقة المشتركة بين الميزات، ويضم:

- `lib/api/` عميل HTTP والتنفيذ العام للطلبات
- `lib/hooks/` خطافات مشتركة مثل `useApiQuery`, `useAction`, `useOperationalDateScope`
- `lib/config/` إعدادات الروابط وقيم الـ API
- `lib/errors/` توحيد رسائل الأخطاء
- `lib/date-scope/` منطق النطاق الزمني التشغيلي
- ملفات Utilities خاصة بالطباعة، الباركود، التقارير، المرجعيات، والتهيئة

## Directory layout

### Root-level folders

```text
app/                # App Router pages, layouts, route handlers
components/         # UI components and domain views
docs/               # project documentation
hooks/              # root-level hooks legacy/shared (limited usage)
lib/                # shared helpers, API, config, utilities
public/             # static assets
scripts/            # helper scripts
src/components/     # app shell, layout, status providers
src/features/       # feature-oriented hooks, types, utilities
styles/             # legacy or shared styles
types/              # root-level shared types when needed
```

### `app/`

مسؤول عن:

- تعريف المسارات
- ربط الصفحة بـ View جاهز
- تنفيذ Route Handlers
- تعريف Layouts العامة والمحلية

القاعدة الحالية الجيدة: ملفات الصفحة نفسها غالباً قصيرة جداً، مثل:

- `app/(protected)/dashboard/orders/page.tsx`
- `app/(protected)/dashboard/tests/page.tsx`

### `components/`

تمثل طبقة العرض الفعلية، وفيها:

- `components/ui` عناصر واجهة عامة مبنية غالباً فوق Radix/shadcn
- `components/<domain>` مكونات العرض الخاصة بكل نطاق
- `components/shared` عناصر مشتركة بين النطاقات
- `components/providers` مزودات React

### `src/features/`

هي أقرب شيء حالياً إلى طبقة التطبيق أو المجال في الواجهة الأمامية. كل ميزة تحتوي عادة على:

- `hooks/` للقراءة والكتابة وإدارة حالة الصفحة
- `types/` لتعريف الأنواع المتوافقة مع Laravel
- `lib/` لدوال التحويل وبناء الاستعلامات
- `index.ts` لإعادة التصدير

الميزات الحالية الأساسية:

- `auth`
- `categories`
- `orders`
- `patients`
- `profile`
- `reports`
- `results`
- `tests`
- `users`

### `src/components/`

تُستخدم للمكونات المشتركة على مستوى التطبيق، خصوصاً:

- Layout
- App shell
- Header / Sidebar
- Action status providers

## State model

لا توجد مكتبة حالة عامة مثل Redux أو Zustand حالياً. بدلاً من ذلك، تعتمد البنية على:

- **React state محلي** داخل الـ Views والخطافات
- **SWR** للتخزين المؤقت وإعادة التحقق للبيانات القادمة من API
- **localStorage** لحفظ إعدادات العرض مثل وضع الصفحة وإظهار الفلاتر والإحصائيات
- **cookies** لإدارة جلسة المستخدم (`access_token`)

هذا النموذج بسيط لكنه أدى إلى تكرار واضح في عدد من Page hooks، وهو موثق في ملف التحسينات.

## Authentication and session model

نموذج الجلسة الحالي كالتالي:

1. `POST /api/auth/login` يمرر بيانات الاعتماد إلى Laravel.
2. عند النجاح، يتم تخزين `token` في كوكي `access_token` بنمط `httpOnly`.
3. `proxy.ts` يمنع الوصول للمسارات الداخلية عند غياب الكوكي.
4. `app/api/auth/me` يستخدم الكوكي لإعادة طلب `auth/me` من Laravel.
5. `src/features/auth/hooks/useAuth.ts` يستخدم SWR لجلب حالة الجلسة على الواجهة.

هذه البنية تجعل المتصفح لا يتعامل مباشرة مع Bearer token، بل يستهلك Route Handlers محلية.

## Backend integration contract

### Primary backend

الخلفية المستهدفة هي Laravel API. الربط يتم بطريقتين:

- **Server-side access** عبر `getLaravelBaseUrl()`
- **Browser-side access** عبر `getApiBaseUrl()` الذي يعيد `/api/bff`

### Important environment variables

- `NEXT_PUBLIC_API_BASE_URL`: مستخدم فعلياً في `lib/config/apiConfig.ts` لبناء مسار Laravel في Route Handlers.
- `LAB_API_BASE_URL`: مستخدم في `lib/lab-api.ts` لبعض الصفحات/المسارات السيرفرية.
- `PDF_RENDER_BASE_URL`: اختياري لتوليد روابط الطباعة في PDF route.
- `PUPPETEER_EXECUTABLE_PATH`: اختياري لتحديد Chrome/Edge صراحة عند التصدير PDF.

يوجد عدم اتساق بين أسماء متغيرات البيئة الحالية ويجب توحيده لاحقاً.

### Response expectations

الواجهة تتوقع غالباً أن Laravel يعيد:

- `status`
- `message`
- `data`
- `meta` للقوائم
- `errors` في حالات التحقق
- `code` عند وجود رمز خطأ ثابت

التفاصيل موثقة في `docs/api-response-format.md`.

## Rendering and specialization

المشروع لا يقتصر على CRUD قياسي، بل يحتوي مجالات متخصصة:

- **إدارة الطلبات** وإنشاء طلب جديد مع اختيار المريض والطبيب والفحوصات
- **إدخال النتائج** مع منطق enrichment للحقول والمرجعيات
- **التقارير والطباعة** مع تخصيصات عربية ودعم PDF
- **الباركود** والماسح الضوئي وسجل القراءات
- **النطاق التشغيلي الزمني** لتوحيد تاريخ الفلاتر عبر عدة صفحات

## Strengths of the current structure

- فصل واضح نسبياً بين المسارات، العرض، وطبقة الاستدعاء.
- صفحات `app/` خفيفة وسهلة التتبع.
- وجود `src/features` أعطى المشروع نقطة تنظيم جيدة.
- وجود BFF محلي حسّن الأمان وبسّط تعامل المتصفح مع المصادقة.
- وجود وثيقة مستقلة بالفعل للنطاق الزمني التشغيلي يدل على توجه توثيقي صحيح.

## Current architectural limitations

- منطق الأعمال ما يزال موزعاً بين View components وPage hooks وHelpers داخل `components/`.
- لا توجد طبقة Services/Repositories للواجهة بشكل واضح.
- يتكرر منطق الصفحات القائم على فلاتر + localStorage + pagination في عدة Hooks.
- يوجد تداخل بين `components/`, `src/components/`, و`lib/` في بعض المسؤوليات.
- يوجد أكثر من عقدة بيئية للاتصال بالخلفية (`NEXT_PUBLIC_API_BASE_URL`, `LAB_API_BASE_URL`) بدون توحيد كامل.
- `next.config.mjs` يتجاهل أخطاء TypeScript في البناء عبر `ignoreBuildErrors: true`، ما يخفي مشاكل تكامل محتملة.

## Complementary docs

- `docs/conventions.md`
- `docs/workflow-rules.md`
- `docs/module-template.md`
- `docs/api-response-format.md`
- `docs/frontend-current-structure.md`
- `docs/architecture-improvements.md`
- `docs/dashboard-operational-date-scope.md`
