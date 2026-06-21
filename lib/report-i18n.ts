export type ReportLanguage = "ar" | "en"

export type ReportLabels = {
  /** نص قصير تحت رمز QR في ترويسة التقرير — رابط التحقق العام */
  reportQrCaptionVerify: string
  /** نص قصير تحت رمز QR عند استخدام رابط ملف المريض (بديل) */
  reportQrCaptionPatient: string
  reportVerificationQr: string
  reportMetaAria: string
  reportNumber: string
  orderDate: string
  reportIssueDate: string
  patientData: string
  patientInfo: string
  fileOrId: string
  age: string
  years: string
  gender: string
  referringDoctor: string
  patientProfileQr: string
  reportGroupBadge: string
  orderNotesTitle: string
  generalGuidanceTitle: string
  resultsTitle: string
  test: string
  result: string
  unit: string
  referenceRange: string
  /** عمود من طلب المريض السابق */
  previousResult: string
  previousOrderDateLabel: string
  status: string
  high: string
  low: string
  normal: string
  abnormal: string
  unevaluated: string
  technicianSignature: string
  laboratoryStamp: string
  directorSignature: string
  footerDisclaimer: string
  /** عنوان فرعي للمختبر بالإنجليزي عند عدم توفير ترجمة */
  defaultLabSubtitle: string
  /** {{count}} يُستبدل بعدد النتائج غير الطبيعية */
  abnormalSummaryLine: string
}

const labelsAr: ReportLabels = {
  reportQrCaptionVerify: "تحقق من التقرير",
  reportQrCaptionPatient: "ملف المريض",
  reportVerificationQr: "رمز التحقق من التقرير",
  reportMetaAria: "بيانات التقرير",
  reportNumber: "رقم التقرير",
  orderDate: "تاريخ الطلب",
  reportIssueDate: "تاريخ إصدار التقرير",
  patientData: "بيانات المريض",
  patientInfo: "معلومات المريض",
  fileOrId: "رقم الملف / المريض",
  age: "العمر",
  years: "سنة",
  gender: "الجنس",
  referringDoctor: "الطبيب المحول",
  patientProfileQr: "تفاصيل المريض",
  reportGroupBadge: "التقرير",
  orderNotesTitle: "ملاحظات على الطلب",
  generalGuidanceTitle: "إرشادات عامة",
  resultsTitle: "نتائج التحاليل",
  test: "التحليل",
  result: "النتيجة",
  unit: "الوحدة",
  referenceRange: "المعدل الطبيعي",
  previousResult: "النتيجة السابقة",
  previousOrderDateLabel: "تاريخ الطلب السابق",
  status: "الحالة",
  high: "مرتفع",
  low: "منخفض",
  normal: "طبيعي",
  abnormal: "غير طبيعي",
  unevaluated: "—",
  technicianSignature: "توقيع الفني المسؤول",
  laboratoryStamp: "ختم المختبر",
  directorSignature: "توقيع مدير المختبر",
  footerDisclaimer:
    "هذا التقرير صادر عن النظام ولا يحتاج توقيع يدوي عند الاعتماد الإلكتروني",
  defaultLabSubtitle: "تقرير نتائج التحاليل الطبية",
  abnormalSummaryLine: "نتائج خارج المعدل الطبيعي: {{count}}",
}

const labelsEn: ReportLabels = {
  reportQrCaptionVerify: "Verify report",
  reportQrCaptionPatient: "Patient file",
  reportVerificationQr: "Report verification code",
  reportMetaAria: "Report details",
  reportNumber: "Report no.",
  orderDate: "Order date",
  reportIssueDate: "Report issue date",
  patientData: "Patient information",
  patientInfo: "Patient info",
  fileOrId: "File / ID no.",
  age: "Age",
  years: "y",
  gender: "Gender",
  referringDoctor: "Referring physician",
  patientProfileQr: "Patient profile",
  reportGroupBadge: "Report",
  orderNotesTitle: "Order notes",
  generalGuidanceTitle: "General guidance",
  resultsTitle: "Test results",
  test: "Test",
  result: "Result",
  unit: "Unit",
  referenceRange: "Reference range",
  previousResult: "Previous result",
  previousOrderDateLabel: "Previous order date",
  status: "Status",
  high: "High",
  low: "Low",
  normal: "Normal",
  abnormal: "Abnormal",
  unevaluated: "—",
  technicianSignature: "Responsible technician",
  laboratoryStamp: "Laboratory stamp",
  directorSignature: "Laboratory director",
  footerDisclaimer:
    "This report is issued by the system and does not require a manual signature for electronic approval.",
  defaultLabSubtitle: "Medical laboratory results report",
  abnormalSummaryLine: "Results outside reference range: {{count}}",
}

export function getReportLabels(lang: ReportLanguage): ReportLabels {
  return lang === "en" ? labelsEn : labelsAr
}

export function formatAbnormalSummaryLabel(L: ReportLabels, count: number): string {
  return L.abnormalSummaryLine.replace(/\{\{count\}\}/g, String(count))
}

export function formatReportDatePerhapsHijri(
  isoDate: string,
  lang: ReportLanguage,
  showHijri: boolean
): string {
  const base = formatReportDate(isoDate, lang)
  if (!showHijri) return base
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return base
  try {
    const locale = lang === "en" ? "en-u-ca-islamic" : "ar-SA-u-ca-islamic"
    const hijri = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d)
    return lang === "en" ? `${base} (${hijri})` : `${base} · ${hijri}`
  } catch {
    return base
  }
}

export function formatReportDate(isoDate: string, lang: ReportLanguage): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return "—"
  const loc = lang === "en" ? "en-GB" : "ar-SA"
  return d.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** عرض الجنس في واجهة إنجليزية عند وصول قيم عربية من الـ API */
export function formatGenderDisplay(genderRaw: string, lang: ReportLanguage): string {
  if (lang === "ar") return genderRaw
  const g = genderRaw.trim().toLowerCase()
  if (g === "ذكر" || g === "male" || g === "m") return "Male"
  if (g === "أنثى" || g === "female" || g === "f") return "Female"
  return genderRaw
}

export function labSubtitleForLang(lang: ReportLanguage, currentSubtitle: string): string {
  if (lang === "ar") return currentSubtitle
  return labelsEn.defaultLabSubtitle
}
