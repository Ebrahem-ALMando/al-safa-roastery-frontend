"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { getReportLabels } from "@/lib/report-i18n"
import { formatReportDatePerhapsHijri } from "@/lib/report-i18n"
import type { AbnormalVisualTone } from "@/lib/report-abnormal-highlight"
import type { ReportTestSectionGroup, TestGroup } from "@/components/reports/report-template"
import {
  REPORT_ARABIC_FONT_CLASS,
  ReportResultsTable,
  type ReportResultsTablePrintProps,
} from "@/components/reports/report-results-table"

type ReportTemplateTestGroupProps = {
  group: TestGroup
  showPrevCol: boolean
  lang: "ar" | "en"
  L: ReturnType<typeof getReportLabels>
  print: ReportResultsTablePrintProps
  abnormalTones: { high: AbnormalVisualTone; low: AbnormalVisualTone }
  showHijriDates: boolean
}

export function ReportTemplateTestGroup({
  group,
  showPrevCol,
  lang,
  L,
  print,
  abnormalTones,
  showHijriDates,
}: ReportTemplateTestGroupProps) {
  const isSectioned = Boolean(group.sectionGroups?.length)
  const arabicCls = REPORT_ARABIC_FONT_CLASS

  return (
    <div className="report-test-group">
      <div
        className={cn(
          "report-test-group-title mb-0 flex flex-wrap items-center justify-between gap-2 rounded-t-lg border border-b-0 border-primary/15 px-3 py-2 print:break-inside-avoid print:rounded-t-md print:py-1.5",
          isSectioned ? "bg-primary/8 print:bg-primary/5" : "bg-primary/10 print:bg-primary/8"
        )}
      >
        <h3
          className={cn(
            "text-start text-base font-bold text-primary print:text-[13px]",
            arabicCls
          )}
        >
          {group.category}
        </h3>
        {group.templateBadge ? (
          <Badge
            variant="outline"
            className={cn(
              "rounded-md border-primary/25 bg-background/80 px-2 py-0 text-[10px] font-medium text-primary/90 print:border-primary/30 print:text-[9px]",
              arabicCls
            )}
          >
            {group.templateBadge}
          </Badge>
        ) : null}
      </div>

      {isSectioned && group.sectionGroups ? (
        <div className="space-y-0 border border-primary/12 print:border-primary/20">
          {group.sectionGroups.map((section: ReportTestSectionGroup, index) => {
            if (section.tests.length === 0) return null

            const isLast = index === group.sectionGroups!.length - 1

            return (
              <div key={section.sectionKey} className="report-test-section">
                <div className="report-test-section-title border-t border-primary/10 bg-muted/25 px-3 py-1.5 print:break-after-avoid print:border-primary/15 print:bg-muted/15 print:py-1">
                  <h4
                    className={cn(
                      "text-start text-[13px] font-semibold text-foreground print:text-[11px]",
                      arabicCls
                    )}
                  >
                    {section.label}
                  </h4>
                </div>
                <ReportResultsTable
                  tests={section.tests}
                  showPrevCol={showPrevCol}
                  lang={lang}
                  L={L}
                  print={print}
                  abnormalTones={abnormalTones}
                  showHijriDates={showHijriDates}
                  formatReportDatePerhapsHijri={formatReportDatePerhapsHijri}
                  roundedBottom={isLast}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <ReportResultsTable
          tests={group.tests}
          showPrevCol={showPrevCol}
          lang={lang}
          L={L}
          print={print}
          abnormalTones={abnormalTones}
          showHijriDates={showHijriDates}
          formatReportDatePerhapsHijri={formatReportDatePerhapsHijri}
          roundedBottom
        />
      )}
    </div>
  )
}
