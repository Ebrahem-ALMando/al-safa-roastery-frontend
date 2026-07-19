"use client"

import { Ban, CheckCircle2, Eye, Pencil, Trash2 } from "lucide-react"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ProductionBatch } from "@/src/features/production"

const itemClass = "flex w-full flex-row-reverse items-center justify-start gap-2 text-right"
export function ProductionRowActionsMenu({ batch, onView, onEdit, onComplete, onCancel, onDelete }: { batch: ProductionBatch; onView: () => void; onEdit?: () => void; onComplete?: () => void; onCancel?: () => void; onDelete?: () => void }) {
  return (
    <DropdownMenuContent align="end" className="min-w-52 text-right" onClick={(event) => event.stopPropagation()}>
      <DropdownMenuItem className={cn(itemClass, "text-sky-800")} onClick={onView}><Eye className="size-4 text-sky-600" />عرض التفاصيل</DropdownMenuItem>
      {batch.status === "draft" && onEdit ? <DropdownMenuItem className={cn(itemClass, "text-sky-800")} onClick={onEdit}><Pencil className="size-4 text-sky-600" />تعديل</DropdownMenuItem> : null}
      {batch.status === "draft" && onComplete ? <DropdownMenuItem className={cn(itemClass, "text-emerald-800")} onClick={onComplete}><CheckCircle2 className="size-4 text-emerald-600" />اعتماد</DropdownMenuItem> : null}
      {batch.status === "completed" && onCancel ? <DropdownMenuItem className={cn(itemClass, "text-amber-800")} onClick={onCancel}><Ban className="size-4 text-amber-600" />إلغاء العملية</DropdownMenuItem> : null}
      {batch.status === "draft" && onDelete ? <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" className={itemClass} onClick={onDelete}><Trash2 className="size-4" />حذف المسودة</DropdownMenuItem></> : null}
    </DropdownMenuContent>
  )
}
