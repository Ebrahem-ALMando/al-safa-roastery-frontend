import type { LabOrderPatient } from "@/features/orders"
import { cleanNumericDisplay } from "@/lib/reference-range-format"

/** وسوم عربية مختصرة للمساعدة السريرية في لوحات الطلب والإدخال (ليست بديلًا عن منطق اختيار النطاق على الخادم). */
export function patientGenderLabelAr(gender: string | null | undefined): string | null {
  const k = String(gender ?? "").trim().toLowerCase()
  if (!k) return null
  if (k === "male" || k === "m" || k === "ذكر") return "ذكر"
  if (k === "female" || k === "f" || k === "أنثى" || k === "انثى") return "أنثى"
  return null
}

export function patientApproxAgeYears(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth?.trim()) return null
  const d = new Date(dateOfBirth)
  if (Number.isNaN(d.getTime())) return null
  return Math.abs(Date.now() - d.getTime()) / (365.25 * 86_400_000)
}

/** طفل: أقل من 18 سنة وفق المعيار العام للمختبرات السريرية. */
export function patientPediatricVsAdultAr(dateOfBirth: string | null | undefined): string | null {
  const y = patientApproxAgeYears(dateOfBirth)
  if (y == null || Number.isNaN(y)) return null
  return y < 18 ? "طفل" : "بالغ"
}

/** Display-friendly age string — whole number when possible, single decimal otherwise. */
export function formatAgeDisplay(years: number | null | undefined): string | null {
  if (years == null || Number.isNaN(years)) return null
  const rounded = Math.round(years * 10) / 10
  return Number.isInteger(rounded) ? String(Math.round(rounded)) : String(rounded)
}

/**
 * Brief Arabic clinical demographic summary for result entry context.
 * Shows: gender + age category, e.g. "ذكر · بالغ" or "أنثى · طفل"
 * Falls back gracefully when data is missing.
 */
export function patientClinicalBriefAr(patient: LabOrderPatient | null | undefined): string | null {
  const g = patientGenderLabelAr(patient?.gender)
  const cat = patientPediatricVsAdultAr(patient?.date_of_birth)
  const bits: string[] = []
  if (g) bits.push(g)
  if (cat) bits.push(cat)
  if (bits.length === 0) return null
  return bits.join(" · ")
}

/**
 * Concise demographic hint for matched reference range.
 * Shows: "الأطفال 2–13 سنة" / "الذكور البالغون 18–65 سنة" / "جميع الأعمار"
 * Uses the actual matched demographic selector — NOT patient gender when range is general/child.
 */
export function referenceRangeDemographicHint(params: {
  genderCode: string | null
  agePreset: "general" | "child" | "adult" | "custom" | null
  ageFrom: string | number | null
  ageTo: string | number | null
  ageUnit: string | null
  patientAgeYears: number | null
  patientGender: string | null
}): string {
  const {
    genderCode,
    agePreset,
    ageFrom,
    ageTo,
    ageUnit,
    patientAgeYears,
    patientGender,
  } = params

  const hasAgeRestriction = agePreset !== "general" && (ageFrom != null || ageTo != null)
  const isChildPreset = agePreset === "child" || (agePreset === "custom" && ageUnit === "year" && ageFrom != null && Number(ageFrom) < 18)

  if (isChildPreset || agePreset === "child") {
    const from = ageFrom != null ? cleanNumericDisplay(ageFrom) : "2"
    const to = ageTo != null ? cleanNumericDisplay(ageTo) : "13"
    return `الأطفال ${from}–${to} سنة`
  }

  if (agePreset === "adult" || (agePreset === "custom" && ageUnit === "year" && ageFrom != null && Number(ageFrom) >= 18)) {
    const from = ageFrom != null ? cleanNumericDisplay(ageFrom) : "18"
    const to = ageTo != null ? cleanNumericDisplay(ageTo) : "65"
    return `البالغون ${from}–${to} سنة`
  }

  if (hasAgeRestriction) {
    const bits: string[] = []
    if (ageFrom != null) bits.push(`من ${cleanNumericDisplay(ageFrom)}`)
    if (ageTo != null) bits.push(`إلى ${cleanNumericDisplay(ageTo)}`)
    if (ageUnit === "year") return `العمر ${bits.join(" ")} سنة`
    if (ageUnit === "month") return `العمر ${bits.join(" ")} شهر`
    if (ageUnit === "day") return `العمر ${bits.join(" ")} يوم`
    return `العمر ${bits.join(" ")}`
  }

  if (genderCode && genderCode !== "__any__" && genderCode !== null) {
    const label = genderCode === "male" ? "الذكور" : genderCode === "female" ? "الإناث" : null
    if (label) return label
  }

  return "جميع الأعمار"
}
