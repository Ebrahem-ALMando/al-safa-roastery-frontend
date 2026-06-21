import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"

function isSecure(): boolean {
  return process.env.NODE_ENV === "production"
}

function clearTokenCookie(res: NextResponse) {
  res.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure() ? true : false,
    path: "/",
    maxAge: 0,
  })
}

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
  clearTokenCookie(res)
  return res
}
