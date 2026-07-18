"use client"

import { Eye, ListChecks, MinusCircle, SlidersHorizontal } from "lucide-react"
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

export type InventoryRowActionCallbacks = {
  onDetails: () => void
  onMovements: () => void
  onWithdraw: () => void
  onAdjust: () => void
}

const actions = (callbacks: InventoryRowActionCallbacks) => [
  { label: "عرض التفاصيل", icon: Eye, run: callbacks.onDetails, className: "text-sky-700" },
  { label: "عرض كل الحركات", icon: ListChecks, run: callbacks.onMovements, className: "text-sky-700" },
  { label: "سحب كمية", icon: MinusCircle, run: callbacks.onWithdraw, className: "text-rose-700" },
  { label: "تسوية المخزون", icon: SlidersHorizontal, run: callbacks.onAdjust, className: "text-amber-700" },
]

export function InventoryRowActionsMenuContent(props: InventoryRowActionCallbacks) {
  return (
    <DropdownMenuContent align="end" className="min-w-52 text-right" data-dir="rtl">
      {actions(props).map((action, index) => (
        <div key={action.label}>
          {index === 2 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem className={`flex-row-reverse justify-start gap-2 ${action.className}`} onClick={(event) => { event.stopPropagation(); action.run() }}>
            <action.icon className="size-4" />{action.label}
          </DropdownMenuItem>
        </div>
      ))}
    </DropdownMenuContent>
  )
}

export function InventoryRowContextMenuContent(props: InventoryRowActionCallbacks) {
  return (
    <ContextMenuContent className="min-w-52 text-right" data-dir="rtl">
      {actions(props).map((action, index) => (
        <div key={action.label}>
          {index === 2 ? <ContextMenuSeparator /> : null}
          <ContextMenuItem className={`flex-row-reverse justify-start gap-2 ${action.className}`} onSelect={action.run}>
            <action.icon className="size-4" />{action.label}
          </ContextMenuItem>
        </div>
      ))}
    </ContextMenuContent>
  )
}
