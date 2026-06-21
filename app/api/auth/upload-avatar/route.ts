import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"

type MeResponse = {
  data?: {
    id?: number
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) {
    return NextResponse.json(
      { status: 401, code: "UNAUTHENTICATED", message: "غير مصرح" },
      { status: 401 }
    )
  }

  const incoming = await request.formData()
  const file = incoming.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json(
      { status: 422, code: "VALIDATION_ERROR", message: "الملف مطلوب" },
      { status: 422 }
    )
  }

  const base = getLaravelBaseUrl()
  const meRes = await fetch(`${base}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const meJson = (await meRes.json().catch(() => null)) as MeResponse | null
  const userId = meJson?.data?.id
  if (!userId) {
    return NextResponse.json(
      { status: 401, code: "UNAUTHENTICATED", message: "تعذر تحديد المستخدم" },
      { status: 401 }
    )
  }

  const payload = new FormData()
  payload.append("files[]", file)
  payload.append("attachable_type", "user")
  payload.append("attachable_id", String(userId))
  payload.append("attachment_type", "avatar")

  const upstream = await fetch(`${base}/attachments`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  })

  const text = await upstream.text()
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  })
}
