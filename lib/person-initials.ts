/** أول حرف من الاسم الأول + أول حرف من الثاني (دعم يونيكود للعربية). */
export function getPersonInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "؟"
  const parts = trimmed.split(/\s+/).filter(Boolean)
  const g0 = parts[0] ? Array.from(parts[0]) : []
  const g1 = parts[1] ? Array.from(parts[1]) : []
  if (parts.length >= 2 && g0[0] && g1[0]) {
    return `${g0[0]}${g1[0]}`
  }
  return `${g0[0] ?? "؟"}${g0[1] ?? ""}`.slice(0, 2)
}
