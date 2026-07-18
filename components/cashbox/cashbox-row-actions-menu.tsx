"use client"

import { Eye } from "lucide-react"
import { ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu"
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export type CashboxRowActionCallbacks = {
  onDetails: () => void
}

export function CashboxRowActionsMenuContent({ onDetails }: CashboxRowActionCallbacks) {
  return (
    <DropdownMenuContent align="end" className="min-w-44 text-right" data-dir="rtl">
      <DropdownMenuItem
        className="flex-row-reverse justify-start gap-2 text-sky-700"
        onClick={(event) => {
          event.stopPropagation()
          onDetails()
        }}
      >
        <Eye className="size-4" />
        عرض التفاصيل
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export function CashboxRowContextMenuContent({ onDetails }: CashboxRowActionCallbacks) {
  return (
    <ContextMenuContent className="min-w-44 text-right" data-dir="rtl">
      <ContextMenuItem className="flex-row-reverse justify-start gap-2 text-sky-700" onSelect={onDetails}>
        <Eye className="size-4" />
        عرض التفاصيل
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
