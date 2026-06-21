import type { CSSProperties } from "react"

/** معرفات الثيمات المدمجة — عدا app_default و custom */
export const REPORT_BUILTIN_THEME_IDS = [
  "app_default",
  "sirian_purple",
  "ocean_teal",
  "forest_emerald",
  "slate_navy",
  "terracotta_warm",
  "rose_clinical",
  "midnight_indigo",
  "custom",
] as const

export type ReportBuiltinThemeId = (typeof REPORT_BUILTIN_THEME_IDS)[number]

export type ReportThemePresetMeta = {
  id: ReportBuiltinThemeId
  /** عربي */
  labelAr: string
  /** إنجليزي */
  labelEn: string
  /** لون أساسي — فارغ عند app_default */
  primary: string
  /** لون ثانٍ (تدرجات، لمسات) — فارغ عند app_default */
  accent: string
}

/** ثيم بنفسجي مخبر السريان — #81548d و #aa548d */
export const REPORT_THEME_PRESETS: ReportThemePresetMeta[] = [
  {
    id: "app_default",
    labelAr: "ألوان التطبيق الافتراضية (أزرق طبي)",
    labelEn: "App default (medical blue)",
    primary: "",
    accent: "",
  },
  {
    id: "sirian_purple",
    labelAr: "بنفسجي السريان (مطابق للهوية)",
    labelEn: "Sirian purple brand",
    primary: "#81548d",
    accent: "#aa548d",
  },
  {
    id: "ocean_teal",
    labelAr: "محيط وزمردي",
    labelEn: "Ocean teal",
    primary: "#0f766e",
    accent: "#2dd4bf",
  },
  {
    id: "forest_emerald",
    labelAr: "أخضر غابات",
    labelEn: "Forest emerald",
    primary: "#047857",
    accent: "#34d399",
  },
  {
    id: "slate_navy",
    labelAr: "كحلي احترافي",
    labelEn: "Slate navy",
    primary: "#1e3a5f",
    accent: "#3b82f6",
  },
  {
    id: "terracotta_warm",
    labelAr: "دافئ تراكوتا",
    labelEn: "Warm terracotta",
    primary: "#c2410c",
    accent: "#fb923c",
  },
  {
    id: "rose_clinical",
    labelAr: "وردي مخبري",
    labelEn: "Rose clinical",
    primary: "#be185d",
    accent: "#f472b6",
  },
  {
    id: "midnight_indigo",
    labelAr: "نيلي ليلي",
    labelEn: "Midnight indigo",
    primary: "#3730a3",
    accent: "#818cf8",
  },
  {
    id: "custom",
    labelAr: "مخصّص (من الألوان أدناه)",
    labelEn: "Custom (colors below)",
    primary: "",
    accent: "",
  },
]

const HEX_RE = /^#([0-9a-f]{6})$/i

export function normalizeReportThemeHex(raw: string | undefined, fallback: string): string {
  const t = (raw ?? "").trim()
  if (HEX_RE.test(t)) return t.toUpperCase()
  return fallback.toUpperCase()
}

export function normalizeReportThemeId(raw: string | undefined): ReportBuiltinThemeId {
  const v = (raw ?? "").trim() as ReportBuiltinThemeId
  return REPORT_BUILTIN_THEME_IDS.includes(v) ? v : "app_default"
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = HEX_RE.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** نص فاتح أو داكن يُقرأ على خلفية primary */
export function pickContrastingForegroundHex(bgHex: string): string {
  const rgb = hexToRgb(bgHex)
  if (!rgb) return "#ffffff"
  const y = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b
  return y > 165 ? "#1a1a1a" : "#ffffff"
}

export function getReportThemeColors(opts: {
  reportThemeId: ReportBuiltinThemeId
  reportThemePrimaryHex: string
  reportThemeAccentHex: string
}): { primary: string; accent: string } | null {
  const id = opts.reportThemeId
  if (id === "app_default") return null

  if (id === "custom") {
    const primary = normalizeReportThemeHex(opts.reportThemePrimaryHex, "#81548d")
    const accent = normalizeReportThemeHex(opts.reportThemeAccentHex, "#aa548d")
    return { primary, accent }
  }

  const preset = REPORT_THEME_PRESETS.find((p) => p.id === id)
  if (!preset?.primary || !preset?.accent) return null
  return { primary: preset.primary.toUpperCase(), accent: preset.accent.toUpperCase() }
}

/**
 * متغيرات CSS للقالب — تُورّث للعناصر الفرعية فيُعاد تعريف primary داخل التقرير فقط.
 */
export function resolveReportThemeCssProperties(opts: {
  reportThemeId: ReportBuiltinThemeId
  reportThemePrimaryHex: string
  reportThemeAccentHex: string
}): CSSProperties {
  const colors = getReportThemeColors({
    reportThemeId: opts.reportThemeId,
    reportThemePrimaryHex: opts.reportThemePrimaryHex,
    reportThemeAccentHex: opts.reportThemeAccentHex,
  })
  if (!colors) return {}

  const fg = pickContrastingForegroundHex(colors.primary)
  return {
    ["--primary" as string]: colors.primary,
    ["--primary-foreground" as string]: fg,
    ["--ring" as string]: colors.accent,
    ["--report-accent" as string]: colors.accent,
    /* تأكيد ربط طبقة الألوان في Tailwind v4 */
    ["--color-primary" as string]: colors.primary,
    ["--color-primary-foreground" as string]: fg,
    ["--color-ring" as string]: colors.accent,
  }
}

export function reportUsesCustomVisualTheme(id: ReportBuiltinThemeId): boolean {
  return id !== "app_default"
}
