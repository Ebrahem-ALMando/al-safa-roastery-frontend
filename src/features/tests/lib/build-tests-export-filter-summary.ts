import { OPERATIONAL_SCOPE_PRESET_LABELS_AR } from "@/lib/date-scope/operational-date-scope-labels"
import type { OperationalDateScopePreset } from "@/lib/date-scope/operational-date-scope.types"
import type {
  BuildTestsExportFilterSummaryInput,
  TestsExportFilterSummary,
} from "./tests-export-types"

const PERIOD_LABELS_EN: Record<OperationalDateScopePreset, string> = {
  all: "All time",
  today: "Today",
  yesterday: "Yesterday",
  current_week: "Current week",
  current_month: "Current month",
}

export function buildTestsExportFilterSummary(
  input: BuildTestsExportFilterSummaryInput
): TestsExportFilterSummary {
  const summary: TestsExportFilterSummary = {}
  const search = input.search.trim()
  if (search) summary.search = search

  if (input.isActive === "active") {
    summary.statusAr = "نشط"
    summary.statusEn = "Active"
  } else if (input.isActive === "inactive") {
    summary.statusAr = "غير نشط"
    summary.statusEn = "Inactive"
  }

  if (input.categoryId !== "all" && input.categoryLabel) {
    summary.categoryAr = input.categoryLabel
    summary.categoryEn = input.categoryLabel
  }

  if (input.dateScopePreset !== "all") {
    summary.periodAr = OPERATIONAL_SCOPE_PRESET_LABELS_AR[input.dateScopePreset]
    summary.periodEn = PERIOD_LABELS_EN[input.dateScopePreset]
  }

  return summary
}

export function hasExportFilterSummary(summary: TestsExportFilterSummary): boolean {
  return Object.keys(summary).length > 0
}
