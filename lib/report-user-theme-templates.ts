const STORAGE_KEY = "lab-report-user-theme-templates"

export type UserReportThemeTemplate = {
  id: string
  name: string
  primaryHex: string
  accentHex: string
  createdAt: string
}

function safeParse(raw: string | null): UserReportThemeTemplate[] {
  if (!raw) return []
  try {
    const a = JSON.parse(raw) as unknown
    if (!Array.isArray(a)) return []
    return a
      .filter(
        (x): x is UserReportThemeTemplate =>
          x != null &&
          typeof x === "object" &&
          typeof (x as UserReportThemeTemplate).id === "string" &&
          typeof (x as UserReportThemeTemplate).name === "string" &&
          typeof (x as UserReportThemeTemplate).primaryHex === "string" &&
          typeof (x as UserReportThemeTemplate).accentHex === "string"
      )
      .map((x) => ({
        ...x,
        createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
      }))
  } catch {
    return []
  }
}

export function readUserReportThemeTemplates(): UserReportThemeTemplate[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

export function writeUserReportThemeTemplates(items: UserReportThemeTemplate[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function addUserReportThemeTemplate(
  entry: Omit<UserReportThemeTemplate, "id" | "createdAt">
): UserReportThemeTemplate {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `t-${Date.now()}`
  const full: UserReportThemeTemplate = {
    id,
    name: entry.name.trim(),
    primaryHex: entry.primaryHex.trim(),
    accentHex: entry.accentHex.trim(),
    createdAt: new Date().toISOString(),
  }
  const next = [full, ...readUserReportThemeTemplates()].slice(0, 40)
  writeUserReportThemeTemplates(next)
  return full
}

export function deleteUserReportThemeTemplate(id: string) {
  writeUserReportThemeTemplates(readUserReportThemeTemplates().filter((t) => t.id !== id))
}
