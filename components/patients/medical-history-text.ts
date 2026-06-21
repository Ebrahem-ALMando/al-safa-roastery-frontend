import {
  MEDICAL_HISTORY_LEGACY_SURGICAL_HEADER,
  MEDICAL_HISTORY_MAX_CHARS,
  MEDICAL_HISTORY_SECTION_ORDER,
  MEDICAL_HISTORY_SECTIONS,
  type MedicalHistorySectionKey,
} from "./medical-history.constants"

export type MedicalHistoryFieldValues = Record<MedicalHistorySectionKey, string>

export function emptyMedicalHistoryFields(): MedicalHistoryFieldValues {
  return {
    chronicDiseases: "",
    currentMedications: "",
    allergies: "",
    surgicalHistory: "",
    additionalMedicalNotes: "",
  }
}

/** يقلِّل أسطر فارغة مكررة داخل محتوى قسم واحد */
function squashExtraBlankLinesInBody(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n").trim()
}

/** يدمج الحقول في سلسلة واحدة: أقسام فارغة تُهمَل، بين الأقسام سطر فارغ واحد بالضبط. */
export function buildMedicalHistoryText(parts: MedicalHistoryFieldValues): string {
  const chunks: string[] = []

  for (const key of MEDICAL_HISTORY_SECTION_ORDER) {
    const body = squashExtraBlankLinesInBody(parts[key] ?? "")
    if (!body) continue
    const title = MEDICAL_HISTORY_SECTIONS[key]
    chunks.push(`${title}:\n${body}`)
  }

  return chunks.join("\n\n").replace(/\n{3,}/g, "\n\n").trimEnd()
}

type HeaderMatch = { key: MedicalHistorySectionKey; rest: string }

function matchSectionHeaderLine(line: string): HeaderMatch | null {
  const t = line.trimStart()

  for (const key of MEDICAL_HISTORY_SECTION_ORDER) {
    const label = MEDICAL_HISTORY_SECTIONS[key]
    const prefix = `${label}:`
    if (t === prefix) {
      return { key, rest: "" }
    }
    if (t.startsWith(prefix)) {
      return { key, rest: t.slice(prefix.length).trimStart() }
    }
  }

  const legacyPrefix = `${MEDICAL_HISTORY_LEGACY_SURGICAL_HEADER}:`
  if (t === legacyPrefix) {
    return { key: "surgicalHistory", rest: "" }
  }
  if (t.startsWith(legacyPrefix)) {
    return { key: "surgicalHistory", rest: t.slice(legacyPrefix.length).trimStart() }
  }

  return null
}

/**
 * يفكّ النص المركّب إلى حقول؛ إذا وُجد نص قبل أول عنوان مهيكَل، أو لا يوجد أي عنوان مهيكَل، يُعتبر النص غير مهيكَل
 * وتُطبَّق سياسة الـ fallback الواحدة:
 * كل الحقول الفارغة ويُحمَّل المحتوى كاملاً في `additionalMedicalNotes`.
 */
export function parseMedicalHistoryText(
  raw: string | null | undefined
): MedicalHistoryFieldValues {
  const trimmed = typeof raw === "string" ? raw.trim() : ""

  const empty = emptyMedicalHistoryFields()
  if (!trimmed) return empty

  const lines = trimmed.split(/\n/)

  let firstHeaderIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (matchSectionHeaderLine(lines[i] ?? "")) {
      firstHeaderIndex = i
      break
    }
  }

  if (firstHeaderIndex === -1) {
    empty.additionalMedicalNotes = trimmed
    return empty
  }

  const preambleLines = lines.slice(0, firstHeaderIndex).map((ln) => ln.trim())
  if (preambleLines.some((ln) => ln.length > 0)) {
    empty.additionalMedicalNotes = trimmed
    return empty
  }

  let currentKey: MedicalHistorySectionKey | null = null
  const buffers: Partial<Record<MedicalHistorySectionKey, string[]>> = {}

  const append = (text: string) => {
    if (!currentKey) return
    const bucket = buffers[currentKey]
    if (bucket) bucket.push(text)
    else buffers[currentKey] = [text]
  }

  let i = firstHeaderIndex

  while (i < lines.length) {
    const line = lines[i] ?? ""
    const m = matchSectionHeaderLine(line)
    if (m) {
      currentKey = m.key
      if (m.rest) append(m.rest)
    } else {
      append(line)
    }
    i++
  }

  const out = emptyMedicalHistoryFields()
  for (const key of MEDICAL_HISTORY_SECTION_ORDER) {
    const parts = buffers[key]
    if (!parts || parts.length === 0) {
      out[key] = ""
    } else {
      out[key] = squashExtraBlankLinesInBody(parts.join("\n"))
    }
  }

  return out
}

export function mergedMedicalHistoryLength(parts: MedicalHistoryFieldValues): number {
  return buildMedicalHistoryText(parts).length
}

export function exceedsMedicalHistoryLimit(parts: MedicalHistoryFieldValues): boolean {
  return mergedMedicalHistoryLength(parts) > MEDICAL_HISTORY_MAX_CHARS
}
