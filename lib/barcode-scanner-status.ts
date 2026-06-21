export const BARCODE_SCANNER_STATUS_EVENT = "barcode-scanner-status"

export type BarcodeScannerStatus = "ready" | "scanning" | "success" | "invalid"

export type BarcodeScannerStatusDetail = {
  status: BarcodeScannerStatus
  value: string
  message: string
}

export function dispatchBarcodeScannerStatus(detail: BarcodeScannerStatusDetail): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<BarcodeScannerStatusDetail>(BARCODE_SCANNER_STATUS_EVENT, { detail }))
}
