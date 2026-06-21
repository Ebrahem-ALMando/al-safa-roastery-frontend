/**
 * نصوص إرشادية ثابتة تظهر في التقرير (كانت في البيانات التجريبية سابقاً).
 * تُدار بشكل منفصل عن ملاحظات الطلب القادمة من الـ API.
 */
export const REPORT_DEFAULT_STATIC_NOTES: readonly string[] = [
  "النتائج المظللة باللون الأحمر أو الأصفر تشير إلى قيم خارج النطاق الطبيعي",
  "يرجى استشارة الطبيب المختص لتفسير النتائج واتخاذ الإجراءات اللازمة",
  "هذا التقرير صادر آلياً ولا يحتاج إلى توقيع في حال الاعتماد الإلكتروني",
  "يمكن التحقق من صحة التقرير عبر مسح رمز الاستجابة السريعة (QR)",
]

export const REPORT_DEFAULT_STATIC_NOTES_EN: readonly string[] = [
  "Results highlighted in red or yellow indicate values outside the normal range.",
  "Please consult your physician to interpret the results and take appropriate action.",
  "This report is generated automatically and does not require a signature when electronically approved.",
  "You can verify this report by scanning the QR code.",
]

/** إرشادات مختصرة عند تفعيل «تقرير مبسّط للمريض» */
export const REPORT_PATIENT_SHORT_AR: readonly string[] = [
  "يرجى استشارة الطبيب لتفسير النتائج واتخاذ الإجراء المناسب.",
  "يمكن التحقق من صحة التقرير عبر مسح رمز الاستجابة السريعة (QR).",
]

export const REPORT_PATIENT_SHORT_EN: readonly string[] = [
  "Please consult your physician to interpret the results and take appropriate action.",
  "You can verify this report by scanning the QR code.",
]

