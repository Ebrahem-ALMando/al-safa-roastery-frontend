"use client"

import Barcode from "react-barcode"
import { cn } from "@/lib/utils"
import {
  getBarcodeCalibrationCssVars,
  normalizePatientBarcodePrintCalibration,
  type PatientBarcodePrintCalibration,
} from "@/lib/patient-barcode-print-calibration"
import {
  ORDER_RESULT_BARCODE_CALIBRATION,
  ORDER_RESULT_BARCODE_CALIBRATION_MODE,
} from "@/lib/order-result-barcode-print"
import {
  getCalibrationRotationClass,
  TUBE_LABEL_HEIGHT_MM,
  TUBE_LABEL_WIDTH_MM,
  type BarcodePrintCalibrationMode,
} from "@/lib/tube-barcode-label"

export type OrderResultBarcodeLabelProps = {
  orderId: number | string
  calibrationMode?: BarcodePrintCalibrationMode
  calibration?: PatientBarcodePrintCalibration
  className?: string
  style?: React.CSSProperties
}

export function OrderResultBarcodeLabel({
  orderId,
  calibrationMode = ORDER_RESULT_BARCODE_CALIBRATION_MODE,
  calibration: calibrationProp,
  className,
  style,
}: OrderResultBarcodeLabelProps) {
  const calibration = normalizePatientBarcodePrintCalibration(
    calibrationProp ?? ORDER_RESULT_BARCODE_CALIBRATION
  )

  const visibleBarcodeValue = `RES-${orderId}`
  const encodedBarcodeValue = `~RES-${orderId}`

  const rotationClass = getCalibrationRotationClass(calibrationMode)

  const showVisibleText =
    calibration.showText && calibration.labelMode === "barcode-with-code"

  const shell = cn(
    "patient-barcode-label box-border overflow-hidden bg-white text-black antialiased",
    "h-[10mm] w-[30mm]",
    rotationClass,
    className
  )

  const calibrationCssVars = getBarcodeCalibrationCssVars(calibration)

  const contentStyle: React.CSSProperties = {
    ...calibrationCssVars,
    transform: `translate(${calibration.offsetXmm}mm, ${calibration.offsetYmm}mm)`,
    width: `${TUBE_LABEL_WIDTH_MM}mm`,
    height: `${TUBE_LABEL_HEIGHT_MM}mm`,
  }

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
        className={cn("patient-barcode-label-content", showVisibleText ? "gap-[0.2mm]" : "gap-0")}
        style={contentStyle}
      >
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
