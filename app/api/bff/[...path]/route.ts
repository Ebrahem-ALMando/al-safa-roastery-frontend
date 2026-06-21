import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getLaravelBaseUrl } from "@/lib/config/apiConfig"

export const runtime = "nodejs"

async function forward(
  request: NextRequest,
  pathSegments: string[]
): Promise<Response> {
  if (pathSegments.length === 0) {
    return NextResponse.json(
      { status: 400, code: "BFF_PATH_MISSING", message: "المسار غير صالح" },
      { status: 400 }
    )
  }

  const base = getLaravelBaseUrl()
  const path = pathSegments.join("/")
  const target = `${base}/${path}${request.nextUrl.search}`

  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  let body: ArrayBuffer | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    const buf = await request.arrayBuffer()
    body = buf.byteLength > 0 ? buf : undefined
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers["Content-Type"] = contentType
  }

  try {
    return await fetch(target, {
      method: request.method,
      headers,
      body,
    })
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    return new Response(
      JSON.stringify({
        status: 503,
        code: "BFF_UPSTREAM_UNREACHABLE",
        message: "تعذر الاتصال بالخادم",
        data: { detail },
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }
}

type RouteContext = { params: Promise<{ path: string[] }> }

/** Strip UTF-8 BOM from JSON upstream bodies before forwarding to the browser. */
function stripBomFromJsonBuffer(buf: ArrayBuffer, contentType: string | null): ArrayBuffer {
  if (!contentType?.includes("application/json") || buf.byteLength === 0) {
    return buf
  }
  const text = new TextDecoder().decode(buf)
  const stripped = text.replace(/^\uFEFF+/, "")
  if (stripped === text) {
    return buf
  }
  return new Uint8Array(new TextEncoder().encode(stripped)).buffer
}

function toNextResponse(upstream: Response): Promise<NextResponse> {
  return upstream.arrayBuffer().then((buf) => {
    const ct = upstream.headers.get("content-type")
    const bodyBuf = stripBomFromJsonBuffer(buf, ct)
    const outHeaders: Record<string, string> = {}
    if (ct) {
      outHeaders["Content-Type"] = ct
    }
    const cd = upstream.headers.get("content-disposition")
    if (cd) {
      outHeaders["Content-Disposition"] = cd
    }
    return new NextResponse(bodyBuf.byteLength > 0 ? bodyBuf : null, {
      status: upstream.status,
      headers: outHeaders,
    })
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params
  const upstream = await forward(request, pathSegments)
  return toNextResponse(upstream)
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params
  const upstream = await forward(request, pathSegments)
  return toNextResponse(upstream)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params
  const upstream = await forward(request, pathSegments)
  return toNextResponse(upstream)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params
  const upstream = await forward(request, pathSegments)
  return toNextResponse(upstream)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path: pathSegments } = await context.params
  const upstream = await forward(request, pathSegments)
  return toNextResponse(upstream)
}
