"use client"

import * as React from "react"
import { AlertTriangle, Barcode, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BARCODE_SCANNER_STATUS_EVENT,
  type BarcodeScannerStatus,
  type BarcodeScannerStatusDetail,
} from "@/lib/barcode-scanner-status"

const READY_MESSAGE = "قارئ الباركود جاهز"
const SUCCESS_RESET_MS = 2000
const INVALID_RESET_MS = 3000

const statusStyles: Record<BarcodeScannerStatus, string> = {
  ready: "border-border/70 bg-muted/40 text-muted-foreground",
  scanning: "border-primary/35 bg-primary/10 text-primary",
  success: "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  invalid: "border-destructive/35 bg-destructive/10 text-destructive",
}

function StatusIcon({ status }: { status: BarcodeScannerStatus }) {
  if (status === "scanning") {
    return <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
  }
  if (status === "success") {
    return <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
  }
  if (status === "invalid") {
    return <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
  }
  return <Barcode className="size-3.5 shrink-0" aria-hidden />
}

export function BarcodeScannerStatusIndicator() {
  const [status, setStatus] = React.useState<BarcodeScannerStatus>("ready")
  const [message, setMessage] = React.useState(READY_MESSAGE)
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimer = React.useCallback(() => {
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  const applyReady = React.useCallback(() => {
    clearResetTimer()
    setStatus("ready")
    setMessage(READY_MESSAGE)
  }, [clearResetTimer])

  React.useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<BarcodeScannerStatusDetail>).detail
      if (!detail?.status) return

      clearResetTimer()
      setStatus(detail.status)
      setMessage(detail.message)

      if (detail.status === "success") {
        resetTimerRef.current = setTimeout(applyReady, SUCCESS_RESET_MS)
      } else if (detail.status === "invalid") {
        resetTimerRef.current = setTimeout(applyReady, INVALID_RESET_MS)
      }
    }

    window.addEventListener(BARCODE_SCANNER_STATUS_EVENT, onStatus)

    return () => {
      window.removeEventListener(BARCODE_SCANNER_STATUS_EVENT, onStatus)
      clearResetTimer()
    }
  }, [applyReady, clearResetTimer])

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:inline-flex",
        statusStyles[status]
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <StatusIcon status={status} />
      <span className="max-w-[11rem] truncate">{message}</span>
    </div>
  )
}
