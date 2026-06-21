import type { CSSProperties } from "react"

export const PATIENT_BARCODE_PRINT_CALIBRATION_STORAGE_KEY = "lab.patient_barcode_print_calibration"

export type PatientBarcodePrintCalibration = {
  barcodeWidthMm: number
  barcodeHeightMm: number
  offsetXmm: number
  offsetYmm: number
  showText: boolean
  textSizePx: number
  labelMode: "barcode-only" | "barcode-with-code"
  barcodeScaleXPercent: number
}

/** Successful Xprinter XP-T361U 30×10 mm tube label calibration */
export const XPRINTER_TUBE_30X10_PRESET: PatientBarcodePrintCalibration = {
  barcodeWidthMm: 28.5,
  barcodeHeightMm: 9,
  offsetXmm: 0,
  offsetYmm: 0,
  showText: false,
  textSizePx: 7,
  labelMode: "barcode-only",
  barcodeScaleXPercent: 160,
}

export const DEFAULT_PATIENT_BARCODE_PRINT_CALIBRATION: PatientBarcodePrintCalibration = {
  ...XPRINTER_TUBE_30X10_PRESET,
}

export const PATIENT_BARCODE_CALIBRATION_PRESETS = {
  xprinterTube30x10: {
    ...XPRINTER_TUBE_30X10_PRESET,
  },
  fullFill: {
    barcodeWidthMm: 29,
    barcodeHeightMm: 8.5,
    offsetXmm: 0,
    offsetYmm: 0,
    showText: false,
    textSizePx: 7,
    labelMode: "barcode-only" as const,
    barcodeScaleXPercent: 100,
  },
  withCode: {
    barcodeWidthMm: 28.5,
    barcodeHeightMm: 7,
    offsetXmm: 0,
    offsetYmm: 0,
    showText: true,
    textSizePx: 7,
    labelMode: "barcode-with-code" as const,
    barcodeScaleXPercent: 100,
  },
  smaller: {
    barcodeWidthMm: 26,
    barcodeHeightMm: 6,
    offsetXmm: 0,
    offsetYmm: 0,
    showText: true,
    textSizePx: 6,
    labelMode: "barcode-with-code" as const,
    barcodeScaleXPercent: 100,
  },
  maxStretch: {
    barcodeWidthMm: 40,
    barcodeHeightMm: 8.5,
    offsetXmm: 0,
    offsetYmm: 0,
    showText: false,
    textSizePx: 7,
    labelMode: "barcode-only" as const,
    barcodeScaleXPercent: 130,
  },
} satisfies Record<string, PatientBarcodePrintCalibration>

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function normalizePatientBarcodePrintCalibration(
  raw: Partial<PatientBarcodePrintCalibration> | null | undefined
): PatientBarcodePrintCalibration {
  const base = DEFAULT_PATIENT_BARCODE_PRINT_CALIBRATION
  if (!raw || typeof raw !== "object") return { ...base }

  const merged: PatientBarcodePrintCalibration = { ...base, ...raw }

  return {
    barcodeWidthMm: clamp(Number(merged.barcodeWidthMm) || base.barcodeWidthMm, 10, 45),
    barcodeHeightMm: clamp(Number(merged.barcodeHeightMm) || base.barcodeHeightMm, 4, 9.5),
    offsetXmm: clamp(Number(merged.offsetXmm) || 0, -15, 15),
    offsetYmm: clamp(Number(merged.offsetYmm) || 0, -3, 3),
    showText: merged.showText !== false,
    textSizePx: clamp(Number(merged.textSizePx) || base.textSizePx, 5, 10),
    labelMode: merged.labelMode === "barcode-only" ? "barcode-only" : "barcode-with-code",
    barcodeScaleXPercent: clamp(
      Number(merged.barcodeScaleXPercent) || base.barcodeScaleXPercent,
      80,
      160
    ),
  }
}

export function hasStoredPatientBarcodePrintCalibration(): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(PATIENT_BARCODE_PRINT_CALIBRATION_STORAGE_KEY) != null
}

export function getPatientBarcodePrintCalibration(): PatientBarcodePrintCalibration {
  if (typeof window === "undefined") {
    return { ...XPRINTER_TUBE_30X10_PRESET }
  }

  try {
    const raw = window.localStorage.getItem(PATIENT_BARCODE_PRINT_CALIBRATION_STORAGE_KEY)
    if (!raw) return { ...XPRINTER_TUBE_30X10_PRESET }
    const parsed = JSON.parse(raw) as Partial<PatientBarcodePrintCalibration>
    return normalizePatientBarcodePrintCalibration({
      ...XPRINTER_TUBE_30X10_PRESET,
      ...parsed,
    })
  } catch {
    return { ...XPRINTER_TUBE_30X10_PRESET }
  }
}

export function savePatientBarcodeTestDefaults(settings: {
  calibration: PatientBarcodePrintCalibration
}): void {
  savePatientBarcodePrintCalibration(settings.calibration)
}

export function savePatientBarcodePrintCalibration(calibration: PatientBarcodePrintCalibration): void {
  if (typeof window === "undefined") return
  const normalized = normalizePatientBarcodePrintCalibration(calibration)
  try {
    window.localStorage.setItem(
      PATIENT_BARCODE_PRINT_CALIBRATION_STORAGE_KEY,
      JSON.stringify(normalized)
    )
  } catch {
    // ignore quota errors
  }
}

export function getBarcodeCalibrationCssVars(
  calibration: PatientBarcodePrintCalibration
): CSSProperties {
  const c = normalizePatientBarcodePrintCalibration(calibration)
  return {
    "--barcode-offset-x": `${c.offsetXmm}mm`,
    "--barcode-offset-y": `${c.offsetYmm}mm`,
    "--barcode-width-mm": `${c.barcodeWidthMm}mm`,
    "--barcode-height-mm": `${c.barcodeHeightMm}mm`,
    "--barcode-scale-x": String(c.barcodeScaleXPercent / 100),
  } as CSSProperties
}
