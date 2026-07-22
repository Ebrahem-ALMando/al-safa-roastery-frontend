import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { BRAND_LOGO_ALT, BRAND_LOGO_PATH, BRAND_METADATA } from "@/lib/brand"

const ACCESS = "access_token"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: `بوابة دخول آمنة إلى ${BRAND_METADATA.title}`,
  robots: { index: false, follow: false },
  openGraph: {
    title: BRAND_METADATA.openGraph.title,
    description: BRAND_METADATA.openGraph.description,
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: 512,
        height: 512,
        alt: BRAND_LOGO_ALT,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [BRAND_LOGO_PATH],
  },
}

/**
 * If session exists, do not show login — go to the app shell.
 */
export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const c = await cookies()
  if (c.get(ACCESS)?.value) {
    redirect("/dashboard")
  }
  return <>{children}</>
}
