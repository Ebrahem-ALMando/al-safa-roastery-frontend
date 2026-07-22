"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react"
import { useAuth, useAuthActions } from "@/src/features/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserProfile } from "../UserProfile"
import {
  menuItems,
  menuSectionLabels,
  menuSectionOrder,
  type MenuSection,
} from "./menuItems"
import { SidebarItem } from "./SidebarItem"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function isItemActive(
  pathname: string,
  href: string,
  matchPrefix?: boolean,
  excludedPrefixes: readonly string[] = []
) {
  if (excludedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false
  }
  if (matchPrefix) return pathname === href || pathname.startsWith(`${href}/`)
  return pathname === href
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { logout } = useAuthActions()

  const grouped = useMemo(() => {
    const role = user?.role
    const visibleItems = menuItems.filter((item) => !item.hiddenForRoles?.includes(role ?? ""))

    return menuSectionOrder.reduce(
      (acc, section) => {
        const items = visibleItems.filter((item) => item.section === section)
        if (items.length > 0) acc[section] = items
        return acc
      },
      {} as Partial<Record<MenuSection, typeof menuItems>>
    )
  }, [user?.role])

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] transition-opacity md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-40 flex h-dvh flex-col border-l border-sidebar-border bg-sidebar shadow-lg transition-all duration-300 ease-out print:hidden",
          collapsed ? "md:w-20" : "md:w-[260px]",
          "w-[260px]",
          isOpen ? "translate-x-0" : "translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-end border-b border-sidebar-border p-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق القائمة">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <UserProfile
          name={user?.name}
          avatar={user?.avatar_url}
          role={user?.role}
          isLoading={isLoading}
          collapsed={collapsed}
        />

        <nav className={cn("flex-1 overflow-y-auto p-3", collapsed ? "space-y-3" : "space-y-4")}>
          {menuSectionOrder.map((section) => {
            const items = grouped[section]
            if (!items?.length) return null

            return (
              <div key={section} className="space-y-1">
                {!collapsed ? (
                  <p className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground">
                    {menuSectionLabels[section]}
                  </p>
                ) : null}
                {items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isItemActive(
                      pathname,
                      item.href,
                      item.matchPrefix,
                      item.excludedPrefixes
                    )}
                    collapsed={collapsed}
                    onNavigate={onClose}
                    comingSoon={item.comingSoon}
                  />
                ))}
              </div>
            )
          })}
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
