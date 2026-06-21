"use client"

import Barcode from "react-barcode"
import { cn } from "@/lib/utils"
import {
  DEFAULT_PATIENT_BARCODE_PRINT_CALIBRATION,
  getBarcodeCalibrationCssVars,
  normalizePatientBarcodePrintCalibration,
  type PatientBarcodePrintCalibration,
} from "@/lib/patient-barcode-print-calibration"
import {
  getCalibrationRotationClass,
  TUBE_LABEL_HEIGHT_MM,
  TUBE_LABEL_WIDTH_MM,
  type BarcodePrintCalibrationMode,
  type TubeLabelOrientation,
} from "@/lib/tube-barcode-label"

export type PatientBarcodeLabelPatient = {
  id: number | string
  full_name?: string
  patient_number?: string | null
}

export type PatientBarcodeLabelProps = {
  patient: PatientBarcodeLabelPatient
  orientation?: TubeLabelOrientation
  calibrationMode?: BarcodePrintCalibrationMode
  calibration?: PatientBarcodePrintCalibration
  className?: string
  style?: React.CSSProperties
}

export function PatientBarcodeLabel({
  patient,
  orientation = "horizontal",
  calibrationMode = "page-10x30-rotate-content",
  calibration: calibrationProp,
  className,
  style,
}: PatientBarcodeLabelProps) {
  const calibration = normalizePatientBarcodePrintCalibration(
    calibrationProp ?? DEFAULT_PATIENT_BARCODE_PRINT_CALIBRATION
  )

  const visibleBarcodeValue = `PAT-${patient.id}`
  const encodedBarcodeValue = `~PAT-${patient.id}`

  const usesRotatedContent =
    calibrationMode === "page-10x30-rotate-content" || calibrationMode === "page-30x10-rotate-content"
  const isHorizontal = usesRotatedContent || orientation === "horizontal"

  const rotationClass = getCalibrationRotationClass(calibrationMode)

  const showVisibleText =
    calibration.showText && calibration.labelMode === "barcode-with-code"

  const shell = cn(
    "patient-barcode-label box-border overflow-hidden bg-white text-black antialiased",
    isHorizontal ? "h-[10mm] w-[30mm]" : "h-[30mm] w-[10mm]",
    rotationClass,
    className
  )

  const calibrationCssVars = getBarcodeCalibrationCssVars(calibration)

  const contentStyle: React.CSSProperties = {
    ...calibrationCssVars,
    transform: `translate(${calibration.offsetXmm}mm, ${calibration.offsetYmm}mm)`,
    ...(isHorizontal
      ? { width: `${TUBE_LABEL_WIDTH_MM}mm`, height: `${TUBE_LABEL_HEIGHT_MM}mm` }
      : { width: "10mm", height: "30mm" }),
  }

  const barcodeBlock = (
    <div
      className="patient-barcode-bars shrink-0"
      style={{
        width: `${calibration.barcodeWidthMm}mm`,
        height: `${calibration.barcodeHeightMm}mm`,
        transform: `scaleX(${calibration.barcodeScaleXPercent / 100})`,
        transformOrigin: "center center",
      }}
      title={`Encoded: ${encodedBarcodeValue}`}
    >
      <Barcode
        value={encodedBarcodeValue}
        format="CODE128"
        displayValue={false}
        margin={0}
        width={1}
        height={60}
        background="#ffffff"
        lineColor="#000000"
        renderer="svg"
      />
    </div>
  )

  return (
    <div
      className={shell}
      dir="ltr"
      lang="ar"
      style={{
        width: `${TUBE_LABEL_WIDTH_MM}mm`,
        height: `${TUBE_LABEL_HEIGHT_MM}mm`,
        overflow: "hidden",
        boxSizing: "border-box",
        ...calibrationCssVars,
        ...style,
      }}
      data-label-mode={calibration.labelMode}
    >
      <div
        className={cn(
          "patient-barcode-label-content",
          showVisibleText ? "gap-[0.2mm]" : "gap-0"
        )}
        style={contentStyle}
      >
        {barcodeBlock}
        {showVisibleText ? (
          <p
            className="patient-barcode-visible-text m-0 text-black"
            dir="ltr"
            style={{ fontSize: `${calibration.textSizePx}px` }}
          >
            {visibleBarcodeValue}
          </p>
        ) : null}
      </div>
    </div>
  )
}
