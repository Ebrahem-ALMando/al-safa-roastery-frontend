import type { OperationalDateScopePreset } from "@/lib/date-scope/operational-date-scope.types"

export type TestsExportFilterSummary = {
  search?: string
  statusAr?: string
  statusEn?: string
  categoryAr?: string
  categoryEn?: string
  periodAr?: string
  periodEn?: string
}

export type TestsExportRow = {
  index: number
  code: string
  name: string
  category: string
  unit: string
  resultTypeAr: string
  resultTypeEn: string
  statusAr: string
  statusEn: string
  basePrice: string
  currency: string
  fieldsCount: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type BuildTestsExportFilterSummaryInput = {
  search: string
  categoryId: number | "all"
  isActive: "all" | "active" | "inactive"
  dateScopePreset: OperationalDateScopePreset
  categoryLabel?: string
}
