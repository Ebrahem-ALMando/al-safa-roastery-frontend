"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getPersonInitials } from "@/lib/person-initials"

type OrderPersonCellProps = {
  name: string | null | undefined
  /** السطر الثاني: رقم المريض، اسم المستخدم، إلخ */
  secondary: string | null | undefined
  /** صورة الملف الشخصي (مثلاً من `requested_by_user.avatar_url`) */
  avatarUrl?: string | null
  /** حجم الأفتار: افتراضي مضغوط للجدول */
  size?: "sm" | "md"
  className?: string
}

export function OrderPersonCell({
  name,
  secondary,
  avatarUrl,
  size = "sm",
  className,
}: OrderPersonCellProps) {
  const displayName = name?.trim() ? name : "—"
  const sub = secondary?.trim() ? secondary : "—"
  const initials = getPersonInitials(displayName === "—" ? "" : displayName)

  const avatarSize =
    size === "md"
      ? "size-12 text-base"
      : "size-10 text-sm sm:size-11 sm:text-[15px]"

  const hasPhoto = Boolean(avatarUrl?.trim())

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)} dir="rtl">
      {hasPhoto ? (
        <Avatar className={cn("shrink-0 border border-sky-200/80 shadow-inner shadow-sky-100/60 dark:border-sky-800/55", avatarSize)}>
          <AvatarImage src={avatarUrl!} alt="" className="object-cover" />
          <AvatarFallback
            className={cn(
              "rounded-full border border-sky-200/90 bg-[#e8f4fc] font-semibold tracking-tight text-sky-800 dark:border-sky-800/55 dark:bg-sky-950/45 dark:text-sky-100",
              avatarSize
            )}
          >
            {displayName === "—" ? "؟" : initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border border-sky-200/90 bg-[#e8f4fc] font-semibold tracking-tight text-sky-800 shadow-inner shadow-sky-100/80 dark:border-sky-800/55 dark:bg-sky-950/45 dark:text-sky-100 dark:shadow-none",
            avatarSize
          )}
          aria-hidden
        >
          {displayName === "—" ? "؟" : initials}
        </div>
      )}
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-sm font-bold leading-tight text-foreground">{displayName}</p>
        <p
          className="truncate text-xs font-medium text-slate-500 dark:text-slate-400"
          dir="ltr"
          title={sub !== "—" ? sub : undefined}
        >
          {sub}
        </p>
      </div>
    </div>
  )
}
