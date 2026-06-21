import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"

type LaravelMeJSON = {
  status?: number
  code?: string
  message?: string
  data?: unknown
}

function stripBom(text: string): string {
  return text.replace(/^\uFEFF+/, "").trimStart()
}

function parseLaravelJson<T>(text: string): T | null {
  const normalized = stripBom(text)
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

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) {
    return NextResponse.json(
      { status: 401, code: "UNAUTHENTICATED", message: "??? ????" },
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
    return NextResponse.json(
      { status: 401, code: "UNAUTHENTICATED", message: "??? ????" },
      { status: 401 }
    )
  }

  if (!upstream.ok || !parsed) {
    return new NextResponse(text || null, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    })
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
