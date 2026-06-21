import type { CSSProperties } from "react"

/** تمييز صفوف القيم المرتفعة/المنخفضة في جدول نتائج التقرير */
export type AbnormalRowPreset =
  | "red_yellow"
  | "red_only"
  | "yellow_only"
  | "none"
  | "custom"

export const ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT = "#dc2626"
export const ABNORMAL_CUSTOM_LOW_HEX_DEFAULT = "#ca8a04"

const PRESETS: readonly AbnormalRowPreset[] = [
  "red_yellow",
  "red_only",
  "yellow_only",
  "none",
  "custom",
]

export function clampAbnormalRowPreset(v: unknown): AbnormalRowPreset {
  return typeof v === "string" && (PRESETS as readonly string[]).includes(v)
    ? (v as AbnormalRowPreset)
    : "red_yellow"
}

function normalizeHex6(input: string, fallback: string): string {
  const s = input.trim()
  const m = /^#?([0-9a-fA-F]{6})$/.exec(s)
  if (m) return `#${m[1].toLowerCase()}`
  const m2 = /^#?([0-9a-fA-F]{3})$/.exec(s)
  if (m2) {
    const x = m2[1]
    return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`.toLowerCase()
  }
  const fb = /^#?([0-9a-fA-F]{6})$/.exec(fallback.trim())
  return fb ? `#${fb[1].toLowerCase()}` : ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
}

export function clampAbnormalCustomHex(v: unknown, fallback: string): string {
  if (typeof v !== "string" || !v.trim()) return normalizeHex6(fallback, fallback)
  return normalizeHex6(v, fallback)
}

function rgbFromHex(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHex6(hex, ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT)
  const h = n.slice(1)
  const v = parseInt(h, 16)
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = rgbFromHex(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

/** ألوان/أنماط صف النتيجة وعمود القيمة وعمود الحالة لهذا النوع */
export type AbnormalVisualTone = {
  trClassName: string
  trStyle?: CSSProperties
  valueClassName: string
  valueStyle?: CSSProperties
  statusVerboseBadgeClassName: string
  statusVerboseBadgeStyle?: CSSProperties
  statusCompactClassName: string
  statusCompactStyle?: CSSProperties
}

const TONE_NONE: AbnormalVisualTone = {
  trClassName: "",
  valueClassName: "",
  statusVerboseBadgeClassName:
    "border-border bg-muted/50 font-bold text-foreground print:border-border",
  statusCompactClassName: "font-mono font-bold text-foreground",
}

function toneFromHex(hex: string): AbnormalVisualTone {
  const n = normalizeHex6(hex, ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT)
  return {
    trClassName: "",
    trStyle: { backgroundColor: rgba(n, 0.08) },
    valueClassName: "",
    valueStyle: { color: n },
    statusVerboseBadgeClassName: "border font-bold print:border",
    statusVerboseBadgeStyle: {
      borderColor: rgba(n, 0.35),
      backgroundColor: rgba(n, 0.12),
      color: n,
    },
    statusCompactClassName: "font-mono font-bold",
    statusCompactStyle: { color: n },
  }
}

/** Tailwind: مرتفع = أحمر، منخفض = كهرماني */
const RED_YELLOW_HIGH: AbnormalVisualTone = {
  trClassName: "bg-destructive/[0.06]",
  valueClassName: "text-destructive",
  statusVerboseBadgeClassName:
    "border-destructive/35 bg-destructive/10 font-bold text-destructive print:border-destructive",
  statusCompactClassName: "font-mono font-bold text-destructive",
}

const RED_YELLOW_LOW: AbnormalVisualTone = {
  trClassName: "bg-warning/[0.06]",
  valueClassName: "text-warning",
  statusVerboseBadgeClassName:
    "border-warning/35 bg-warning/10 font-bold text-warning print:border-warning",
  statusCompactClassName: "font-mono font-bold text-warning",
}

const RED_ONLY_HIGH: AbnormalVisualTone = {
  trClassName: "bg-destructive/[0.07]",
  valueClassName: "text-destructive",
  statusVerboseBadgeClassName:
    "border-destructive/35 bg-destructive/10 font-bold text-destructive print:border-destructive",
  statusCompactClassName: "font-mono font-bold text-destructive",
}

/** منخفض بنفس سلسلة الأحمر (خلفية أخف قليلاً) */
const RED_ONLY_LOW: AbnormalVisualTone = {
  trClassName: "bg-destructive/[0.04]",
  valueClassName: "text-destructive",
  statusVerboseBadgeClassName:
    "border-destructive/30 bg-destructive/10 font-bold text-destructive print:border-destructive",
  statusCompactClassName: "font-mono font-bold text-destructive",
}

const YELLOW_ONLY_HIGH: AbnormalVisualTone = {
  trClassName: "bg-warning/[0.07]",
  valueClassName: "text-warning",
  statusVerboseBadgeClassName:
    "border-warning/35 bg-warning/10 font-bold text-warning print:border-warning",
  statusCompactClassName: "font-mono font-bold text-warning",
}

const YELLOW_ONLY_LOW: AbnormalVisualTone = {
  trClassName: "bg-warning/[0.05]",
  valueClassName: "text-warning",
  statusVerboseBadgeClassName:
    "border-warning/30 bg-warning/10 font-bold text-warning print:border-warning",
  statusCompactClassName: "font-mono font-bold text-warning",
}

export function resolveAbnormalVisuals(options: {
  preset: AbnormalRowPreset
  customHighHex: string
  customLowHex: string
}): { high: AbnormalVisualTone; low: AbnormalVisualTone } {
  const { preset } = options
  const hi = clampAbnormalCustomHex(
    options.customHighHex,
    ABNORMAL_CUSTOM_HIGH_HEX_DEFAULT
  )
  const lo = clampAbnormalCustomHex(
    options.customLowHex,
    ABNORMAL_CUSTOM_LOW_HEX_DEFAULT
  )

  switch (preset) {
    case "red_yellow":
      return { high: RED_YELLOW_HIGH, low: RED_YELLOW_LOW }
    case "red_only":
      return { high: RED_ONLY_HIGH, low: RED_ONLY_LOW }
    case "yellow_only":
      return { high: YELLOW_ONLY_HIGH, low: YELLOW_ONLY_LOW }
    case "none":
      return {
        high: TONE_NONE,
        low: { ...TONE_NONE },
      }
    case "custom":
      return {
        high: toneFromHex(hi),
        low: toneFromHex(lo),
      }
    default:
      return { high: RED_YELLOW_HIGH, low: RED_YELLOW_LOW }
  }
}
