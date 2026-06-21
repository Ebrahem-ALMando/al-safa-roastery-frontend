"use client"

import * as React from "react"
import {
  Beaker,
  Check,
  FlaskConical,
  Hash,
  Info,
  ListChecks,
  Loader2,
  Plus,
  SlidersHorizontal,
  Tag,
  X,
  Trash2,
  GripVertical,
  ChevronUp,
  Type,
  CheckSquare,
  Binary,
  Banknote,
  Coins,
  User,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/custom-toast-with-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { LabTest, LabTestField, LabTestPrice, ResultType } from "@/lib/lab-catalog-types"
import type { CategoryNode } from "@/lib/lab-catalog-types"
import { findCategoryNode, flattenCategories } from "@/lib/lab-catalog-helpers"
import { AdvancedCategoryPicker } from "@/components/tests/advanced-category-picker"
import { IconPicker } from "@/components/tests/icon-picker"
import { cn } from "@/lib/utils"
import { cleanNumericDisplay } from "@/lib/reference-range-format"

import { resolveReferenceRange } from "@/lib/reference-range-resolver"
import { ArrowLeft, ArrowRight, Lock, Maximize2, MoveLeft, MoveRight } from "lucide-react"
import {
  parseSelectOptionsForm,
  serializeSelectOptionsForm,
  type SelectOptionFormRow,
} from "./select-options-form"

const DEFAULT_SELECT_OPTIONS_JSON = serializeSelectOptionsForm([
  { value: "إيجابي" },
  { value: "سلبي", is_normal: true },
])

interface TestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** يُستدعى بعد التحقق من النموذج؛ عند الرفض (رفع خطأ) يبقى المودال مفتوحاً. */
  onSubmit: (data: Omit<LabTest, "id">) => void | Promise<void>
  /** شجرة التصنيفات (مع الأعداد إن وُجدت) */
  categoryTree: CategoryNode[]
  initial?: LabTest | null
  /** عند الإضافة: اختيار تصنيف ابتدائي (مثل فتح «إضافة فحص» من شجرة التصنيفات) */
  defaultCategoryId?: string | null
  title: string
}

const empty: Omit<LabTest, "id"> = {
  name: "",
  code: "",
  categoryId: "",
  isActive: true,
  icon_name: "default",
  notes: "",
  prices: [{ currency_code: "SAR", amount: 0 }],
  fields: [
    {
      name: "",
      code: "",
      resultType: "number",
      unit: "",
      referenceRange: "",
      referenceRangeMode: "single",
      referenceRanges: [
        {
          gender_code: null,
          age_from: null,
          age_to: null,
          age_unit: null,
          min_value: null,
          max_value: null,
          critical_low: null,
          critical_high: null,
          reference_text: null,
          interpretation_text: null,
          priority: 0,
          is_active: true,
          ui_age_preset: "general",
          ui_show_critical: false,
          ui_operator: "between",
        },
      ],
      selectOptions: DEFAULT_SELECT_OPTIONS_JSON,
      sortOrder: 0,
      isActive: true,
    },
  ],
}

function firstCategoryIdFromTree(nodes: CategoryNode[]): string {
  const flat = flattenCategories(nodes)
  return flat[0]?.id ?? ""
}

const SECTION_CATEGORY = "category"
const SECTION_DEFINITION = "definition"
const SECTION_REPORTING = "reporting"

const POPULAR_MEASUREMENT_UNITS = [
  "mg/dL",
  "g/dL",
  "mmol/L",
  "mEq/L",
  "IU/L",
  "U/L",
  "ng/mL",
  "pg/mL",
  "fL",
  "%",
  "cells/uL",
  "x10^3/uL",
  "x10^6/uL",
] as const

const POPULAR_FIELD_CODE_BADGES = [
  "CBC",
  "WBC",
  "RBC",
  "HGB",
  "HCT",
  "MCV",
  "MCH",
  "MCHC",
  "PLT",
  "GLU",
  "HbA1c",
  "CHOL",
  "TG",
  "HDL",
  "LDL",
  "ALT",
  "AST",
  "ALP",
  "TSH",
  "CRP",
  "BUN",
  "CREA",
] as const

/** Sentinel for Radix Select (empty string is not allowed as SelectItem value). Maps to null gender_code in API. */
const GENDER_ANY_VALUE = "__any__" as const

const GENDER_OPTIONS = [
  { value: GENDER_ANY_VALUE, label: "الكل" },
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
] as const

const AGE_PRESET_OPTIONS = [
  { value: "general", label: "عام" },
  { value: "child", label: "طفل" },
  { value: "adult", label: "بالغ" },
  { value: "custom", label: "مخصص" },
] as const

const PRIORITY_OPTIONS = [
  { value: 0, label: "عادي" },
  { value: 5, label: "مهم" },
  { value: 10, label: "أولوية عالية" },
] as const

const RANGE_OPERATOR_OPTIONS = [
  { value: "between", label: "نطاق" },
  { value: "greater_than", label: "أكبر من" },
  { value: "less_than", label: "أصغر من" },
] as const

const SUGGESTED_UNIT_BY_CODE: Record<string, string> = {
  HGB: "g/dL",
  HCT: "%",
  WBC: "x10^3/uL",
  RBC: "x10^6/uL",
  PLT: "x10^3/uL",
  GLU: "mg/dL",
  HBA1C: "%",
  CHOL: "mg/dL",
  TG: "mg/dL",
  HDL: "mg/dL",
  LDL: "mg/dL",
  ALT: "U/L",
  AST: "U/L",
  ALP: "U/L",
  TSH: "mIU/L",
  CRP: "mg/L",
  CREA: "mg/dL",
  BUN: "mg/dL",
}

type TestTemplate = {
  id: string
  label: string
  description: string
  payload: Pick<Omit<LabTest, "id">, "name" | "code" | "notes" | "icon_name" | "fields" | "prices">
}

const TEST_TEMPLATES: TestTemplate[] = [
  {
    id: "cbc",
    label: "CBC",
    description: "صورة دم كاملة مختصرة",
    payload: {
      name: "صورة دم كاملة",
      code: "CBC",
      notes: "قالب مبدئي قابل للتعديل",
      icon_name: "hematology",
      prices: [{ currency_code: "SAR", amount: 60 }],
      fields: [
        { name: "الهيموجلوبين", code: "HGB", resultType: "number", unit: "g/dL", referenceRange: "12-16", selectOptions: "", sortOrder: 0, isActive: true },
        { name: "كريات الدم البيضاء", code: "WBC", resultType: "number", unit: "x10^3/uL", referenceRange: "4-11", selectOptions: "", sortOrder: 1, isActive: true },
        { name: "الصفائح الدموية", code: "PLT", resultType: "number", unit: "x10^3/uL", referenceRange: "150-450", selectOptions: "", sortOrder: 2, isActive: true },
      ],
    },
  },
  {
    id: "fbs",
    label: "FBS",
    description: "سكر صائم",
    payload: {
      name: "سكر الدم الصائم",
      code: "FBS",
      notes: "",
      icon_name: "biochemistry",
      prices: [{ currency_code: "SAR", amount: 25 }],
      fields: [
        { name: "سكر صائم", code: "GLU", resultType: "number", unit: "mg/dL", referenceRange: "70-100", selectOptions: "", sortOrder: 0, isActive: true },
      ],
    },
  },
  {
    id: "lipid",
    label: "LIPID",
    description: "دهون الدم الأساسية",
    payload: {
      name: "دهون الدم",
      code: "LIPID",
      notes: "قالب أولي للدهون",
      icon_name: "biochemistry",
      prices: [{ currency_code: "SAR", amount: 80 }],
      fields: [
        { name: "الكوليسترول الكلي", code: "CHOL", resultType: "number", unit: "mg/dL", referenceRange: "< 200", selectOptions: "", sortOrder: 0, isActive: true },
        { name: "الدهون الثلاثية", code: "TG", resultType: "number", unit: "mg/dL", referenceRange: "< 150", selectOptions: "", sortOrder: 1, isActive: true },
        { name: "HDL", code: "HDL", resultType: "number", unit: "mg/dL", referenceRange: "> 40", selectOptions: "", sortOrder: 2, isActive: true },
      ],
    },
  },
]

function inferAgePreset(range: NonNullable<LabTestField["referenceRanges"]>[number]) {
  const fromRaw = range.age_from != null ? String(range.age_from).trim() : ""
  const toRaw = range.age_to != null ? String(range.age_to).trim() : ""
  const from = fromRaw ? cleanNumericDisplay(fromRaw) : ""
  const to = toRaw ? cleanNumericDisplay(toRaw) : ""
  const unit = (range.age_unit ?? "").trim()

  if (!from && !to) return "general" as const
  if (from === "2" && to === "13" && unit === "year") return "child" as const
  if (from === "18" && to === "65" && unit === "year") return "adult" as const
  return "custom" as const
}

function applyAgePresetValues(
  preset: "general" | "child" | "adult" | "custom"
): Pick<
  NonNullable<LabTestField["referenceRanges"]>[number],
  "age_from" | "age_to" | "age_unit" | "ui_age_preset"
> {
  if (preset === "general") {
    return { age_from: null, age_to: null, age_unit: null, ui_age_preset: "general" }
  }
  if (preset === "child") {
    return { age_from: "2", age_to: "13", age_unit: "year", ui_age_preset: "child" }
  }
  if (preset === "adult") {
    return { age_from: "18", age_to: "65", age_unit: "year", ui_age_preset: "adult" }
  }
  return { age_from: null, age_to: null, age_unit: "year", ui_age_preset: "custom" }
}

function inferRangeOperator(range: NonNullable<LabTestField["referenceRanges"]>[number]) {
  const text = (range.reference_text ?? "").trim()
  if (text.startsWith(">")) return "greater_than" as const
  if (text.startsWith("<")) return "less_than" as const
  return "between" as const
}

/** محاذاة بداية السطر (يمين في RTL) — يُستخدم مع `dir="rtl"` على الحقل */
const rtlField =
  "text-start placeholder:text-start [direction:rtl]"

/* مع dir=rtl على الأكورديون: text-start = يمين. لا تستخدم text-end (في RTL = يسار) */
const accordionTriggerClass =
  "gap-3 rounded-xl px-4 py-4 text-start! hover:no-underline [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"

function suggestFieldCodes(field: LabTestField): string[] {
  const byType =
    field.resultType === "number"
      ? ["HGB", "WBC", "RBC", "PLT", "GLU", "CHOL", "ALT", "AST", "TSH", "CREA"]
      : field.resultType === "text"
        ? ["REPORT", "NOTE", "COMMENT"]
        : ["POS_NEG", "STATUS", "RESULT"]

  const byName: string[] = []
  const n = field.name.trim().toLowerCase()
  if (n.includes("هيمو") || n.includes("hemoglobin")) byName.push("HGB")
  if (n.includes("سكر") || n.includes("glucose")) byName.push("GLU")
  if (n.includes("كول") || n.includes("chol")) byName.push("CHOL")
  if (n.includes("دهون") || n.includes("trig")) byName.push("TG")
  if (n.includes("صفائح") || n.includes("platelet")) byName.push("PLT")
  if (n.includes("درق") || n.includes("thyroid") || n.includes("tsh")) byName.push("TSH")
  if (n.includes("كريات") || n.includes("white")) byName.push("WBC")
  if (n.includes("حمراء") || n.includes("red")) byName.push("RBC")

  const current = field.code.trim().toUpperCase()
  const merged = [...byName, ...byType, ...POPULAR_FIELD_CODE_BADGES]
  if (current) merged.unshift(current)
  const unique = Array.from(new Set(merged.map((c) => c.toUpperCase())))
  return unique.slice(0, 10)
}

/** أغلفة أقسام شبه صلبة (بدون شفافية زجاجية) */
const sectionShell = {
  category: cn(
    "border-teal-200 bg-teal-50 shadow-sm",
    "dark:border-teal-900 dark:bg-teal-950"
  ),
  definition: cn(
    "border-sky-200 bg-sky-50 shadow-sm",
    "dark:border-sky-900 dark:bg-sky-950"
  ),
  reporting: cn(
    "border-violet-200 bg-violet-50 shadow-sm",
    "dark:border-violet-900 dark:bg-violet-950"
  ),
} as const

const sectionInner = {
  category:
    "border-teal-200/80 bg-background dark:border-teal-800 dark:bg-background",
  definition:
    "border-sky-200/80 bg-background dark:border-sky-800 dark:bg-background",
  reporting:
    "border-violet-200/80 bg-background dark:border-violet-800 dark:bg-background",
} as const

const sectionIconClass = {
  category: "text-teal-600 dark:text-teal-400",
  definition: "text-sky-600 dark:text-sky-400",
  reporting: "text-violet-600 dark:text-violet-400",
} as const

function SectionHeader({
  icon: Icon,
  title,
  hint,
  iconTint = "text-primary",
  extra,
}: {
  icon: React.ElementType
  title: string
  hint: string
  iconTint?: string
  extra?: React.ReactNode
}) {
  return (
    <span
      dir="rtl"
      className="flex min-w-0 w-full flex-1 flex-col items-stretch gap-1.5 text-start"
    >
      {/* مع dir=rtl: justify-between يضع المجموعة الأولى يميناً و extra يساراً؛ عنصر واحد يبقى عند البداية (يمين) */}
      <span className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 text-start">
        <span className="inline-flex flex-row-reverse items-center gap-2 text-start text-base font-semibold tracking-tight text-foreground">
          <span className="min-w-0 text-pretty">{title}</span>
          <Icon className={cn("size-4 shrink-0", iconTint)} aria-hidden />
       
        </span>
        {extra}
      </span>
      <span className="text-pretty text-start text-[13px] font-normal leading-snug text-muted-foreground">
        {hint}
      </span>
    </span>
  )
}

function SelectOptionsEditor({
  value,
  onChange,
  inputClassName,
}: {
  value: string
  onChange: (next: string) => void
  inputClassName: string
}) {
  const rows = React.useMemo(() => parseSelectOptionsForm(value), [value])
  const [draft, setDraft] = React.useState("")

  const add = React.useCallback(() => {
    const t = draft.trim()
    if (!t) return
    if (rows.some((r) => r.value.trim() === t)) {
      toast.info("هذا الخيار موجود مسبقاً")
      return
    }
    const next: SelectOptionFormRow[] = [...rows, { value: t, is_normal: rows.length === 0 }]
    onChange(serializeSelectOptionsForm(next))
    setDraft("")
  }, [draft, rows, onChange])

  const removeAt = React.useCallback(
    (index: number) => {
      onChange(serializeSelectOptionsForm(rows.filter((_, j) => j !== index)))
    },
    [rows, onChange]
  )

  const setNormal = React.useCallback(
    (index: number) => {
      onChange(serializeSelectOptionsForm(rows.map((r, i) => ({ ...r, is_normal: i === index }))))
    },
    [rows, onChange]
  )

  const updateValueAt = React.useCallback(
    (index: number, nextVal: string) => {
      onChange(serializeSelectOptionsForm(rows.map((r, i) => (i === index ? { ...r, value: nextVal } : r))))
    },
    [rows, onChange]
  )

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground text-right">
        عيّن خياراً واحداً كـ<strong className="text-foreground">مرجع طبيعي</strong> — يُعرَض افتراضياً عند إدخال نتائج هذا الفحص.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="tf-opt-draft" className="text-sm font-medium text-foreground/90 text-right block w-full">
            نص الخيار الجديد
          </Label>
          <Input
            id="tf-opt-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
            placeholder="مثال: سلبي"
            dir="rtl"
            className={inputClassName}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-11 shrink-0 gap-2 rounded-xl px-4"
          onClick={add}
        >
          <Plus className="size-4" aria-hidden />
          إضافة خيار
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground text-right">
          الخيارات ({rows.length})
        </p>
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
            لم تُضف خيارات بعد. أضف خياراً واحداً على الأقل للقائمة المنسدلة.
          </p>
        ) : (
          <ul className="space-y-2" dir="rtl">
            {rows.map((row, index) => (
              <li
                key={`${index}-${row.value}`}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">قيمة الخيار</Label>
                  <Input
                    value={row.value}
                    onChange={(e) => updateValueAt(index, e.target.value)}
                    className={cn(inputClassName, "h-10")}
                    dir="rtl"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={row.is_normal ? "default" : "outline"}
                    className="gap-1.5 rounded-lg"
                    onClick={() => setNormal(index)}
                  >
                    <Check className="size-3.5" aria-hidden />
                    مرجع طبيعي
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => removeAt(index)}
                    aria-label={`حذف الخيار ${row.value}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function TestFormDialog({
  open,
  onOpenChange,
  onSubmit,
  categoryTree,
  initial,
  defaultCategoryId = null,
  title,
}: TestFormDialogProps) {
  const [form, setForm] = React.useState<Omit<LabTest, "id">>(empty)
  const [submitting, setSubmitting] = React.useState(false)
  const [openSections, setOpenSections] = React.useState<string[]>([
    SECTION_CATEGORY,
    SECTION_DEFINITION,
    SECTION_REPORTING,
  ])

  React.useEffect(() => {
    if (!open) {
      setSubmitting(false)
      return
    }
    if (initial) {
      setForm({
        name: initial.name,
        code: initial.code,
        categoryId: initial.categoryId,
        isActive: initial.isActive,
        icon_name: initial.icon_name || "default",
        notes: initial.notes || "",
        prices: initial.prices?.length ? initial.prices : [{ currency_code: "SAR", amount: initial.price || 0 }],
        fields: initial.fields?.length 
          ? initial.fields 
          : [
              {
                name: initial.fieldName || initial.name,
                code: initial.code,
                resultType: initial.resultType || "number",
                unit: initial.unit || "",
                referenceRange: initial.referenceRange || "",
                selectOptions: initial.selectOptions || DEFAULT_SELECT_OPTIONS_JSON,
                sortOrder: 0,
                isActive: true,
              }
            ],
      })
    } else {
      const fromDefault =
        defaultCategoryId && findCategoryNode(categoryTree, defaultCategoryId)
          ? defaultCategoryId
          : null
      setForm({
        ...empty,
        categoryId: fromDefault ?? firstCategoryIdFromTree(categoryTree),
      })
    }
    setOpenSections([
      SECTION_CATEGORY,
      SECTION_DEFINITION,
      SECTION_REPORTING,
    ])
  }, [open, initial, categoryTree, defaultCategoryId])

  const set = <K extends keyof Omit<LabTest, "id">>(
    key: K,
    value: Omit<LabTest, "id">[K]
  ) => setForm((f) => ({ ...f, [key]: value }))

  const addField = () => {
    set("fields", [
      ...form.fields,
      {
        name: "",
        code: "",
        resultType: "number",
        unit: "",
        referenceRange: "",
        referenceRangeMode: "single",
        referenceRanges: [
          {
            gender_code: null,
            age_from: null,
            age_to: null,
            age_unit: null,
            min_value: null,
            max_value: null,
            critical_low: null,
            critical_high: null,
            reference_text: null,
            interpretation_text: null,
            priority: 0,
            is_active: true,
            ui_age_preset: "general",
            ui_show_critical: false,
            ui_operator: "between",
          },
        ],
        selectOptions: DEFAULT_SELECT_OPTIONS_JSON,
        sortOrder: form.fields.length,
        isActive: true,
      },
    ])
  }

  const removeField = (index: number) => {
    if (form.fields.length <= 1) {
      toast.error("يجب أن يحتوي الفحص على حقل نتيجة واحد على الأقل")
      return
    }
    const next = [...form.fields]
    next.splice(index, 1)
    set("fields", next)
  }

  const updateField = <K extends keyof LabTestField>(
    index: number,
    key: K,
    value: LabTestField[K]
  ) => {
    const next = [...form.fields]
    next[index] = { ...next[index], [key]: value }
    set("fields", next)
  }

  const patchField = (index: number, patch: Partial<LabTestField>) => {
    setForm((prev) => {
      const next = [...prev.fields]
      next[index] = { ...next[index], ...patch }
      return { ...prev, fields: next }
    })
  }

  const setFieldRangeMode = (index: number, mode: "single" | "advanced") => {
    patchField(index, {
      referenceRangeMode: mode,
      referenceRanges:
        mode === "single"
          ? [
              {
                gender_code: null,
                age_from: null,
                age_to: null,
                age_unit: null,
                min_value: null,
                max_value: null,
                critical_low: null,
                critical_high: null,
                reference_text: null,
                interpretation_text: null,
                priority: 0,
                is_active: true,
                ui_age_preset: "general",
                ui_show_critical: false,
                ui_operator: "between",
              },
            ]
          : form.fields[index]?.referenceRanges?.length
            ? form.fields[index]!.referenceRanges
            : [
                {
                  gender_code: null,
                  age_from: null,
                  age_to: null,
                  age_unit: "year",
                  min_value: null,
                  max_value: null,
                  critical_low: null,
                  critical_high: null,
                  reference_text: null,
                  interpretation_text: null,
                  priority: 0,
                  is_active: true,
                  ui_age_preset: "custom",
                  ui_show_critical: false,
                  ui_operator: "between",
                },
              ],
    })
  }

  const updateReferenceRangeRow = (
    fieldIndex: number,
    rangeIndex: number,
    patch: Partial<NonNullable<LabTestField["referenceRanges"]>[number]>
  ) => {
    setForm((prev) => {
      const fields = [...prev.fields]
      const f = fields[fieldIndex]
      const ranges = [...(f.referenceRanges ?? [])]
      const merged = { ...(ranges[rangeIndex] ?? {}), ...patch }

      // لا نستنتج الفئة العمرية فوق اختيار القائمة: applyAgePresetValues يمرّر age_* مع ui_age_preset؛
      // inferAgePreset يعامل «من/إلى» الفارغين كـ عام فيُلغي اختيار «مخصص».
      // عند وجود صف «مخصص» بحدود فارغة، لا نهبطها إلى عام بسبب تغيير الوحدة فقط.
      if (
        ("age_from" in patch || "age_to" in patch || "age_unit" in patch) &&
        !("ui_age_preset" in patch)
      ) {
        const inferred = inferAgePreset(merged)
        const emptyBounds =
          !String(merged.age_from ?? "").trim() &&
          !String(merged.age_to ?? "").trim()
        if (!(merged.ui_age_preset === "custom" && emptyBounds && inferred === "general")) {
          merged.ui_age_preset = inferred
        }
      }

      if (patch.ui_show_critical === false) {
        merged.critical_low = null
        merged.critical_high = null
      }

      ranges[rangeIndex] = merged
      fields[fieldIndex] = { ...f, referenceRanges: ranges }
      return { ...prev, fields }
    })
  }

  const addReferenceRangeRow = (fieldIndex: number) => {
    setForm((prev) => {
      const fields = [...prev.fields]
      const f = fields[fieldIndex]
      const newRange: NonNullable<LabTestField["referenceRanges"]>[number] = {
        gender_code: null,
        age_from: null,
        age_to: null,
        age_unit: "year",
        min_value: null,
        max_value: null,
        critical_low: null,
        critical_high: null,
        reference_text: null,
        interpretation_text: null,
        priority: 0,
        is_active: true,
        ui_age_preset: "custom",
        ui_show_critical: false,
        ui_operator: "between",
      }
      const next = [
        ...(f.referenceRanges ?? []),
        newRange,
      ]
      fields[fieldIndex] = { ...f, referenceRanges: next }
      return { ...prev, fields }
    })
  }

  const removeReferenceRangeRow = (fieldIndex: number, rangeIndex: number) => {
    setForm((prev) => {
      const fields = [...prev.fields]
      const f = fields[fieldIndex]
      const next = (f.referenceRanges ?? []).filter((_, i) => i !== rangeIndex)
      fields[fieldIndex] = { ...f, referenceRanges: next.length ? next : f.referenceRanges }
      return { ...prev, fields }
    })
  }

  const addPrice = () => {
    set("prices", [...form.prices, { currency_code: "USD", amount: 0 }])
  }

  const removePrice = (index: number) => {
    if (form.prices.length <= 1) return
    const next = [...form.prices]
    next.splice(index, 1)
    set("prices", next)
  }

  const updatePrice = (index: number, key: keyof LabTestPrice, value: any) => {
    const next = [...form.prices]
    next[index] = { ...next[index], [key]: value }
    set("prices", next)
  }

  const applyTemplate = (template: TestTemplate) => {
    setForm((prev) => ({
      ...prev,
      name: template.payload.name,
      code: template.payload.code,
      notes: template.payload.notes,
      icon_name: template.payload.icon_name,
      prices: template.payload.prices.map((p) => ({ ...p })),
      fields: template.payload.fields.map((f, i) => ({ ...f, sortOrder: i })),
    }))
    toast.success(`تم تطبيق قالب ${template.label}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!form.name.trim() || !form.code.trim() || !form.categoryId) {
      toast.error("يرجى إدخال اسم الفحص والرمز واختيار التصنيف")
      return
    }
    
    if (!form.fields || form.fields.length === 0) {
      toast.error("يجب إضافة حقل نتيجة واحد على الأقل")
      return
    }

    for (const field of form.fields) {
      if (!field.name.trim()) {
        toast.error("يرجى إدخال اسم لجميع حقول النتائج")
        return
      }
      if (field.resultType === "select") {
        const opts = parseSelectOptionsForm(field.selectOptions)
        if (opts.length === 0) {
          toast.error(`أضف خياراً واحداً على الأقل للقائمة المنسدلة في حقل «${field.name}»`)
          return
        }
        if (!opts.some((o) => o.is_normal)) {
          toast.error(`عيّن الخيار الطبيعي في حقل القائمة «${field.name}» (زر «مرجع طبيعي»).`)
          return
        }
      }
    }

    setSubmitting(true)
    try {
      await Promise.resolve(onSubmit({ ...form }))
      onOpenChange(false)
    } catch {
      // يبقى المودال مفتوحاً؛ التوست من المستدعي
    } finally {
      setSubmitting(false)
    }
  }

  const handleDialogOpenChange = (next: boolean) => {
    if (!next && submitting) return
    onOpenChange(next)
  }

  const subtitle = initial
    ? "حدّث بيانات الفحص والتصنيف وإعدادات النتيجة بخطوات واضحة"
    : "أكمل الأقسام التالية — يمكن طيّ أي قسم للتركيز على جزء معيّن"

  const labelClass = "text-sm font-medium text-foreground/90 text-right block w-full"
  const inputClass = cn(
    "h-11 rounded-xl bg-background shadow-none transition-[box-shadow,background-color] duration-200",
    "focus-visible:shadow-md focus-visible:ring-0",
    rtlField
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className={cn(
          "flex max-h-[min(92vh,860px)] w-[min(100%-1.25rem,940px)] max-w-[min(100%-1.25rem,940px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 bg-background p-0 shadow-xl",
          "sm:max-w-[min(100%-1.25rem,940px)]"
        )}
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="relative z-10 shrink-0 border-b border-border/50 bg-background px-6 pb-5 pt-6 sm:px-8">
            <DialogHeader className="space-y-2 text-right sm:text-right">
              <div className="flex items-start gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 motion-reduce:animate-none animate-in fade-in-0 zoom-in-95 duration-300"
                >
                  <Beaker className="size-6" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                    {subtitle}
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={submitting}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label="إغلاق"
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              </div>
            </DialogHeader>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            {submitting ? (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/55 backdrop-blur-[1px]"
                aria-busy="true"
                aria-label="جارٍ الحفظ"
              >
                <Loader2 className="size-9 animate-spin text-primary" />
              </div>
            ) : null}
            <div className="pointer-events-none sticky top-0 z-[1] -mb-3 h-4 bg-gradient-to-b from-background to-transparent" />

            <div className="space-y-4 px-5 py-5 sm:px-8 sm:py-6">
              <Accordion
                type="multiple"
                dir="rtl"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-3.5"
              >
                <AccordionItem
                  value={SECTION_CATEGORY}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
                    sectionShell.category
                  )}
                >
                  <AccordionTrigger
                    dir="rtl"
                    className={cn(
                      accordionTriggerClass,
                      "bg-teal-50/80 hover:bg-teal-100/80 data-[state=open]:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 dark:data-[state=open]:bg-teal-900"
                    )}
                  >
                    <SectionHeader
                      icon={Tag}
                      title="التصنيف"
                      hint="اختر التصنيف من الشجرة — البحث يضيّق النتائج بسرعة"
                      iconTint={sectionIconClass.category}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-0 sm:px-5">
                    <div
                      className={cn(
                        "space-y-3 rounded-xl border p-4 sm:p-5",
                        sectionInner.category
                      )}
                    >
                      <p className="text-[13px] leading-relaxed text-muted-foreground text-right">
                        يحدد التصنيف مكان ظهور الفحص في القوائم والتقارير.
                      </p>
                      {categoryTree.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground text-right">
                          لا توجد تصنيفات. أضف تصنيفاً من صفحة «تصنيفات الفحوصات»
                          أولاً.
                        </p>
                      ) : (
                        <AdvancedCategoryPicker
                          nodes={categoryTree}
                          value={form.categoryId}
                          onChange={(id) => set("categoryId", id)}
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value={SECTION_DEFINITION}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
                    sectionShell.definition
                  )}
                >
                  <AccordionTrigger
                    dir="rtl"
                    className={cn(
                      accordionTriggerClass,
                      "bg-sky-50/80 hover:bg-sky-100/80 data-[state=open]:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 dark:data-[state=open]:bg-sky-900"
                    )}
                  >
                    <SectionHeader
                      icon={FlaskConical}
                      title="تعريف الفحص والتسعير"
                      hint="الاسم والرمز ونوع النتيجة والسعر وحالة التفعيل"
                      iconTint={sectionIconClass.definition}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-0 sm:px-5">
                    <div
                      className={cn(
                        "space-y-5 rounded-xl border p-4 sm:p-5",
                        sectionInner.definition
                      )}
                    >
                      <div className="space-y-2">
                        <Label className={labelClass}>قوالب جاهزة سريعة</Label>
                        <div className="flex flex-wrap gap-2">
                          {TEST_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => applyTemplate(tpl)}
                              className="rounded-xl border border-sky-200/70 bg-sky-50 px-3 py-2 text-right text-xs transition-colors hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:hover:bg-sky-900/50"
                            >
                              <span className="block font-semibold text-sky-800 dark:text-sky-200">
                                {tpl.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {tpl.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tf-name" className={labelClass}>
                          اسم الفحص <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                            <FlaskConical className="size-4" aria-hidden />
                          </span>
                          <Input
                            id="tf-name"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            className={cn(inputClass, "ps-10")}
                            dir="rtl"
                            placeholder="مثال: سكر الدم الصائم"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tf-code" className={labelClass}>
                              الرمز <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                                <Hash className="size-4" aria-hidden />
                              </span>
                              <Input
                                id="tf-code"
                                value={form.code}
                                onChange={(e) =>
                                  set("code", e.target.value.toUpperCase())
                                }
                                className={cn(
                                  inputClass,
                                  "ps-10 font-mono text-sm tabular-nums"
                                )}
                                dir="rtl"
                                placeholder="FBS"
                              />
                            </div>
                          </div>
                          <IconPicker 
                            value={form.icon_name} 
                            onChange={(v) => set("icon_name", v)} 
                          />
                        </div>

                        <div className="space-y-4">
                          <Label className={labelClass}>إدارة الأسعار (عملات متعددة)</Label>
                          <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                            {form.prices.map((price, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-2">
                                <Select
                                  value={price.currency_code}
                                  onValueChange={(v) => updatePrice(pIdx, "currency_code", v)}
                                >
                                  <SelectTrigger className="h-10 w-24 rounded-xl border-border/40 font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SAR">SAR</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="TRY">TRY</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="relative flex-1">
                                  <Banknote className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40" />
                                  <Input
                                    type="number"
                                    value={price.amount || ""}
                                    onChange={(e) => updatePrice(pIdx, "amount", Number(e.target.value))}
                                    className="h-10 rounded-xl pr-9 font-bold tabular-nums"
                                    placeholder="0.00"
                                  />
                                </div>
                                {form.prices.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => removePrice(pIdx)}
                                  >
                                    <X className="size-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 w-full gap-2 rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/5"
                              onClick={addPrice}
                            >
                              <Plus className="size-3.5" />
                              <span>أضف سعر بعملة أخرى</span>
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex flex-col justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 sm:min-h-13"
                        )}
                      >
                        <div className="flex flex-row-reverse items-center justify-between gap-3">
                          <Switch
                            id="tf-active"
                            checked={form.isActive}
                            onCheckedChange={(v) => set("isActive", v)}
                          />
                          <Label
                            htmlFor="tf-active"
                            className="cursor-pointer text-right text-sm font-medium leading-snug"
                          >
                            فحص نشط
                          </Label>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground text-right">
                          الفحوصات غير النشطة لا تظهر في قوائم الطلب
                          الافتراضية.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value={SECTION_REPORTING}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
                    sectionShell.reporting
                  )}
                >
                  <AccordionTrigger
                    dir="rtl"
                    className={cn(
                      accordionTriggerClass,
                      "bg-violet-50/80 hover:bg-violet-100/80 data-[state=open]:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900 dark:data-[state=open]:bg-violet-900"
                    )}
                  >
                    <SectionHeader
                      icon={SlidersHorizontal}
                      title="حقول النتائج"
                      hint="أضف حقل نتيجة واحد أو أكثر (مثل CBC يحتوي على عدة حقول)"
                      iconTint={sectionIconClass.reporting}
                      extra={
                        <Badge
                          variant="outline"
                          className="rounded-lg border-violet-200 bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800 dark:border-violet-800 dark:bg-violet-900 dark:text-violet-200"
                        >
                          عدد الحقول: {form.fields.length}
                        </Badge>
                      }
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-0 sm:px-5">
                    <div className="space-y-4">
                      {form.fields.map((field, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "group relative overflow-hidden rounded-3xl border border-border/60 bg-background/50 p-5 transition-all duration-300 hover:border-violet-200 hover:bg-background hover:shadow-xl sm:p-6",
                            "dark:hover:border-violet-900/50"
                          )}
                        >
                          {/* Header Area */}
                          <div className="mb-6 flex items-start justify-between gap-6">
                            <div className="flex flex-1 items-center gap-4">
                              <div className="relative shrink-0">
                                <div className="relative flex size-10 items-center justify-center rounded-xl bg-violet-100 text-base font-semibold text-violet-600 shadow-sm dark:bg-violet-900/30 dark:text-violet-400">
                                  {idx + 1}
                                </div>
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground/80">اسم الحقل (مثال: الهيموجلوبين)</Label>
                                <Input
                                  value={field.name}
                                  onChange={(e) => updateField(idx, "name", e.target.value)}
                                  placeholder="أدخل اسم الحقل هنا..."
                                  className="h-9   text-lg font-semibold tracking-tight placeholder:text-muted-foreground/30 "
                                  dir="rtl"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-xl text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-90"
                                onClick={() => removeField(idx)}
                              >
                                <Trash2 className="size-4.5" />
                              </Button>
                              <div className="cursor-grab p-2 text-muted-foreground/30 transition-colors hover:text-muted-foreground active:cursor-grabbing">
                                <GripVertical className="size-4.5" />
                              </div>
                            </div>
                          </div>

                          {/* Controls Grid */}
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-[13px] font-semibold text-foreground/70">نوع النتيجة</Label>
                              <div className="grid grid-cols-3 gap-2" dir="rtl">
                                {[
                                  { id: "number", label: "رقم", icon: Binary, color: "sky" },
                                  { id: "text", label: "نص", icon: Type, color: "emerald" },
                                  { id: "select", label: "قائمة", icon: ListChecks, color: "amber" },
                                ].map((type) => {
                                  const isSelected = field.resultType === type.id
                                  const colorClass = {
                                    sky: isSelected ? "bg-sky-500 text-white shadow-sky-200" : "hover:bg-sky-50 text-sky-600 border-sky-100",
                                    emerald: isSelected ? "bg-emerald-500 text-white shadow-emerald-200" : "hover:bg-emerald-50 text-emerald-600 border-emerald-100",
                                    amber: isSelected ? "bg-amber-500 text-white shadow-amber-200" : "hover:bg-amber-50 text-amber-600 border-amber-100",
                                  }[type.color]

                                  return (
                                    <button
                                      key={type.id}
                                      type="button"
                                      onClick={() => {
                                        const t = type.id as ResultType
                                        const patch: Partial<LabTestField> = { resultType: t }
                                        if (t === "select" && parseSelectOptionsForm(field.selectOptions ?? "").length === 0) {
                                          patch.selectOptions = DEFAULT_SELECT_OPTIONS_JSON
                                        }
                                        patchField(idx, patch)
                                      }}
                                      className={cn(
                                        "flex h-11 items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                                        isSelected ? "border-transparent shadow-lg" : "bg-background border-border/40",
                                        colorClass
                                      )}
                                    >
                                      <type.icon className={cn("size-4", isSelected ? "text-white" : "")} />
                                      <span>{type.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            <div className={cn("grid gap-5 lg:grid-cols-2", field.resultType !== "number" && "lg:grid-cols-1")}>
                              <div className="space-y-2.5">
                                <Label className="text-[13px] font-semibold text-foreground/70">رمز الحقل (اختياري)</Label>
                                <div className="relative group/input">
                                  <Input
                                    value={field.code}
                                    onChange={(e) => updateField(idx, "code", e.target.value.toUpperCase())}
                                    placeholder="HGB"
                                    className={cn(inputClass, "font-mono font-medium")}
                                    dir="rtl"
                                  />
                                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                    <Hash className="size-3.5" />
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {suggestFieldCodes(field).map((code) => {
                                    const isSelected = field.code.trim().toUpperCase() === code
                                    return (
                                      <button
                                        key={`${idx}-${code}`}
                                        type="button"
                                        onClick={() => {
                                          updateField(idx, "code", code)
                                          // تسهيل إضافي: تعبئة الوحدة تلقائياً عند اختيار رمز شائع رقمي
                                          if (field.resultType === "number" && !field.unit.trim()) {
                                            const u = SUGGESTED_UNIT_BY_CODE[code]
                                            if (u) updateField(idx, "unit", u)
                                          }
                                        }}
                                        className={cn(
                                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                                          isSelected
                                            ? "border-primary/40 bg-primary/10 text-primary"
                                            : "border-border/60 bg-background text-muted-foreground hover:bg-muted/40"
                                        )}
                                      >
                                        {code}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {field.resultType === "number" && (
                                <div className="space-y-2.5">
                                  <Label className="text-[13px] font-semibold text-foreground/70">وحدة القياس</Label>
                                  <Input
                                    value={field.unit}
                                    onChange={(e) => updateField(idx, "unit", e.target.value)}
                                    placeholder="g/dL"
                                    className={cn(inputClass, "font-medium")}
                                    dir="rtl"
                                  />
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {POPULAR_MEASUREMENT_UNITS.map((unit) => {
                                      const isSelected =
                                        field.unit.trim().toLowerCase() === unit.toLowerCase()
                                      return (
                                        <button
                                          key={`${idx}-${unit}`}
                                          type="button"
                                          onClick={() => updateField(idx, "unit", unit)}
                                          className={cn(
                                            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                                            isSelected
                                              ? "border-primary/40 bg-primary/10 text-primary"
                                              : "border-border/60 bg-background text-muted-foreground hover:bg-muted/40"
                                          )}
                                        >
                                          {unit}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {field.resultType === "number" && (
                              <div className="space-y-2.5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <Label className="text-[13px] font-semibold text-foreground/70">المعدل الطبيعي</Label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={field.referenceRangeMode !== "advanced" ? "default" : "outline"}
                                      className="h-9 rounded-xl"
                                      onClick={() => setFieldRangeMode(idx, "single")}
                                    >
                                      نطاق مفرد
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={field.referenceRangeMode === "advanced" ? "default" : "outline"}
                                      className="h-9 rounded-xl"
                                      onClick={() => setFieldRangeMode(idx, "advanced")}
                                    >
                                      نطاقات متعددة
                                    </Button>
                                  </div>
                                </div>

                                {field.referenceRangeMode === "advanced" ? (
                                  <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-semibold text-muted-foreground">
                                        نطاقات مرجعية متعددة ({field.referenceRanges?.length ?? 0})
                                      </p>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-2 rounded-xl"
                                        onClick={() => addReferenceRangeRow(idx)}
                                      >
                                        <Plus className="size-4" />
                                        إضافة نطاق
                                      </Button>
                                    </div>

                                    <div className="space-y-3">
                                      {(field.referenceRanges ?? []).map((r, rIdx) => (
                                        <div key={`${idx}-rr-${rIdx}`} className="rounded-2xl border border-border/60 bg-background p-4">
                                          <div className="mb-3 flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-foreground/80">نطاق #{rIdx + 1}</p>
                                            {(field.referenceRanges?.length ?? 0) > 1 ? (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => removeReferenceRangeRow(idx, rIdx)}
                                                aria-label="حذف النطاق"
                                              >
                                                <Trash2 className="size-4.5" />
                                              </Button>
                                            ) : null}
                                          </div>

                                          <div className="space-y-3">
                                            <div className="space-y-3 rounded-xl border border-sky-200/40 bg-sky-50/30 p-3 dark:border-sky-800/40 dark:bg-sky-950/20">
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                                  الاستهداف
                                                </span>
                                                <div className="h-px flex-1 bg-sky-200/50 dark:bg-sky-800/40" />
                                              </div>

                                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] text-muted-foreground">الجنس</Label>
                                                  <Select
                                                    
                                                    value={(r.gender_code ?? GENDER_ANY_VALUE) as string}
                                                    onValueChange={(v) =>
                                                      updateReferenceRangeRow(idx, rIdx, {
                                                        gender_code: v === GENDER_ANY_VALUE ? null : v,
                                                      })
                                                    }
                                                  >
                                                    <SelectTrigger className="h-9 rounded-lg text-xs w-[95%]">
                                                      <SelectValue placeholder="الكل" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {GENDER_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>
                                                          {o.label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] text-muted-foreground">الفئة العمرية</Label>
                                                  <Select
                                                    value={(r.ui_age_preset ?? inferAgePreset(r as NonNullable<LabTestField["referenceRanges"]>[number])) as string}
                                                    onValueChange={(v) =>
                                                      updateReferenceRangeRow(
                                                        idx,
                                                        rIdx,
                                                        applyAgePresetValues(v as "general" | "child" | "adult" | "custom")
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="h-9 rounded-lg text-xs w-[95%] 
                                                    ">
                                                      <SelectValue
                                                  
                                                      placeholder="فئة العمر" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {AGE_PRESET_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>
                                                          {o.label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] text-muted-foreground">الأولوية</Label>
                                                  <Select
                                                    value={String(r.priority ?? 0)}
                                                    onValueChange={(v) => updateReferenceRangeRow(idx, rIdx, { priority: Number(v) })}
                                                  >
                                                    <SelectTrigger className="h-9 rounded-lg text-xs w-[95%]">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {PRIORITY_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={String(o.value)}>
                                                          {o.label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>

                                              {(r.ui_age_preset ?? inferAgePreset(r as NonNullable<LabTestField["referenceRanges"]>[number])) !== "general" ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                  <div className="space-y-1.5">
                                                    <Label className="text-[10px] text-muted-foreground">من عمر</Label>
                                                    <Input
                                                      value={r.age_from ?? ""}
                                                      onChange={(e) => updateReferenceRangeRow(idx, rIdx, { age_from: e.target.value })}
                                                      className="h-9 rounded-lg text-xs text-center"
                                                      placeholder="18"
                                                      dir="ltr"
                                                    />
                                                  </div>
                                                  <div className="space-y-1.5">
                                                    <Label className="text-[10px] text-muted-foreground">إلى عمر</Label>
                                                    <Input
                                                      value={r.age_to ?? ""}
                                                      onChange={(e) => updateReferenceRangeRow(idx, rIdx, { age_to: e.target.value })}
                                                      className="h-9 rounded-lg text-xs text-center"
                                                      placeholder="65"
                                                      dir="ltr"
                                                    />
                                                  </div>
                                                  <div className="space-y-1.5">
                                                    <Label className="text-[10px] text-muted-foreground">الوحدة</Label>
                                                    <Select
                                                      value={(r.age_unit ?? "year") as string}
                                                      onValueChange={(v) => updateReferenceRangeRow(idx, rIdx, { age_unit: v })}
                                                    >
                                                      <SelectTrigger className="h-9 rounded-lg text-xs w-[95%]">
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem value="year">سنة</SelectItem>
                                                        <SelectItem value="month">شهر</SelectItem>
                                                        <SelectItem value="day">يوم</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                </div>
                                              ) : null}
                                            </div>

                                            <div className="space-y-3 rounded-xl border border-violet-200/40 bg-violet-50/30 p-3 dark:border-violet-800/40 dark:bg-violet-950/20">
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                                                  نوع المدى
                                                </span>
                                                <div className="h-px flex-1 bg-violet-200/50 dark:bg-violet-800/40" />
                                              </div>

                                              <div className="grid grid-cols-3 gap-2">
                                                {RANGE_OPERATOR_OPTIONS.map((op) => {
                                                  const selected =
                                                    (r.ui_operator ?? inferRangeOperator(r as NonNullable<LabTestField["referenceRanges"]>[number])) === op.value
                                                  const icon = { between: "≈", greater_than: ">", less_than: "<" }[op.value]
                                                  return (
                                                    <button
                                                      key={op.value}
                                                      type="button"
                                                      onClick={() =>
                                                        updateReferenceRangeRow(idx, rIdx, {
                                                          ui_operator: op.value,
                                                          min_value: op.value === "less_than" ? null : r.min_value ?? null,
                                                          max_value: op.value === "greater_than" ? null : r.max_value ?? null,
                                                          reference_text: null,
                                                        })
                                                      }
                                                      className={cn(
                                                        "flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all",
                                                        selected
                                                          ? "bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-violet-900"
                                                          : "border border-border/60 bg-background text-muted-foreground hover:bg-violet-50 hover:text-violet-600"
                                                      )}
                                                    >
                                                      <span className="text-sm font-bold">{icon}</span>
                                                      {op.label}
                                                    </button>
                                                  )
                                                })}
                                              </div>

                                              {(r.ui_operator ?? inferRangeOperator(r as NonNullable<LabTestField["referenceRanges"]>[number])) === "between" ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                  <div className="relative">
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-violet-600">من</span>
                                                    <Input
                                                      value={r.min_value ?? ""}
                                                      onChange={(e) => updateReferenceRangeRow(idx, rIdx, { min_value: e.target.value })}
                                                      className="h-9 rounded-lg pl-8 text-center text-xs"
                                                      placeholder="0"
                                                      dir="ltr"
                                                    />
                                                  </div>
                                                  <div className="relative">
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-violet-600">إلى</span>
                                                    <Input
                                                      value={r.max_value ?? ""}
                                                      onChange={(e) => updateReferenceRangeRow(idx, rIdx, { max_value: e.target.value })}
                                                      className="h-9 rounded-lg pl-8 text-center text-xs"
                                                      placeholder="100"
                                                      dir="ltr"
                                                    />
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="relative">
                                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                                                    <span className="text-sm font-bold text-violet-600">
                                                      {(r.ui_operator ?? inferRangeOperator(r as NonNullable<LabTestField["referenceRanges"]>[number])) === "greater_than" ? ">" : "<"}
                                                    </span>
                                                  </div>
                                                  <Input
                                                    value={
                                                      (r.ui_operator ?? inferRangeOperator(r as NonNullable<LabTestField["referenceRanges"]>[number])) === "greater_than"
                                                        ? (r.min_value ?? "")
                                                        : (r.max_value ?? "")
                                                    }
                                                    onChange={(e) =>
                                                      updateReferenceRangeRow(idx, rIdx, {
                                                        min_value:
                                                          (r.ui_operator ?? inferRangeOperator(r as NonNullable<LabTestField["referenceRanges"]>[number])) === "greater_than"
                                                            ? e.target.value
                                                            : null,
                                                        max_value:
                                                          (r.ui_operator ?? inferRangeOperator(r as NonNullable<LabTestField["referenceRanges"]>[number])) === "less_than"
                                                            ? e.target.value
                                                            : null,
                                                        reference_text: null,
                                                      })
                                                    }
                                                    className="h-9 rounded-lg pl-8 text-center text-xs border-violet-200/50 bg-violet-50/20"
                                                    placeholder="القيمة"
                                                    dir="ltr"
                                                  />
                                                </div>
                                              )}
                                            </div>

                                            <Accordion
                                              type="single"
                                              collapsible
                                              dir="rtl"
                                              className="w-full"
                                            >
                                              <AccordionItem
                                                value={`rr-optional-${idx}-${rIdx}`}
                                                className={cn(
                                                  "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
                                                  sectionShell.definition
                                                )}
                                              >
                                                <AccordionTrigger
                                                  dir="rtl"
                                                  className={cn(
                                                    accordionTriggerClass,
                                                    "bg-sky-50/80 py-3 hover:bg-sky-100/80 data-[state=open]:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 dark:data-[state=open]:bg-sky-900"
                                                  )}
                                                >
                                                  <span className="min-w-0 text-start text-sm font-semibold tracking-tight text-foreground">
                                                    تفاصيل اختيارية (حدود حرجة · تفسير)
                                                  </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-3 pb-4 pt-0 sm:px-4">
                                                  <div
                                                    className={cn(
                                                      "space-y-2 rounded-xl border p-3 sm:p-3.5",
                                                      sectionInner.definition
                                                    )}
                                                  >
                                                    <div className="grid grid-cols-2 gap-2">
                                                      <div className="space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground">
                                                          انخفاض حرج
                                                        </Label>
                                                        <Input
                                                          value={r.critical_low ?? ""}
                                                          onChange={(e) =>
                                                            updateReferenceRangeRow(idx, rIdx, {
                                                              critical_low: e.target.value,
                                                            })
                                                          }
                                                          className="h-8 rounded-lg text-xs"
                                                          placeholder="0"
                                                          dir="ltr"
                                                        />
                                                      </div>
                                                      <div className="space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground">
                                                          ارتفاع حرج
                                                        </Label>
                                                        <Input
                                                          value={r.critical_high ?? ""}
                                                          onChange={(e) =>
                                                            updateReferenceRangeRow(idx, rIdx, {
                                                              critical_high: e.target.value,
                                                            })
                                                          }
                                                          className="h-8 rounded-lg text-xs"
                                                          placeholder="999"
                                                          dir="ltr"
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                      <Label className="text-[10px] text-muted-foreground">
                                                        التفسير
                                                      </Label>
                                                      <Input
                                                        value={r.interpretation_text ?? ""}
                                                        onChange={(e) =>
                                                          updateReferenceRangeRow(idx, rIdx, {
                                                            interpretation_text: e.target.value,
                                                          })
                                                        }
                                                        className="h-8 rounded-lg text-xs"
                                                        placeholder="نص تفسيري..."
                                                        dir="rtl"
                                                      />
                                                    </div>
                                                  </div>
                                                </AccordionContent>
                                              </AccordionItem>
                                            </Accordion>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="relative">
                                      {field.referenceRange.includes("-") ? (
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="relative">
                                            <Input
                                              placeholder="الأدنى"
                                              value={field.referenceRange.split("-")[0]?.trim() || ""}
                                              onChange={(e) => {
                                                const parts = field.referenceRange.split("-")
                                                updateField(
                                                  idx,
                                                  "referenceRange",
                                                  `${e.target.value}-${parts[1]?.trim() || ""}`
                                                )
                                              }}
                                              className={cn(
                                                inputClass,
                                                "text-center font-semibold border-violet-200/50 bg-violet-50/20"
                                              )}
                                              dir="ltr"
                                            />
                                            <span className="absolute -top-2 right-4 bg-background px-1 text-[9px] font-bold text-violet-500">
                                              الأدنى
                                            </span>
                                          </div>
                                          <div className="relative">
                                            <Input
                                              placeholder="الأقصى"
                                              value={field.referenceRange.split("-")[1]?.trim() || ""}
                                              onChange={(e) => {
                                                const parts = field.referenceRange.split("-")
                                                updateField(
                                                  idx,
                                                  "referenceRange",
                                                  `${parts[0]?.trim() || ""}-${e.target.value}`
                                                )
                                              }}
                                              className={cn(
                                                inputClass,
                                                "text-center font-semibold border-violet-200/50 bg-violet-50/20"
                                              )}
                                              dir="ltr"
                                            />
                                            <span className="absolute -top-2 right-4 bg-background px-1 text-[9px] font-bold text-violet-500">
                                              الأعلى
                                            </span>
                                          </div>
                                        </div>
                                      ) : field.referenceRange.startsWith(">") ||
                                        field.referenceRange.startsWith("<") ? (
                                        <div className="relative group/ref">
                                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none bg-violet-500/5 rounded-r-xl border-l-2 border-violet-500/10 px-3">
                                            <span className="text-lg font-bold text-violet-600">
                                              {field.referenceRange[0]}
                                            </span>
                                          </div>
                                          <Input
                                            value={field.referenceRange.substring(1).trim()}
                                            onChange={(e) =>
                                              updateField(
                                                idx,
                                                "referenceRange",
                                                `${field.referenceRange[0]}${e.target.value}`
                                              )
                                            }
                                            className={cn(
                                              inputClass,
                                              "pr-16 text-left font-semibold border-violet-200/50 bg-violet-50/20"
                                            )}
                                            dir="ltr"
                                          />
                                        </div>
                                      ) : (
                                        <Input
                                          value={field.referenceRange}
                                          onChange={(e) => updateField(idx, "referenceRange", e.target.value)}
                                          className={cn(inputClass, "font-semibold")}
                                          placeholder="مثال: 70-100"
                                          dir="rtl"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 ">
                                      {[
                                        { label: "نطاق", val: "70-100" },
                                        { label: "أكبر من", val: "> 50" },
                                        { label: "أصغر من", val: "< 10" },
                                      ].map((tmpl) => (
                                        <button
                                          key={tmpl.val}
                                          type="button"
                                          onClick={() => updateField(idx, "referenceRange", tmpl.val)}
                                          className={cn(
                                            "px-3.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                                            field.referenceRange.includes(tmpl.val[0])
                                              ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                                              : "bg-muted text-muted-foreground hover:bg-violet-50 hover:text-violet-600"
                                          )}
                                        >
                                          {tmpl.label}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {field.resultType === "text" && (
                              <div className="space-y-2.5">
                                <Label className="text-[13px] font-semibold text-foreground/70">تعليمات أو مثال (اختياري)</Label>
                                <Input
                                  value={field.referenceRange}
                                  onChange={(e) => updateField(idx, "referenceRange", e.target.value)}
                                  placeholder="يظهر كتلميح عند الإدخال..."
                                  className={cn(inputClass, "font-medium")}
                                  dir="rtl"
                                />
                              </div>
                            )}

                            {field.resultType === "select" && (
                              <div className="rounded-2xl bg-violet-50/30 p-5 border border-dashed border-violet-200">
                                <SelectOptionsEditor
                                  value={field.selectOptions ?? ""}
                                  onChange={(next) => updateField(idx, "selectOptions", next)}
                                  inputClassName={cn(inputClass, "font-medium")}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-full gap-2 rounded-xl border-dashed border-violet-300 bg-violet-50/30 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800 dark:bg-violet-950/20"
                        onClick={addField}
                      >
                        <Plus className="size-4" />
                        إضافة حقل نتيجة جديد
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="pointer-events-none sticky bottom-0 z-[1] -mt-3 h-4 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="shrink-0 border-t border-border/50 bg-muted/40 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="order-2 text-center text-xs text-muted-foreground sm:order-1 sm:text-right">
                الحقول ذات العلامة <span className="text-destructive">*</span>{" "}
                مطلوبة قبل الحفظ.
              </p>
              <div className="order-1 flex flex-wrap items-center justify-center gap-2 sm:order-2 sm:justify-start">
                <Button
                  type="submit"
                  className="min-h-11 min-w-[140px] rounded-xl px-6 text-base shadow-md transition-shadow hover:shadow-lg"
                  disabled={categoryTree.length === 0 || submitting}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      جارٍ الحفظ…
                    </span>
                  ) : initial ? (
                    "حفظ التغييرات"
                  ) : (
                    "حفظ الفحص"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={submitting}
                  className="min-h-11 rounded-xl px-5 text-muted-foreground"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
