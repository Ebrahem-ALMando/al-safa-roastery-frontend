"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/custom-toast-with-icons"
import {
  addBarcodeScanHistoryItem,
  normalizeBarcodeValueWithoutPrefix,
} from "@/lib/barcode-scan-history"
import { dispatchBarcodeScannerStatus } from "@/lib/barcode-scanner-status"
import { resolveBarcodeRoute } from "@/lib/resolve-barcode-route"
import { isScannerEnterKey, keyboardEventToUsChar } from "@/lib/scanner-keyboard-code"

const BUFFER_TIMEOUT_MS = 500
const REDIRECT_COOLDOWN_MS = 1000

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable=''], [contenteditable='plaintext-only']"
    )
  )
}

function scanSuccessMessage(type: "patient" | "results" | "verify"): string {
  if (type === "patient") return "تم فتح ملف المريض"
  if (type === "verify") return "تم فتح صفحة التحقق من التقرير"
  return "تم فتح صفحة النتائج"
}

function scanStatusMessage(type: "patient" | "results" | "verify"): string {
  if (type === "patient") return "تمت قراءة باركود المريض — جارٍ فتح الملف..."
  if (type === "verify") return "تمت قراءة رمز التحقق — جارٍ فتح صفحة التحقق..."
  return "تمت قراءة باركود النتائج — جارٍ فتح صفحة النتائج..."
}

/**
 * Global wedge-scanner listener for protected dashboard routes.
 * Activates only after "~" is seen; ignores normal typing in form fields until then.
 */
export function GlobalBarcodeScannerListener() {
  const router = useRouter()
  const bufferRef = useRef("")
  const scanActiveRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRedirectAtRef = useRef(0)

  useEffect(() => {
    const resetBuffer = () => {
      bufferRef.current = ""
      scanActiveRef.current = false
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const clearBufferWithReady = () => {
      resetBuffer()
      dispatchBarcodeScannerStatus({
        status: "ready",
        value: "",
        message: "قارئ الباركود جاهز",
      })
    }

    const scheduleBufferTimeout = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(clearBufferWithReady, BUFFER_TIMEOUT_MS)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      if (Date.now() - lastRedirectAtRef.current < REDIRECT_COOLDOWN_MS) {
        return
      }

      const inEditable = isEditableTarget(e.target)
      if (inEditable && !scanActiveRef.current) {
        return
      }

      if (isScannerEnterKey(e)) {
        if (!scanActiveRef.current) return

        e.preventDefault()
        e.stopPropagation()

        const raw = bufferRef.current
        resetBuffer()

        const normalizedValue = normalizeBarcodeValueWithoutPrefix(raw)
        const result = resolveBarcodeRoute(raw, { requirePrefix: true })

        if (result.isValid) {
          addBarcodeScanHistoryItem({
            rawValue: raw,
            normalizedValue,
            type: result.type,
            entityId: result.id,
            route: result.route,
            status: "success",
            message: scanSuccessMessage(result.type),
          })
          dispatchBarcodeScannerStatus({
            status: "success",
            value: raw,
            message: scanStatusMessage(result.type),
          })
          lastRedirectAtRef.current = Date.now()
          router.push(result.route)
          return
        }

        addBarcodeScanHistoryItem({
          rawValue: raw,
          normalizedValue,
          type: "unknown",
          status: "invalid",
          message: "صيغة الباركود غير مدعومة",
        })
        dispatchBarcodeScannerStatus({
          status: "invalid",
          value: raw,
          message: "قراءة غير صالحة",
        })
        toast.error(result.error)
        return
      }

      const char = keyboardEventToUsChar(e)
      if (char === null) return

      if (!scanActiveRef.current) {
        if (char !== "~") return

        scanActiveRef.current = true
        bufferRef.current = "~"
        dispatchBarcodeScannerStatus({
          status: "scanning",
          value: "",
          message: "جاري قراءة الباركود...",
        })
        e.preventDefault()
        e.stopPropagation()
        scheduleBufferTimeout()
        return
      }

      e.preventDefault()
      e.stopPropagation()
      bufferRef.current += char
      scheduleBufferTimeout()
    }

    window.addEventListener("keydown", onKeyDown, true)

    return () => {
      window.removeEventListener("keydown", onKeyDown, true)
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [router])

  return null
}
