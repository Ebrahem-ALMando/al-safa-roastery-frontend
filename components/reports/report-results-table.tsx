"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { getReportLabels } from "@/lib/report-i18n"
import type { AbnormalVisualTone } from "@/lib/report-abnormal-highlight"
import type { TestResult } from "@/components/reports/report-template"

export const REPORT_ARABIC_FONT_CLASS =
  "font-[family-name:var(--font-tajawal)] tracking-normal leading-relaxed"

function isLikelyNumericReferenceDisplay(range: string): boolean {
  const t = range.trim()
  if (!t || t === "—") return false
  if (/[\u0600-\u06FF]/.test(t)) return false
  return /^[\d.<>=≤≥–\-]/.test(t) || /^\d/.test(t)
}

function isLikelyNumericResultValue(value: string, fieldType?: string): boolean {
  if (fieldType === "number") return true
  const t = value.trim()
  if (!t || t === "—") return false
  return /^-?\d+(\.\d+)?$/.test(t)
}

function toneForAbnormalTest(
  test: TestResult,
  tones: { high: AbnormalVisualTone; low: AbnormalVisualTone }
): AbnormalVisualTone | null {
  if (!test.isAbnormal) return null
  return test.abnormalType === "low" ? tones.low : tones.high
}

function renderStatusCell(
  test: TestResult,
  verbose: boolean,
  L: ReturnType<typeof getReportLabels>,
  bodyFontPx: number,
  tones: { high: AbnormalVisualTone; low: AbnormalVisualTone }
): React.ReactNode {
  const fz = `${Math.max(10, bodyFontPx)}px`
  const fzHL = `${Math.max(11, Math.round(bodyFontPx * 1.08))}px`
  const tH = tones.high
  const tL = tones.low
  const arabicCls = REPORT_ARABIC_FONT_CLASS

  if (!test.hasEvaluableReference) {
    return (
      <span className={cn("text-muted-foreground", arabicCls)} style={{ fontSize: fz }}>
        {L.unevaluated}
      </span>
    )
  }

  const flag = test.resultFlag

  if (!flag || flag === "normal") {
    if (verbose && flag === "normal") {
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-success/35 bg-success/10 font-semibold text-success print:border-success",
            arabicCls
          )}
          style={{ fontSize: fz }}
        >
          {L.normal}
        </Badge>
      )
    }
    return (
      <span className="text-muted-foreground" style={{ fontSize: fz }}>
        —
      </span>
    )
  }

  if (verbose) {
    if (flag === "high") {
      return (
        <Badge
          variant="outline"
          className={cn(tH.statusVerboseBadgeClassName, arabicCls)}
          style={{ fontSize: fz, ...tH.statusVerboseBadgeStyle }}
        >
          {L.high}
        </Badge>
      )
    }
    if (flag === "low") {
      return (
        <Badge
          variant="outline"
          className={cn(tL.statusVerboseBadgeClassName, arabicCls)}
          style={{ fontSize: fz, ...tL.statusVerboseBadgeStyle }}
        >
          {L.low}
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className={cn(tH.statusVerboseBadgeClassName, arabicCls)}
        style={{ fontSize: fz, ...tH.statusVerboseBadgeStyle }}
      >
        {L.abnormal}
      </Badge>
    )
  }

  if (flag === "high") {
    return (
      <span
        className={cn(tH.statusCompactClassName, arabicCls)}
        style={{ fontSize: fzHL, ...tH.statusCompactStyle }}
      >
        H
      </span>
    )
  }
  if (flag === "low") {
    return (
      <span
        className={cn(tL.statusCompactClassName, arabicCls)}
        style={{ fontSize: fzHL, ...tL.statusCompactStyle }}
      >
        L
      </span>
    )
  }
  if (flag === "abnormal") {
    return (
      <span
        className={cn(tH.statusCompactClassName, arabicCls)}
        style={{ fontSize: fzHL, ...tH.statusCompactStyle }}
      >
        !
      </span>
    )
  }

  return (
    <span className={cn("text-muted-foreground", arabicCls)} style={{ fontSize: fz }}>
      {L.unevaluated}
    </span>
  )
}

export type ReportResultsTablePrintProps = {
  verboseStatusColumn: boolean
  hideTestFieldCodes: boolean
  hideEmptyUnitColumn: boolean
  compactResultsSpacing: boolean
  useCustomResultsTableFonts: boolean
  resultsTableHeaderFontPx: number
  resultsTableBodyFontPx: number
}

type ReportResultsTableProps = {
  tests: TestResult[]
  showPrevCol: boolean
  lang: "ar" | "en"
  L: ReturnType<typeof getReportLabels>
  print: ReportResultsTablePrintProps
  abnormalTones: { high: AbnormalVisualTone; low: AbnormalVisualTone }
  showHijriDates: boolean
  formatReportDatePerhapsHijri: (
    iso: string,
    lang: "ar" | "en",
    showHijri: boolean
  ) => string
  roundedBottom?: boolean
}

export function ReportResultsTable({
  tests,
  showPrevCol,
  lang,
  L,
  print,
  abnormalTones,
  showHijriDates,
  formatReportDatePerhapsHijri,
  roundedBottom = true,
}: ReportResultsTableProps) {
  const showUnitCol =
    !print.hideEmptyUnitColumn || tests.some((t) => (t.unit ?? "").trim() !== "")

  const rtHeaderPx = print.useCustomResultsTableFonts
    ? print.resultsTableHeaderFontPx
    : 12
  const rtBodyPx = print.useCustomResultsTableFonts ? print.resultsTableBodyFontPx : 11
  const rtValuePx = Math.max(11, Math.round(rtBodyPx * 1.12))
  const rtCodePx = Math.max(9, rtBodyPx - 2)
  const rtMetaPx = Math.max(9, rtBodyPx - 3)
  const hideFieldCodes = print.hideTestFieldCodes
  const cellPad = print.compactResultsSpacing ? "px-2 py-1" : "px-2.5 py-1.5"
  const arabicCls = REPORT_ARABIC_FONT_CLASS

  if (tests.length === 0) return null

  return (
    <div
      className={cn(
        "overflow-hidden border border-primary/12 print:border-primary/25",
        roundedBottom ? "rounded-b-lg border-t-0" : "rounded-lg"
      )}
    >
      <table
        className={cn("w-full table-fixed border-collapse", arabicCls)}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <colgroup>
          {showPrevCol && showUnitCol ? (
            <>
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
            </>
          ) : showPrevCol ? (
            <>
              <col className="w-[26%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[28%]" />
              <col className="w-[16%]" />
            </>
          ) : showUnitCol ? (
            <>
              <col className="w-[32%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[26%]" />
              <col className="w-[16%]" />
            </>
          ) : (
            <>
              <col className="w-[38%]" />
              <col className="w-[18%]" />
              <col className="w-[32%]" />
              <col className="w-[12%]" />
            </>
          )}
        </colgroup>
        <thead className="print:table-header-group">
          <tr className="bg-muted/35 print:bg-muted/20">
            <th
              className={cn(cellPad, "text-start align-middle font-bold text-muted-foreground")}
              style={{ fontSize: `${rtHeaderPx}px` }}
            >
              {L.test}
            </th>
            <th
              className={cn(cellPad, "text-center align-middle font-bold text-muted-foreground")}
              style={{ fontSize: `${rtHeaderPx}px` }}
            >
              {L.result}
            </th>
            {showPrevCol ? (
              <th
                className={cn(cellPad, "text-center align-middle font-bold text-muted-foreground")}
                style={{ fontSize: `${rtHeaderPx}px` }}
              >
                {L.previousResult}
              </th>
            ) : null}
            {showUnitCol ? (
              <th
                className={cn(cellPad, "text-center align-middle font-bold text-muted-foreground")}
                style={{ fontSize: `${rtHeaderPx}px` }}
              >
                {L.unit}
              </th>
            ) : null}
            <th
              className={cn(cellPad, "text-center align-middle font-bold text-muted-foreground")}
              style={{ fontSize: `${rtHeaderPx}px` }}
            >
              {L.referenceRange}
            </th>
            <th
              className={cn(cellPad, "text-center align-middle font-bold text-muted-foreground")}
              style={{ fontSize: `${rtHeaderPx}px` }}
            >
              {L.status}
            </th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => {
            const abTone = toneForAbnormalTest(test, abnormalTones)
            const refNumeric = isLikelyNumericReferenceDisplay(test.referenceRange)
            const valueNumeric = isLikelyNumericResultValue(test.value, test.fieldType)

            return (
              <tr
                key={`${test.code}:${test.name}`}
                className={cn("border-t border-primary/8 print:border-primary/15", abTone?.trClassName)}
                style={abTone?.trStyle}
              >
                <td className={cn(cellPad, "text-start align-middle")}>
                  <p className="font-bold leading-snug" style={{ fontSize: `${rtBodyPx}px` }}>
                    {test.name}
                  </p>
                  {!hideFieldCodes ? (
                    <p
                      className="font-mono text-muted-foreground text-start"
                      style={{ fontSize: `${rtCodePx}px` }}
                    >
                      {test.code}
                    </p>
                  ) : null}
                </td>
                <td
                  className={cn(
                    cellPad,
                    "text-center align-middle",
                    test.isMultiline
                      ? cn(arabicCls, "font-semibold")
                      : valueNumeric
                        ? "font-mono font-bold tabular-nums"
                        : cn(arabicCls, "font-semibold"),
                    abTone?.valueClassName
                  )}
                  style={{
                    fontSize: `${rtValuePx}px`,
                    ...abTone?.valueStyle,
                  }}
                  dir={valueNumeric && !test.isMultiline ? "ltr" : undefined}
                >
                  {test.isMultiline ? (
                    <span className="inline-block max-w-full whitespace-pre-wrap text-start">
                      {test.value}
                    </span>
                  ) : (
                    test.value
                  )}
                </td>
                {showPrevCol ? (
                  <td className={cn(cellPad, "text-center align-middle")}>
                    {test.previousValue ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className="font-mono font-semibold leading-tight tabular-nums"
                          style={{ fontSize: `${rtBodyPx}px` }}
                        >
                          {test.previousValue}
                        </span>
                        {test.previousOrderedAt ? (
                          <span
                            className={cn("leading-tight text-muted-foreground", arabicCls)}
                            style={{ fontSize: `${rtMetaPx}px` }}
                          >
                            {formatReportDatePerhapsHijri(
                              test.previousOrderedAt,
                              lang,
                              showHijriDates
                            )}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground" style={{ fontSize: `${rtBodyPx}px` }}>
                        —
                      </span>
                    )}
                  </td>
                ) : null}
                {showUnitCol ? (
                  <td
                    className={cn(cellPad, "text-center align-middle text-muted-foreground")}
                    style={{ fontSize: `${rtBodyPx}px` }}
                    dir="ltr"
                  >
                    {test.unit || "—"}
                  </td>
                ) : null}
                <td className={cn(cellPad, "text-center align-middle leading-snug")}>
                  <span
                    className={cn(
                      refNumeric
                        ? "font-mono tabular-nums text-foreground"
                        : cn(arabicCls, "text-foreground/90")
                    )}
                    style={{ fontSize: `${rtBodyPx}px` }}
                    dir={refNumeric ? "ltr" : "rtl"}
                  >
                    {test.referenceRange}
                  </span>
                </td>
                <td className={cn(cellPad, "text-center align-middle")}>
                  {renderStatusCell(test, print.verboseStatusColumn, L, rtBodyPx, abnormalTones)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
