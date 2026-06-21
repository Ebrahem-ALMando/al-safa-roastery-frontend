import { XPRINTER_TUBE_30X10_PRESET } from "@/lib/patient-barcode-print-calibration"
import type { BarcodePrintCalibrationMode } from "@/lib/tube-barcode-label"

/** Approved tube label print mode for lab order result barcodes */
export const ORDER_RESULT_BARCODE_CALIBRATION_MODE: BarcodePrintCalibrationMode =
  "page-10x30-rotate-content"

export const ORDER_RESULT_BARCODE_CALIBRATION = XPRINTER_TUBE_30X10_PRESET

export const BARCODE_LABEL_PRINT_BODY_CLASS = "printing-barcode-label"
