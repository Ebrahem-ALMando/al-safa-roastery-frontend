import type { ReportPrintOptions } from "@/components/reports/report-template"
import {
  ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT,
  ABNORMAL_CUSTOM_LOW_HEX_DEFAULT,
  clampAbnormalCustomHex,
  clampAbnormalRowPreset,
} from "@/lib/report-abnormal-highlight"
import {
  RESULTS_TABLE_BODY_PX_DEFAULT,
  RESULTS_TABLE_HEADER_PX_DEFAULT,
  clampResultsTableBodyFontPx,
  clampResultsTableHeaderFontPx,
} from "@/lib/report-results-table-font"
import { normalizeReportThemeHex, normalizeReportThemeId } from "@/lib/report-themes"

export {
  ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT,
  ABNORMAL_CUSTOM_LOW_HEX_DEFAULT,
  clampAbnormalCustomHex,
  clampAbnormalRowPreset,
} from "@/lib/report-abnormal-highlight"
export {
  RESULTS_TABLE_BODY_PX_DEFAULT,
  RESULTS_TABLE_HEADER_PX_DEFAULT,
  clampResultsTableBodyFontPx,
  clampResultsTableHeaderFontPx,
} from "@/lib/report-results-table-font"

const STORAGE_KEY = "lab-report-print-customization"

function clampMargin(n: number): number {
  if (!Number.isFinite(n)) return 10
  return Math.min(80, Math.max(0, Math.round(n * 10) / 10))
}

function clampLogoPlacement(
  v: unknown
): ReportPrintOptions["logoPlacement"] {
  return v === "center" || v === "end" ? v : "start"
}

export const defaultReportPrintOptions: ReportPrintOptions = {
  includeNotes: true,
  includeStaticNotes: true,
  includeHeader: true,
  includeFooter: true,
  spaciousReportMetadata: true,
  reportLanguage: "ar",
  useCustomPageMargins: false,
  pageMarginsMm: { top: 10, right: 10, bottom: 10, left: 10 },
  verboseStatusColumn: true,
  useCustomResultsTableFonts: false,
  resultsTableHeaderFontPx: RESULTS_TABLE_HEADER_PX_DEFAULT,
  resultsTableBodyFontPx: RESULTS_TABLE_BODY_PX_DEFAULT,
  abnormalRowPreset: "red_yellow",
  abnormalCustomHighHex: ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT,
  abnormalCustomLowHex: ABNORMAL_CUSTOM_LOW_HEX_DEFAULT,
  syncPreferencesToPdfUrl: false,
  printGrayscale: false,
  hideTestFieldCodes: false,
  hideEmptyUnitColumn: false,
  compactResultsSpacing: false,
  logoPlacement: "start",
  showExtraFooterLines: false,
  footerExtraLine1: "",
  footerExtraLine2: "",
  showHijriDates: false,
  showAbnormalSummaryBanner: false,
  patientFriendlyReport: false,
  showPrintFooterMetadata: false,
  showPrintShortcutHint: false,
  reportThemeId: "app_default",
  reportThemePrimaryHex: "#81548D",
  reportThemeAccentHex: "#AA548D",
}

/** دمج جزئي مع الافتراضيات والحدود — يُستخدم للتخزين ولمعلَمات URL */
export function normalizeReportPrintOptions(
  parsed: Partial<ReportPrintOptions> | null | undefined
): ReportPrintOptions {
  const p = parsed ?? {}
  return {
    includeNotes: p.includeNotes ?? defaultReportPrintOptions.includeNotes,
    includeStaticNotes:
      p.includeStaticNotes ?? defaultReportPrintOptions.includeStaticNotes,
    includeHeader: p.includeHeader ?? defaultReportPrintOptions.includeHeader,
    includeFooter: p.includeFooter ?? defaultReportPrintOptions.includeFooter,
    spaciousReportMetadata:
      p.spaciousReportMetadata ?? defaultReportPrintOptions.spaciousReportMetadata,
    reportLanguage:
      p.reportLanguage === "en" || p.reportLanguage === "ar"
        ? p.reportLanguage
        : defaultReportPrintOptions.reportLanguage,
    useCustomPageMargins:
      p.useCustomPageMargins ?? defaultReportPrintOptions.useCustomPageMargins,
    pageMarginsMm: {
      top: clampMargin(p.pageMarginsMm?.top ?? defaultReportPrintOptions.pageMarginsMm.top),
      right: clampMargin(
        p.pageMarginsMm?.right ?? defaultReportPrintOptions.pageMarginsMm.right
      ),
      bottom: clampMargin(
        p.pageMarginsMm?.bottom ?? defaultReportPrintOptions.pageMarginsMm.bottom
      ),
      left: clampMargin(
        p.pageMarginsMm?.left ?? defaultReportPrintOptions.pageMarginsMm.left
      ),
    },
    verboseStatusColumn:
      p.verboseStatusColumn ?? defaultReportPrintOptions.verboseStatusColumn,
    useCustomResultsTableFonts:
      p.useCustomResultsTableFonts ??
      defaultReportPrintOptions.useCustomResultsTableFonts,
    resultsTableHeaderFontPx: clampResultsTableHeaderFontPx(p.resultsTableHeaderFontPx),
    resultsTableBodyFontPx: clampResultsTableBodyFontPx(p.resultsTableBodyFontPx),
    abnormalRowPreset: clampAbnormalRowPreset(p.abnormalRowPreset),
    abnormalCustomHighHex: clampAbnormalCustomHex(
      p.abnormalCustomHighHex,
      ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
    ),
    abnormalCustomLowHex: clampAbnormalCustomHex(
      p.abnormalCustomLowHex,
      ABNORMAL_CUSTOM_LOW_HEX_DEFAULT
    ),
    syncPreferencesToPdfUrl:
      p.syncPreferencesToPdfUrl ?? defaultReportPrintOptions.syncPreferencesToPdfUrl,
    printGrayscale: p.printGrayscale ?? defaultReportPrintOptions.printGrayscale,
    hideTestFieldCodes: p.hideTestFieldCodes ?? defaultReportPrintOptions.hideTestFieldCodes,
    hideEmptyUnitColumn:
      p.hideEmptyUnitColumn ?? defaultReportPrintOptions.hideEmptyUnitColumn,
    compactResultsSpacing:
      p.compactResultsSpacing ?? defaultReportPrintOptions.compactResultsSpacing,
    logoPlacement: clampLogoPlacement(p.logoPlacement),
    showExtraFooterLines:
      p.showExtraFooterLines ?? defaultReportPrintOptions.showExtraFooterLines,
    footerExtraLine1:
      typeof p.footerExtraLine1 === "string"
        ? p.footerExtraLine1
        : defaultReportPrintOptions.footerExtraLine1,
    footerExtraLine2:
      typeof p.footerExtraLine2 === "string"
        ? p.footerExtraLine2
        : defaultReportPrintOptions.footerExtraLine2,
    showHijriDates: p.showHijriDates ?? defaultReportPrintOptions.showHijriDates,
    showAbnormalSummaryBanner:
      p.showAbnormalSummaryBanner ??
      defaultReportPrintOptions.showAbnormalSummaryBanner,
    patientFriendlyReport:
      p.patientFriendlyReport ?? defaultReportPrintOptions.patientFriendlyReport,
    showPrintFooterMetadata:
      p.showPrintFooterMetadata ?? defaultReportPrintOptions.showPrintFooterMetadata,
    showPrintShortcutHint:
      p.showPrintShortcutHint ?? defaultReportPrintOptions.showPrintShortcutHint,
    reportThemeId: normalizeReportThemeId(
      (p.reportThemeId as string | undefined) ??
        defaultReportPrintOptions.reportThemeId
    ),
    reportThemePrimaryHex: normalizeReportThemeHex(
      p.reportThemePrimaryHex,
      defaultReportPrintOptions.reportThemePrimaryHex
    ),
    reportThemeAccentHex: normalizeReportThemeHex(
      p.reportThemeAccentHex,
      defaultReportPrintOptions.reportThemeAccentHex
    ),
  }
}

export function readReportPrintPreferences(): ReportPrintOptions {
  if (typeof window === "undefined") return { ...defaultReportPrintOptions }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultReportPrintOptions }
    const parsed = JSON.parse(raw) as Partial<ReportPrintOptions>
    return normalizeReportPrintOptions(parsed)
  } catch {
    return { ...defaultReportPrintOptions }
  }
}

export function writeReportPrintPreferences(next: ReportPrintOptions) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
