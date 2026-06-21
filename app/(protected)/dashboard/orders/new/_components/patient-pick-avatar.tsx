"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getPersonInitials } from "@/lib/person-initials"

const avatarFallbackClass =
  "rounded-full border border-sky-200/90 bg-[#e8f4fc] text-sm font-semibold tracking-tight text-sky-800 shadow-inner shadow-sky-100/80 dark:border-sky-800/55 dark:bg-sky-950/45 dark:text-sky-100 dark:shadow-none"

export function PatientPickAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = getPersonInitials(name)
  const dim = size === "sm" ? "size-10 text-xs" : "size-12 text-sm"
  return (
    <Avatar className={cn("shrink-0 ring-2 ring-sky-200/40 ring-offset-2 ring-offset-background dark:ring-sky-800/50", dim)}>
      <AvatarFallback className={cn(avatarFallbackClass, "font-semibold")}>{initials}</AvatarFallback>
    </Avatar>
  )
}
