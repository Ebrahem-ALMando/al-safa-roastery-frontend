export const BARCODE_SCAN_HISTORY_STORAGE_KEY = "lab.barcode_scan_history"

export const BARCODE_SCAN_HISTORY_UPDATED_EVENT = "barcode-scan-history-updated"

const MAX_HISTORY_ITEMS = 20

export type BarcodeScanHistoryType = "patient" | "results" | "verify" | "unknown"

export type BarcodeScanHistoryItem = {
  id: string
  rawValue: string
  normalizedValue: string
  type: BarcodeScanHistoryType
  entityId?: string
  route?: string
  status: "success" | "invalid"
  message: string
  createdAt: string
}

function createHistoryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return String(Date.now())
}

function normalizeHistoryType(raw: unknown): BarcodeScanHistoryType {
  if (raw === "patient" || raw === "results" || raw === "verify") return raw
  return "unknown"
}

function normalizeHistoryItem(raw: unknown): BarcodeScanHistoryItem | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Partial<BarcodeScanHistoryItem>
  if (typeof item.rawValue !== "string" || typeof item.status !== "string") return null

  return {
    id: typeof item.id === "string" ? item.id : createHistoryId(),
    rawValue: item.rawValue,
    normalizedValue:
      typeof item.normalizedValue === "string"
        ? item.normalizedValue
        : normalizeBarcodeValueWithoutPrefix(item.rawValue),
    type: normalizeHistoryType(item.type),
    entityId: typeof item.entityId === "string" ? item.entityId : undefined,
    route: typeof item.route === "string" ? item.route : undefined,
    status: item.status === "success" ? "success" : "invalid",
    message: typeof item.message === "string" ? item.message : "",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
  }
}

function persistHistory(items: BarcodeScanHistoryItem[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(BARCODE_SCAN_HISTORY_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(BARCODE_SCAN_HISTORY_UPDATED_EVENT))
  } catch {
    // ignore quota / storage errors
  }
}

export function normalizeBarcodeValueWithoutPrefix(rawValue: string): string {
  const trimmed = rawValue.trim().toUpperCase()
  return trimmed.startsWith("~") ? trimmed.slice(1) : trimmed
}

export function getBarcodeScanHistory(): BarcodeScanHistoryItem[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(BARCODE_SCAN_HISTORY_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      persistHistory([])
      return []
    }

    return parsed
      .map(normalizeHistoryItem)
      .filter((item): item is BarcodeScanHistoryItem => item !== null)
  } catch {
    persistHistory([])
    return []
  }
}

export function addBarcodeScanHistoryItem(
  item: Omit<BarcodeScanHistoryItem, "id" | "createdAt">
): BarcodeScanHistoryItem[] {
  if (typeof window === "undefined") return []

  const record: BarcodeScanHistoryItem = {
    ...item,
    id: createHistoryId(),
    createdAt: new Date().toISOString(),
  }

  const next = [record, ...getBarcodeScanHistory()].slice(0, MAX_HISTORY_ITEMS)
  persistHistory(next)
  return next
}

export function clearBarcodeScanHistory(): void {
  if (typeof window === "undefined") return
  persistHistory([])
}
