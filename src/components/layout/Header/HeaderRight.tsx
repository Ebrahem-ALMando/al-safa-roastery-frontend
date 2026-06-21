"use client"

import type { LucideIcon } from "lucide-react"

interface HeaderRightProps {
  title: string
  icon: LucideIcon
}

export function HeaderRight({ title, icon: Icon }: HeaderRightProps) {
  const date = new Intl.DateTimeFormat("ar-SY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())

  return (
    <div className="flex min-w-0 flex-col items-start md:items-end gap-1">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h1 className="truncate text-base md:text-lg font-bold text-foreground">{title}</h1>
      </div>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  )
}
