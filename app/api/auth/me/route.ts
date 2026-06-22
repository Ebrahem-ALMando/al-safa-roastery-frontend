import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"
import { clearAccessTokenCookie } from "@/lib/server/authCookie"
import { LOGIN_REQUIRED_MESSAGE_AR, SESSION_EXPIRED_MESSAGE_AR } from "@/lib/auth/messages"
import { stripResponseBom } from "@/lib/api/parseApiResponse"

type LaravelMeJSON = {
  status?: number
  code?: string
  message?: string
  data?: unknown
}

function parseLaravelJson<T>(text: string): T | null {
  const normalized = stripResponseBom(text)
  if (!normalized) {
    return null
  }

  try {
    return JSON.parse(normalized) as T
  } catch {
    return null
  }
}

function extractUser(payload: LaravelMeJSON | null): unknown {
  if (!payload?.data || typeof payload.data !== "object") {
    return payload?.data
  }

  const data = payload.data as Record<string, unknown>
  return data.user ?? payload.data
}

function unauthenticatedResponse(message: string): NextResponse {
  const res = NextResponse.json(
    { status: 401, code: "UNAUTHENTICATED", message },
    { status: 401 }
  )
  clearAccessTokenCookie(res)
  return res
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) {
    return NextResponse.json(
      { status: 401, code: "UNAUTHENTICATED", message: LOGIN_REQUIRED_MESSAGE_AR },
      { status: 401 }
    )
  }

  const base = getLaravelBaseUrl()
  const upstream = await fetch(`${base}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await upstream.text()
  const parsed = parseLaravelJson<LaravelMeJSON>(text)

  if (upstream.status === 401) {
    const message =
      typeof parsed?.message === "string" && parsed.message.length > 0
        ? parsed.message
        : SESSION_EXPIRED_MESSAGE_AR
    return unauthenticatedResponse(message)
  }

  if (!upstream.ok || !parsed) {
    return NextResponse.json(
      parsed ?? {
        status: upstream.status,
        code: "AUTH_ME_FAILED",
        message: "تعذر تحميل بيانات الجلسة.",
      },
      { status: upstream.status }
    )
  }

  return NextResponse.json(
    {
      status: parsed.status ?? upstream.status,
      message: parsed.message ?? "Success",
      data: {
        user: extractUser(parsed),
      },
    },
    { status: upstream.status }
  )
}
