"use client"

import { mutate as globalMutate } from "swr"
import { SESSION_EXPIRED_MESSAGE_AR } from "./messages"

export { SESSION_EXPIRED_MESSAGE_AR }

let redirectInFlight: Promise<void> | null = null
let redirectStarted = false

const SESSION_EXPIRED_PATH = "/login?reason=session_expired"

/** Public auth endpoints must not trigger a global session-expired redirect. */
export function isSessionExpiryProtectedRequest(url: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const path = new URL(url, window.location.origin).pathname
    if (path === "/api/auth/login") return false
    return path.startsWith("/api/bff/") || path.startsWith("/api/auth/")
  } catch {
    return false
  }
}

/**
 * Single-flight session expiry flow: clear SWR cache once, then redirect once.
 * Safe to call from parallel 401 responses.
 */
export function handleSessionExpired(): void {
  if (typeof window === "undefined") return
  if (redirectStarted) return
  if (window.location.pathname.startsWith("/login")) return

  if (!redirectInFlight) {
    redirectInFlight = (async () => {
      redirectStarted = true
      try {
        await globalMutate(() => true, undefined, { revalidate: false })
      } catch {
        // Cache clear is best-effort; redirect still proceeds.
      }
      window.location.replace(SESSION_EXPIRED_PATH)
    })()
  }
}
