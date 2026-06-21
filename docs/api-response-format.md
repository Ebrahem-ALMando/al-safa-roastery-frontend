# API response format

هذا الملف يعرّف **العقد الذي تتوقعه الواجهة الأمامية** عند استهلاك Laravel عبر BFF أو Route Handlers المحلية. الهدف ليس فرض شكل backend جديد بحد ذاته، بل توثيق ما تعتمد عليه الواجهة حالياً حتى لا تنكسر الميزات عند أي تعديل.

## Standard success envelope

الغالبية العظمى من hooks الحالية تفترض الاستجابة التالية:

```json
{
  "status": 200,
  "message": "تمت العملية بنجاح",
  "data": {},
  "meta": {}
}
```

### Required fields

- `status`: رقم HTTP status.
- `message`: رسالة مختصرة صالحة للعرض أو الاستخدام في toast.
- `data`: الكيان أو القائمة المطلوبة.

### Optional fields

- `code`: رمز ثابت تستخدمه الواجهة أحياناً للتفريع.
- `meta`: بيانات pagination أو إجماليات للقوائم.

## Collection responses

الصفحات الجدولية مثل المرضى والفحوصات والطلبات تعتمد غالباً على:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "id": 1, "name": "..." }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}
```

### Collection rules

- `data` يجب أن تكون مصفوفة.
- `meta.total` مهم للبطاقات الملخصة والعد الكلي.
- `current_page` و`last_page` مستخدمان مباشرة في pagination.

## Single-resource responses

مثال:

```json
{
  "status": 200,
  "message": "تم جلب المريض",
  "data": {
    "id": 10,
    "full_name": "..."
  }
}
```

الواجهة تتوقع أن يكون الكيان مباشرة داخل `data` بدون طبقات إضافية مثل `attributes`.

## Mutation responses

عمليات الإنشاء والتحديث والحذف تستخدم عادة:

```json
{
  "status": 201,
  "message": "تم الإنشاء بنجاح",
  "data": {
    "id": 123
  }
}
```

قواعد عملية:

- يجب إعادة `message` واضح لأن `useAction` و`useActionToast` قد يعرضانه مباشرة.
- يستحسن إعادة الكيان الناتج بعد الإنشاء أو التحديث.
- في الحذف يمكن أن يكون `data` فارغاً أو `null` إذا كان هذا موثقاً بوضوح.

## Validation and business errors

الواجهة تتوقع الشكل التالي في الأخطاء:

```json
{
  "status": 422,
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": {
    "field_name": ["رسالة الخطأ"]
  }
}
```

### Error field expectations

- `status`: ضروري
- `message`: ضروري
- `errors`: اختياري لكنه مهم جداً لربط الأخطاء بالنماذج
- `code`: اختياري لكنه مفيد لتمييز حالات الأعمال

الملف `lib/api/apiClient.ts` يحاول استخراج:

- `message`
- `code`
- `errors`

وأي خروج عن هذا النمط قد يؤدي إلى رسائل عامة فقط.

## Auth route responses

المسارات داخل `app/api/auth/*` لا تعيد دائماً نفس جسم Laravel الخام، بل قد تعيد نسخة محلية منسقة.

### Login

الواجهة تتوقع من `/api/auth/login`:

```json
{
  "status": 200,
  "code": "AUTH_LOGIN_SUCCESS",
  "message": "تم تسجيل الدخول بنجاح.",
  "data": {
    "user": {}
  }
}
```

ويتم تخزين `token` في cookie بدلاً من إعادته للواجهة.

### Me

`/api/auth/me` يعيد غالباً نفس استجابة Laravel مع تمرير الـ body كما هو. في `useAuth`:

- `401` لا تعتبر خطأ تقنياً بل حالة "غير مسجل الدخول"
- أي status آخر يعامل كفشل حقيقي

## BFF passthrough behavior

`/api/bff/[...path]` يمرر معظم الاستجابات كما هي من Laravel:

- status كما هو
- body كما هو
- `Content-Type` كما هو
- `Content-Disposition` عند وجود تنزيلات

هذا يعني أن أي endpoint جديد خلف BFF يجب أن يحافظ على عقد Laravel القياسي ما لم يكن endpoint binary/raw.

## Non-JSON responses

ليست كل الاستجابات JSON:

- ملفات PDF
- تنزيلات محتملة مستقبلية
- استجابات route handlers خاصة

في هذه الحالات:

- يجب إعادة `Content-Type` صحيح
- ويجب ألا تفترض hooks العامة أن الاستجابة JSON

## Domain shape notes

بالإضافة إلى envelope العام، هناك عقود شكلية مهمة تعتمد عليها الواجهة:

- `LabOrder` يحتوي `items`, `patient`, و`requested_by_user` عند التحميل الكامل
- `Test` غالباً يحتوي `category`, `fields`, `prices`
- `Patient` يعتمد على `full_name` كاسم العرض الأساسي
- `Report/Result` يعيدان بيانات مركبة للاستخدام في العرض والطباعة

أي حذف لحقل مستخدم في العرض يجب أن يراجع معه:

- `src/features/*/types`
- أي mapper أو helper مرتبط
- أي component يستخدم هذا الحقل مباشرة

## Pagination contract

القوائم الحالية تعتمد عادة على:

```json
{
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 70
  }
}
```

إذا أعاد backend أسماء مختلفة، يجب إضافة طبقة تحويل قبل تمرير البيانات إلى الـ View.

## Backward compatibility rule

أي تغيير في الخلفية على مستوى:

- اسم الحقل
- نوع الحقل
- nesting داخل `data`
- أسماء pagination
- وجود `message` أو `errors`

قد يكسر الواجهة الحالية مباشرة، لأن كثيراً من hooks والمكونات تستهلك الشكل كما هو. لذلك:

- يجب توثيق أي تغيير في هذا الملف
- ويجب تحديث `src/features/.../types` وmappers بالتزامن

## Recommended response policy for new endpoints

لأي endpoint جديد موجّه لهذه الواجهة:

1. استخدم Envelope Laravel المعياري.
2. أعد `message` صالحاً للعرض.
3. أعد `errors` بشكل field map في حالات 422.
4. أعد `meta` ثابتة في القوائم.
5. لا تغيّر أسماء الحقول الحالية دون طبقة توافق.
