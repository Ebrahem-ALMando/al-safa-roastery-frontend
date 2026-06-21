import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) {
    return NextResponse.json(
      { status: 401, code: "UNAUTHENTICATED", message: "غير مصرح" },
      { status: 401 }
    )
  }

  const body = await request.text()
  const base = getLaravelBaseUrl()
  const upstream = await fetch(`${base}/auth/profile`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  const text = await upstream.text()
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  })
}
