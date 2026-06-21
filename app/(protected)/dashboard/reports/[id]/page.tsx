"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, Printer, Download, Loader2, SlidersHorizontal } from "lucide-react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportPrintCustomizeDialog } from "@/components/reports/report-print-customize-dialog"
import { ReportTemplate, type ReportPrintOptions } from "@/components/reports/report-template"
import { AttachmentsViewer } from "@/components/attachments/attachments-viewer"
import { useLabOrder, usePreviousPatientLabOrder } from "@/features/orders"
import { cn } from "@/lib/utils"
import { labOrderToReportData } from "@/lib/lab-order-to-report-data"
import {
  defaultReportPrintOptions,
  readReportPrintPreferences,
  writeReportPrintPreferences,
} from "@/lib/report-print-preferences"
import {
  PREFS_CHANGED_EVENT,
  readLabProfile,
  type LabProfile,
  defaultLabProfile,
} from "@/lib/dashboard-prefs"
import { savePdfBlobWithBrowserPicker } from "@/lib/save-pdf-blob"
import { getAppOrigin } from "@/lib/app-origin"
import { encodeReportPrintPrefsForUrl } from "@/lib/report-print-prefs-codec"

export default function ReportPreviewPage() {
  const params = useParams()
  const reportId = String(params.id ?? "")
  const orderIdNum = Number.parseInt(reportId, 10)
  const validOrderId = Number.isFinite(orderIdNum) && orderIdNum > 0

  const { order, isLoading: orderLoading, error: orderError } = useLabOrder({
    id: validOrderId ? orderIdNum : null,
    enabled: validOrderId,
  })

  const { previousOrder } = usePreviousPatientLabOrder({
    currentOrder: order,
    enabled: Boolean(order),
  })

  const [labProfile, setLabProfile] = React.useState<LabProfile>(defaultLabProfile)
  const [printOptions, setPrintOptions] = React.useState<ReportPrintOptions>(() =>
    typeof window !== "undefined" ? readReportPrintPreferences() : defaultReportPrintOptions
  )
  const [customizeOpen, setCustomizeOpen] = React.useState(false)
  const [verificationOrigin, setVerificationOrigin] = React.useState<string | undefined>(
    undefined
  )

  React.useEffect(() => {
    setLabProfile(readLabProfile())
    const onPrefs = () => setLabProfile(readLabProfile())
    window.addEventListener(PREFS_CHANGED_EVENT, onPrefs)
    return () => window.removeEventListener(PREFS_CHANGED_EVENT, onPrefs)
  }, [])

  React.useEffect(() => {
    setVerificationOrigin(getAppOrigin() || window.location.origin)
  }, [])

  const reportData = React.useMemo(() => {
    if (!order) return null
    return labOrderToReportData(order, labProfile, previousOrder ?? null)
  }, [order, labProfile, previousOrder])

  const handleSavePrintPrefs = React.useCallback((next: ReportPrintOptions) => {
    writeReportPrintPreferences(next)
    setPrintOptions(next)
    toast.success("تم حفظ تخصيص الطباعة")
  }, [])
  const reportRef = React.useRef<HTMLDivElement>(null)
  const pdfBlobForSaveRef = React.useRef<Blob | null>(null)
  const pdfFilenameRef = React.useRef("")
  const [pdfLoading, setPdfLoading] = React.useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = React.useState<string | null>(null)

  const closePdfPreview = React.useCallback(() => {
    setPdfPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    pdfBlobForSaveRef.current = null
  }, [])

  const allAttachments =
    reportData?.testGroups
      .flatMap((group) => group.tests)
      .filter((test) => test.attachments && test.attachments.length > 0)
      .flatMap((test) =>
        test.attachments!.map((att) => ({
          ...att,
          testName: test.name,
          testCode: test.code,
        }))
      ) ?? []

  /** معاينة طباعة المتصفح — نفس الصفحة؛ يُخفى الـ dashboard عبر @media print في globals.css */
  const printReport = React.useCallback(() => {
    if (!reportData) return
    window.print()
  }, [reportData])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isPrintShortcut =
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "p"
      if (!isPrintShortcut) return
      if (!reportData) return
      e.preventDefault()
      printReport()
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [printReport, reportData])

  /** من جدول التقارير: روابط `?print=1` تفتح معاينة الطباعة تلقائياً بعد التحميل */
  React.useEffect(() => {
    if (!reportData) return
    const sp = new URLSearchParams(window.location.search)
    if (sp.get("print") !== "1") return
    const t = window.setTimeout(() => {
      window.print()
      sp.delete("print")
      const qs = sp.toString()
      const path = window.location.pathname
      const next = `${path}${qs ? `?${qs}` : ""}${window.location.hash}`
      window.history.replaceState(null, "", next)
    }, 350)
    return () => window.clearTimeout(t)
  }, [reportData])

  /**
   * لا نستخدم `<a download>` — IDM يعترضه. نعتمد «حفظ باسم» (النظام) أو معاينة + زر حفظ.
   */
  const handleSavePdfFromPreview = React.useCallback(async () => {
    const blob = pdfBlobForSaveRef.current
    const name = pdfFilenameRef.current || `report-${reportId}.pdf`
    if (!blob) return
    const r = await savePdfBlobWithBrowserPicker(blob, name)
    if (r === "saved") {
      toast.success("تم حفظ ملف PDF")
      closePdfPreview()
    }
  }, [closePdfPreview, reportId])

  const handleDownloadPdf = React.useCallback(async () => {
    if (!reportId) {
      toast.error("معرّف التقرير غير صالح")
      return
    }
    /** استجابة JSON + base64 — لا تُعرَّف كتنزيل ملف فيعترضها IDM كطلب /api/.../pdf */
    const apiUrl = new URL(
      `/api/reports/${encodeURIComponent(reportId)}/pdf`,
      window.location.origin
    )
    apiUrl.searchParams.set("format", "json")
    if (printOptions.syncPreferencesToPdfUrl) {
      const enc = encodeReportPrintPrefsForUrl(printOptions)
      if (enc) apiUrl.searchParams.set("prefs", enc)
    }

    const defaultFilename = `report-${reportId}.pdf`

    setPdfLoading(true)
    try {
      const res = await fetch(apiUrl.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
      const rawText = await res.text()
      let data: {
        filename?: string
        pdfBase64?: string
        error?: string
        message?: string
      }
      try {
        data = JSON.parse(rawText) as typeof data
      } catch {
        throw new Error(
          /IDM|Intercepted/i.test(rawText)
            ? "عطّل «Advanced Integration» في IDM لهذا الموقع ثم أعد المحاولة"
            : "استجابة غير متوقعة من الخادم"
        )
      }

      if (!res.ok || !data.pdfBase64) {
        const detail = data.message ?? data.error ?? res.statusText
        throw new Error(detail || "فشل طلب التقرير")
      }

      const filename = data.filename ?? defaultFilename

      let buf: Uint8Array
      try {
        const bin = atob(data.pdfBase64)
        buf = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
      } catch {
        throw new Error("تعذر فك ترميز PDF")
      }

      const looksPdf =
        buf.length >= 5 &&
        buf[0] === 0x25 &&
        buf[1] === 0x50 &&
        buf[2] === 0x44 &&
        buf[3] === 0x46
      if (!looksPdf) {
        throw new Error("الخادم لم يُرجع بيانات PDF صالحة")
      }

      const blob = new Blob([buf], { type: "application/pdf" })

      const pickerResult = await savePdfBlobWithBrowserPicker(blob, filename)
      if (pickerResult === "saved") {
        toast.success("تم حفظ ملف PDF")
        return
      }
      if (pickerResult === "cancelled") {
        return
      }

      pdfBlobForSaveRef.current = blob
      pdfFilenameRef.current = filename
      setPdfPreviewUrl(URL.createObjectURL(blob))
      toast.info("اختر «حفظ في المجلد…» لتجاوز IDM، أو الحفظ من شريط عارض PDF")
    } catch (e) {
      console.error(e)
      toast.error("تعذر إنشاء ملف PDF", {
        description: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setPdfLoading(false)
    }
  }, [reportId, printOptions])

  const showOrderUnavailable =
    !validOrderId || Boolean(orderError) || (!orderLoading && !order)

  return (
    <div className="space-y-6 print:space-y-0" dir="rtl">
      <ReportPrintCustomizeDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        value={printOptions}
        onSave={handleSavePrintPrefs}
      />

      {/* رأس الصفحة — لا يُطبع */}
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">معاينة التقرير</h1>
            <p className="text-muted-foreground">
              طلب رقم:{" "}
              <span className="font-mono" dir="ltr">
                {reportData?.orderId ?? (validOrderId ? "…" : "—")}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {printOptions.showPrintShortcutHint ? (
            <p className="w-full text-start text-[11px] text-muted-foreground print:hidden sm:text-end">
              <kbd className="rounded border bg-muted px-1 font-mono">Ctrl</kbd>+
              <kbd className="rounded border bg-muted px-1 font-mono">P</kbd> أو زر الطباعة: معاينة
              الطباعة لهذا التقرير فقط
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={printReport}
            disabled={!reportData}
          >
            <Printer className="size-4" />
            طباعة
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={() => setCustomizeOpen(true)}
            disabled={!reportData}
          >
            <SlidersHorizontal className="size-4" />
            تخصيص الطباعة
          </Button>
          <Button
            type="button"
            className="gap-2 rounded-xl"
            disabled={pdfLoading || !validOrderId}
            onClick={handleDownloadPdf}
          >
            {pdfLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {pdfLoading ? "جاري التحميل…" : "حفظ PDF"}
          </Button>
        </div>
        </div>
      </div>

      <Dialog
        open={pdfPreviewUrl !== null}
        onOpenChange={(open) => {
          if (!open) closePdfPreview()
        }}
      >
        <DialogContent
          showCloseButton
          className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col gap-4 overflow-hidden sm:max-w-4xl"
        >
          <DialogHeader className="text-start">
            <DialogTitle>حفظ التقرير بدون Internet Download Manager</DialogTitle>
            <DialogDescription>
              استخدم الزر «حفظ في المجلد…» لفتح نافذة الحفظ الخاصة بالمتصفح (لا يمرّ
              التنزيل عبر شريط IDM). يمكنك أيضاً الحفظ من أيقونة التنزيل في عارض PDF
              أدناه.
            </DialogDescription>
          </DialogHeader>
          {pdfPreviewUrl ? (
            <iframe
              title="معاينة PDF"
              src={pdfPreviewUrl}
              className="min-h-[min(70vh,640px)] w-full flex-1 rounded-lg border bg-muted/30"
            />
          ) : null}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={closePdfPreview}
            >
              إغلاق
            </Button>
            <Button type="button" onClick={handleSavePdfFromPreview}>
              حفظ في المجلد…
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {orderLoading ? (
        <Card className="print:hidden">
          <CardContent className="flex min-h-[320px] items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-10 animate-spin" />
              <p>جاري تحميل بيانات التقرير…</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showOrderUnavailable ? (
        <Card className="border-destructive/30 print:hidden">
          <CardContent className="p-8 text-center">
            <p className="font-semibold text-destructive">
              {!validOrderId
                ? "معرّف الطلب غير صالح"
                : orderError
                  ? "تعذر تحميل بيانات الطلب"
                  : "لم يُعثر على الطلب"}
            </p>
            {orderError ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {orderError.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Tabs
      dir="rtl"
        defaultValue="report"
        className={cn("w-full print:block", (orderLoading || showOrderUnavailable) && "hidden")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 print:hidden">
          <TabsTrigger value="report">التقرير الطبي</TabsTrigger>
          <TabsTrigger value="attachments">
            المرفقات ({allAttachments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-6 print:mt-0">
          <Card
            className={cn(
              "overflow-hidden border-border/60 print:border-0 print:shadow-none"
            )}
          >
            <CardContent className="p-0">
              {/*
                منطقة الطباعة/PDF فقط — يُخفى الإطاء حولها في الطباعة عبر الأنماط أعلاه
              */}
              <div
                ref={reportRef}
                id="report-print-surface"
                className="mx-auto max-w-[210mm] bg-white print:max-w-none print:shadow-none"
              >
                {reportData ? (
                  <ReportTemplate
                    data={reportData}
                    verificationBaseUrl={verificationOrigin}
                    printOptions={printOptions}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="mt-6 print:hidden">
          <Card>
            <CardContent className="p-6">
              {allAttachments.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">المرفقات المرتبطة بالتقرير</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      جميع الملفات والصور المرفقة مع التحاليل
                    </p>
                  </div>

                  {reportData?.testGroups.map((group) => (
                    <div key={group.category} className="space-y-3">
                      {group.tests
                        .filter((test) => test.attachments && test.attachments.length > 0)
                        .map((test) => (
                          <AttachmentsViewer
                            key={test.code}
                            attachments={test.attachments!}
                            testName={`${test.name} (${test.code})`}
                            defaultOpen={false}
                          />
                        ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6">
                    <Download className="size-12 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">لا توجد مرفقات</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    لم يتم رفع أي ملفات مع هذا التقرير
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
