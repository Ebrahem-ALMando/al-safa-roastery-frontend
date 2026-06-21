"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Printer, ScanBarcode, UserRound } from "lucide-react"
import { PatientSelectionDialog } from "@/components/patients/patient-selection-dialog"
import { PatientBarcodeLabel } from "@/components/patients/patient-barcode-label"
import type { PatientBarcodeLabelPatient } from "@/components/patients/patient-barcode-label"
import { PatientBarcodeLabelPreview } from "@/components/patients/patient-barcode-label-preview"
import { PatientBarcodeTechnicalPrintPreview } from "@/components/patients/patient-barcode-technical-print-preview"
import { DashboardPageHeader } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { cn } from "@/lib/utils"
import {
  PatientBarcodeCalibrationPanel,
  usePatientBarcodePrintCalibration,
} from "@/components/barcode/patient-barcode-calibration-panel"
import {
  getBarcodeCalibrationCssVars,
  savePatientBarcodePrintCalibration,
  XPRINTER_TUBE_30X10_PRESET,
  type PatientBarcodePrintCalibration,
} from "@/lib/patient-barcode-print-calibration"
import {
  getCalibrationModeLabel,
  getPatientBarcodeTestPageSettings,
  savePatientBarcodeTestPageSettings,
  XPRINTER_TUBE_30X10_PAGE_SETTINGS,
} from "@/lib/patient-barcode-test-settings"
import {
  getBarcodePrintPageClassName,
  getBarcodePrintSurfaceConfig,
  type BarcodePrintCalibrationMode,
} from "@/lib/tube-barcode-label"
import type { PatientPickerRow } from "@/features/patients"

const PATIENT_BARCODE_PRINT_BODY_CLASS = "printing-patient-barcode"

function toLabelPatient(p: PatientPickerRow): PatientBarcodeLabelPatient {
  return {
    id: p.id,
    full_name: p.name,
    patient_number: p.patientNumber === "—" ? null : p.patientNumber,
  }
}

function CurrentSettingsSummary({
  calibrationMode,
  calibration,
  copies,
}: {
  calibrationMode: BarcodePrintCalibrationMode
  calibration: PatientBarcodePrintCalibration
  copies: 1 | 2
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed">
      <p className="mb-2 font-medium">الإعداد الحالي:</p>
      <ul className="space-y-1 text-muted-foreground">
        <li>الوضع: {getCalibrationModeLabel(calibrationMode)}</li>
        <li>النمط: {calibration.labelMode === "barcode-only" ? "باركود فقط" : "باركود + كود المريض"}</li>
        <li>العرض: {calibration.barcodeWidthMm} مم</li>
        <li>الارتفاع: {calibration.barcodeHeightMm} مم</li>
        <li>التمدد: {calibration.barcodeScaleXPercent}%</li>
        <li>النص: {calibration.showText && calibration.labelMode === "barcode-with-code" ? "ظاهر" : "مخفي"}</li>
        <li>عدد اللصاقات: {copies}</li>
      </ul>
    </div>
  )
}

export default function BarcodeTestPage() {
  const [selected, setSelected] = React.useState<PatientPickerRow | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [calibrationMode, setCalibrationMode] = React.useState<BarcodePrintCalibrationMode>(
    XPRINTER_TUBE_30X10_PAGE_SETTINGS.calibrationMode
  )
  const [copies, setCopies] = React.useState<1 | 2>(XPRINTER_TUBE_30X10_PAGE_SETTINGS.copies)
  const [printing, setPrinting] = React.useState(false)
  const [pageHydrated, setPageHydrated] = React.useState(false)

  const {
    calibration: printCalibration,
    setCalibration: setPrintCalibration,
    reset: resetPrintCalibration,
    hydrated: calibrationHydrated,
  } = usePatientBarcodePrintCalibration()

  React.useEffect(() => {
    const pageSettings = getPatientBarcodeTestPageSettings()
    setCalibrationMode(pageSettings.calibrationMode)
    setCopies(pageSettings.copies)
    setPageHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!pageHydrated) return
    savePatientBarcodeTestPageSettings({ calibrationMode, copies })
  }, [calibrationMode, copies, pageHydrated])

  const printSurface = getBarcodePrintSurfaceConfig(calibrationMode)
  const calibrationCssVars = getBarcodeCalibrationCssVars(printCalibration)
  const printPageClassName = getBarcodePrintPageClassName(calibrationMode)
  const needsRotatedHost = calibrationMode !== "direct-30x10"

  const applyXprinterPreset = React.useCallback(() => {
    setCalibrationMode(XPRINTER_TUBE_30X10_PAGE_SETTINGS.calibrationMode)
    setCopies(XPRINTER_TUBE_30X10_PAGE_SETTINGS.copies)
    setPrintCalibration({ ...XPRINTER_TUBE_30X10_PRESET })
  }, [setPrintCalibration])

  const handleSaveAsDefault = React.useCallback(() => {
    savePatientBarcodePrintCalibration(printCalibration)
    savePatientBarcodeTestPageSettings({ calibrationMode, copies })
    toast.success("تم حفظ إعدادات الطباعة الافتراضية")
  }, [printCalibration, calibrationMode, copies])

  React.useEffect(() => {
    const onBeforePrint = () => {
      document.body.classList.add(PATIENT_BARCODE_PRINT_BODY_CLASS)
      document.body.dataset.calibrationMode = calibrationMode
      document.body.dataset.barcodeCopies = String(copies)
      const { cssVars } = printSurface
      if (cssVars["--barcode-print-page-width"]) {
        document.body.style.setProperty(
          "--barcode-print-page-width",
          String(cssVars["--barcode-print-page-width"])
        )
      }
      if (cssVars["--barcode-print-page-height"]) {
        document.body.style.setProperty(
          "--barcode-print-page-height",
          String(cssVars["--barcode-print-page-height"])
        )
      }
    }
    const onAfterPrint = () => {
      document.body.classList.remove(PATIENT_BARCODE_PRINT_BODY_CLASS)
      delete document.body.dataset.calibrationMode
      delete document.body.dataset.barcodeCopies
      document.body.style.removeProperty("--barcode-print-page-width")
      document.body.style.removeProperty("--barcode-print-page-height")
      setPrinting(false)
    }

    window.addEventListener("beforeprint", onBeforePrint)
    window.addEventListener("afterprint", onAfterPrint)

    return () => {
      window.removeEventListener("beforeprint", onBeforePrint)
      window.removeEventListener("afterprint", onAfterPrint)
      document.body.classList.remove(PATIENT_BARCODE_PRINT_BODY_CLASS)
      delete document.body.dataset.calibrationMode
      delete document.body.dataset.barcodeCopies
      document.body.style.removeProperty("--barcode-print-page-width")
      document.body.style.removeProperty("--barcode-print-page-height")
    }
  }, [calibrationMode, copies, printSurface])

  const handlePrint = React.useCallback(() => {
    if (!selected) return
    setPrinting(true)
    window.requestAnimationFrame(() => {
      window.print()
    })
  }, [selected])

  const labelPatient = selected ? toLabelPatient(selected) : null
  const settingsReady = pageHydrated && calibrationHydrated
  const [portalReady, setPortalReady] = React.useState(false)

  React.useEffect(() => {
    setPortalReady(true)
  }, [])

  const printSurfaceNode =
    labelPatient && portalReady
      ? createPortal(
          <div
            id="patient-barcode-print-surface"
            className={cn("hidden print:block", `copies-${copies}`)}
            data-copies={copies}
            data-calibration-mode={calibrationMode}
          >
            {Array.from({ length: copies }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "patient-barcode-print-page",
                  printPageClassName,
                  needsRotatedHost && "patient-barcode-print-surface--rotated-host"
                )}
                style={{
                  width: printSurface.pageWidth,
                  height: printSurface.pageHeight,
                  ...printSurface.cssVars,
                  ...calibrationCssVars,
                }}
              >
                <PatientBarcodeLabel
                  patient={labelPatient}
                  orientation="horizontal"
                  calibrationMode={calibrationMode}
                  calibration={printCalibration}
                />
              </div>
            ))}
          </div>,
          document.body
        )
      : null

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <PatientSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} onSelect={setSelected} />

      {printSurfaceNode}

      <div className="print:hidden">
        <DashboardPageHeader>
          <DashboardPageHeader.Lead>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <ScanBarcode className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">تجربة طباعة باركود المريض</h1>
                <p className="text-sm text-muted-foreground">
                  لصاقة أنبوب 30×10 مم — معايرة الطباعة لطابعة Xprinter ومخزون 30*10.
                </p>
              </div>
            </div>
          </DashboardPageHeader.Lead>
        </DashboardPageHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="space-y-1 text-right">
              <CardTitle className="text-lg">إعدادات اللصاقة</CardTitle>
              <CardDescription>اختر المريض ووضع المعايرة ثم اطبع.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">المريض</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => setDialogOpen(true)}
                  >
                    <UserRound className="size-4" />
                    {selected ? "تغيير المريض" : "اختيار المريض"}
                  </Button>
                  {selected ? (
                    <span className="min-w-0 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{selected.name}</span>
                      {selected.patientNumber !== "—" ? (
                        <span className="ms-2 tabular-nums" dir="ltr">
                          ({selected.patientNumber})
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">لم يُختر مريض بعد.</span>
                  )}
                </div>
              </div>

              {settingsReady ? (
                <CurrentSettingsSummary
                  calibrationMode={calibrationMode}
                  calibration={printCalibration}
                  copies={copies}
                />
              ) : null}

              <div className="space-y-3">
                <Label className="text-sm font-medium">وضع معايرة الطباعة</Label>
                <RadioGroup
                  value={calibrationMode}
                  onValueChange={(v) => setCalibrationMode(v as BarcodePrintCalibrationMode)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="direct-30x10" id="cal-direct" className="shrink-0" />
                    <Label htmlFor="cal-direct" className="cursor-pointer font-normal">
                      مباشر 30×10 مم
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="page-10x30-rotate-content" id="cal-10x30" className="shrink-0" />
                    <Label htmlFor="cal-10x30" className="cursor-pointer font-normal">
                      صفحة 10×30 مم + تدوير المحتوى
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="page-30x10-rotate-content" id="cal-30x10r" className="shrink-0" />
                    <Label htmlFor="cal-30x10r" className="cursor-pointer font-normal">
                      صفحة 30×10 مم + تدوير المحتوى
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">عدد اللصاقات</Label>
                <RadioGroup
                  value={String(copies)}
                  onValueChange={(v) => setCopies(v === "2" ? 2 : 1)}
                  className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="1" id="copies-1" className="shrink-0" />
                    <Label htmlFor="copies-1" className="cursor-pointer font-normal">
                      1 لصاقة
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="2" id="copies-2" className="shrink-0" />
                    <Label htmlFor="copies-2" className="cursor-pointer font-normal">
                      2 لصاقات
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  className="gap-2 rounded-xl"
                  disabled={!selected || printing}
                  onClick={handlePrint}
                >
                  <Printer className="size-4" />
                  طباعة الباركود
                </Button>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  سيتم إرسال {copies} لصاقة للطباعة من داخل الصفحة. اترك Copies في نافذة الطباعة = 1.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Chrome: Paper size = 30*10، Margins = None، Scale = 100، Copies = 1، Layout =
                  Portrait. الوضع الموصى به: صفحة 30×10 مم + تدوير المحتوى.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="space-y-1 text-right">
              <CardTitle className="text-lg">معاينة النتيجة النهائية</CardTitle>
              <CardDescription>
                هذه المعاينة توضح شكل اللصاقة بعد المعايرة، وليست مقاس الطباعة الحقيقي على الشاشة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "rounded-md border border-dashed border-border bg-muted/30 p-6",
                  "flex min-h-[160px] items-center justify-center"
                )}
              >
                {labelPatient && settingsReady ? (
                  <PatientBarcodeLabelPreview patient={labelPatient} calibration={printCalibration} />
                ) : (
                  <div className="flex min-h-[120px] w-full max-w-sm items-center justify-center rounded-lg border border-dashed border-border/80 bg-card/50 p-6 text-center text-sm text-muted-foreground">
                    اختر مريضاً لعرض المعاينة.
                  </div>
                )}
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="technical-preview" className="border-none">
                  <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                    معاينة تقنية لاتجاه الطباعة
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      تستخدم فقط لتشخيص اتجاه الطابعة والدرايفر.
                    </p>
                    <div className="flex justify-center overflow-hidden rounded-md border border-dashed border-border/80 bg-muted/20 p-4">
                      {labelPatient && settingsReady ? (
                        <PatientBarcodeTechnicalPrintPreview
                          patient={labelPatient}
                          calibration={printCalibration}
                          calibrationMode={calibrationMode}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">اختر مريضاً أولاً.</span>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
            <CardHeader className="space-y-1 text-right">
              <CardTitle className="text-lg">إعدادات معايرة اللصاقة</CardTitle>
              <CardDescription>تُحفظ الإعدادات تلقائياً في المتصفح عند التعديل.</CardDescription>
            </CardHeader>
            <CardContent>
              {settingsReady ? (
                <PatientBarcodeCalibrationPanel
                  calibration={printCalibration}
                  onChange={setPrintCalibration}
                  onReset={resetPrintCalibration}
                  onApplyXprinterPreset={applyXprinterPreset}
                  onSaveAsDefault={handleSaveAsDefault}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
