import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer-core"
import { resolveChromiumExecutable } from "@/lib/chromium-executable"

export const runtime = "nodejs"
export const maxDuration = 120

function resolvePrintUrl(request: NextRequest, id: string): string {
  const explicit = process.env.PDF_RENDER_BASE_URL?.replace(/\/$/, "")
  const prefs = request.nextUrl.searchParams.get("prefs")
  const qs = prefs ? `?prefs=${encodeURIComponent(prefs)}` : ""
  if (explicit) {
    return `${explicit}/print/report/${encodeURIComponent(id)}${qs}`
  }
  const u = new URL(request.url)
  /** تجنّب تعارض IPv4/IPv6 مع localhost عند فتح الخادم من Chromium */
  if (u.hostname === "localhost") {
    u.hostname = "127.0.0.1"
  }
  return `${u.origin}/print/report/${encodeURIComponent(id)}${qs}`
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 })
  }

  const printUrl = resolvePrintUrl(request, id)

  const executablePath = resolveChromiumExecutable()
  if (!executablePath) {
    return NextResponse.json(
      {
        error: "no_chromium",
        message:
          "لم يُعثر على Chrome أو Edge. ثبّت أحدهما أو عيّن المتغير PUPPETEER_EXECUTABLE_PATH لمسار chrome.exe أو msedge.exe",
      },
      { status: 503 }
    )
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
    ],
  })

  try {
    const page = await browser.newPage()
    await page.emulateMediaType("print")
    /** `networkidle0` لا يصل أحياناً مع HMR في وضع التطوير */
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 })
    await page.goto(printUrl, { waitUntil: "load", timeout: 90_000 })
    /** بدون `visible: true` — في headless قد لا يُعتبر العنصر «ظاهراً» رغم وجوده في DOM */
    await page.waitForSelector("#report-print-surface", { timeout: 45_000 })
    await new Promise<void>((r) => setTimeout(r, 500))
    await page.evaluate(() => document.fonts?.ready)

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    })

    /** نسخ صريحة إلى Uint8Array لضمان تسليم ثنائي صحيح لـ NextResponse */
    const bytes = new Uint8Array(pdf)
    const header = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0)
    if (bytes.length < 8 || header !== "%PDF") {
      throw new Error(`خرج غير PDF صالح (${bytes.length} بايت)`)
    }

    const filename = `report-${id.replace(/[^\w.-]+/g, "_")}.pdf`

    /** `?format=json` — يعيد JSON + base64 بدل ملف PDF مباشرة؛ يقلّل اعتراض Internet Download Manager للطلب */
    const url = new URL(request.url)
    if (url.searchParams.get("format") === "json") {
      return NextResponse.json(
        {
          filename,
          pdfBase64: Buffer.from(bytes).toString("base64"),
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }
      )
    }

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "pdf_render_failed", message }, { status: 500 })
  } finally {
    await browser.close()
  }
}
