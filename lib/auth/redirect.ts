/**
 * Prevent open redirects: only same-app relative paths.
 */
export function safeRedirectPath(from: string | null | undefined): string {
  if (!from) {
    return "/dashboard"
  }
  if (!from.startsWith("/") || from.startsWith("//")) {
    return "/dashboard"
  }
  if (from.startsWith("/api")) {
    return "/dashboard"
  }
  if (from.includes("\\")) {
    return "/dashboard"
  }
  return from
}
