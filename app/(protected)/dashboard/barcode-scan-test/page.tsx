"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Eraser, ScanLine, Search } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { resolveBarcodeRoute } from "@/lib/resolve-barcode-route"
import { BarcodeScanHistoryCard } from "@/components/barcode/barcode-scan-history-card"
import { isScannerEnterKey, keyboardEventToUsChar } from "@/lib/scanner-keyboard-code"

type ScanStatus = "idle" | "invalid" | "redirecting"

const SCAN_BUFFER_TIMEOUT_MS = 500

export default function BarcodeScanTestPage() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scanBufferRef = React.useRef("")
  const scanActiveRef = React.useRef(false)
  const scanTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [scannedValue, setScannedValue] = React.useState("")
  const [lastRead, setLastRead] = React.useState<string | null>(null)
  const [reconstructedRead, setReconstructedRead] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<ScanStatus>("idle")
  const [redirectPreview, setRedirectPreview] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const focusInput = React.useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  React.useEffect(() => {
    focusInput()
  }, [focusInput])

  const clearScanBuffer = React.useCallback(() => {
    scanBufferRef.current = ""
    scanActiveRef.current = false
    if (scanTimeoutRef.current !== null) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }
  }, [])

  const scheduleScanBufferTimeout = React.useCallback(() => {
    if (scanTimeoutRef.current !== null) {
      clearTimeout(scanTimeoutRef.current)
    }
    scanTimeoutRef.current = setTimeout(() => {
      clearScanBuffer()
      setReconstructedRead(null)
    }, SCAN_BUFFER_TIMEOUT_MS)
  }, [clearScanBuffer])

  React.useEffect(() => {
    return () => {
      if (scanTimeoutRef.current !== null) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [])

  const resetStatus = React.useCallback(() => {
    setStatus("idle")
    setRedirectPreview(null)
    setErrorMessage(null)
    setReconstructedRead(null)
  }, [])

  const clearField = React.useCallback(() => {
    setScannedValue("")
    setLastRead(null)
    clearScanBuffer()
    resetStatus()
    focusInput()
  }, [clearScanBuffer, focusInput, resetStatus])

  const processBarcode = React.useCallback(
    (raw: string, fromScanner = false) => {
      const trimmed = raw.trim()
      if (trimmed === "") {
        setErrorMessage("لم يُدخل باركود.")
        setStatus("invalid")
        setRedirectPreview(null)
        focusInput()
        return
      }

      const normalized = trimmed.toUpperCase()
      setLastRead(normalized)
      if (fromScanner) {
        setReconstructedRead(normalized)
      }

      const result = resolveBarcodeRoute(trimmed, { requirePrefix: false })

      if (!result.isValid) {
        setStatus("invalid")
        setRedirectPreview(null)
        setErrorMessage(result.error ?? "صيغة الباركود غير مدعومة.")
        setScannedValue("")
        clearScanBuffer()
        focusInput()
        return
      }

      setStatus("redirecting")
      setRedirectPreview(result.route)
      setErrorMessage(null)
      clearScanBuffer()

      router.push(result.route)
    },
    [clearScanBuffer, focusInput, router]
  )

  const handleManualTest = React.useCallback(() => {
    processBarcode(scannedValue, false)
  }, [processBarcode, scannedValue])

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (scanActiveRef.current) return
      setScannedValue(e.target.value)
    },
    []
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const native = e.nativeEvent

      if (isScannerEnterKey(native)) {
        e.preventDefault()
        if (scanActiveRef.current) {
          const raw = scanBufferRef.current
          clearScanBuffer()
          setScannedValue("")
          processBarcode(raw, true)
        } else {
          processBarcode(scannedValue, false)
        }
        return
      }

      const char = keyboardEventToUsChar(native)
      if (char === null) return

      if (!scanActiveRef.current) {
        if (char !== "~") return

        scanActiveRef.current = true
        scanBufferRef.current = "~"
        setScannedValue("~")
        setReconstructedRead("~")
        e.preventDefault()
        scheduleScanBufferTimeout()
        return
      }

      e.preventDefault()
      scanBufferRef.current += char
      const display = scanBufferRef.current.toUpperCase()
      setScannedValue(display)
      setReconstructedRead(display)
      scheduleScanBufferTimeout()
    },
    [clearScanBuffer, processBarcode, scannedValue, scheduleScanBufferTimeout]
  )

  const handlePageClick = React.useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("button, a, input, textarea, select, label")) return
      focusInput()
    },
    [focusInput]
  )

  const statusBadgeLabel =
    status === "idle"
      ? "بانتظار"
      : status === "invalid"
        ? "غير صالح"
        : "جارٍ التوجيه"

  const displayRead = reconstructedRead ?? lastRead

  return (
    <div className="space-y-6" dir="rtl" lang="ar" onClick={handlePageClick}>
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <ScanLine className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">تجربة قراءة الباركود</h1>
              <p className="text-sm text-muted-foreground">
                اختبار قارئ الباركود — توجيه إلى ملف المريض أو صفحة نتائج الطلب.
              </p>
            </div>
          </div>
        </DashboardPageHeader.Lead>
      </DashboardPageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="space-y-1 text-right">
            <CardTitle className="text-lg">قارئ الباركود</CardTitle>
            <CardDescription>وجّه المؤشر هنا ثم امسح اللصاقة أو أدخل القيمة يدوياً.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode-scan-input" className="text-sm font-medium">
                حقل القراءة
              </Label>
              <Input
                ref={inputRef}
                id="barcode-scan-input"
                value={scannedValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="امسح باركود المريض هنا"
                className="h-14 rounded-xl text-center text-lg font-mono tracking-wide"
                dir="ltr"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-label="حقل قراءة باركود المريض"
              />
              <p className="text-xs text-muted-foreground">
                الصيغ المدعومة: <span className="font-mono" dir="ltr">~PAT-{"{id}"}</span> و{" "}
                <span className="font-mono" dir="ltr">~RES-{"{id}"}</span> و{" "}
                <span className="font-mono" dir="ltr">~VRF-{"{hex}"}</span> للتحقق من التقرير (أو بدون ~
                للـ PAT/RES اليدوي فقط).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={clearField}>
                <Eraser className="size-4" />
                مسح الحقل
              </Button>
              <Button type="button" className="gap-2 rounded-xl" onClick={handleManualTest}>
                <Search className="size-4" />
                تجربة يدوية
              </Button>
            </div>

            {status === "redirecting" ? (
              <Alert className="rounded-xl border-emerald-500/30 bg-emerald-500/5">
                <CheckCircle2 className="text-emerald-600" />
                <AlertTitle>تمت قراءة الباركود بنجاح</AlertTitle>
                <AlertDescription>جارٍ فتح ملف المريض…</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="space-y-1 text-right">
            <CardTitle className="text-lg">حالة القراءة</CardTitle>
            <CardDescription>معاينة آخر مسح قبل التوجيه.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">آخر قراءة</span>
                <span className="font-mono font-medium" dir="ltr">
                  {displayRead ?? "—"}
                </span>
              </div>
              {reconstructedRead ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted-foreground">قيمة مُعاد بناؤها (Code)</span>
                  <span className="font-mono text-xs font-medium text-primary" dir="ltr">
                    {reconstructedRead}
                  </span>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">الحالة</span>
                <Badge
                  variant={
                    status === "redirecting"
                      ? "default"
                      : status === "invalid"
                        ? "destructive"
                        : "secondary"
                  }
                  className="rounded-lg"
                >
                  {statusBadgeLabel}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <span className="shrink-0 text-muted-foreground">سيتم التوجيه إلى</span>
                <span
                  className={cn(
                    "break-all font-mono text-xs sm:text-sm",
                    redirectPreview ? "text-foreground" : "text-muted-foreground"
                  )}
                  dir="ltr"
                >
                  {redirectPreview ?? "—"}
                </span>
              </div>
            </div>

            {status === "invalid" && errorMessage ? (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle />
                <AlertTitle>قراءة غير صالحة</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {status === "idle" ? (
              <p className="text-sm text-muted-foreground">
                يعمل المسح مع لوحة المفاتيح العربية عبر رموز المفاتيح الفيزيائية (Code). للتجربة اليدوية
                أدخل <span className="font-mono" dir="ltr">~PAT-3</span> أو{" "}
                <span className="font-mono" dir="ltr">~RES-6</span> ثم Enter.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <BarcodeScanHistoryCard />
      </div>
    </div>
  )
}
