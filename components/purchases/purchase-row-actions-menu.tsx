"use client"

import type { MouseEvent } from "react"
import { Ban, Eye, Pencil, Printer, Trash2 } from "lucide-react"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { PurchaseInvoice } from "@/features/purchases"

const itemClass =
  "flex w-full flex-row-reverse items-center justify-start gap-2 text-right focus:text-inherit"

type PurchaseRowActionsMenuContentProps = {
  purchase: PurchaseInvoice
  onViewDetails: () => void
  onEdit?: () => void
  onPrint?: () => void
  onCancel?: () => void
  onDelete?: () => void
  stopPropagation?: boolean
}

function stopIfNeeded(event: MouseEvent, stopPropagation: boolean) {
  if (stopPropagation) {
    event.stopPropagation()
  }
}

export function PurchaseRowActionsMenuContent({
  purchase,
  onViewDetails,
  onEdit,
  onPrint,
  onCancel,
  onDelete,
  stopPropagation = false,
}: PurchaseRowActionsMenuContentProps) {
  const isDraft = purchase.status === "draft"
  const isCompleted = purchase.status === "completed"
  const isCancelled = purchase.status === "cancelled"
  const canPrint = isCompleted || isCancelled

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

      {isDraft && onEdit ? (
        <DropdownMenuItem
          className={cn(
            itemClass,
            "text-emerald-800 focus:bg-emerald-50 focus:text-emerald-900 dark:text-emerald-200 dark:focus:bg-emerald-950/40"
          )}
          onClick={(event) => {
            stopIfNeeded(event, stopPropagation)
            onEdit()
          }}
        >
          <Pencil className="size-4 text-emerald-600 dark:text-emerald-300" />
          تعديل المسودة
        </DropdownMenuItem>
      ) : null}

      {canPrint && onPrint ? (
        <DropdownMenuItem
          className={cn(
            itemClass,
            "text-violet-800 focus:bg-violet-50 focus:text-violet-900 dark:text-violet-200 dark:focus:bg-violet-950/40"
          )}
          onClick={(event) => {
            stopIfNeeded(event, stopPropagation)
            onPrint()
          }}
        >
          <Printer className="size-4 text-violet-600 dark:text-violet-300" />
          طباعة الفاتورة
        </DropdownMenuItem>
      ) : null}

      {isCompleted && onCancel ? (
        <DropdownMenuItem
          className={cn(
            itemClass,
            "text-orange-800 focus:bg-orange-50 focus:text-orange-900 dark:text-orange-200 dark:focus:bg-orange-950/40"
          )}
          onClick={(event) => {
            stopIfNeeded(event, stopPropagation)
            onCancel()
          }}
        >
          <Ban className="size-4 text-orange-600 dark:text-orange-300" />
          إلغاء الفاتورة
        </DropdownMenuItem>
      ) : null}

      {isDraft && onDelete ? (
        <>
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
            حذف المسودة
          </DropdownMenuItem>
        </>
      ) : null}
    </DropdownMenuContent>
  )
}
