"use client"

import * as React from "react"
import { FileText, FlaskConical, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getReportLabels, type ReportLanguage } from "@/lib/report-i18n"
import {
  REPORT_THEME_PRESETS,
  getReportThemeColors,
  normalizeReportThemeId,
  reportUsesCustomVisualTheme,
  resolveReportThemeCssProperties,
  type ReportBuiltinThemeId,
} from "@/lib/report-themes"

export type ReportThemeLivePreviewProps = {
  reportThemeId: ReportBuiltinThemeId | string
  reportThemePrimaryHex: string
  reportThemeAccentHex: string
  reportLanguage?: ReportLanguage
  className?: string
}

/** معاينة مصغّرة لترويسة التقرير وبطاقات البيانات — نفس متغيرات CSS المستخدمة في القالب */
export function ReportThemeLivePreview({
  reportThemeId: rawThemeId,
  reportThemePrimaryHex,
  reportThemeAccentHex,
  reportLanguage = "ar",
  className,
}: ReportThemeLivePreviewProps) {
  const reportThemeId = normalizeReportThemeId(rawThemeId)
  const lang = reportLanguage === "en" ? "en" : "ar"
  const L = getReportLabels(lang)
  const themed = reportUsesCustomVisualTheme(reportThemeId)
  const colors = getReportThemeColors({
    reportThemeId,
    reportThemePrimaryHex,
    reportThemeAccentHex,
  })
  const themeCss = resolveReportThemeCssProperties({
    reportThemeId,
    reportThemePrimaryHex,
    reportThemeAccentHex,
  })
  const presetMeta = REPORT_THEME_PRESETS.find((p) => p.id === reportThemeId)

  const sampleLab =
    lang === "en" ? "Medical Laboratory — Preview" : "مخبر السريان للتحاليل الطبية"
  const sampleSubtitle =
    lang === "en" ? "Clinical diagnostics" : "AL-SIRIAN LAB · معاينة الثيم"
  const samplePatient = lang === "en" ? "Sample Patient" : "مريض تجريبي"
  const sampleOrderId = "ORD-2026-0042"

  return (
    <div className={cn("space-y-2", className)} aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-primary">معاينة حيّة للتقرير</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-foreground">
            {presetMeta?.labelAr ?? reportThemeId}
          </span>
          {colors ? (
            <>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px]"
                dir="ltr"
                title="أساسي"
              >
                <span
                  className="size-3 rounded-sm border border-border/50"
                  style={{ backgroundColor: colors.primary }}
                  aria-hidden
                />
                {colors.primary}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px]"
                dir="ltr"
                title="ثانٍ"
              >
                <span
                  className="size-3 rounded-sm border border-border/50"
                  style={{ backgroundColor: colors.accent }}
                  aria-hidden
                />
                {colors.accent}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              {lang === "en" ? "App default colors" : "ألوان التطبيق الافتراضية"}
            </span>
          )}
        </div>
      </div>

      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang === "ar" ? "ar" : "en"}
        style={themeCss}
        className="relative isolate overflow-hidden rounded-xl border-2 border-primary/15 bg-white text-foreground shadow-sm"
      >
        <div
          className={cn(
            "h-1 w-full",
            lang === "ar" ? "bg-gradient-to-l" : "bg-gradient-to-r",
            themed
              ? "from-[var(--primary)] via-[color-mix(in_srgb,var(--primary)_55%,var(--report-accent)_45%)] to-[var(--report-accent)]"
              : "from-primary via-primary/80 to-primary/40"
          )}
          aria-hidden
        />

        <div className="relative px-3 py-2.5">
          <header className="mb-2 border-b border-primary/12 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-primary-foreground shadow-sm",
                  themed
                    ? "from-[var(--primary)] to-[var(--report-accent)]"
                    : "from-primary to-primary/85"
                )}
              >
                <FlaskConical className="size-3.5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate text-[11px] font-bold leading-tight text-primary">
                  {sampleLab}
                </p>
                <p className="truncate text-[8px] text-muted-foreground">{sampleSubtitle}</p>
              </div>
            </div>
          </header>

          <div className="mb-2 flex flex-wrap gap-2">
            <div className="flex min-w-[46%] flex-1 items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 text-start">
                <span className="text-[8px] font-bold text-primary">{L.patientInfo}</span>
                <p className="truncate text-[10px] font-bold text-foreground">{samplePatient}</p>
                <p className="text-[8px] text-muted-foreground" dir="ltr">
                  PAT-1001 · 35 {L.years}
                </p>
              </div>
            </div>

            <div className="flex min-w-[40%] flex-1 items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 text-start">
                <span className="text-[8px] font-bold text-primary">{L.reportNumber}</span>
                <p className="truncate text-[10px] font-bold tabular-nums" dir="ltr">
                  {sampleOrderId}
                </p>
                <p className="text-[8px] text-muted-foreground">2026-05-20</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "mb-2 h-px w-full",
              lang === "ar"
                ? "bg-gradient-to-l from-transparent via-primary/15 to-transparent"
                : "bg-gradient-to-r from-transparent via-primary/15 to-transparent"
            )}
            aria-hidden
          />

          <div className="flex items-center gap-1.5 border-b border-primary/15 pb-1.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/12 text-[10px] font-bold text-primary">
              1
            </span>
            <h3 className="text-[11px] font-bold text-primary">{L.resultsTitle}</h3>
          </div>

          <div className="mt-1.5 overflow-hidden rounded-lg border border-primary/12">
            <div className="grid grid-cols-3 gap-px bg-primary/10 px-2 py-1 text-[8px] font-semibold text-primary">
              <span className="text-start">{L.test}</span>
              <span className="text-center">{L.result}</span>
              <span className="text-center">{L.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-px border-t border-primary/10 bg-white px-2 py-1.5 text-[8px]">
              <span className="text-start text-foreground">
                {lang === "en" ? "Glucose" : "سكر الدم"}
              </span>
              <span className="text-center font-mono font-bold text-foreground">95</span>
              <span className="text-center text-muted-foreground">—</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
        {lang === "en"
          ? "Updates as you pick a theme or adjust custom colors."
          : "تتحدّث فور اختيار ثيم أو تعديل اللونين — الشكل قريب من التقرير المطبوع."}
      </p>
    </div>
  )
}
