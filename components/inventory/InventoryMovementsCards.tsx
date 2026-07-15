"use client"

import { Move3d } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ADJUSTMENT_REASON_LABELS_AR, formatInventoryDate, formatInventoryQuantity, type InventoryMovement, type InventoryPaginationMeta, WITHDRAWAL_REASON_LABELS_AR } from "@/src/features/inventory"
import { InventoryDirectionBadge } from "./InventoryDirectionBadge"
import { InventoryMovementTypeBadge } from "./InventoryMovementTypeBadge"

export function InventoryMovementsCards({ movements, meta, isLoading, page, onPageChange }: { movements: InventoryMovement[]; meta?: InventoryPaginationMeta; isLoading: boolean; page: number; onPageChange: (page: number) => void }) {
  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80 rounded-2xl" />)}</div>
  if (movements.length === 0) return <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground"><Move3d className="size-10" />لا توجد حركات مخزون ضمن الفلاتر الحالية.</div>
  const lastPage = meta?.last_page ?? 1
  return <div className="space-y-4"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{movements.map((movement) => { const note = movementNote(movement); return <Card key={movement.id} className="overflow-hidden rounded-2xl transition hover:border-primary/30 hover:shadow-md"><CardHeader className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><InventoryMovementTypeBadge label={movement.movement_label_ar} /><InventoryDirectionBadge direction={movement.direction} /></div><div><h3 className="font-bold">{movement.item?.name || "صنف غير متاح"}</h3><p className="font-mono text-xs text-muted-foreground" dir="ltr">{movement.item?.code || "—"}</p></div></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm"><Info label="التاريخ" value={formatInventoryDate(movement.movement_date, true)} /><Info label="المرجع" value={movement.source_number || "—"} ltr /><Info label="الوارد" value={movement.direction === "in" ? formatInventoryQuantity(movement.quantity_kg) : "—"} ltr /><Info label="الصادر" value={movement.direction === "out" ? formatInventoryQuantity(movement.quantity_kg) : "—"} ltr /><Info label="الرصيد بعد الحركة" value={movement.balance_after_kg == null ? "غير متاح" : formatInventoryQuantity(movement.balance_after_kg)} ltr /><Info label="المستخدم" value={movement.created_by?.name || "—"} /><div className="col-span-2 rounded-xl border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">ملاحظات</p><p className="mt-1 line-clamp-2" title={note || undefined}>{note || "—"}</p></div></CardContent></Card> })}</div>{lastPage > 1 ? <div className="flex justify-center gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</Button><Button variant="outline" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>التالي</Button></div> : null}</div>
}

function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return <div className="rounded-xl border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold" dir={ltr ? "ltr" : undefined}>{value}</p></div>
}

function movementNote(movement: InventoryMovement) {
  const reason = movement.reason
    ? WITHDRAWAL_REASON_LABELS_AR[movement.reason as keyof typeof WITHDRAWAL_REASON_LABELS_AR]
      ?? ADJUSTMENT_REASON_LABELS_AR[movement.reason as keyof typeof ADJUSTMENT_REASON_LABELS_AR]
      ?? movement.reason
    : null
  return [reason, movement.notes].filter(Boolean).join(" · ")
}
