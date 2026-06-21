"use client"

import { PatientBarcodeLabel, type PatientBarcodeLabelPatient } from "@/components/patients/patient-barcode-label"
import type { PatientBarcodePrintCalibration } from "@/lib/patient-barcode-print-calibration"
import type { BarcodePrintCalibrationMode } from "@/lib/tube-barcode-label"
import { cn } from "@/lib/utils"

export type PatientBarcodeTechnicalPrintPreviewProps = {
  patient: PatientBarcodeLabelPatient
  calibration: PatientBarcodePrintCalibration
  calibrationMode: BarcodePrintCalibrationMode
}

export function PatientBarcodeTechnicalPrintPreview({
  patient,
  calibration,
  calibrationMode,
}: PatientBarcodeTechnicalPrintPreviewProps) {
  const needsRotatedHost = calibrationMode !== "direct-30x10"
  const previewScale = calibrationMode === "direct-30x10" ? 2.5 : 2

  const label = (
    <PatientBarcodeLabel
      patient={patient}
      orientation="horizontal"
      calibrationMode={calibrationMode}
      calibration={calibration}
      className="shadow-none ring-0"
    />
  )

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div
        className="origin-center"
        style={{ transform: `scale(${previewScale})` }}
        aria-label="معاينة تقنية لصفحة الطباعة"
      >
        {needsRotatedHost ? (
          <div
            className={cn(
              "patient-barcode-print-surface--rotated-host bg-white",
              calibrationMode === "page-10x30-rotate-content" ? "h-[30mm] w-[10mm]" : "h-[10mm] w-[30mm]"
            )}
          >
            {label}
          </div>
        ) : (
          label
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        وضع الطباعة:{" "}
        {calibrationMode === "direct-30x10"
          ? "مباشر 30×10"
          : calibrationMode === "page-30x10-rotate-content"
            ? "30×10 + تدوير"
            : "10×30 + تدوير"}
      </p>
    </div>
  )
}
