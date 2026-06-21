import type { Test } from "../types/test.types"
import type { TestsExportRow } from "./tests-export-types"

const DASH = "—"

function displayOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return DASH
  const s = String(value).trim()
  return s.length > 0 ? s : DASH
}

function resolveResultType(test: Test): "number" | "select" | "text" {
  const f = test.fields?.[0]
  if (f == null) return "number"
  if (f.field_type === "select") return "select"
  if (f.field_type === "text") return "text"
  return "number"
}

const RESULT_TYPE_AR: Record<"number" | "select" | "text", string> = {
  number: "رقم",
  select: "قائمة",
  text: "نص",
}

const RESULT_TYPE_EN: Record<"number" | "select" | "text", string> = {
  number: "Number",
  select: "Select",
  text: "Text",
}

function formatOptionalDate(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") return DASH
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function mapTestToExportRow(test: Test, index: number): TestsExportRow {
  const resultType = resolveResultType(test)
  const firstPrice = test.prices?.[0]
  const extended = test as Test & { created_at?: string; updated_at?: string }

  return {
    index,
    code: displayOrDash(test.code),
    name: displayOrDash(test.name),
    category: displayOrDash(test.category?.name),
    unit: displayOrDash(test.fields?.[0]?.unit),
    resultTypeAr: RESULT_TYPE_AR[resultType],
    resultTypeEn: RESULT_TYPE_EN[resultType],
    statusAr: test.is_active ? "نشط" : "غير نشط",
    statusEn: test.is_active ? "Active" : "Inactive",
    basePrice:
      firstPrice != null && Number.isFinite(firstPrice.amount)
        ? String(firstPrice.amount)
        : DASH,
    currency: displayOrDash(firstPrice?.currency_code),
    fieldsCount: String(test.fields?.length ?? 0),
    createdAt: formatOptionalDate(extended.created_at),
    updatedAt: formatOptionalDate(extended.updated_at),
    isActive: test.is_active,
  }
}

export function mapTestsToExportRows(tests: Test[]): TestsExportRow[] {
  return tests.map((test, i) => mapTestToExportRow(test, i + 1))
}
