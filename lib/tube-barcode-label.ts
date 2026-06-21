import type { CSSProperties } from "react"

export const TUBE_LABEL_WIDTH_MM = 30
export const TUBE_LABEL_HEIGHT_MM = 10

export const TUBE_LABEL_PAGE_NAMES = {
  direct30x10: "patientBarcodeTube30x10",
  page10x30: "patientBarcodeTube10x30",
} as const

export type BarcodePrintCalibrationMode =
  | "direct-30x10"
  | "page-10x30-rotate-content"
  | "page-30x10-rotate-content"

export type TubeLabelOrientation = "horizontal" | "vertical"

export function getBarcodePrintPageName(mode: BarcodePrintCalibrationMode): string {
  if (mode === "page-10x30-rotate-content") {
    return TUBE_LABEL_PAGE_NAMES.page10x30
  }
  return TUBE_LABEL_PAGE_NAMES.direct30x10
}

export type BarcodePrintSurfaceConfig = {
  pageName: string
  pageWidth: string
  pageHeight: string
  cssVars: CSSProperties
  labelCalibrationMode: BarcodePrintCalibrationMode
}

export function getBarcodePrintSurfaceConfig(mode: BarcodePrintCalibrationMode): BarcodePrintSurfaceConfig {
  if (mode === "page-10x30-rotate-content") {
    return {
      pageName: TUBE_LABEL_PAGE_NAMES.page10x30,
      pageWidth: "10mm",
      pageHeight: "30mm",
      cssVars: {
        "--barcode-print-page-width": "10mm",
        "--barcode-print-page-height": "30mm",
      },
      labelCalibrationMode: mode,
    }
  }

  return {
    pageName: TUBE_LABEL_PAGE_NAMES.direct30x10,
    pageWidth: "30mm",
    pageHeight: "10mm",
    cssVars: {
      "--barcode-print-page-width": "30mm",
      "--barcode-print-page-height": "10mm",
    },
    labelCalibrationMode: mode,
  }
}

export function getBarcodePrintPageClassName(mode: BarcodePrintCalibrationMode): string {
  if (mode === "page-10x30-rotate-content") {
    return "patient-barcode-print-page--10x30"
  }
  return "patient-barcode-print-page--30x10"
}

export function getCalibrationRotationClass(
  mode: BarcodePrintCalibrationMode
): string | undefined {
  switch (mode) {
    case "page-10x30-rotate-content":
      return "rotate-content-90"
    case "page-30x10-rotate-content":
      return "rotate-content-minus-90"
    default:
      return undefined
  }
}

/** @deprecated Use getBarcodePrintSurfaceConfig for barcode-test printing */
export function getTubeLabelPageName(orientation: TubeLabelOrientation): string {
  return orientation === "vertical" ? TUBE_LABEL_PAGE_NAMES.page10x30 : TUBE_LABEL_PAGE_NAMES.direct30x10
}

/** @deprecated Use getBarcodePrintSurfaceConfig for barcode-test printing */
export function getTubeLabelDimensions(orientation: TubeLabelOrientation): {
  width: string
  height: string
} {
  if (orientation === "vertical") {
    return { width: "10mm", height: "30mm" }
  }
  return { width: "30mm", height: "10mm" }
}
