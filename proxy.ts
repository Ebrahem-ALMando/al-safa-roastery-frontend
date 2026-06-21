import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ACCESS_COOKIE = "access_token"

/**
 * Public paths: no session required. All other app paths require `access_token`
 * (opt-out model — new top-level routes stay protected by default).
 */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/favicon.ico") return true
  if (pathname === "/api" || pathname.startsWith("/api/")) return true
  if (pathname.startsWith("/_next/") || pathname === "/_next") return true
  if (pathname.startsWith("/login")) return true
  if (pathname.startsWith("/verify")) return true
  if (pathname.startsWith("/print")) return true
  if (/\.(ico|png|jpg|jpeg|svg|gif|webp|txt|webmanifest|xml|json|woff2?|pdf|map)$/i.test(pathname)) {
    return true
  }
  return false
}

/**
 * Central session gate. `(protected)/layout` remains a second server check only.
 * No refresh-token logic; `access_token` is the only cookie checked.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!request.cookies.get(ACCESS_COOKIE)?.value) {
    const original = `${pathname}${search}`
    const login = new URL("/login", request.url)
    login.searchParams.set("from", original)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

/**
 * Skip `/_next/*`, `/api/*`, assets with extensions, and favicon so the BFF and
 * static pipeline are untouched. `"/"` is explicit (the common block often omits root).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
 */
export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*$).*)",
  ],
}
