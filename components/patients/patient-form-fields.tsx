"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AlertTriangle,
  Cake,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  IdCard,
  Info,
  Mail,
  MapPin,
  Mars,
  Phone,
  Pill,
  Stethoscope,
  Syringe,
  User,
  Venus,
  VenusAndMars,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { patientAgeYearsFromDob } from "@/lib/lab-order-to-report-data"
import type { CreatePatientInput, Patient, UpdatePatientInput } from "@/features/patients"
import {
  MEDICAL_HISTORY_MAX_CHARS,
  MEDICAL_HISTORY_PLACEHOLDER_HINTS,
  MEDICAL_HISTORY_SECTION_ORDER,
  MEDICAL_HISTORY_SECTIONS,
  type MedicalHistorySectionKey,
} from "./medical-history.constants"
import {
  buildMedicalHistoryText,
  exceedsMedicalHistoryLimit,
  parseMedicalHistoryText,
  type MedicalHistoryFieldValues,
} from "./medical-history-text"

export type PatientFormState = {
  fullName: string
  nationalId: string
  gender: string
  dateOfBirth: string
  phone: string
  email: string
  address: string
  notes: string
  chronicDiseases: string
  currentMedications: string
  allergies: string
  surgicalHistory: string
  additionalMedicalNotes: string
  isActive: boolean
}

export function emptyPatientForm(): PatientFormState {
  return {
    fullName: "",
    nationalId: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    chronicDiseases: "",
    currentMedications: "",
    allergies: "",
    surgicalHistory: "",
    additionalMedicalNotes: "",
    isActive: true,
  }
}

function medicalFieldsFromPatientForm(form: PatientFormState): MedicalHistoryFieldValues {
  return {
    chronicDiseases: form.chronicDiseases,
    currentMedications: form.currentMedications,
    allergies: form.allergies,
    surgicalHistory: form.surgicalHistory,
    additionalMedicalNotes: form.additionalMedicalNotes,
  }
}

/** يُستدعَى قبل الإرسال لتفادي 422 عندما يتجاوز الدمج الحد المسموح على الخادم. */
export function exceedsPatientFormMedicalHistoryLimit(s: PatientFormState): boolean {
  return exceedsMedicalHistoryLimit(medicalFieldsFromPatientForm(s))
}

function parseFlexibleDateInput(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null

  const ymdLike = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (ymdLike) {
    const year = Number.parseInt(ymdLike[1] ?? "", 10)
    const month = Number.parseInt(ymdLike[2] ?? "", 10)
    const day = Number.parseInt(ymdLike[3] ?? "", 10)
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      const date = new Date(year, month - 1, day)
      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        year >= 1900 &&
        year <= new Date().getFullYear()
      ) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      }
    }
  }

  const dmyLike = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyLike) {
    const day = Number.parseInt(dmyLike[1] ?? "", 10)
    const month = Number.parseInt(dmyLike[2] ?? "", 10)
    const year = Number.parseInt(dmyLike[3] ?? "", 10)
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      const date = new Date(year, month - 1, day)
      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        year >= 1900 &&
        year <= new Date().getFullYear()
      ) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      }
    }
  }

  return null
}

function buildIsoFromParts(y: string, m: string, d: string): string | null {
  const year = Number.parseInt(y, 10)
  const month = Number.parseInt(m, 10)
  const day = Number.parseInt(d, 10)
  if (!y.trim() || !m.trim() || !d.trim()) return null
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  if (year < 1900 || year > new Date().getFullYear()) return null
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export const MIN_PATIENT_AGE_YEARS = 1
const MAX_PATIENT_AGE_YEARS = 150

/** آخر تاريخ ميلاد مسموح (يوم كامل قبل سنة واحدة على الأقل). */
export function maxDateOfBirthIsoForMinAge(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - MIN_PATIENT_AGE_YEARS)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** تحقق من تاريخ الميلاد / العمر قبل الحفظ — يُرجع رسالة خطأ بالعربية أو null. */
export function validatePatientDobOrAge(dateOfBirth: string): string | null {
  const raw = dateOfBirth.trim()
  if (!raw) return null

  const iso =
    parseFlexibleDateInput(raw) ??
    (/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null)
  if (!iso) return "تاريخ الميلاد غير صالح"

  const age = patientAgeYearsFromDob(iso)
  if (age === null) return "تاريخ الميلاد غير صالح"
  if (age < 0) return "تاريخ الميلاد لا يمكن أن يكون في المستقبل"
  if (age < MIN_PATIENT_AGE_YEARS) {
    return `يجب أن يكون عمر المريض ${MIN_PATIENT_AGE_YEARS} سنة على الأقل`
  }
  if (age > MAX_PATIENT_AGE_YEARS) {
    return `العمر يتجاوز الحد المسموح (${MAX_PATIENT_AGE_YEARS} سنة)`
  }
  return null
}

/** يُقدَّر تاريخ الميلاد من العمر: نفس اليوم والشهر قبل N سنة (مناسب للمختبر). */
export function deriveDobIsoFromAgeYears(ageYears: number): string | null {
  if (
    !Number.isFinite(ageYears) ||
    ageYears < MIN_PATIENT_AGE_YEARS ||
    ageYears > MAX_PATIENT_AGE_YEARS
  ) {
    return null
  }
  const today = new Date()
  const birth = new Date(today.getFullYear() - Math.floor(ageYears), today.getMonth(), today.getDate())
  const y = birth.getFullYear()
  if (y < 1900 || y > today.getFullYear()) return null
  const m = birth.getMonth() + 1
  const d = birth.getDate()
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function formatDobDisplayAr(iso: string): string {
  const parts = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!parts) return iso
  const y = Number(parts[1])
  const mo = Number(parts[2])
  const day = Number(parts[3])
  const date = new Date(y, mo - 1, day)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function patientToForm(p: Patient): PatientFormState {
  const mh = parseMedicalHistoryText(p.medical_history ?? null)
  return {
    fullName: p.full_name ?? "",
    nationalId: p.national_id ?? "",
    gender: p.gender ?? "",
    dateOfBirth: p.date_of_birth ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
    address: p.address ?? "",
    notes: p.notes ?? "",
    chronicDiseases: mh.chronicDiseases,
    currentMedications: mh.currentMedications,
    allergies: mh.allergies,
    surgicalHistory: mh.surgicalHistory,
    additionalMedicalNotes: mh.additionalMedicalNotes,
    isActive: p.is_active,
  }
}

export function formToCreatePayload(s: PatientFormState): CreatePatientInput {
  const mh = buildMedicalHistoryText(medicalFieldsFromPatientForm(s))
  return {
    full_name: s.fullName.trim(),
    national_id: s.nationalId.trim() || null,
    gender: s.gender.trim() || null,
    date_of_birth: parseFlexibleDateInput(s.dateOfBirth),
    phone: s.phone.trim() || null,
    email: s.email.trim() || null,
    address: s.address.trim() || null,
    notes: s.notes.trim() || null,
    medical_history: mh.length > 0 ? mh : null,
    is_active: s.isActive,
  }
}

export function formToUpdatePayload(s: PatientFormState): UpdatePatientInput {
  const mh = buildMedicalHistoryText(medicalFieldsFromPatientForm(s))
  return {
    full_name: s.fullName.trim(),
    national_id: s.nationalId.trim() || null,
    gender: s.gender.trim() || null,
    date_of_birth: s.dateOfBirth.trim() || null,
    phone: s.phone.trim() || null,
    email: s.email.trim() || null,
    address: s.address.trim() || null,
    notes: s.notes.trim() || null,
    medical_history: mh.length > 0 ? mh : null,
    is_active: s.isActive,
  }
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors peer-focus:text-primary"
      aria-hidden
    >
      {children}
    </span>
  )
}

type PatientFormFieldsProps = {
  form: PatientFormState
  onChange: (next: PatientFormState) => void
  idPrefix: string
  nameFieldAutoFocus?: boolean
}

const sectionClass =
  "min-w-0 space-y-3 rounded-xl border border-border/50 bg-muted/20 p-3.5 sm:p-4"
const sectionTitleClass = "px-0.5 text-sm font-bold text-primary"
const fieldCardClass =
  "flex min-h-0 flex-col gap-2.5 rounded-xl border border-border/60 bg-gradient-to-b from-background via-background/95 to-muted/15 p-3.5 shadow-sm ring-1 ring-border/30"

/** محاذاة مع أكورديون نموذج الفحص — text-start مع dir=rtl = يمين */
const medicalAccordionTriggerClass =
  "gap-3 rounded-xl px-4 py-3.5 text-start! hover:no-underline [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"

type MedicalAccordionUi = {
  Icon: LucideIcon
  shell: string
  trigger: string
  iconTint: string
  inner: string
}

const MEDICAL_SECTION_ACCORDION: Record<MedicalHistorySectionKey, MedicalAccordionUi> = {
  chronicDiseases: {
    Icon: Activity,
    shell: cn(
      "border-rose-200/90 bg-rose-50/40 shadow-sm dark:border-rose-900 dark:bg-rose-950/50",
    ),
    trigger: cn(
      "bg-rose-50/90 hover:bg-rose-100/90 data-[state=open]:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 dark:data-[state=open]:bg-rose-900",
    ),
    iconTint: "text-rose-600 dark:text-rose-400",
    inner: cn(
      "border-rose-200/70 bg-background dark:border-rose-900/70 dark:bg-background",
    ),
  },
  currentMedications: {
    Icon: Pill,
    shell: cn(
      "border-sky-200/90 bg-sky-50/40 shadow-sm dark:border-sky-900 dark:bg-sky-950/50",
    ),
    trigger: cn(
      "bg-sky-50/90 hover:bg-sky-100/90 data-[state=open]:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 dark:data-[state=open]:bg-sky-900",
    ),
    iconTint: "text-sky-600 dark:text-sky-400",
    inner: cn(
      "border-sky-200/70 bg-background dark:border-sky-900/70 dark:bg-background",
    ),
  },
  allergies: {
    Icon: AlertTriangle,
    shell: cn(
      "border-amber-200/90 bg-amber-50/40 shadow-sm dark:border-amber-900 dark:bg-amber-950/50",
    ),
    trigger: cn(
      "bg-amber-50/90 hover:bg-amber-100/90 data-[state=open]:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 dark:data-[state=open]:bg-amber-900",
    ),
    iconTint: "text-amber-700 dark:text-amber-400",
    inner: cn(
      "border-amber-200/70 bg-background dark:border-amber-900/70 dark:bg-background",
    ),
  },
  surgicalHistory: {
    Icon: Syringe,
    shell: cn(
      "border-violet-200/90 bg-violet-50/40 shadow-sm dark:border-violet-900 dark:bg-violet-950/50",
    ),
    trigger: cn(
      "bg-violet-50/90 hover:bg-violet-100/90 data-[state=open]:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900 dark:data-[state=open]:bg-violet-900",
    ),
    iconTint: "text-violet-600 dark:text-violet-400",
    inner: cn(
      "border-violet-200/70 bg-background dark:border-violet-900/70 dark:bg-background",
    ),
  },
  additionalMedicalNotes: {
    Icon: ClipboardList,
    shell: cn(
      "border-teal-200/90 bg-teal-50/40 shadow-sm dark:border-teal-900 dark:bg-teal-950/50",
    ),
    trigger: cn(
      "bg-teal-50/90 hover:bg-teal-100/90 data-[state=open]:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 dark:data-[state=open]:bg-teal-900",
    ),
    iconTint: "text-teal-600 dark:text-teal-400",
    inner: cn(
      "border-teal-200/70 bg-background dark:border-teal-900/70 dark:bg-background",
    ),
  },
}

function MedicalHistoryAccordionHeader({
  icon: Icon,
  title,
  hint,
  iconTint,
}: {
  icon: LucideIcon
  title: string
  hint: string
  iconTint: string
}) {
  return (
    <span
      dir="rtl"
      className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-1.5 text-start"
    >
      <span className="flex w-full min-w-0 flex-wrap items-start gap-2 text-start">
        <span className="inline-flex flex-row-reverse items-center gap-2 text-start text-base font-semibold tracking-tight text-foreground">
          <span className="min-w-0 text-pretty">{title}</span>
          <Icon className={cn("size-4 shrink-0", iconTint)} aria-hidden />
        </span>
      </span>
      <span className="text-pretty text-start text-[13px] font-normal leading-snug text-muted-foreground">
        {hint}
      </span>
    </span>
  )
}

/**
 * Reused by add / edit patient dialogs — same layout, backend field names in payloads only.
 */
export function PatientFormFields({
  form,
  onChange,
  idPrefix,
  nameFieldAutoFocus,
}: PatientFormFieldsProps) {
  const set = (patch: Partial<PatientFormState>) => onChange({ ...form, ...patch })

  const [dobEntryMode, setDobEntryMode] = React.useState<"birthdate" | "age">("age")
  const [dobMode, setDobMode] = React.useState<"calendar" | "manual">("calendar")
  const [dobY, setDobY] = React.useState("")
  const [dobM, setDobM] = React.useState("")
  const [dobD, setDobD] = React.useState("")
  const [ageYearsInput, setAgeYearsInput] = React.useState("")

  const syncManualPartsFromIso = React.useCallback((iso: string) => {
    const p = iso.split("-")
    if (p.length === 3) {
      setDobY(p[0] ?? "")
      setDobM(p[1] ?? "")
      setDobD(p[2] ?? "")
    }
  }, [])

  React.useEffect(() => {
    if (dobEntryMode !== "birthdate" || dobMode !== "calendar") return
    if (!form.dateOfBirth) {
      setDobY("")
      setDobM("")
      setDobD("")
      return
    }
    syncManualPartsFromIso(form.dateOfBirth)
  }, [form.dateOfBirth, dobEntryMode, dobMode, syncManualPartsFromIso])

  const onDobEntryModeChange = (v: string) => {
    const next = v as "birthdate" | "age"
    setDobEntryMode(next)
    if (next === "age") {
      const age = patientAgeYearsFromDob(form.dateOfBirth || null)
      setAgeYearsInput(age != null ? String(age) : "")
      return
    }
    if (form.dateOfBirth) syncManualPartsFromIso(form.dateOfBirth)
  }

  const onDobModeChange = (v: string) => {
    const next = v as "calendar" | "manual"
    setDobMode(next)
    if (next === "manual" && form.dateOfBirth) {
      syncManualPartsFromIso(form.dateOfBirth)
    }
  }

  const applyManualDob = (y: string, m: string, d: string) => {
    setDobY(y)
    setDobM(m)
    setDobD(d)
    const iso = buildIsoFromParts(y, m, d)
    set({ dateOfBirth: iso ?? "" })
    if (iso) {
      const age = patientAgeYearsFromDob(iso)
      setAgeYearsInput(age != null ? String(age) : "")
    }
  }

  const applyAgeYears = (raw: string) => {
    const digits = raw.replace(/\D/g, "")
    setAgeYearsInput(digits)
    if (!digits.trim()) {
      set({ dateOfBirth: "" })
      return
    }
    const age = Number.parseInt(digits, 10)
    if (Number.isNaN(age) || age < MIN_PATIENT_AGE_YEARS) {
      set({ dateOfBirth: "" })
      return
    }
    const iso = deriveDobIsoFromAgeYears(age)
    set({ dateOfBirth: iso ?? "" })
    if (iso) syncManualPartsFromIso(iso)
  }

  const dobValidationError = React.useMemo(
    () => validatePatientDobOrAge(form.dateOfBirth),
    [form.dateOfBirth]
  )

  const derivedDobLabel =
    form.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)
      ? formatDobDisplayAr(form.dateOfBirth)
      : null
  const derivedAgeLabel =
    form.dateOfBirth && dobEntryMode === "birthdate"
      ? patientAgeYearsFromDob(form.dateOfBirth)
      : null

  return (
    <div className="space-y-3.5">
      <div className={sectionClass}>
       <div className="flex items-center gap-2">
       <CircleUserRound className="size-4 text-primary" />
       <p className={sectionTitleClass}>المعلومات الشخصية</p>

       </div>

         
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:items-start">
          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor={`${idPrefix}-fullName`}
              className="text-sm font-bold text-foreground"
            >
              الاسم الكامل <span className="text-destructive">*</span>
            </Label>
            <div className="relative w-full min-w-0">
              <FieldIcon>
                <User className="size-4" />
              </FieldIcon>
              <Input
                id={`${idPrefix}-fullName`}
                name="fullName"
                value={form.fullName}
                onChange={(ev) => set({ fullName: ev.target.value })}
                autoComplete="name"
                placeholder="أدخل الاسم الكامل"
                autoFocus={nameFieldAutoFocus}
                className="peer h-11 w-full rounded-lg border-border/50 bg-background ps-10 shadow-sm transition-shadow focus-visible:ring-2"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor={`${idPrefix}-nationalId`}
              className="text-sm font-bold text-foreground"
            >
              الرقم الوطني
            </Label>
            <div className="relative w-full min-w-0">
              <FieldIcon>
                <IdCard className="size-4" />
              </FieldIcon>
              <Input
                id={`${idPrefix}-nationalId`}
                name="nationalId"
                value={form.nationalId}
                onChange={(ev) => set({ nationalId: ev.target.value })}
                placeholder="أدخل الرقم الوطني (اختياري)"
                className="peer h-11 w-full rounded-lg border-border/50 bg-background ps-10 shadow-sm transition-shadow focus-visible:ring-2"
                dir="ltr"
              />
            </div>
          </div>

          <div className="min-h-0 sm:col-span-2">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:items-stretch sm:gap-4">
              <div className={fieldCardClass}>
                <div
                  id={`${idPrefix}-dob-group`}
                  className="flex items-center justify-between gap-2 border-b border-border/40 pb-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalendarDays className="size-4" aria-hidden />
                    </span>
                    <p className="text-sm font-bold text-foreground">تاريخ الميلاد / العمر</p>
                  </div>
                </div>
                <Tabs
                  dir="rtl"
                  value={dobEntryMode}
                  onValueChange={onDobEntryModeChange}
                  className="w-full min-w-0 flex-1 gap-2.5"
                  aria-labelledby={`${idPrefix}-dob-group`}
                >
                  <TabsList className="grid h-10 w-full grid-cols-2 gap-0.5 rounded-lg border border-border/40 bg-muted/70 p-0.5 shadow-inner">
                    <TabsTrigger
                      value="birthdate"
                      className="h-full min-w-0 gap-1 rounded-md px-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow sm:text-sm"
                    >
                      <CalendarDays className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      تاريخ الميلاد
                    </TabsTrigger>
                    <TabsTrigger
                      value="age"
                      className="h-full min-w-0 gap-1 rounded-md px-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow sm:text-sm"
                    >
                      <Cake className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      العمر
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="birthdate" className="mt-0 space-y-2.5 p-0">
                    <Tabs
                      dir="rtl"
                      value={dobMode}
                      onValueChange={onDobModeChange}
                      className="w-full gap-2"
                    >
                      <TabsList className="grid h-9 w-full grid-cols-2 gap-0.5 rounded-lg border border-border/30 bg-muted/50 p-0.5">
                        <TabsTrigger
                          value="calendar"
                          className="h-full min-w-0 rounded-md px-1.5 text-[11px] font-medium data-[state=active]:bg-background data-[state=active]:shadow sm:text-xs"
                        >
                          من التقويم
                        </TabsTrigger>
                        <TabsTrigger
                          value="manual"
                          className="h-full min-w-0 rounded-md px-1.5 text-[11px] font-medium data-[state=active]:bg-background data-[state=active]:shadow sm:text-xs"
                        >
                          إدخال يدوي
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="calendar" className="mt-0 p-0">
                    <div className="relative w-full min-w-0">
                      <FieldIcon>
                        <CalendarDays className="size-4" />
                      </FieldIcon>
                      <Input
                        id={`${idPrefix}-dob`}
                        name="dob"
                        type="date"
                        value={form.dateOfBirth}
                        max={maxDateOfBirthIsoForMinAge()}
                        onChange={(ev) => {
                          const iso = ev.target.value
                          set({ dateOfBirth: iso })
                          const age = patientAgeYearsFromDob(iso || null)
                          setAgeYearsInput(
                            age != null && age >= MIN_PATIENT_AGE_YEARS ? String(age) : ""
                          )
                        }}
                        title="تاريخ الميلاد"
                        aria-invalid={dobValidationError ? true : undefined}
                        className={cn(
                          "peer h-11 w-full rounded-lg border bg-muted/20 ps-10 font-mono text-sm tabular-nums shadow-sm transition-[box-shadow,background-color] focus-visible:bg-background focus-visible:ring-2",
                          dobValidationError
                            ? "border-destructive/60 focus-visible:ring-destructive/30"
                            : "border-border/50"
                        )}
                        dir="ltr"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      استخدم مربع التاريخ أو أيقونة التقويم لاختيار الميلاد بدقة.
                    </p>
                    {derivedAgeLabel != null && derivedAgeLabel >= MIN_PATIENT_AGE_YEARS ? (
                      <p className="text-[11px] font-medium text-primary">
                        العمر التقريبي:{" "}
                        <span className="font-mono tabular-nums" dir="ltr">
                          {derivedAgeLabel}
                        </span>{" "}
                        سنة
                      </p>
                    ) : null}
                      </TabsContent>
                      <TabsContent value="manual" className="mt-0 p-0">
                    <div
                      className="flex w-full min-w-0 flex-wrap items-end gap-2 sm:gap-2.5"
                
                    >
                       <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-16">
                        <Label
                          htmlFor={`${idPrefix}-dob-d`}
                          className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                        >
                          اليوم
                        </Label>
                        <Input
                          id={`${idPrefix}-dob-d`}
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="10"
                          value={dobD}
                          onChange={(e) => applyManualDob(dobY, dobM, e.target.value)}
                          className="h-11 w-full rounded-lg border border-border/50 bg-muted/20 text-center font-mono text-sm tabular-nums shadow-sm"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-16">
                        <Label
                          htmlFor={`${idPrefix}-dob-m`}
                          className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                        >
                          الشهر
                        </Label>
                        <Input
                          id={`${idPrefix}-dob-m`}
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="05"
                          value={dobM}
                          onChange={(e) => applyManualDob(dobY, e.target.value, dobD)}
                          className="h-11 w-full rounded-lg border border-border/50 bg-muted/20 text-center font-mono text-sm tabular-nums shadow-sm"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-24">
                        <Label
                          htmlFor={`${idPrefix}-dob-y`}
                          className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                        >
                          السنة
                        </Label>
                        <Input
                          id={`${idPrefix}-dob-y`}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="1995"
                          value={dobY}
                          onChange={(e) => applyManualDob(e.target.value, dobM, dobD)}
                          className="h-11 w-full rounded-lg border border-border/50 bg-muted/20 text-center font-mono text-sm tabular-nums shadow-sm"
                        />
                      </div>
                    
                     
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      أدخل السنة بأربع أرقام، ثم الشهر واليوم (يُحفَظ بصيغة{" "}
                      <span dir="ltr" className="font-mono text-foreground/80">
                        YYYY-MM-DD
                      </span>
                      ).
                    </p>
                    {derivedAgeLabel != null && derivedAgeLabel >= MIN_PATIENT_AGE_YEARS ? (
                      <p className="text-[11px] font-medium text-primary">
                        العمر التقريبي:{" "}
                        <span className="font-mono tabular-nums" dir="ltr">
                          {derivedAgeLabel}
                        </span>{" "}
                        سنة
                      </p>
                    ) : null}
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="age" className="mt-0 space-y-2 p-0">
                    <div className="relative w-full min-w-0">
                      <FieldIcon>
                        <Cake className="size-4" />
                      </FieldIcon>
                      <Input
                        id={`${idPrefix}-age-years`}
                        name="ageYears"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder={`مثال: 35 (من ${MIN_PATIENT_AGE_YEARS} إلى ${MAX_PATIENT_AGE_YEARS})`}
                        value={ageYearsInput}
                        onChange={(e) => applyAgeYears(e.target.value)}
                        title="العمر بالسنوات"
                        aria-invalid={
                          ageYearsInput.trim() !== "" &&
                          (Number.parseInt(ageYearsInput, 10) < MIN_PATIENT_AGE_YEARS ||
                            dobValidationError != null)
                            ? true
                            : undefined
                        }
                        className={cn(
                          "peer h-11 w-full rounded-lg border bg-muted/20 ps-10 text-sm tabular-nums shadow-sm transition-[box-shadow,background-color] focus-visible:bg-background focus-visible:ring-2",
                          ageYearsInput.trim() !== "" &&
                            (Number.parseInt(ageYearsInput, 10) < MIN_PATIENT_AGE_YEARS ||
                              dobValidationError != null)
                            ? "border-destructive/60 focus-visible:ring-destructive/30"
                            : "border-border/50"
                        )}
                        dir="ltr"
                      />
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      أدخل العمر بالسنوات (من {MIN_PATIENT_AGE_YEARS} إلى {MAX_PATIENT_AGE_YEARS})؛
                      يُحسب تاريخ الميلاد تلقائياً.
                    </p>
                    {derivedDobLabel && !dobValidationError ? (
                      <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed">
                        <p className="font-semibold text-foreground">تاريخ الميلاد المستنتج</p>
                        <p className="mt-0.5 text-foreground/90">{derivedDobLabel}</p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
                          {form.dateOfBirth}
                        </p>
                      </div>
                    ) : ageYearsInput.trim() &&
                      Number.parseInt(ageYearsInput, 10) < MIN_PATIENT_AGE_YEARS ? (
                      <p className="text-[11px] font-medium text-destructive">
                        الحد الأدنى للعمر {MIN_PATIENT_AGE_YEARS} سنة.
                      </p>
                    ) : ageYearsInput.trim() &&
                      Number.parseInt(ageYearsInput, 10) > MAX_PATIENT_AGE_YEARS ? (
                      <p className="text-[11px] font-medium text-destructive">
                        الحد الأقصى للعمر {MAX_PATIENT_AGE_YEARS} سنة.
                      </p>
                    ) : null}
                  </TabsContent>
                </Tabs>
                {dobValidationError ? (
                  <p
                    className="text-[11px] font-medium text-destructive"
                    role="alert"
                    id={`${idPrefix}-dob-error`}
                  >
                    {dobValidationError}
                  </p>
                ) : null}
              </div>

              <div className={cn(fieldCardClass, "justify-between")}>
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <VenusAndMars className="size-4" aria-hidden />
                    </span>
                    <p className="text-sm font-bold text-foreground">الجنس</p>
                  </div>
                </div>
                <div
                  className="min-h-0 w-full flex-1"
                  role="group"
                  aria-label="اختيار الجنس (اختياري)"
                >
                  <div className="flex w-full flex-col gap-2">
                    <button
                      type="button"
                      id={`${idPrefix}-gender-male`}
                      onClick={() =>
                        set({ gender: form.gender === "male" ? "" : "male" })
                      }
                      aria-pressed={form.gender === "male"}
                      className={cn(
                        "flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2",
                        form.gender === "male"
                          ? "border-sky-500 bg-sky-500/12 text-sky-900 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-50"
                          : "border-border/50 bg-muted/20 text-foreground/80 hover:border-sky-400/45 hover:bg-sky-500/5"
                      )}
                    >
                      <Mars
                        className={cn(
                          "size-4 shrink-0",
                          form.gender === "male"
                            ? "text-sky-600 dark:text-sky-300"
                            : "text-sky-600/80"
                        )}
                        aria-hidden
                      />
                      ذكر
                    </button>
                    <button
                      type="button"
                      id={`${idPrefix}-gender-female`}
                      onClick={() =>
                        set({ gender: form.gender === "female" ? "" : "female" })
                      }
                      aria-pressed={form.gender === "female"}
                      className={cn(
                        "flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:ring-offset-2",
                        form.gender === "female"
                          ? "border-rose-500 bg-rose-500/12 text-rose-950 dark:border-rose-400 dark:bg-rose-500/15 dark:text-rose-50"
                          : "border-border/50 bg-muted/20 text-foreground/80 hover:border-rose-400/45 hover:bg-rose-500/5"
                      )}
                    >
                      <Venus
                        className={cn(
                          "size-4 shrink-0",
                          form.gender === "female"
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-rose-600/80"
                        )}
                        aria-hidden
                      />
                      أنثى
                    </button>
                  </div>
                </div>
                <p className="pt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  حقل اختياري يساعد في التقارير والترشيحات لاحقاً.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
       <div className="flex items-center gap-2">
       <Phone className="size-4 text-primary" />
       <p className={sectionTitleClass}>معلومات التواصل</p>

       </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-phone`} className="text-sm font-bold text-foreground">
              الهاتف
            </Label>
            <div className="relative w-full min-w-0">
              <FieldIcon>
                <Phone className="size-4" />
              </FieldIcon>
              <Input
                id={`${idPrefix}-phone`}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(ev) => set({ phone: ev.target.value })}
                autoComplete="tel"
                placeholder="05XXXXXXXX (اختياري)"
                className="peer h-10 w-full rounded-lg bg-background ps-10 shadow-none transition-shadow focus:shadow-sm"
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-email`} className="text-sm font-bold text-foreground">
              البريد الإلكتروني
            </Label>
            <div className="relative w-full min-w-0">
              <FieldIcon>
                <Mail className="size-4" />
              </FieldIcon>
              <Input
                id={`${idPrefix}-email`}
                name="email"
                type="email"
                value={form.email}
                onChange={(ev) => set({ email: ev.target.value })}
                autoComplete="email"
                placeholder="example@email.com (اختياري)"
                className="peer h-10 w-full rounded-lg bg-background ps-10 shadow-none transition-shadow focus:shadow-sm"
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-address`} className="text-sm font-bold text-foreground">
              العنوان
            </Label>
            <div className="relative w-full min-w-0">
              <span
                className="pointer-events-none absolute start-3 top-3 text-muted-foreground/60"
                aria-hidden
              >
                <MapPin className="size-4" />
              </span>
              <Textarea
                id={`${idPrefix}-address`}
                name="address"
                value={form.address}
                onChange={(ev) => set({ address: ev.target.value })}
                autoComplete="street-address"
                placeholder="أدخل العنوان (اختياري)"
                className="min-h-[72px] w-full rounded-lg bg-background ps-10 shadow-none transition-shadow focus:shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2">
          <Stethoscope className="size-4 text-primary" />
          <p className={sectionTitleClass}>التاريخ المرضي</p>
        </div>
        {/* <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          تُرسل للخادم كحقل نصي واحد؛ الحد الأقصى للمجموع بعد الدمج هو{" "}
          {MEDICAL_HISTORY_MAX_CHARS.toLocaleString("ar-SA")} حرفاً. وسّع أو اطوِ كل قسم
          بالأسهم.
        </p> */}
        <Accordion
          type="multiple"
          dir="rtl"
          defaultValue={[...MEDICAL_HISTORY_SECTION_ORDER]}
          className="space-y-3"
        >
          {MEDICAL_HISTORY_SECTION_ORDER.map((section) => {
            const ui = MEDICAL_SECTION_ACCORDION[section]
            const stateKey = section
            const isNotes = section === "additionalMedicalNotes"
            return (
              <AccordionItem
                key={section}
                value={section}
                className={cn(
                  "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
                  ui.shell,
                )}
              >
                <AccordionTrigger
                  dir="rtl"
                  className={cn(medicalAccordionTriggerClass, ui.trigger)}
                >
                  <MedicalHistoryAccordionHeader
                    icon={ui.Icon}
                    title={MEDICAL_HISTORY_SECTIONS[section]}
                    hint={MEDICAL_HISTORY_PLACEHOLDER_HINTS[section]}
                    iconTint={ui.iconTint}
                  />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0 sm:px-5">
                  <div className={cn("space-y-2 rounded-xl border p-4", ui.inner)}>
                    <Label
                      htmlFor={`${idPrefix}-mh-${section}`}
                      className="sr-only"
                    >
                      {MEDICAL_HISTORY_SECTIONS[section]}
                    </Label>
                    <Textarea
                      id={`${idPrefix}-mh-${section}`}
                      name={`medical-${section}`}
                      value={form[stateKey]}
                      onChange={(ev) =>
                        set({ [stateKey]: ev.target.value } as Partial<PatientFormState>)
                      }
                      maxLength={MEDICAL_HISTORY_MAX_CHARS}
                      placeholder={MEDICAL_HISTORY_PLACEHOLDER_HINTS[section]}
                      className={cn(
                        "resize-y text-sm leading-relaxed [direction:rtl]",
                        isNotes
                          ? "min-h-[100px] max-h-[min(44vh,22rem)]"
                          : "min-h-[88px] max-h-[min(38vh,18rem)]",
                      )}
                      dir="rtl"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>

      <div className={sectionClass}>
       <div className="flex items-center gap-2">
       <Info className="size-4 text-primary" />
       <p className={sectionTitleClass}> معلومات اضافية</p>

       </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-notes`} className="text-sm font-bold text-foreground">
              الملاحظات
            </Label>
            <Textarea
              id={`${idPrefix}-notes`}
              name="notes"
              value={form.notes}
              onChange={(ev) => set({ notes: ev.target.value })}
              placeholder="ملاحظات (اختياري)"
              className="min-h-[80px] rounded-lg"
            />
          </div>
          <div
            className={cn(
              "flex sm:col-span-2",
              "flex-row items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-3 py-2.5"
            )}
          >
            <Label
              htmlFor={`${idPrefix}-isActive`}
              className="text-sm font-bold leading-tight text-foreground"
            >
              مريض نشط
            </Label>
            <Switch
              id={`${idPrefix}-isActive`}
              checked={form.isActive}
              onCheckedChange={(c) => set({ isActive: Boolean(c) })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
