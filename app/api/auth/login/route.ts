import { NextRequest, NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"

type LoginRequestBody = {
  username?: string
  password?: string
}

type LaravelLoginJSON = {
  status?: number
  code?: string
  message?: string
  data?: { user?: unknown; token?: string }
}

function isSecure(): boolean {
  return process.env.NODE_ENV === "production"
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

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as LoginRequestBody | null
  if (!body?.username || !body?.password) {
    return NextResponse.json(
      {
        status: 422,
        code: "VALIDATION_ERROR",
        message: "اسم المستخدم وكلمة المرور مطلوبان.",
      },
      { status: 422 }
    )
  }

  const base = getLaravelBaseUrl()
  const upstream = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: body.username,
      password: body.password,
      device_name: "nextjs-web",
    }),
  })

  const text = await upstream.text()
  const parsed = parseLaravelJson<LaravelLoginJSON>(text)

  if (!upstream.ok || !parsed) {
    return new NextResponse(text || null, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    })
  }

  const token = parsed.data?.token
  const user = parsed.data?.user
  if (!token || user === undefined) {
    return NextResponse.json(
      {
        status: parsed.status ?? upstream.status,
        code: parsed.code ?? "AUTH_INVALID_CREDENTIALS",
        message: parsed.message ?? "تعذر تسجيل الدخول.",
        data: parsed.data ?? null,
      },
      { status: upstream.status }
    )
  }

  const res = NextResponse.json(
    {
      status: parsed.status ?? upstream.status,
      code: parsed.code ?? "AUTH_LOGIN_SUCCESS",
      message: parsed.message ?? "تم تسجيل الدخول بنجاح.",
      data: { user },
    },
    { status: upstream.status }
  )

  res.cookies.set("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure() ? true : false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
