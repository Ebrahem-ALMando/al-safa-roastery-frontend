"use client"

import type { MouseEvent } from "react"
import {
  Eye,
  FileText,
  Pencil,
  Power,
  ScrollText,
  Trash2,
} from "lucide-react"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Customer } from "@/features/customers"

const itemClass =
  "flex w-full flex-row-reverse items-center justify-start gap-2 text-right focus:text-inherit"

type CustomerRowActionsMenuContentProps = {
  customer: Customer
  onViewDetails: () => void
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
  stopPropagation?: boolean
}

function stopIfNeeded(event: MouseEvent, stopPropagation: boolean) {
  if (stopPropagation) {
    event.stopPropagation()
  }
}

export function CustomerRowActionsMenuContent({
  customer,
  onViewDetails,
  onEdit,
  onToggleActive,
  onDelete,
  stopPropagation = false,
}: CustomerRowActionsMenuContentProps) {
  const isActive = customer.is_active

  return (
    <DropdownMenuContent align="end" className="min-w-52 text-right">
      <DropdownMenuItem
        className={cn(
          itemClass,
          "text-sky-800 focus:bg-sky-50 focus:text-sky-900 dark:text-sky-200 dark:focus:bg-sky-950/40"
        )}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation)
          onViewDetails()
        }}
      >
        <Eye className="size-4 text-sky-600 dark:text-sky-300" />
        عرض التفاصيل
      </DropdownMenuItem>

      <DropdownMenuItem
        className={cn(
          itemClass,
          "text-violet-800 focus:bg-violet-50 focus:text-violet-900 dark:text-violet-200 dark:focus:bg-violet-950/40"
        )}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation)
          onEdit()
        }}
      >
        <Pencil className="size-4 text-violet-600 dark:text-violet-300" />
        تعديل
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled
        className={cn(
          itemClass,
          "text-amber-800/70 focus:bg-amber-50/80 dark:text-amber-200/70 dark:focus:bg-amber-950/30"
        )}
      >
        <FileText className="size-4 text-amber-600/70 dark:text-amber-300/70" />
        إنشاء فاتورة
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled
        className={cn(
          itemClass,
          "text-teal-800/70 focus:bg-teal-50/80 dark:text-teal-200/70 dark:focus:bg-teal-950/30"
        )}
      >
        <ScrollText className="size-4 text-teal-600/70 dark:text-teal-300/70" />
        كشف حساب
      </DropdownMenuItem>

      <DropdownMenuItem
        className={cn(
          itemClass,
          isActive
            ? "text-orange-800 focus:bg-orange-50 focus:text-orange-900 dark:text-orange-200 dark:focus:bg-orange-950/40"
            : "text-emerald-800 focus:bg-emerald-50 focus:text-emerald-900 dark:text-emerald-200 dark:focus:bg-emerald-950/40"
        )}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation)
          onToggleActive()
        }}
      >
        <Power
          className={cn(
            "size-4",
            isActive ? "text-orange-600 dark:text-orange-300" : "text-emerald-600 dark:text-emerald-300"
          )}
        />
        {isActive ? "إيقاف" : "تفعيل"}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        variant="destructive"
        className={cn(
          itemClass,
          "text-rose-700 focus:bg-rose-50 focus:text-rose-800 dark:text-rose-300 dark:focus:bg-rose-950/40"
        )}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation)
          onDelete()
        }}
      >
        <Trash2 className="size-4 text-rose-600 dark:text-rose-300" />
        حذف
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
