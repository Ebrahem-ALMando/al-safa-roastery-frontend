"use client"

import * as React from "react"
import { PatientBarcodeLabel, type PatientBarcodeLabelPatient } from "@/components/patients/patient-barcode-label"
import {
  normalizePatientBarcodePrintCalibration,
  type PatientBarcodePrintCalibration,
} from "@/lib/patient-barcode-print-calibration"
import { TUBE_LABEL_WIDTH_MM } from "@/lib/tube-barcode-label"

const MM_TO_PX = 96 / 25.4
const LABEL_WIDTH_PX = TUBE_LABEL_WIDTH_MM * MM_TO_PX

export type PatientBarcodeLabelPreviewProps = {
  patient: PatientBarcodeLabelPatient
  calibration: PatientBarcodePrintCalibration
  className?: string
}

export function PatientBarcodeLabelPreview({
  patient,
  calibration,
  className,
}: PatientBarcodeLabelPreviewProps) {
  const normalized = normalizePatientBarcodePrintCalibration(calibration)
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(3.5)

  React.useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const updateScale = () => {
      const width = frame.clientWidth
      if (width > 0) {
        setScale(width / LABEL_WIDTH_PX)
      }
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={className}>
      <div
        ref={frameRef}
        className="patient-barcode-final-preview relative mx-auto w-full max-w-[420px] overflow-hidden rounded-md border border-dashed border-border bg-white"
        style={{ aspectRatio: "3 / 1" }}
        aria-label="معاينة النتيجة النهائية للصاقة 30×10 مم"
      >
        <div className="pointer-events-none absolute inset-0 z-10 border border-dashed border-amber-600/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="origin-center"
            style={{
              width: `${TUBE_LABEL_WIDTH_MM}mm`,
              height: "10mm",
              transform: `scale(${scale})`,
            }}
          >
            <PatientBarcodeLabel
              patient={patient}
              orientation="horizontal"
              calibrationMode="direct-30x10"
              calibration={normalized}
              className="shadow-none ring-0"
            />
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">حدود اللصاقة الفعلية</p>
    </div>
  )
}
