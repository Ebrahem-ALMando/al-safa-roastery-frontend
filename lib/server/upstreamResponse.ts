import { NextResponse } from "next/server"
import { stripResponseBom } from "@/lib/api/parseApiResponse"
import { clearAccessTokenCookie } from "./authCookie"

function jsonContentType(contentType: string | null): boolean {
  if (!contentType) return false
  return contentType.includes("application/json") || contentType.includes("+json")
}

function withUtf8Charset(contentType: string): string {
  if (contentType.includes("charset=")) return contentType
  if (contentType.includes("application/json")) return "application/json; charset=utf-8"
  return contentType
}

/**
 * Forward an upstream Laravel response to the browser while preserving UTF-8 JSON.
 * On HTTP 401, clears the `access_token` cookie so stale sessions cannot linger.
 */
export async function upstreamToNextResponse(upstream: Response): Promise<NextResponse> {
  const contentType = upstream.headers.get("content-type")
  const buf = await upstream.arrayBuffer()

  if (buf.byteLength > 0 && jsonContentType(contentType)) {
    const text = stripResponseBom(new TextDecoder("utf-8").decode(buf))
    if (text) {
      try {
        const parsed = JSON.parse(text) as unknown
        const res = NextResponse.json(parsed, { status: upstream.status })
        if (upstream.status === 401) {
          clearAccessTokenCookie(res)
        }
        return res
      } catch {
        // Fall through to raw bytes when upstream JSON is malformed.
      }
    }
  }

  const outHeaders: Record<string, string> = {}
  if (contentType) {
    outHeaders["Content-Type"] = withUtf8Charset(contentType)
  }
  const cd = upstream.headers.get("content-disposition")
  if (cd) {
    outHeaders["Content-Disposition"] = cd
  }

  const res = new NextResponse(buf.byteLength > 0 ? buf : null, {
    status: upstream.status,
    headers: outHeaders,
  })

  if (upstream.status === 401) {
    clearAccessTokenCookie(res)
  }

  return res
}
