"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { OrderResultBarcodeLabel } from "@/components/orders/order-result-barcode-label"
import { getBarcodeCalibrationCssVars } from "@/lib/patient-barcode-print-calibration"
import {
  BARCODE_LABEL_PRINT_BODY_CLASS,
  ORDER_RESULT_BARCODE_CALIBRATION,
  ORDER_RESULT_BARCODE_CALIBRATION_MODE,
} from "@/lib/order-result-barcode-print"
import {
  getBarcodePrintPageClassName,
  getBarcodePrintSurfaceConfig,
} from "@/lib/tube-barcode-label"
import { cn } from "@/lib/utils"

export type OrderResultBarcodePrintJob = {
  orderId: number
  copies: number
}

export type OrderResultBarcodePrintPortalProps = {
  job: OrderResultBarcodePrintJob | null
  onAfterPrint?: () => void
}

export function OrderResultBarcodePrintPortal({ job, onAfterPrint }: OrderResultBarcodePrintPortalProps) {
  const [portalReady, setPortalReady] = React.useState(false)
  const printTriggeredRef = React.useRef(false)

  const calibrationMode = ORDER_RESULT_BARCODE_CALIBRATION_MODE
  const printSurface = getBarcodePrintSurfaceConfig(calibrationMode)
  const printPageClassName = getBarcodePrintPageClassName(calibrationMode)
  const calibrationCssVars = getBarcodeCalibrationCssVars(ORDER_RESULT_BARCODE_CALIBRATION)
  const needsRotatedHost = calibrationMode !== "direct-30x10"
  const copies = job?.copies ?? 0

  React.useEffect(() => {
    setPortalReady(true)
  }, [])

  React.useEffect(() => {
    if (!job) {
      printTriggeredRef.current = false
      return
    }

    const onBeforePrint = () => {
      document.body.classList.add(BARCODE_LABEL_PRINT_BODY_CLASS)
      document.body.dataset.barcodeCopies = String(job.copies)
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

    const onAfterPrintEvent = () => {
      document.body.classList.remove(BARCODE_LABEL_PRINT_BODY_CLASS)
      delete document.body.dataset.barcodeCopies
      document.body.style.removeProperty("--barcode-print-page-width")
      document.body.style.removeProperty("--barcode-print-page-height")
      printTriggeredRef.current = false
      onAfterPrint?.()
    }

    window.addEventListener("beforeprint", onBeforePrint)
    window.addEventListener("afterprint", onAfterPrintEvent)

    return () => {
      window.removeEventListener("beforeprint", onBeforePrint)
      window.removeEventListener("afterprint", onAfterPrintEvent)
      document.body.classList.remove(BARCODE_LABEL_PRINT_BODY_CLASS)
      delete document.body.dataset.barcodeCopies
      document.body.style.removeProperty("--barcode-print-page-width")
      document.body.style.removeProperty("--barcode-print-page-height")
    }
  }, [job, onAfterPrint, printSurface])

  React.useEffect(() => {
    if (!job || !portalReady || printTriggeredRef.current) return

    printTriggeredRef.current = true
    const timer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.print()
      })
    }, 100)

    return () => window.clearTimeout(timer)
  }, [job, portalReady])

  if (!job || !portalReady) return null

  return createPortal(
    <div
      id="barcode-label-print-surface"
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
          <OrderResultBarcodeLabel orderId={job.orderId} calibrationMode={calibrationMode} />
        </div>
      ))}
    </div>,
    document.body
  )
}
