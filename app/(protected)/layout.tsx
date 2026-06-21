import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppShell } from "@/src/components/layout/AppShell"

const ACCESS = "access_token"

/**
 * Fallback server guard (primary check is `proxy.ts`). HttpOnly `access_token`.
 */
export default async function ProtectedGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  if (!cookieStore.get(ACCESS)?.value) {
    redirect("/login")
  }
  return <AppShell>{children}</AppShell>
}
