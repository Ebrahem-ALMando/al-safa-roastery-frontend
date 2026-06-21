"use client"

import * as React from "react"
import {
  FileDown,
  FileUp,
  Info,
  Languages,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  SwatchBook,
  Table2,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { ReportPrintOptions } from "@/components/reports/report-template"
import { ReportThemeLivePreview } from "@/components/reports/report-theme-live-preview"
import { cn } from "@/lib/utils"
import {
  ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT,
  ABNORMAL_CUSTOM_LOW_HEX_DEFAULT,
  type AbnormalRowPreset,
  clampAbnormalCustomHex,
  clampAbnormalRowPreset,
  resolveAbnormalVisuals,
} from "@/lib/report-abnormal-highlight"
import {
  defaultReportPrintOptions,
  normalizeReportPrintOptions,
} from "@/lib/report-print-preferences"
import {
  RESULTS_TABLE_BODY_PX_DEFAULT,
  RESULTS_TABLE_HEADER_PX_DEFAULT,
  clampResultsTableBodyFontPx,
  clampResultsTableHeaderFontPx,
} from "@/lib/report-results-table-font"
import {
  REPORT_THEME_PRESETS,
  getReportThemeColors,
  normalizeReportThemeHex,
  normalizeReportThemeId,
  type ReportBuiltinThemeId,
} from "@/lib/report-themes"
import {
  addUserReportThemeTemplate,
  deleteUserReportThemeTemplate,
  readUserReportThemeTemplates,
  type UserReportThemeTemplate,
} from "@/lib/report-user-theme-templates"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: ReportPrintOptions
  onSave: (next: ReportPrintOptions) => void
}

const REPORT_THEME_JSON_SCHEMA = "lab-report-theme-template-v1" as const

type ThemeJsonFile = {
  schema: typeof REPORT_THEME_JSON_SCHEMA
  version: number
  name?: string
  reportThemePrimaryHex: string
  reportThemeAccentHex: string
}

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <h4 className="text-sm font-semibold leading-tight">{title}</h4>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  )
}

function SwitchRow({
  id,
  title,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string
  title: string
  hint?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-3 sm:p-4",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {title}
        </Label>
        {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  )
}

export function ReportPrintCustomizeDialog({ open, onOpenChange, value, onSave }: Props) {
  const [draft, setDraft] = React.useState<ReportPrintOptions>(value)
  const importRef = React.useRef<HTMLInputElement>(null)
  const themeImportRef = React.useRef<HTMLInputElement>(null)
  const [userThemeTemplates, setUserThemeTemplates] = React.useState<UserReportThemeTemplate[]>(
    []
  )
  const [userTemplateNameDraft, setUserTemplateNameDraft] = React.useState("")

  React.useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  React.useEffect(() => {
    if (open && typeof window !== "undefined") {
      setUserThemeTemplates(readUserReportThemeTemplates())
    }
  }, [open])

  const applyReportThemePreset = React.useCallback((id: ReportBuiltinThemeId) => {
    setDraft((s) => {
      if (id === "app_default") return { ...s, reportThemeId: "app_default" }
      if (id === "custom") return { ...s, reportThemeId: "custom" }

      const preset = REPORT_THEME_PRESETS.find((p) => p.id === id)
      if (!preset?.primary || !preset.accent)
        return { ...s, reportThemeId: id as ReportPrintOptions["reportThemeId"] }

      return {
        ...s,
        reportThemeId: id as ReportPrintOptions["reportThemeId"],
        reportThemePrimaryHex: normalizeReportThemeHex(preset.primary, s.reportThemePrimaryHex),
        reportThemeAccentHex: normalizeReportThemeHex(preset.accent, s.reportThemeAccentHex),
      }
    })
  }, [])

  const resolvedReportThemeColors = React.useMemo(
    () =>
      getReportThemeColors({
        reportThemeId: normalizeReportThemeId(draft.reportThemeId),
        reportThemePrimaryHex: draft.reportThemePrimaryHex,
        reportThemeAccentHex: draft.reportThemeAccentHex,
      }),
    [draft.reportThemeAccentHex, draft.reportThemeId, draft.reportThemePrimaryHex]
  )

  const exportThemeOnlyJson = () => {
    if (!resolvedReportThemeColors) {
      toast.error(
        "ثيم التطبيق الافتراضي لا يصدّر كملف ألوان. اختر ثيماً ملوّناً أو «مخصّص» ثم صدّر."
      )
      return
    }
    try {
      const payload: ThemeJsonFile = {
        schema: REPORT_THEME_JSON_SCHEMA,
        version: 1,
        name: userTemplateNameDraft.trim() || `theme-${draft.reportThemeId}`,
        reportThemePrimaryHex: resolvedReportThemeColors.primary,
        reportThemeAccentHex: resolvedReportThemeColors.accent,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "lab-report-theme-colors.json"
      a.click()
      URL.revokeObjectURL(url)
      toast.success("تم تصدير ألوان الثيم")
    } catch {
      toast.error("تعذّر التصدير")
    }
  }

  const onImportThemeFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const o =
        parsed && typeof parsed === "object" ? (parsed as Partial<ThemeJsonFile>) : null
      if (
        o?.schema !== REPORT_THEME_JSON_SCHEMA ||
        typeof o.reportThemePrimaryHex !== "string" ||
        typeof o.reportThemeAccentHex !== "string"
      ) {
        toast.error("ملف ثيم غير صالح")
        return
      }
      setDraft((s) => ({
        ...s,
        reportThemeId: "custom",
        reportThemePrimaryHex: normalizeReportThemeHex(
          o.reportThemePrimaryHex,
          s.reportThemePrimaryHex
        ),
        reportThemeAccentHex: normalizeReportThemeHex(
          o.reportThemeAccentHex,
          s.reportThemeAccentHex
        ),
      }))
      toast.success("تم استيراد ألوان الثيم — راجع واحفظ")
    } catch {
      toast.error("تعذّر قراءة الملف")
    }
  }

  const saveUserThemeTemplate = () => {
    const name = userTemplateNameDraft.trim()
    if (!name) {
      toast.error("أدخل اسماً لحفظ القالب")
      return
    }
    if (!resolvedReportThemeColors) {
      toast.error("لا يمكن حفظ الثيم الافتراضي كقالب ألوان. اختر ألواناً أولاً.")
      return
    }
    try {
      addUserReportThemeTemplate({
        name,
        primaryHex: resolvedReportThemeColors.primary,
        accentHex: resolvedReportThemeColors.accent,
      })
      setUserThemeTemplates(readUserReportThemeTemplates())
      toast.success("تم حفظ القالب محلياً")
    } catch {
      toast.error("تعذّر الحفظ")
    }
  }

  const removeUserThemeTemplate = (id: string) => {
    deleteUserReportThemeTemplate(id)
    setUserThemeTemplates(readUserReportThemeTemplates())
    toast.info("تم حذف القالب")
  }

  const applyUserThemeTemplateEntry = (t: UserReportThemeTemplate) => {
    setDraft((s) => ({
      ...s,
      reportThemeId: "custom",
      reportThemePrimaryHex: normalizeReportThemeHex(t.primaryHex, s.reportThemePrimaryHex),
      reportThemeAccentHex: normalizeReportThemeHex(t.accentHex, s.reportThemeAccentHex),
    }))
    toast.success(`تم تطبيق «${t.name}»`)
  }

  const handleSave = () => {
    onSave(normalizeReportPrintOptions(draft))
    onOpenChange(false)
  }

  const abnormalPreviewTones = React.useMemo(
    () =>
      resolveAbnormalVisuals({
        preset: clampAbnormalRowPreset(draft.abnormalRowPreset),
        customHighHex: clampAbnormalCustomHex(
          draft.abnormalCustomHighHex,
          ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
        ),
        customLowHex: clampAbnormalCustomHex(
          draft.abnormalCustomLowHex,
          ABNORMAL_CUSTOM_LOW_HEX_DEFAULT
        ),
      }),
    [
      draft.abnormalRowPreset,
      draft.abnormalCustomHighHex,
      draft.abnormalCustomLowHex,
    ]
  )

  const previewHigh = abnormalPreviewTones.high
  const previewLow = abnormalPreviewTones.low
  const previewLang = draft.reportLanguage === "en" ? "en" : "ar"
  const previewLabels =
    previewLang === "en"
      ? {
          high: "High",
          low: "Low",
          colTest: "Example",
          colVal: "Result",
          colSt: "Status",
        }
      : {
          high: "مرتفع",
          low: "منخفض",
          colTest: "مثال",
          colVal: "النتيجة",
          colSt: "الحالة",
        }

  const exportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(normalizeReportPrintOptions(draft), null, 2)], {
        type: "application/json;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "lab-report-print-settings.json"
      a.click()
      URL.revokeObjectURL(url)
      toast.success("تم تصدير الإعدادات")
    } catch {
      toast.error("تعذر التصدير")
    }
  }

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as Partial<ReportPrintOptions>
      setDraft(normalizeReportPrintOptions(parsed))
      toast.success("تم استيراد الإعدادات — راجع التبويبات ثم احفظ")
    } catch {
      toast.error("ملف غير صالح")
    }
  }

  const resetDefaults = () => {
    setDraft({ ...defaultReportPrintOptions })
    toast.info("تمت الاستعادة للوضع الافتراضي — احفظ لتطبيق")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[94vh] w-[93vw] max-w-[760px] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-[50vw] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-300"
        dir="rtl"
      >
        <div className="shrink-0 border-b border-border/50 bg-card/90 px-5 py-4 sm:px-6">
          <DialogHeader className="space-y-2 text-start">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <SlidersHorizontal className="size-6" aria-hidden />
              </span>
              تخصيص الطباعة والتقرير
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              ضبط ما يظهر في المعاينة والطباعة وملف PDF. يُحفظ محلياً على هذا الجهاز.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs 
          dir="rtl"
        defaultValue="general" className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-border/50 px-5 py-2 sm:px-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-2xl border border-border/60 bg-card/80 p-1.5 sm:grid-cols-4">
              <TabsTrigger value="general" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                <Info className="size-4" />
                عام
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                <Table2 className="size-4" />
                الجدول
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                <Palette className="size-4" />
                الألوان
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                <Sparkles className="size-4" />
                متقدم
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <TabsContent
              value="general"
              className="mt-0 space-y-5 data-[state=inactive]:hidden"
            >
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <SectionTitle icon={Languages} title="لغة التقرير" hint="تسميات الواجهة فقط" />
                <RadioGroup
                  value={draft.reportLanguage}
                  onValueChange={(v) =>
                    setDraft((s) => ({ ...s, reportLanguage: v as "ar" | "en" }))
                  }
                  className="mt-3 flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="ar" id="lang-ar" />
                    <Label htmlFor="lang-ar" className="cursor-pointer font-normal">
                      العربية
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label htmlFor="lang-en" className="cursor-pointer font-normal">
                      English
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <SectionTitle
                  icon={SlidersHorizontal}
                  title="هوامش المحتوى (مم)"
                  hint="يُطبَّق مع تفعيل التخصيص"
                />
                <SwitchRow
                  id="custom-margins"
                  title="تخصيص هوامش المحتوى"
                  hint="استبدال الهوامش الافتراضية بالقيم أدناه."
                  checked={draft.useCustomPageMargins}
                  onCheckedChange={(v) => setDraft((s) => ({ ...s, useCustomPageMargins: v }))}
                />
                <div
                  className={cn(
                    "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4",
                    !draft.useCustomPageMargins && "pointer-events-none opacity-45"
                  )}
                >
                  {(
                    ["top", "right", "bottom", "left"] as const
                  ).map((side, i) => (
                    <div key={side} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {["أعلى", "يمين", "أسفل", "يسار"][i]} (مم)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={80}
                        step={0.5}
                        className="rounded-xl"
                        value={draft.pageMarginsMm[side]}
                        onChange={(e) => {
                          const n = Number.parseFloat(e.target.value)
                          setDraft((s) => ({
                            ...s,
                            pageMarginsMm: {
                              ...s.pageMarginsMm,
                              [side]: Number.isFinite(n)
                                ? Math.min(80, Math.max(0, n))
                                : s.pageMarginsMm[side],
                            },
                          }))
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <SwitchRow
                id="spacious"
                title="تخطيط موسّع لبطاقات رقم التقرير وتاريخ الطلب والمريض"
                hint="عند الإلغاء يُفعّل تخطيط مدمج."
                checked={draft.spaciousReportMetadata}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, spaciousReportMetadata: v }))}
              />

              <SwitchRow
                id="ordernotes"
                title="تضمين ملاحظات الطلب"
                checked={draft.includeNotes}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, includeNotes: v }))}
              />
              <SwitchRow
                id="staticnotes"
                title="تضمين الإرشادات الثابتة"
                checked={draft.includeStaticNotes}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, includeStaticNotes: v }))}
              />
              <SwitchRow
                id="hdr"
                title="تضمين الترويسة (شعار، مختبر، QR)"
                checked={draft.includeHeader}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, includeHeader: v }))}
              />
              <SwitchRow
                id="ftr"
                title="تضمين التذييل (توقيعات، إخلاء مسؤولية)"
                checked={draft.includeFooter}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, includeFooter: v }))}
              />
            </TabsContent>

            <TabsContent
              value="table"
              className="mt-0 space-y-5 data-[state=inactive]:hidden"
            >
              <SwitchRow
                id="verbos-status"
                title="عمود الحالة: نص كامل (طبيعي / مرتفع / منخفض)"
                hint="عند الإلغاء: — للطبيعي، H و L لغير الطبيعي."
                checked={draft.verboseStatusColumn}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, verboseStatusColumn: v }))}
              />

              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-rt-fonts" className="text-sm font-medium">
                      تخصيص حجم خط جدول النتائج
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      الافتراضي: ترويسة {RESULTS_TABLE_HEADER_PX_DEFAULT} بكسل، خلايا{" "}
                      {RESULTS_TABLE_BODY_PX_DEFAULT} بكسل.
                    </p>
                  </div>
                  <Switch
                    id="custom-rt-fonts"
                    checked={draft.useCustomResultsTableFonts}
                    onCheckedChange={(v) =>
                      setDraft((s) => ({ ...s, useCustomResultsTableFonts: v }))
                    }
                  />
                </div>
                <div
                  className={cn(
                    "mt-3 grid gap-4 sm:grid-cols-2",
                    !draft.useCustomResultsTableFonts && "pointer-events-none opacity-45"
                  )}
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs">ترويسة الجدول (بكسل)</Label>
                    <Input
                      type="number"
                      min={9}
                      max={15}
                      className="rounded-xl"
                      value={draft.resultsTableHeaderFontPx}
                      onChange={(e) => {
                        const n = Number.parseFloat(e.target.value)
                        setDraft((s) => ({
                          ...s,
                          resultsTableHeaderFontPx: clampResultsTableHeaderFontPx(
                            Number.isFinite(n) ? n : s.resultsTableHeaderFontPx
                          ),
                        }))
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">خلايا الجدول (بكسل)</Label>
                    <Input
                      type="number"
                      min={10}
                      max={17}
                      className="rounded-xl"
                      value={draft.resultsTableBodyFontPx}
                      onChange={(e) => {
                        const n = Number.parseFloat(e.target.value)
                        setDraft((s) => ({
                          ...s,
                          resultsTableBodyFontPx: clampResultsTableBodyFontPx(
                            Number.isFinite(n) ? n : s.resultsTableBodyFontPx
                          ),
                        }))
                      }}
                    />
                  </div>
                </div>
              </div>

              <SwitchRow
                id="hide-code"
                title="إخفاء كود الحقل تحت اسم التحليل"
                checked={draft.hideTestFieldCodes}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, hideTestFieldCodes: v }))}
              />
              <SwitchRow
                id="hide-unit"
                title="إخفاء عمود الوحدة إذا كانت كل الوحدات فارغة في المجموعة"
                checked={draft.hideEmptyUnitColumn}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, hideEmptyUnitColumn: v }))}
              />
              <SwitchRow
                id="compact-space"
                title="مسافات أضيق داخل خلايا جدول النتائج"
                checked={draft.compactResultsSpacing}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, compactResultsSpacing: v }))
                }
              />
            </TabsContent>

            <TabsContent
              value="colors"
              className="mt-0 space-y-5 data-[state=inactive]:hidden"
            >
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm">
                <SectionTitle
                  icon={SwatchBook}
                  title="ثيم ألوان التقرير (الترويسة والعناوين)"
                  hint="يُقيّد داخل ورقة الطباعة فقط؛ لا يغيّر ألوان بقية لوحة التحكم."
                />

                <div className="mt-4 rounded-2xl border-2 border-primary/12 bg-gradient-to-br from-background via-muted/20 to-muted/40 p-3 shadow-sm">
                  <ReportThemeLivePreview
                    reportThemeId={draft.reportThemeId}
                    reportThemePrimaryHex={draft.reportThemePrimaryHex}
                    reportThemeAccentHex={draft.reportThemeAccentHex}
                    reportLanguage={draft.reportLanguage}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {REPORT_THEME_PRESETS.filter((preset) => preset.id !== "custom").map((preset) => {
                    const active = draft.reportThemeId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        dir="rtl"
                        onClick={() => applyReportThemePreset(preset.id)}
                        className={cn(
                          "flex flex-col gap-2 rounded-2xl border p-3 text-start transition-colors",
                          active
                            ? "border-primary bg-primary/[0.06] ring-2 ring-primary/25"
                            : "border-border/70 bg-background/70 hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {preset.primary && preset.accent ? (
                            <div
                              className="h-9 w-14 shrink-0 rounded-xl border border-border/60 shadow-inner"
                              style={{
                                background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})`,
                              }}
                              aria-hidden
                            />
                          ) : (
                            <div
                              className="flex h-9 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-[10px] text-muted-foreground"
                              aria-hidden
                            >
                              تطبيق
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-snug">{preset.labelAr}</p>
                            <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
                              {preset.labelEn}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  dir="rtl"
                  onClick={() => applyReportThemePreset("custom")}
                  className={cn(
                    "mt-3 w-full rounded-2xl border p-3 text-start transition-colors",
                    draft.reportThemeId === "custom"
                      ? "border-primary bg-primary/[0.06] ring-2 ring-primary/25"
                      : "border-border/70 bg-background/70 hover:bg-muted/40"
                  )}
                >
                  <p className="text-sm font-semibold">
                    {REPORT_THEME_PRESETS.find((p) => p.id === "custom")?.labelAr}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    اختر لونين أدناه؛ يمكن حفظهما كقالب أو تصديرهما كملف JSON.
                  </p>
                </button>

                <div className="mt-4 space-y-4 rounded-xl border border-border/50 bg-muted/15 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    تخصيص لونَي الثيم (يُفعّل وضع «مخصّص» عند ضبطك للأدناه)
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">أساسي (عناوين، شعار)</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label="لون أساسي للتقرير"
                          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border"
                          value={draft.reportThemePrimaryHex}
                          onChange={(e) =>
                            setDraft((s) => ({
                              ...s,
                              reportThemeId: "custom",
                              reportThemePrimaryHex: normalizeReportThemeHex(
                                e.target.value,
                                s.reportThemePrimaryHex
                              ),
                            }))
                          }
                        />
                        <Input
                          dir="ltr"
                          className="rounded-xl font-mono text-sm"
                          value={draft.reportThemePrimaryHex}
                          onChange={(e) =>
                            setDraft((s) => ({
                              ...s,
                              reportThemeId: "custom",
                              reportThemePrimaryHex: normalizeReportThemeHex(
                                e.target.value,
                                s.reportThemePrimaryHex
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        ثانٍ (حدود، تمييز، تدرج مع الأساسي)
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label="لون ثانوي للتقرير"
                          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border"
                          value={draft.reportThemeAccentHex}
                          onChange={(e) =>
                            setDraft((s) => ({
                              ...s,
                              reportThemeId: "custom",
                              reportThemeAccentHex: normalizeReportThemeHex(
                                e.target.value,
                                s.reportThemeAccentHex
                              ),
                            }))
                          }
                        />
                        <Input
                          dir="ltr"
                          className="rounded-xl font-mono text-sm"
                          value={draft.reportThemeAccentHex}
                          onChange={(e) =>
                            setDraft((s) => ({
                              ...s,
                              reportThemeId: "custom",
                              reportThemeAccentHex: normalizeReportThemeHex(
                                e.target.value,
                                s.reportThemeAccentHex
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={exportThemeOnlyJson}
                  >
                    <FileDown className="size-4" />
                    تصدير ثيم (JSON)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => themeImportRef.current?.click()}
                  >
                    <FileUp className="size-4" />
                    استيراد ثيم
                  </Button>
                  <input
                    ref={themeImportRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={onImportThemeFile}
                  />
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-dashed border-border/60 bg-background/40 p-3">
                  <Label className="text-xs font-medium">حفظ كقالب على هذا الجهاز</Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      placeholder="اسم القالب (مثال: ألوان الفرع الجنوبي)"
                      value={userTemplateNameDraft}
                      onChange={(e) => setUserTemplateNameDraft(e.target.value)}
                      className="rounded-xl sm:min-w-0 sm:flex-1"
                    />
                    <Button
                      type="button"
                      className="shrink-0 rounded-xl"
                      onClick={saveUserThemeTemplate}
                    >
                      حفظ القالب
                    </Button>
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    يُحفظ اسم القالب واللونين فقط محلياً (حتى 40 قالب). تصدير إعداد الطباعة الكامل لا
                    يزال من تبويب «متقدم».
                  </p>
                  {userThemeTemplates.length ? (
                    <ul className="space-y-1.5 pt-1">
                      {userThemeTemplates.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/70 px-2 py-1.5"
                        >
                          <div
                            className="h-7 w-10 shrink-0 rounded-md border border-border/50"
                            style={{
                              background: `linear-gradient(135deg, ${entry.primaryHex}, ${entry.accentHex})`,
                            }}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 truncate text-xs font-medium">
                            {entry.name}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="shrink-0 rounded-lg text-xs"
                            onClick={() => applyUserThemeTemplateEntry(entry)}
                          >
                            تطبيق
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 shrink-0 text-destructive"
                            aria-label={`حذف ${entry.name}`}
                            onClick={() => removeUserThemeTemplate(entry.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">لا توجد قوالب محفوظة بعد.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abnormal-preset">مجموعة ألوان الصفوف غير الطبيعية</Label>
                <Select
                  value={draft.abnormalRowPreset}
                  onValueChange={(v) =>
                    setDraft((s) => ({
                      ...s,
                      abnormalRowPreset: v as AbnormalRowPreset,
                    }))
                  }
                >
                  <SelectTrigger id="abnormal-preset" className="w-full rounded-xl">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red_yellow">
                      أحمر (مرتفع) + كهرماني (منخفض) — افتراضي
                    </SelectItem>
                    <SelectItem value="red_only">أحمر لغير الطبيعي كله</SelectItem>
                    <SelectItem value="yellow_only">كهرماني لغير الطبيعي كله</SelectItem>
                    <SelectItem value="none">بدون تمييز لوني</SelectItem>
                    <SelectItem value="custom">مخصّص (لونان)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="rounded-xl border-2 border-primary/12 bg-gradient-to-br from-background via-muted/30 to-muted/50 p-3 shadow-sm"
                aria-live="polite"
              >
                <p className="mb-2 text-center text-xs font-semibold text-primary">
                  معاينة مباشرة للثيم
                </p>
                <div className="overflow-hidden rounded-lg border border-border bg-white">
                  <table
                    className="w-full border-collapse text-[11px] sm:text-xs"
                    dir={previewLang === "ar" ? "rtl" : "ltr"}
                  >
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground">
                        <th className="px-2 py-1.5 font-semibold">{previewLabels.colTest}</th>
                        <th className="px-2 py-1.5 text-center font-semibold">
                          {previewLabels.colVal}
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold">
                          {previewLabels.colSt}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={cn("border-t border-border/60", previewHigh.trClassName)}
                        style={previewHigh.trStyle}
                      >
                        <td className="px-2 py-2 font-medium">
                          {previewLang === "en" ? "High sample" : "مثال مرتفع"}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-mono font-bold",
                            previewHigh.valueClassName
                          )}
                          style={previewHigh.valueStyle}
                        >
                          22.00
                        </td>
                        <td className="px-2 py-2 text-center align-middle">
                          {draft.verboseStatusColumn ? (
                            <Badge
                              variant="outline"
                              className={previewHigh.statusVerboseBadgeClassName}
                              style={{
                                fontSize: "10px",
                                ...previewHigh.statusVerboseBadgeStyle,
                              }}
                            >
                              {previewLabels.high}
                            </Badge>
                          ) : (
                            <span
                              className={previewHigh.statusCompactClassName}
                              style={{
                                fontSize: "12px",
                                ...previewHigh.statusCompactStyle,
                              }}
                            >
                              H
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr
                        className={cn("border-t border-border/60", previewLow.trClassName)}
                        style={previewLow.trStyle}
                      >
                        <td className="px-2 py-2 font-medium">
                          {previewLang === "en" ? "Low sample" : "مثال منخفض"}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-mono font-bold",
                            previewLow.valueClassName
                          )}
                          style={previewLow.valueStyle}
                        >
                          0.50
                        </td>
                        <td className="px-2 py-2 text-center align-middle">
                          {draft.verboseStatusColumn ? (
                            <Badge
                              variant="outline"
                              className={previewLow.statusVerboseBadgeClassName}
                              style={{
                                fontSize: "10px",
                                ...previewLow.statusVerboseBadgeStyle,
                              }}
                            >
                              {previewLabels.low}
                            </Badge>
                          ) : (
                            <span
                              className={previewLow.statusCompactClassName}
                              style={{
                                fontSize: "12px",
                                ...previewLow.statusCompactStyle,
                              }}
                            >
                              L
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  تتحدّث مع لغة التقرير ونمط عمود الحالة (هذا الحوار).
                </p>
              </div>

              <div
                className={cn(
                  "space-y-3 rounded-2xl border border-border/60 bg-card/40 p-3",
                  draft.abnormalRowPreset !== "custom" && "pointer-events-none opacity-45"
                )}
              >
                <p className="text-xs font-semibold text-muted-foreground">ألوان المخصّص</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">لون المرتفع</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="لون المرتفع"
                        className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border"
                        value={draft.abnormalCustomHighHex}
                        onChange={(e) =>
                          setDraft((s) => ({
                            ...s,
                            abnormalCustomHighHex: clampAbnormalCustomHex(
                              e.target.value,
                              ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
                            ),
                          }))
                        }
                      />
                      <Input
                        dir="ltr"
                        className="rounded-xl font-mono text-sm"
                        value={draft.abnormalCustomHighHex}
                        onChange={(e) =>
                          setDraft((s) => ({
                            ...s,
                            abnormalCustomHighHex: clampAbnormalCustomHex(
                              e.target.value,
                              ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">لون المنخفض</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="لون المنخفض"
                        className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border"
                        value={draft.abnormalCustomLowHex}
                        onChange={(e) =>
                          setDraft((s) => ({
                            ...s,
                            abnormalCustomLowHex: clampAbnormalCustomHex(
                              e.target.value,
                              ABNORMAL_CUSTOM_LOW_HEX_DEFAULT
                            ),
                          }))
                        }
                      />
                      <Input
                        dir="ltr"
                        className="rounded-xl font-mono text-sm"
                        value={draft.abnormalCustomLowHex}
                        onChange={(e) =>
                          setDraft((s) => ({
                            ...s,
                            abnormalCustomLowHex: clampAbnormalCustomHex(
                              e.target.value,
                              ABNORMAL_CUSTOM_LOW_HEX_DEFAULT
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="advanced"
              className="mt-0 space-y-5 data-[state=inactive]:hidden"
            >
              <SwitchRow
                id="sync-pdf"
                title="مزامنة إعدادات المعاينة مع PDF من الخادم"
                hint="يُمرَّر التفضيل في عنوان الطباعة حتى يطابق Puppeteer نفس الشكل."
                checked={draft.syncPreferencesToPdfUrl}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, syncPreferencesToPdfUrl: v }))
                }
              />
              <SwitchRow
                id="gray"
                title="عرض رمادي (معاينة وطباعة)"
                checked={draft.printGrayscale}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, printGrayscale: v }))}
              />
              <SwitchRow
                id="hijri"
                title="إظهار التاريخ الهجري بجانب الميلادي"
                checked={draft.showHijriDates}
                onCheckedChange={(v) => setDraft((s) => ({ ...s, showHijriDates: v }))}
              />
              <SwitchRow
                id="abn-banner"
                title="شريط ملخص: عدد النتائج خارج المعدل"
                checked={draft.showAbnormalSummaryBanner}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, showAbnormalSummaryBanner: v }))
                }
              />
              <SwitchRow
                id="patient"
                title="تقرير مبسّط للمريض (إخفاء الأكواد + إرشادات مختصرة)"
                checked={draft.patientFriendlyReport}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, patientFriendlyReport: v }))
                }
              />

              <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                <Label className="text-sm font-medium">محاذاة كتلة الشعار والاسم في الترويسة</Label>
                <Select
                  value={draft.logoPlacement}
                  onValueChange={(v) =>
                      setDraft((s) => ({
                        ...s,
                        logoPlacement: v as ReportPrintOptions["logoPlacement"],
                      }))
                  }
                >
                  <SelectTrigger className="mt-2 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">افتراضي (بداية السطر)</SelectItem>
                    <SelectItem value="center">وسط</SelectItem>
                    <SelectItem value="end">نهاية السطر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <SwitchRow
                id="extra-foot"
                title="أسطر نصية إضافية فوق إخلاء المسؤولية"
                checked={draft.showExtraFooterLines}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, showExtraFooterLines: v }))
                }
              />
              <div
                className={cn(
                  "space-y-3 rounded-2xl border border-border/60 bg-card/40 p-3",
                  !draft.showExtraFooterLines && "pointer-events-none opacity-45"
                )}
              >
                <Input
                  placeholder="سطر 1 (اختياري)"
                  value={draft.footerExtraLine1}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, footerExtraLine1: e.target.value }))
                  }
                  className="rounded-xl"
                />
                <Input
                  placeholder="سطر 2 (اختياري)"
                  value={draft.footerExtraLine2}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, footerExtraLine2: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>

              <SwitchRow
                id="foot-meta"
                title="سطر تعريفي في التذييل (رقم التقرير وتاريخ الإصدار)"
                checked={draft.showPrintFooterMetadata}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, showPrintFooterMetadata: v }))
                }
              />

              <SwitchRow
                id="hint-shortcut"
                title="إظهار تلميح اختصار الطباعة (Ctrl+P) في صفحة المعاينة"
                hint="يذكّر باختصار معاينة الطباعة من هذه الصفحة. لا يظهر داخل ورقة الطباعة."
                checked={draft.showPrintShortcutHint}
                onCheckedChange={(v) =>
                  setDraft((s) => ({ ...s, showPrintShortcutHint: v }))
                }
              />

              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
                <SectionTitle
                  icon={FileDown}
                  title="نسخ احتياطي للإعدادات"
                  hint="JSON — لمشاركة الجهاز أو الأرشفة"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={exportJson}>
                    <FileDown className="size-4" />
                    تصدير JSON
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => importRef.current?.click()}
                  >
                    <FileUp className="size-4" />
                    استيراد
                  </Button>
                  <input
                    ref={importRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={onImportFile}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2 rounded-xl"
                    onClick={resetDefaults}
                  >
                    <RotateCcw className="size-4" />
                    استعادة الافتراضيات
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="shrink-0 gap-2 border-t border-border/50 bg-card/95 px-5 py-4 sm:justify-between">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" className="rounded-xl" onClick={handleSave}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
