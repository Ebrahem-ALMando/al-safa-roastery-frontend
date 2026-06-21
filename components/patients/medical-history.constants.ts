/**
 * وحيد المصدر لعناوين أقسام التاريخ المرضي في الواجهة والدمج مع الـ API.
 */
export const MEDICAL_HISTORY_SECTIONS = {
  chronicDiseases: "الأمراض المزمنة (السوابق المرضية)",
  currentMedications: "الأدوية الحالية",
  allergies: "الحساسيات",
  surgicalHistory: "السوابق الجراحية",
  additionalMedicalNotes: "ملاحظات إضافية",
} as const

export type MedicalHistorySectionKey = keyof typeof MEDICAL_HISTORY_SECTIONS

/** ترتيب إدراج الأقسام في النص المركّب */
export const MEDICAL_HISTORY_SECTION_ORDER: readonly MedicalHistorySectionKey[] = [
  "chronicDiseases",
  "currentMedications",
  "allergies",
  "surgicalHistory",
  "additionalMedicalNotes",
]

/** بادئة عنوان قسم جراحات قد تظهر في بيانات قديمة (فكّ فقط، لا يُستعمل في البناء). */
export const MEDICAL_HISTORY_LEGACY_SURGICAL_HEADER = "العمليات السابقة"

/** أقصى طول مسموح لحقل medical_history على الخادم والواجهة */
export const MEDICAL_HISTORY_MAX_CHARS = 20_000

/** تلميحات للعرض ضمن placeholders (ارتباط بنفس المفاتيح) */
export const MEDICAL_HISTORY_PLACEHOLDER_HINTS: Record<
  MedicalHistorySectionKey,
  string
> = {
  chronicDiseases: "أمثلة: سكري، ضغط — سطر واحد أو أكثر.",
  currentMedications: "الاسم أو الجرعة إن وُجدت.",
  allergies: "دوائي، غذائي، أو غير ذلك.",
  surgicalHistory: "عمليات أو إجراءات أو قسطرة…",
  additionalMedicalNotes: "أي تفاصيل أخرى تخص الحالة الطبية.",
}
