"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react"
import { useAuth, useAuthActions } from "@/src/features/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserProfile } from "../UserProfile"
import { menuItems } from "./menuItems"
import { SidebarItem } from "./SidebarItem"
import { LAB_LOGO_PATH } from "@/lib/lab-brand"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function isItemActive(pathname: string, href: string, matchPrefix?: boolean) {
  if (matchPrefix) return pathname === href || pathname.startsWith(`${href}/`)
  return pathname === href
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { logout } = useAuthActions()

  const visibleItems = useMemo(() => {
    const role = user?.role
    return menuItems.filter((item) => !item.hiddenForRoles?.includes(role ?? ""))
  }, [user?.role])

  const grouped = useMemo(() => {
    return {
      main: visibleItems.filter((item) => item.section === "main"),
      management: visibleItems.filter((item) => item.section !== "main"),
    }
  }, [visibleItems])

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-40 flex h-dvh flex-col border-l border-sidebar-border bg-sidebar transition-all duration-300 print:hidden",
          collapsed ? "md:w-20" : "md:w-[260px]",
          "w-[260px]",
          isOpen ? "translate-x-0" : "translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className={cn("flex items-center border-b border-sidebar-border p-3 md:hidden", collapsed ? "justify-center" : "justify-end")}>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* <div
          className={cn(
            "border-b border-sidebar-border px-3 py-2.5",
            collapsed ? "flex justify-center" : "flex justify-center md:justify-start"
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-sidebar-border/80 bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white dark:bg-white/95 dark:hover:bg-white",
              collapsed ? "justify-center" : "w-full max-w-full"
            )}
            onClick={onClose}
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <Image src={LAB_LOGO_PATH} alt="" width={36} height={36} className="object-contain" priority />
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1 text-right leading-tight">
                <span className="block truncate text-[13px] font-bold text-sidebar-foreground">مختبر التحاليل الطبية</span>
                <span className="block truncate text-[10px] font-medium text-muted-foreground">نظام الإدارة</span>
              </span>
            ) : null}
          </Link>
        </div> */}

        <UserProfile
          name={user?.name}
          avatar={user?.avatar_url}
          role={user?.role}
          isLoading={isLoading}
          collapsed={collapsed}
        />

        <nav className={cn("flex-1 overflow-y-auto p-3", collapsed ? "space-y-4" : "space-y-5")}>
          <div className="space-y-1">
            {grouped.main.map((item) => (
              <SidebarItem
                key={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isItemActive(pathname, item.href, item.matchPrefix)}
                collapsed={collapsed}
                onNavigate={onClose}
              />
            ))}
          </div>

          {grouped.management.length > 0 ? (
            <div className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[11px] font-semibold text-muted-foreground">الإدارة</p>
              ) : null}
              {grouped.management.map((item) => (
                <SidebarItem
                  key={item.id}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isItemActive(pathname, item.href, item.matchPrefix)}
                  collapsed={collapsed}
                  onNavigate={onClose}
                />
              ))}
            </div>
          ) : null}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            title={collapsed ? "تسجيل الخروج" : undefined}
            className={cn(
              "w-full transition-all duration-300 text-destructive hover:bg-destructive/10 hover:text-destructive",
              collapsed ? "justify-center px-2" : "justify-start gap-2"
            )}
            onClick={async () => {
              try {
                await logout()
              } finally {
                router.replace("/login")
                onClose()
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed ? <span>تسجيل الخروج</span> : null}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "mt-2 hidden w-full transition-all duration-300 md:flex",
              collapsed ? "justify-center" : "justify-start gap-2"
            )}
            onClick={onToggleCollapse}
            title={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {!collapsed ? <span>طي القائمة</span> : null}
          </Button>
        </div>
      </aside>
    </>
  )
}
