const ARABIC_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

/** True when the string contains Arabic script characters. */
export function containsArabicScript(text: string | null | undefined): boolean {
  if (!text?.trim()) return false
  return ARABIC_SCRIPT_RE.test(text)
}

export const tajawalFontClass =
  "font-[family-name:var(--font-tajawal)] tracking-normal leading-relaxed"

/**
 * Tajawal for Arabic text; optional mono for purely non-Arabic numeric/code strings.
 */
export function typographyClassForText(
  text: string | null | undefined,
  options?: { monoWhenNonArabic?: boolean }
): string {
  if (containsArabicScript(text)) {
    return tajawalFontClass
  }
  if (options?.monoWhenNonArabic && text?.trim()) {
    return "font-mono tabular-nums"
  }
  return ""
}
