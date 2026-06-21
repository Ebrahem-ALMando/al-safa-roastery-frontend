"use client"

import * as React from "react"
import { FlaskConical, MapPin, Phone, User, FileText, Stethoscope } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  REPORT_DEFAULT_STATIC_NOTES,
  REPORT_DEFAULT_STATIC_NOTES_EN,
  REPORT_PATIENT_SHORT_AR,
  REPORT_PATIENT_SHORT_EN,
} from "@/lib/report-static-notes"
import {
  formatAbnormalSummaryLabel,
  formatGenderDisplay,
  formatReportDate,
  formatReportDatePerhapsHijri,
  getReportLabels,
  labSubtitleForLang,
  type ReportLanguage,
} from "@/lib/report-i18n"
import QRCode from "react-qr-code"
import {
  ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT,
  ABNORMAL_CUSTOM_LOW_HEX_DEFAULT,
  type AbnormalRowPreset,
  type AbnormalVisualTone,
  clampAbnormalCustomHex,
  clampAbnormalRowPreset,
  resolveAbnormalVisuals,
} from "@/lib/report-abnormal-highlight"
import {
  RESULTS_TABLE_BODY_PX_DEFAULT,
  RESULTS_TABLE_HEADER_PX_DEFAULT,
  clampResultsTableBodyFontPx,
  clampResultsTableHeaderFontPx,
} from "@/lib/report-results-table-font"
import { encodeVerifyOrderToken } from "@/lib/verify-order-wedge-token"
import {
  normalizeReportThemeHex,
  normalizeReportThemeId,
  resolveReportThemeCssProperties,
  reportUsesCustomVisualTheme,
} from "@/lib/report-themes"
import { ReportTemplateTestGroup } from "@/components/reports/report-template-test-group"
import type { LabOrderResultFlag } from "@/features/orders"

export interface TestResult {
  name: string
  code: string
  value: string
  unit: string
  referenceRange: string
  isAbnormal: boolean
  abnormalType?: "high" | "low"
  resultFlag?: LabOrderResultFlag | null
  hasEvaluableReference?: boolean
  fieldType?: string
  /** Narrative / textarea values — preserve line breaks in print */
  isMultiline?: boolean
  /** من آخر طلب سابق للمريض عند وجود نفس الحقل */
  previousValue?: string
  /** YYYY-MM-DD لتاريخ الطلب السابق */
  previousOrderedAt?: string | null
  attachments?: {
    id: string
    name: string
    url: string
    type: string
    uploadDate: string
  }[]
}

export type ReportTestSectionGroup = {
  sectionKey: string
  label: string
  tests: TestResult[]
}

export interface TestGroup {
  category: string
  /** Standard tests: flat rows. Template tests may use `sectionGroups` instead. */
  tests: TestResult[]
  /** When set, render grouped section tables (urinalysis, stool, semen, etc.). */
  sectionGroups?: ReportTestSectionGroup[]
  /** Subtle template badge in Arabic report UI */
  templateBadge?: string
}

function resolveNumericPatientId(patient: ReportData["patient"]): number | null {
  const dbId = patient.dbId
  if (dbId != null && Number.isFinite(dbId) && dbId > 0) return dbId
  const trimmed = patient.id.trim()
  const patMatch = /^PAT-0*(\d+)$/i.exec(trimmed)
  if (patMatch) return parseInt(patMatch[1], 10)
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10)
  return null
}

/** نفس ترميز ملصق المريض — يعمل مع الماسح العالمي ~PAT-{id} → /dashboard/patients/{id} */
export function encodePatientWedgeBarcode(patient: ReportData["patient"]): string | null {
  const id = resolveNumericPatientId(patient)
  return id != null ? `~PAT-${id}` : null
}

/** ترميز تحقق التقرير لماسح الإسفين: ~VRF-{HEX} → /verify/{order_number} */
export function encodeVerifyWedgeBarcode(orderNumber: string): string | null {
  const hex = encodeVerifyOrderToken(orderNumber.trim())
  return hex ? `~VRF-${hex}` : null
}

export interface ReportData {
  orderId: string
  /** معرّف الطلب الرقمي في النظام */
  orderDbId?: number
  date: string
  issueDate?: string
  patient: {
    name: string
    id: string
    /** معرّف المريض الرقمي في النظام — لفتح ملف المريض عند الحاجة (ليس لترميز QR التقرير) */
    dbId?: number
    /** `null` إن لم يتوفر تاريخ ميلاد في البيانات */
    age: number | null
    gender: string
    phone?: string
  }
  doctor?: string
  testGroups: TestGroup[]
  /** عند وجود طلب سابق للمريض يُعرض عمود النتيجة السابقة */
  showPreviousResultColumn?: boolean
  notes?: string[]
  labInfo?: {
    name: string
    subtitle: string
    phone?: string
    address?: string
    logo?: string
  }
}

/** خيارات إظهار أقسام الطباعة — تُخزَّن من صفحة «تخصيص الطباعة». */
export type ReportPrintOptions = {
  /** ملاحظات الطلب المخزّنة على الطلب (من الـ API). */
  includeNotes: boolean
  /** النصوص الإرشادية الثابتة (تفسير الألوان، الطبيب، التحقق، إلخ). */
  includeStaticNotes: boolean
  includeHeader: boolean
  includeFooter: boolean
  /**
   * عند التفعيل: بطاقات رقم التقرير/التواريخ وبيانات المريض بتخطيط ومساحات كالتصميم الحالي.
   * عند الإلغاء: ثيم مدمج بخطوط وأحجام أصغر لتوفير المساحة.
   */
  spaciousReportMetadata: boolean
  /** لغة واجهة التقرير والطباعة */
  reportLanguage: ReportLanguage
  /** عند التفعيل تُستبدل هوامش المحتوى بالقيم بالمليمتر؛ عند الإلغاء تُستخدم هوامش الواجهة الافتراضية */
  useCustomPageMargins: boolean
  /** يُطبَّق عند useCustomPageMargins */
  pageMarginsMm: { top: number; right: number; bottom: number; left: number }
  /**
   * عند التفعيل: عمود الحالة يعرض نصوصًا كاملة (طبيعي / مرتفع / منخفض).
   * عند الإلغاء: الطبيعي يُعرض كشرطة «—» فقط؛ المرتفع «H» والمنخفض «L».
   */
  verboseStatusColumn: boolean
  /**
   * عند التفعيل تُستخدم القيم `resultsTableHeaderFontPx` / `resultsTableBodyFontPx`.
   * عند الإلغاء تُستخدم أحجام النظام الافتراضية (مثل الهوامش قبل تخصيص المم).
   */
  useCustomResultsTableFonts: boolean
  /** يُطبَّق عند useCustomResultsTableFonts */
  resultsTableHeaderFontPx: number
  /** يُطبَّق عند useCustomResultsTableFonts */
  resultsTableBodyFontPx: number
  /** تمييز ألوان الصفوف/القيم للنتائج خارج المعدل */
  abnormalRowPreset: AbnormalRowPreset
  /** لون المرتفع عند `abnormalRowPreset === "custom"` */
  abnormalCustomHighHex: string
  /** لون المنخفض عند `abnormalRowPreset === "custom"` */
  abnormalCustomLowHex: string

  /** إلحاق التفضيلات بعنوان صفحة الطباعة ليتطابق PDF من الخادم مع المعاينة */
  syncPreferencesToPdfUrl: boolean
  /** عرض الرمادي (معاينة وطباعة) */
  printGrayscale: boolean
  /** إخفاء سطر كود الحقل تحت اسم التحليل */
  hideTestFieldCodes: boolean
  /** إخفاء عمود الوحدة عندما تكون كل وحدات المجموعة فارغة */
  hideEmptyUnitColumn: boolean
  /** تقليل حشو خلايا جدول النتائج */
  compactResultsSpacing: boolean
  /** محاذاة كتلة الشعار والاسم في الترويسة — في RTL: start يمين، end يسار */
  logoPlacement: "start" | "center" | "end"
  /** أسطر نصية إضافية فوق تذييل التوقيعات */
  showExtraFooterLines: boolean
  footerExtraLine1: string
  footerExtraLine2: string
  /** إظهار تقويم هجري بجانب الميلادي للتواريخ */
  showHijriDates: boolean
  /** شريط تنبيه بعد عنوان النتائج بعدد القيم غير الطبيعية */
  showAbnormalSummaryBanner: boolean
  /** إخفاء الأكواد وإرشادات مختصرة — مناسب لنسخة المريض */
  patientFriendlyReport: boolean
  /** سطر صغير في التذييل يحتوي رقم التقرير والتاريخ (للطباعة) */
  showPrintFooterMetadata: boolean
  /** تلميح اختصار الطباعة — يُعرض في صفحة المعاينة فقط وليس داخل القالب */
  showPrintShortcutHint: boolean

  /** ثيم ألوان التقرير — يعيد تعريف الألوان داخل ورقة التقرير فقط */
  reportThemeId:
    | "app_default"
    | "sirian_purple"
    | "ocean_teal"
    | "forest_emerald"
    | "slate_navy"
    | "terracotta_warm"
    | "rose_clinical"
    | "midnight_indigo"
    | "custom"
  /** يُستخدم عند reportThemeId === "custom" */
  reportThemePrimaryHex: string
  reportThemeAccentHex: string
}

interface ReportTemplateProps {
  data: ReportData
  showAttachments?: boolean
  /** قاعدة الموقع لرابط التحقق (مثال: https://example.com) — يُفضَّل تمرير `window.location.origin` من الصفحة. */
  verificationBaseUrl?: string
  printOptions?: ReportPrintOptions
  className?: string
}

export function ReportTemplate({
  data,
  showAttachments: _showAttachments = false,
  verificationBaseUrl: _verificationBaseUrl,
  printOptions,
  className,
}: ReportTemplateProps) {
  const labInfo = data.labInfo || {
    name: "مختبر التحاليل الطبية",
    subtitle: "تقرير نتائج التحاليل الطبية",
  }

  /** قيم ماسح الإسفين — نفس آلية ~RES في ملصق الطلب (ينتهي بـ Enter) */
  const patientWedgeBarcode = encodePatientWedgeBarcode(data.patient)
  const verifyWedgeBarcode =
    data.orderId?.trim() ? encodeVerifyWedgeBarcode(data.orderId) : null

  const print = {
    includeNotes: printOptions?.includeNotes ?? true,
    includeStaticNotes: printOptions?.includeStaticNotes ?? true,
    includeHeader: printOptions?.includeHeader ?? true,
    includeFooter: printOptions?.includeFooter ?? true,
    spaciousReportMetadata: printOptions?.spaciousReportMetadata ?? true,
    reportLanguage: (printOptions?.reportLanguage ?? "ar") as ReportLanguage,
    useCustomPageMargins: printOptions?.useCustomPageMargins ?? false,
    pageMarginsMm: printOptions?.pageMarginsMm ?? {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    verboseStatusColumn: printOptions?.verboseStatusColumn ?? true,
    useCustomResultsTableFonts: printOptions?.useCustomResultsTableFonts ?? false,
    resultsTableHeaderFontPx: clampResultsTableHeaderFontPx(
      printOptions?.resultsTableHeaderFontPx
    ),
    resultsTableBodyFontPx: clampResultsTableBodyFontPx(printOptions?.resultsTableBodyFontPx),
    abnormalRowPreset: clampAbnormalRowPreset(printOptions?.abnormalRowPreset),
    abnormalCustomHighHex: clampAbnormalCustomHex(
      printOptions?.abnormalCustomHighHex,
      ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
    ),
    abnormalCustomLowHex: clampAbnormalCustomHex(
      printOptions?.abnormalCustomLowHex,
      ABNORMAL_CUSTOM_LOW_HEX_DEFAULT
    ),
    syncPreferencesToPdfUrl: printOptions?.syncPreferencesToPdfUrl ?? false,
    printGrayscale: printOptions?.printGrayscale ?? false,
    hideTestFieldCodes: printOptions?.hideTestFieldCodes ?? false,
    hideEmptyUnitColumn: printOptions?.hideEmptyUnitColumn ?? false,
    compactResultsSpacing: printOptions?.compactResultsSpacing ?? false,
    logoPlacement:
      printOptions?.logoPlacement === "center" || printOptions?.logoPlacement === "end"
        ? printOptions.logoPlacement
        : "start",
    showExtraFooterLines: printOptions?.showExtraFooterLines ?? false,
    footerExtraLine1: printOptions?.footerExtraLine1 ?? "",
    footerExtraLine2: printOptions?.footerExtraLine2 ?? "",
    showHijriDates: printOptions?.showHijriDates ?? false,
    showAbnormalSummaryBanner: printOptions?.showAbnormalSummaryBanner ?? false,
    patientFriendlyReport: printOptions?.patientFriendlyReport ?? false,
    showPrintFooterMetadata: printOptions?.showPrintFooterMetadata ?? false,
    showPrintShortcutHint: printOptions?.showPrintShortcutHint ?? false,
    reportThemeId: normalizeReportThemeId(printOptions?.reportThemeId as string | undefined),
    reportThemePrimaryHex: normalizeReportThemeHex(
      printOptions?.reportThemePrimaryHex,
      "#81548d"
    ),
    reportThemeAccentHex: normalizeReportThemeHex(
      printOptions?.reportThemeAccentHex,
      "#aa548d"
    ),
  }

  const reportThemeCss = resolveReportThemeCssProperties({
    reportThemeId: print.reportThemeId,
    reportThemePrimaryHex: print.reportThemePrimaryHex,
    reportThemeAccentHex: print.reportThemeAccentHex,
  })
  const themedReport = reportUsesCustomVisualTheme(print.reportThemeId)

  const abnormalTones = resolveAbnormalVisuals({
    preset: print.abnormalRowPreset,
    customHighHex: print.abnormalCustomHighHex,
    customLowHex: print.abnormalCustomLowHex,
  })

  const rtHeaderPx = print.useCustomResultsTableFonts
    ? print.resultsTableHeaderFontPx
    : RESULTS_TABLE_HEADER_PX_DEFAULT
  const rtBodyPx = print.useCustomResultsTableFonts
    ? print.resultsTableBodyFontPx
    : RESULTS_TABLE_BODY_PX_DEFAULT
  const lang = print.reportLanguage
  const L = getReportLabels(lang)
  const labSubtitleDisplay = labSubtitleForLang(lang, labInfo.subtitle)
  const staticNotesList =
    lang === "en" ? REPORT_DEFAULT_STATIC_NOTES_EN : REPORT_DEFAULT_STATIC_NOTES
  const guidanceNotes =
    print.patientFriendlyReport
      ? lang === "en"
        ? REPORT_PATIENT_SHORT_EN
        : REPORT_PATIENT_SHORT_AR
      : staticNotesList
  const showPrevCol = data.showPreviousResultColumn === true
  const hideFieldCodes = print.hideTestFieldCodes || print.patientFriendlyReport
  const countAbnormalInGroup = (g: TestGroup) => {
    const rows = g.sectionGroups?.length
      ? g.sectionGroups.flatMap((sec) => sec.tests)
      : g.tests
    return rows.filter(
      (t) =>
        t.resultFlag === "low" ||
        t.resultFlag === "high" ||
        t.resultFlag === "abnormal"
    ).length
  }

  const abnormalCount = data.testGroups.reduce((n, g) => n + countAbnormalInGroup(g), 0)

  const resultsTablePrint = {
    verboseStatusColumn: print.verboseStatusColumn,
    hideTestFieldCodes: hideFieldCodes,
    hideEmptyUnitColumn: print.hideEmptyUnitColumn,
    compactResultsSpacing: print.compactResultsSpacing,
    useCustomResultsTableFonts: print.useCustomResultsTableFonts,
    resultsTableHeaderFontPx: rtHeaderPx,
    resultsTableBodyFontPx: rtBodyPx,
  }

  const innerContentStyle: React.CSSProperties | undefined = print.useCustomPageMargins
    ? {
        paddingTop: `${print.pageMarginsMm.top}mm`,
        paddingRight: `${print.pageMarginsMm.right}mm`,
        paddingBottom: `${print.pageMarginsMm.bottom}mm`,
        paddingLeft: `${print.pageMarginsMm.left}mm`,
      }
    : undefined

  const innerContentClass = print.useCustomPageMargins
    ? "relative z-10"
    : "relative z-10 px-6 py-8 print:px-5 print:py-5 sm:px-10 sm:py-10"

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang === "ar" ? "ar" : "en"}
      style={reportThemeCss}
      className={cn(
        "relative isolate overflow-hidden bg-white text-foreground shadow-sm print:shadow-none",
        print.printGrayscale && "grayscale",
        className
      )}
    >
      {/* شريط علوي للهوية البصرية — ضمن الترويسة */}
      {print.includeHeader ? (
        <div
          className={cn(
            "h-1.5 w-full print:h-1",
            lang === "ar"
              ? "bg-gradient-to-l"
              : "bg-gradient-to-r",
            themedReport
              ? "from-[var(--primary)] via-[color-mix(in_srgb,var(--primary)_55%,var(--report-accent)_45%)] to-[var(--report-accent)]"
              : "from-primary via-primary/80 to-primary/40"
          )}
          aria-hidden
        />
      ) : null}

      {/* Watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] print:opacity-[0.02]">
        <FlaskConical className="size-[36rem] text-primary" strokeWidth={0.45} />
      </div>

      <div className={innerContentClass} style={innerContentStyle}>
        {/* ترويسة المختبر فقط — اختيارية (includeHeader) */}
        {print.includeHeader ? (
          <header className="mb-2 break-inside-avoid print:mb-2">
            <div
              className={cn(
                "flex min-h-0 items-center gap-2.5 border-b border-primary/12 pb-2 print:pb-1.5",
                print.logoPlacement === "center" && "justify-center",
                print.logoPlacement === "end" && "justify-end"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-primary-foreground shadow-sm print:h-8 print:w-8",
                  themedReport
                    ? "from-[var(--primary)] to-[var(--report-accent)]"
                    : "from-primary to-primary/85"
                )}
              >
                <FlaskConical className="size-4.5 print:size-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 text-start">
                <h1 className="truncate text-base font-bold leading-tight text-primary sm:text-lg print:text-[13px]">
                  {labInfo.name}
                </h1>
                <p className="truncate text-[11px] text-muted-foreground print:text-[9px]">
                  {labSubtitleDisplay}
                </p>
              </div>
              {(labInfo.phone || labInfo.address) && (
                <div className="hidden max-w-[38%] flex-col items-end gap-0.5 text-end text-[9px] leading-snug text-muted-foreground sm:flex print:hidden">
                  {labInfo.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3 shrink-0 text-primary/70" aria-hidden />
                      <span dir="ltr" className="font-mono">
                        {labInfo.phone}
                      </span>
                    </span>
                  )}
                  {labInfo.address && (
                    <span className="inline-flex items-start gap-1">
                      <MapPin className="mt-0.5 size-3 shrink-0 text-primary/70" aria-hidden />
                      <span className="line-clamp-2">{labInfo.address}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </header>
        ) : null}

        {/* بطاقة بيانات التقرير + المريض + QR — منظمة بشكل أفقي واحترافي */}
        <section
          aria-label={L.reportMetaAria}
          className={cn(
            "mb-4 flex flex-wrap justify-between gap-y-4 print:mb-3",
            !print.includeHeader && "mt-0"
          )}
        >
          {/* مجموعة المريض - 48% */}
          <div className="flex w-full sm:w-[42%] items-center justify-between rounded-[1.25rem] border border-dashed border-primary/30 bg-primary/[0.02] p-3 print:border-primary/40 print:p-2">
            <div className="flex items-center gap-3 text-start">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary print:size-9 print:bg-primary/5">
                <User className="size-[22px] print:size-4.5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-primary  font-bold  print:text-[9px]">
                  {L.patientInfo || "اسم المريض"}
                </span>
                <span className="mt-0.5 text-[15px] font-bold text-foreground leading-tight print:text-[13px]">
                  {data.patient.name}
                </span>
                <span className="mt-1 flex flex-wrap font-bold  items-center gap-1 text-[11px] text-muted-foreground leading-tight print:text-[10px]">
                  <span dir="ltr" className="font-bold ">{data.patient.id}</span>
                  {(() => {
                    const agePart = data.patient.age != null ? `${data.patient.age} ${L.years}` : null
                    const genderDisp = formatGenderDisplay(data.patient.gender, lang)
                    const genderPart = genderDisp && genderDisp !== "—" ? genderDisp : null
                    if (!agePart && !genderPart) return null
                    return " - " + [agePart, genderPart].filter(Boolean).join(" - ")
                  })()}
                </span>
              </div>
            </div>
            {patientWedgeBarcode && (
              <div className="shrink-0 ms-2 flex flex-col items-center gap-1">
                <div className="rounded-[3px] border border-primary/20 bg-white p-1 shadow-sm print:border-primary/30">
                  <QRCode
                    key={patientWedgeBarcode}
                    value={patientWedgeBarcode}
                    size={48}
                    level="M"
                    className="size-[48px] print:size-[14mm] "
                    aria-label={L.patientProfileQr}
                    title={patientWedgeBarcode}
                  />
                </div>
                <span className="text-[9px] text-primary  font-bold  print:text-[8px]">
                  {L.patientProfileQr}
                </span>
              </div>
            )}
          </div>

          {/* مجموعة التقرير والطبيب - 48% */}
          <div className="flex w-full sm:w-[56%] gap-4 print:gap-3">
            {/* التقرير */}
            <div className="flex flex-1 items-center gap-3 rounded-[1.25rem] border border-dashed border-primary/30 bg-primary/[0.02] p-3 text-start print:border-primary/40 print:p-2">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary print:size-9 print:bg-primary/5">
                <FileText className="size-[22px] print:size-4.5" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] text-primary  font-bold print:text-[9px]">
                  {L.reportNumber}
                </span>
                <span className="mt-0.5 text-[14px] font-bold tabular-nums leading-tight truncate print:text-[13px]" dir="ltr">
                  {data.orderId}
                </span>
                <span className="mt-1 text-[11px] font-bold  text-muted-foreground leading-tight truncate print:text-[10px]">
                  {formatReportDatePerhapsHijri(data.date, lang, print.showHijriDates)}
                </span>
              </div>
            </div>

            {/* الطبيب */}
            {data.doctor && (
              <div className="flex flex-1 items-center gap-3 rounded-[1.25rem] border border-dashed border-primary/30 bg-primary/[0.02] p-3 text-start print:border-primary/40 print:p-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary print:size-9 print:bg-primary/5">
                  <Stethoscope className="size-[22px] print:size-4.5" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[10px] text-primary  font-bold print:text-[9px]">
                    {L.referringDoctor}
                  </span>
                  <span className="mt-0.5 text-[14px] font-bold text-foreground leading-tight truncate print:text-[13px]">
                    {data.doctor}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div
          className="mb-3 h-px w-full bg-gradient-to-l from-transparent via-primary/15 to-transparent print:mb-2"
          aria-hidden
        />

   {/* ملاحظات الطلب (من النظام) */}
   {print.includeNotes && data.notes && data.notes.length > 0 && (
          <div className="mt-4 mb-8 break-inside-avoid rounded-2xl border border-primary/12 bg-primary/[0.04] p-5 print:mb-2 print:mt-2 print:p-3 print:break-inside-auto">
            <p className="mb-3 text-start text-sm font-bold text-primary">{L.orderNotesTitle}</p>
            <ul className="space-y-2.5 text-start text-sm leading-relaxed text-muted-foreground">
              {data.notes.map((note, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* نصوص إرشادية ثابتة (كانت في القالب سابقاً) */}
        {print.includeStaticNotes && guidanceNotes.length > 0 && (
          <div
            className={cn(
              "mb-8 break-inside-avoid rounded-2xl border border-primary/12 bg-primary/[0.04] p-5 print:mb-2 print:mt-2 print:p-3 print:break-inside-auto",
              !(print.includeNotes && data.notes && data.notes.length > 0) && "mt-4"
            )}
          >
            <p className="mb-3 text-start text-sm font-bold text-primary">
              {L.generalGuidanceTitle}
            </p>
            <ul className="space-y-2.5 text-start text-sm leading-relaxed text-muted-foreground">
              {guidanceNotes.map((note, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* ——— نتائج التحاليل — مباشرة تحت بيانات المريض (نفس الصفحة) ——— */}
        <section
          className={cn(
            "report-results-section space-y-4 print:space-y-2",
            print.spaciousReportMetadata ? "mt-5 print:mt-2" : "mt-3 print:mt-1.5"
          )}
          aria-labelledby="results-heading"
        >
          <div className="report-results-heading flex items-center gap-2 border-b border-primary/15 pb-2 print:break-after-avoid print:pb-1">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-sm font-bold text-primary print:size-7 print:text-xs">
              {lang === "en" ? "2" : "٢"}
            </span>
            <h2
              id="results-heading"
              className="font-[family-name:var(--font-tajawal)] text-xl font-bold text-primary print:text-base"
            >
              {L.resultsTitle}
            </h2>
          </div>

          {print.showAbnormalSummaryBanner && abnormalCount > 0 ? (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-950 print:border-amber-600/50">
              {formatAbnormalSummaryLabel(L, abnormalCount)}
            </div>
          ) : null}

          <div className="report-results-groups space-y-4 print:space-y-2">
            {data.testGroups.map((group) => (
              <ReportTemplateTestGroup
                key={group.category}
                group={group}
                showPrevCol={showPrevCol}
                lang={lang}
                L={L}
                print={resultsTablePrint}
                abnormalTones={abnormalTones}
                showHijriDates={print.showHijriDates}
              />
            ))}
          </div>
        </section>

     

        {/* توقيعات وتذييل */}
        {print.includeFooter ? (
        <footer className="mt-10 break-inside-avoid border-t-2 border-dashed border-primary/20 pt-8 print:mt-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:items-end sm:gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 h-16 w-36 max-w-full border-b-2 border-dashed border-primary/35 sm:h-20 sm:w-40" />
              <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
                {L.technicianSignature}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-28 items-center justify-center rounded-full border-[3px] border-dashed border-primary/25 bg-primary/[0.03] sm:size-32 print:size-28">
                <p className="px-2 text-center text-[11px] font-semibold leading-tight text-muted-foreground">
                  {L.laboratoryStamp}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 h-16 w-36 max-w-full border-b-2 border-dashed border-primary/35 sm:h-20 sm:w-40" />
              <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
                {L.directorSignature}
              </p>
            </div>
          </div>

          {print.showExtraFooterLines &&
          (print.footerExtraLine1.trim() || print.footerExtraLine2.trim()) ? (
            <div className="mt-6 space-y-1.5 text-center text-sm leading-relaxed text-muted-foreground">
              {print.footerExtraLine1.trim() ? (
                <p className="whitespace-pre-wrap">{print.footerExtraLine1.trim()}</p>
              ) : null}
              {print.footerExtraLine2.trim() ? (
                <p className="whitespace-pre-wrap">{print.footerExtraLine2.trim()}</p>
              ) : null}
            </div>
          ) : null}

          {print.showPrintFooterMetadata ? (
            <p
              className="mt-6 text-center font-mono text-[10px] text-muted-foreground print:text-[9px]"
              dir="ltr"
            >
              {data.orderId}
              {" · "}
              {formatReportDatePerhapsHijri(
                data.issueDate || data.date,
                lang,
                print.showHijriDates
              )}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-center border-t border-primary/10 pt-5 text-center">
            {verifyWedgeBarcode && (
              <div className="mb-3 flex flex-col items-center gap-1">
                <div className="rounded-md border border-primary/20 bg-white p-1 shadow-sm print:border-primary/30">
                  <QRCode
                    key={verifyWedgeBarcode}
                    value={verifyWedgeBarcode}
                    size={64}
                    level="M"
                    className="size-[64px] print:size-[16mm]"
                    aria-label={L.reportQrCaptionVerify || "تحقق من صحة التقرير"}
                    title={verifyWedgeBarcode}
                  />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground print:text-[8px]">
                  {L.reportQrCaptionVerify || "تحقق من صحة التقرير"}
                </span>
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {L.footerDisclaimer}
            </p>
            {data.orderId?.trim() ? (
              <p
                className="mt-1.5 text-center text-[9px] leading-snug text-muted-foreground print:text-[8px]"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <span className="text-muted-foreground/90">
                  {lang === "en" ? "Order / report no." : "رقم الطلب / التقرير"}:{" "}
                </span>
                <span className="font-mono font-semibold" dir="ltr">
                  {data.orderId.trim()}
                </span>
              </p>
            ) : null}
          </div>
        </footer>
        ) : null}
      </div>
    </div>
  )
}

export type { ReportLanguage } from "@/lib/report-i18n"
export type { AbnormalRowPreset } from "@/lib/report-abnormal-highlight"
