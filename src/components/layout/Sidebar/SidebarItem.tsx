"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
  href: string
  label: string
  icon: LucideIcon
  isActive?: boolean
  collapsed?: boolean
  onNavigate?: () => void
  comingSoon?: boolean
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  collapsed = false,
  onNavigate,
  comingSoon = false,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative w-full flex items-center rounded-lg text-right cursor-pointer",
        "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
        "hover:translate-x-[-4px] hover:shadow-md",
        isActive
          ? "bg-primary/20  text-primary  font-semibold shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive ? (
        <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-primary " />
      ) : null}

      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 transition-all duration-300",
          isActive
            ? "text-primary "
            : "text-sidebar-foreground group-hover:text-primary "
        )}
      >
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Icon className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      </div>

      {!collapsed ? (
        <span className="flex flex-1 items-center gap-2 truncate text-sm">
          <span className="truncate">{label}</span>
          {comingSoon ? (
            <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              قريباً
            </span>
          ) : null}
        </span>
      ) : null}

      {collapsed ? (
        <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block">
          {label}
        </span>
      ) : null}
    </Link>
  )
}
