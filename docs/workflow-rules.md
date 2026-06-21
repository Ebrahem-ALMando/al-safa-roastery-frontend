# Workflow rules

## Local setup workflow

### Requirements

- Node.js حديث متوافق مع Next 16
- npm أو pnpm، مع ضرورة اعتماد مدير حزم واحد داخل الفريق
- Laravel backend شغال محلياً
- Chrome أو Edge متاحان إذا كانت ميزة PDF مطلوبة

### Environment

الحد الأدنى المطلوب للتشغيل:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
LAB_API_BASE_URL=http://127.0.0.1:8000
```

اختياري:

```env
PDF_RENDER_BASE_URL=http://127.0.0.1:3000
PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

ملاحظة مهمة: ملف `env.example` الحالي لا يعكس بالكامل المتغيرات المستخدمة فعلياً في `lib/config/apiConfig.ts`، لذلك يجب مزامنته عند أي تعديل بيئي.

### Install and run

```bash
npm install
npm run dev
```

أوامر مفيدة:

```bash
npm run lint
npm run build
```

## Standard feature workflow

عند إضافة صفحة أو ميزة جديدة، اتبع المسار التالي:

1. أضف route داخل `app/`.
2. أنشئ View رئيسي داخل `components/<domain>/`.
3. أضف hooks/types/helpers داخل `src/features/<domain>/`.
4. إذا احتجت تكامل backend:
   - استخدم BFF الحالي إن كان endpoint عادياً
   - أو أضف Route Handler متخصص إذا كانت هناك حاجة منطقية على السيرفر
5. اربط الصفحة بوثيقة `docs/` إذا كانت تضيف نمطاً أو سلوكاً مشتركاً جديداً.

## Page workflow

### Dashboard list pages

النمط الحالي المتكرر للصفحات الجدولية:

1. `page.tsx` يعرض View واحداً.
2. View يحتوي:
   - `DashboardPageHeader`
   - أدوات التحكم العامة
   - KPI summary اختياري
   - filters
   - data view
   - dialogs
3. hook صفحة مثل `useOrdersPage` أو `usePatientsPage` يدير:
   - search
   - filters
   - pagination
   - localStorage config
   - date scope
4. Hook بيانات مثل `useOrders` أو `usePatients` ينفذ القراءة عبر SWR.

### New form-heavy pages

لصفحات الإدخال الثقيلة مثل إنشاء الطلب:

- اجعل View مسؤولاً عن العرض والتركيب.
- انقل بناء payload والتحويلات القابلة لإعادة الاستخدام إلى `src/features/<domain>/lib` أو `services`.
- اجعل hook الصفحة ينسق الحالات العامة فقط، لا أن يصبح ملف domain service كامل.

## API integration workflow

### Read operations

لجلب البيانات:

1. عرف type للاستجابة أو البيانات داخل `src/features/<domain>/types`.
2. أضف helper لبناء query params إذا كانت الصفحة تحتاج فلاتر متعددة.
3. استخدم `useApiQuery` أو hook مخصص فوقها.
4. أعد فقط البيانات الجاهزة للاستهلاك من View.

### Write operations

للكتابة:

1. استخدم `useAction`.
2. ضع endpoint/method/payload في hook مخصص داخل feature.
3. أعد تنفيذ `mutate` أو `invalidate` لمفاتيح SWR ذات الصلة.
4. لا تكرر منطق toast يدوياً إلا إذا كنت تحتاج سلوكاً مختلفاً عن الافتراضي.

## Auth workflow

التدفق القياسي للمصادقة:

1. `app/api/auth/login` يمرر اسم المستخدم وكلمة المرور إلى Laravel.
2. عند النجاح، يتم حفظ `access_token` في cookie آمنة نسبياً.
3. `proxy.ts` يمنع الوصول للمسارات الداخلية لغير المصادقين.
4. `useAuth` يستدعي `/api/auth/me` لتحديد المستخدم الحالي.
5. تسجيل الخروج يجب أن يزيل الكوكي ويعيد المستخدم إلى شاشة الدخول.

إذا أُضيف endpoint auth جديد:

- اجعله ضمن `app/api/auth/*`
- وحافظ على نفس أسلوب تمرير status/body/content-type

## BFF workflow

المسار الافتراضي لأي endpoint جديد من Laravel:

- من المتصفح -> `/api/bff/<path>`
- من Route Handler -> Laravel مباشرة إذا لزم الوصول من السيرفر

قواعد BFF الحالية:

- يقرأ `access_token` من الكوكي
- يضيف `Authorization: Bearer <token>` عند وجوده
- يمرر body للطلبات غير `GET/HEAD`
- يعيد محتوى الاستجابة مع `content-type`

عند توسيع BFF:

- لا تضف منطق أعمال domain داخل route العام
- اجعل الممر العام عاماً، وأضف Route Handler متخصص فقط للحالات الخاصة

## Date-scope workflow

عند إنشاء صفحة تتأثر بالتاريخ:

1. حدد `pageId` واضحاً.
2. اربط الصفحة بـ `useOperationalDateScope(pageId)`.
3. مرر `dateRange` إلى hook البيانات.
4. إذا احتجت دمج نطاق تشغيلي مع حقول تاريخ يدوية، فاستخدم helpers الحالية.
5. وثق أي binding API جديد في ملف النطاق الزمني.

## Print and PDF workflow

التقارير والـ PDF تتبع المسار التالي:

1. صفحة طباعة داخل `app/print/report/[id]/page.tsx`
2. Route Handler داخل `app/api/reports/[id]/pdf/route.ts`
3. Puppeteer يفتح صفحة الطباعة ويولد ملف PDF
4. الاستجابة تعاد إما كملف مباشر أو JSON base64 عند `format=json`

قواعد مهمة:

- يجب أن يكون runtime هو `nodejs`
- يجب انتظار سطح الطباعة `#report-print-surface`
- يجب التأكد من وجود Chrome/Edge أو مسار تنفيذي محدد

## Barcode and scanning workflow

تدفقات الباركود تعتمد على:

- listeners داخل layout/app shell
- helpers داخل `lib/`
- مكونات عرض داخل `components/barcode` و`components/orders`

أي تطوير جديد في هذا المجال يجب أن يحافظ على:

- عزل parsing والمنطق داخل helpers
- إبقاء المكونات للعرض فقط
- عدم خلط منطق المسح مع منطق الطلبات نفسه

## Mutation safety rules

- بعد أي عملية إنشاء/تحديث/حذف، أعد التحقق من مفاتيح SWR المتأثرة.
- عند وجود صفحة قائمة وصفحة تفاصيل، يجب تحديثهما معاً إن أمكن.
- لا تفترض أن mutate المحلي وحده يكفي إذا كان هناك أكثر من مفتاح لنفس الكيان.

## UI workflow rules

- استخدم Views على مستوى الصفحة بدلاً من وضع JSX الكبير داخل `page.tsx`.
- افصل dialogs الكبيرة في ملفات مستقلة.
- استخدم مكونات `components/ui` قبل بناء عنصر جديد من الصفر.
- اجعل رسائل الخطأ والنجاح عربية ومتسقة.

## Before merging changes

تحقق من الآتي:

1. الصفحة تعمل محلياً.
2. المسارات المحمية لا تُفتح بدون جلسة.
3. الـ API requests تذهب إلى BFF أو Route Handler الصحيح.
4. البحث والفلاتر وpagination تعمل بعد تحديث الصفحة.
5. الإعدادات المحفوظة في `localStorage` لا تكسر الصفحة عند تلف القيمة.
6. `npm run lint` يمر.

## When to update docs

حدّث `docs/` في الحالات التالية:

- إضافة feature module جديد
- تغيير عقد API متوقع في الواجهة
- تغيير طريقة الربط مع Laravel
- تغيير نمط auth أو cookies
- إضافة pattern مشترك جديد للصفحات
- تغيير تدفق PDF أو barcode أو date scope
