"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getRoleConfig, type UserRole } from "./roleConfig"

interface UserProfileProps {
  name?: string
  avatar?: string | null
  role?: UserRole
  isLoading?: boolean
  collapsed?: boolean
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "U"
}

export function UserProfile({
  name = "مستخدم النظام",
  avatar = null,
  role,
  isLoading = false,
  collapsed = false,
}: UserProfileProps) {
  if (isLoading) {
    return (
      <div className={cn("border-b border-sidebar-border p-4", collapsed && "px-2")}>
        <div className="animate-pulse space-y-3">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted" />
          {!collapsed ? <div className="mx-auto h-4 w-28 rounded bg-muted" /> : null}
          {!collapsed ? <div className="mx-auto h-7 w-24 rounded-md bg-muted" /> : null}
        </div>
      </div>
    )
  }

  const roleConfig = getRoleConfig(role)
  const RoleIcon = roleConfig.icon

  return (
    <div className={cn("border-b border-sidebar-border p-4 animate-in fade-in slide-in-from-top-1 duration-300", collapsed && "px-2")}>
      <div className="flex flex-col items-center gap-2.5">
        <div className="group relative">
          <div className="absolute inset-[-3px] rounded-full bg-primary/20 blur-md opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center justify-center">
            {/* خلفية جمالية متدرجة وحواف زجاجية */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/70 via-violet-400/40 to-teal-300/30 blur-[4px] opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl" />
            <div className="relative rounded-full bg-white/80 dark:bg-sidebar/60 backdrop-blur-md shadow-lg ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 h-20 w-20 sm:h-28 sm:w-28 border-2 border-white dark:border-sidebar">
              <Avatar
                className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(.45,1.7,.67,1)] group-hover:scale-[1.09]"
              >
                {avatar ? (
                  <AvatarImage
                    src={avatar}
                    alt={name}
                    className="rounded-full object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-sky-500 text-white text-lg font-bold rounded-full flex items-center justify-center transition-all duration-300 shadow-md">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              {/* دائرة زخرفية صغيرة متحركة لجمالية إضافية */}
              <span className="absolute bottom-1 end-1 h-3 w-3 rounded-full bg-gradient-to-tr from-violet-400 via-sky-400 to-teal-400 border-2 border-white dark:border-sidebar shadow-lg animate-pulse" />
            </div>
          </div>
    
        </div>

        {!collapsed ? (
          <>
            <p className="text-sm font-semibold text-sidebar-foreground">{name}</p>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300",
                "shadow-sm hover:scale-105",
                roleConfig.className
              )}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{roleConfig.label}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-current/60 animate-pulse" />
            </div>
          </>
        ) : null}

        {collapsed ? (
          <span className="sr-only">{name}</span>
        ) : null}
      </div>
    </div>
  )
}
