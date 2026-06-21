"use client"

import * as React from "react"
import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ReportTemplate, type ReportPrintOptions } from "@/components/reports/report-template"
import { getAppOrigin } from "@/lib/app-origin"
import { useLabOrder, usePreviousPatientLabOrder } from "@/features/orders"
import { defaultLabProfile } from "@/lib/dashboard-prefs"
import { labOrderToReportData } from "@/lib/lab-order-to-report-data"
import { decodeReportPrintPrefsFromBase64 } from "@/lib/report-print-prefs-codec"
import {
  defaultReportPrintOptions,
  normalizeReportPrintOptions,
  readReportPrintPreferences,
} from "@/lib/report-print-preferences"

function PrintReportContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const raw = String(params.id ?? "")
  const id = Number.parseInt(raw, 10)
  const valid = Number.isFinite(id) && id > 0

  const prefsFromUrl = React.useMemo(() => {
    const p = searchParams.get("prefs")
    return p ? decodeReportPrintPrefsFromBase64(p) : null
  }, [searchParams])

  const autoprintRequested = searchParams.get("autoprint") === "1"

  const { order, isLoading, error } = useLabOrder({
    id: valid ? id : null,
    enabled: valid,
  })

  const { previousOrder } = usePreviousPatientLabOrder({
    currentOrder: order,
    enabled: Boolean(order),
  })

  const [printPrefs, setPrintPrefs] = React.useState<ReportPrintOptions>(
    defaultReportPrintOptions
  )

  const [origin, setOrigin] = React.useState("")

  React.useEffect(() => {
    setOrigin(getAppOrigin() || (typeof window !== "undefined" ? window.location.origin : ""))
  }, [])

  React.useEffect(() => {
    if (prefsFromUrl) {
      setPrintPrefs(normalizeReportPrintOptions(prefsFromUrl))
    } else {
      setPrintPrefs(readReportPrintPreferences())
    }
  }, [prefsFromUrl])

  const data = React.useMemo(() => {
    if (!order) return null
    return labOrderToReportData(order, defaultLabProfile, previousOrder ?? null)
  }, [order, previousOrder])

  React.useEffect(() => {
    if (!autoprintRequested || !data) return
    let cancelled = false
    const t = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) window.print()
        })
      })
    }, 500)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [autoprintRequested, data])

  if (!valid) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-4 text-destructive">
        معرّف الطلب غير صالح
      </div>
    )
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-8 text-muted-foreground">
        <Loader2 className="size-10 animate-spin" />
        <p>جاري تحميل التقرير…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-4 text-destructive">
        تعذر تحميل بيانات التقرير
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white p-4 print:min-h-0 print:p-0"
    >
      <div id="report-print-surface" className="mx-auto max-w-[210mm] bg-white print:max-w-none">
        <ReportTemplate
          data={data}
          verificationBaseUrl={origin || undefined}
          printOptions={printPrefs}
        />
      </div>
    </div>
  )
}

export default function PrintReportPage() {
  return (
    <Suspense
      fallback={
        <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-8 text-muted-foreground">
          <Loader2 className="size-10 animate-spin" />
        </div>
      }
    >
      <PrintReportContent />
    </Suspense>
  )
}
