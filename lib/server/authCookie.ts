import { NextResponse } from "next/server"

export function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production"
}

/** Clears the httpOnly Sanctum session cookie on the BFF / auth routes. */
export function clearAccessTokenCookie(res: NextResponse): void {
  res.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 0,
  })
}
