import type { BarcodePrintCalibrationMode } from "@/lib/tube-barcode-label"

export const PATIENT_BARCODE_TEST_PAGE_SETTINGS_STORAGE_KEY = "lab.patient_barcode_test_page_settings"

export type PatientBarcodeTestPageSettings = {
  calibrationMode: BarcodePrintCalibrationMode
  copies: 1 | 2
}

export const XPRINTER_TUBE_30X10_PAGE_SETTINGS: PatientBarcodeTestPageSettings = {
  calibrationMode: "page-10x30-rotate-content",
  copies: 1,
}

export function hasStoredPatientBarcodeTestPageSettings(): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(PATIENT_BARCODE_TEST_PAGE_SETTINGS_STORAGE_KEY) != null
}

export function getPatientBarcodeTestPageSettings(): PatientBarcodeTestPageSettings {
  if (typeof window === "undefined") {
    return { ...XPRINTER_TUBE_30X10_PAGE_SETTINGS }
  }

  try {
    const raw = window.localStorage.getItem(PATIENT_BARCODE_TEST_PAGE_SETTINGS_STORAGE_KEY)
    if (!raw) return { ...XPRINTER_TUBE_30X10_PAGE_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<PatientBarcodeTestPageSettings>
    const mode = parsed.calibrationMode
    const validModes: BarcodePrintCalibrationMode[] = [
      "direct-30x10",
      "page-10x30-rotate-content",
      "page-30x10-rotate-content",
    ]
    return {
      calibrationMode: validModes.includes(mode as BarcodePrintCalibrationMode)
        ? (mode as BarcodePrintCalibrationMode)
        : XPRINTER_TUBE_30X10_PAGE_SETTINGS.calibrationMode,
      copies: parsed.copies === 2 ? 2 : 1,
    }
  } catch {
    return { ...XPRINTER_TUBE_30X10_PAGE_SETTINGS }
  }
}

export function savePatientBarcodeTestPageSettings(settings: PatientBarcodeTestPageSettings): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      PATIENT_BARCODE_TEST_PAGE_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    )
  } catch {
    // ignore
  }
}

export function getCalibrationModeLabel(mode: BarcodePrintCalibrationMode): string {
  switch (mode) {
    case "direct-30x10":
      return "مباشر 30×10 مم"
    case "page-10x30-rotate-content":
      return "صفحة 10×30 مم + تدوير المحتوى"
    case "page-30x10-rotate-content":
      return "صفحة 30×10 مم + تدوير المحتوى"
  }
}
