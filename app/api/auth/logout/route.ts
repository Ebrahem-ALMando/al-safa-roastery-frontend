import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"
import { clearAccessTokenCookie } from "@/lib/server/authCookie"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const base = getLaravelBaseUrl()

  if (token) {
    try {
      await fetch(`${base}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Still clear the cookie so the client session cannot be reused.
    }
  }

  const res = NextResponse.json(
    {
      status: 200,
      code: "AUTH_LOGOUT_SUCCESS",
      message: "تم تسجيل الخروج بنجاح.",
      data: {},
    },
    { status: 200 }
  )
  clearAccessTokenCookie(res)
  return res
}
