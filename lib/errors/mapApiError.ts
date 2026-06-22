import { ApiRequestError } from "@/lib/api"

/** Mirrors backend `ApiCodes` — used when the body message is not Arabic. */
const API_ERROR_BY_CODE: Record<string, string> = {
  VALIDATION_ERROR: "فشل التحقق من البيانات.",
  NOT_FOUND: "لم يُعثَر على المورد.",
  CONFLICT: "تعارض في العملية المطلوبة.",
  DOMAIN_UNKNOWN: "تعذر إتمام العملية.",
  // Auth
  AUTH_INVALID_CREDENTIALS: "بيانات تسجيل الدخول غير صحيحة.",
  AUTH_CURRENT_PASSWORD_INVALID: "كلمة المرور الحالية غير صحيحة.",
  AUTH_INACTIVE_USER: "الحساب غير مفعّل.",
  UNAUTHENTICATED: "يرجى تسجيل الدخول.",
  // Categories
  DOMAIN_CATEGORY_CYCLE: "تصنيف رئيسي غير صالح: سيتسبب بحلقة في التسلسل.",
  DOMAIN_CATEGORY_NAME_REQUIRED: "اسم التصنيف مطلوب.",
  // Tests
  DOMAIN_TEST_INVALID_PAYLOAD: "بيانات الفحص غير صالحة.",
  // Patients
  DOMAIN_PATIENT_NAME_REQUIRED: "الاسم الكامل مطلوب.",
  DOMAIN_PATIENT_HAS_LAB_ORDERS: "لا يمكن حذف مريض مرتبط بطلبات مختبر.",
  // Lab orders
  DOMAIN_LAB_ORDER_PATIENT_REQUIRED: "معرّف المريض مطلوب.",
  // Results
  DOMAIN_RESULT_ORDER_ITEM_NO_TEST: "عنصر الطلب ليس مرتبطاً بفحص.",
  DOMAIN_RESULT_FIELD_REQUIRED: "حقل نتيجة مطلوب.",
  DOMAIN_RESULT_FIELD_INVALID: "حقل اختبار غير صالح لعنصر الطلب.",
  DOMAIN_RESULT_TEST_FIELD_INACTIVE: "لا يمكن تسجيل نتائج لحقل غير مفعّل.",
  // Attachments
  DOMAIN_ATTACHMENTS_NO_VALID_FILES: "لم يُرفع أي ملف صالح.",
  DOMAIN_ATTACHMENTS_INVALID_ATTACHABLE_TYPE: "نوع المرفق غير صالح.",
  DOMAIN_ATTACHMENTS_ATTACHABLE_NOT_FOUND: "العنصر المرتبط غير موجود.",
  DOMAIN_ATTACHMENTS_PDF_WRITE_FAILED: "فشل تخزين ملف PDF.",
  DOMAIN_ATTACHMENTS_NOT_FOUND: "المرفق غير موجود.",
}

const ARABIC_RE = /[\u0600-\u06FF]/

function messageLooksArabic(message: string): boolean {
  return ARABIC_RE.test(message)
}

/**
 * Resolves a user-facing Arabic string. Prefer the server `message` when it is Arabic, then
 * `code`, then HTTP status. Never shows raw English from the network as the final message
 * when a code or status mapping exists.
 */
export function mapApiError(err: unknown): string {
  if (err instanceof ApiRequestError) {
    if (err.status === 0) {
      return "فشل الاتصال بالشبكة"
    }

    const m = err.message
    if (m && messageLooksArabic(m)) {
      return m
    }

    if (err.code) {
      const byCode = API_ERROR_BY_CODE[err.code]
      if (byCode) {
        return byCode
      }
    }

    if (err.status === 401) {
      return err.code === "UNAUTHENTICATED"
        ? API_ERROR_BY_CODE.UNAUTHENTICATED
        : "يرجى تسجيل الدخول."
    }
    if (err.status === 403) {
      return "الحساب غير مفعّل"
    }
    if (err.status === 404) {
      return "لم يُعثَر على المورد"
    }
    if (err.status === 409) {
      return "تعارض في العملية المطلوبة"
    }
    if (err.status === 422) {
      return "فشل التحقق من البيانات"
    }
    if (err.status === 429) {
      return "تم إرسال طلبات كثيرة. حاول لاحقاً"
    }
    if (err.status === 503) {
      return "الخادم غير متوفر مؤقتاً"
    }
    if (err.status >= 500) {
      return "حدث خطأ في الخادم"
    }
  }

  if (err instanceof TypeError) {
    return "فشل الاتصال بالشبكة"
  }
  if (err instanceof Error && err.name === "AbortError") {
    return "تم إلغاء الطلب"
  }
  return "حدث خطأ غير متوقع. حاول مرة أخرى."
}
