import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

const ACCESS = "access_token"

export const metadata: Metadata = {
  title: "تسجيل الدخول | نظام إدارة المختبرات",
  description: "بوابة دخول آمنة لنظام إدارة المختبرات الطبية",
  robots: { index: false, follow: false },
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
