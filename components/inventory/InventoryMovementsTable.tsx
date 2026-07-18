"use client"

import Link from "next/link"
import { Move3d } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ADJUSTMENT_REASON_LABELS_AR,
  formatInventoryCost,
  formatInventoryDate,
  formatInventoryMoney,
  formatInventoryQuantity,
  INVENTORY_MOVEMENT_TABLE_COLUMNS,
  INVENTORY_SOURCE_TYPE_LABELS_AR,
  sourceDetailsHref,
  type InventoryMovement,
  type InventoryMovementTableColumnId,
  type InventoryPaginationMeta,
  WITHDRAWAL_REASON_LABELS_AR,
} from "@/src/features/inventory"
import { InventoryDirectionBadge } from "./InventoryDirectionBadge"
import { InventoryMovementTypeBadge } from "./InventoryMovementTypeBadge"

type Props = {
  movements: InventoryMovement[]
  meta?: InventoryPaginationMeta
  visibleColumns: InventoryMovementTableColumnId[]
  isLoading: boolean
  page: number
  onPageChange: (page: number) => void
  emptyMessage?: string
}

export function InventoryMovementsTable({ movements, meta, visibleColumns, isLoading, page, onPageChange, emptyMessage = "لا توجد حركات مخزون ضمن الفلاتر الحالية." }: Props) {
  const perPage = meta?.per_page ?? 15
  const lastPage = meta?.last_page ?? 1

  function cell(column: InventoryMovementTableColumnId, movement: InventoryMovement, index: number) {
    const note = movementNote(movement)
    switch (column) {
      case "row_number": return (page - 1) * perPage + index + 1
      case "movement_date": return <span className="whitespace-nowrap text-xs">{formatInventoryDate(movement.movement_date, true)}</span>
      case "item": return movement.item ? <div className="min-w-40 text-right"><p className="font-semibold">{movement.item.name}</p><p className="font-mono text-xs text-muted-foreground" dir="ltr">{movement.item.code}</p></div> : <span>—</span>
      case "movement_type": return <InventoryMovementTypeBadge label={movement.movement_label_ar} />
      case "source": return <MovementSource movement={movement} />
      case "incoming": return movement.direction === "in" ? <span className="font-semibold text-emerald-700" dir="ltr">{formatInventoryQuantity(movement.quantity_kg)}</span> : <span>—</span>
      case "outgoing": return movement.direction === "out" ? <span className="font-semibold text-rose-700" dir="ltr">{formatInventoryQuantity(movement.quantity_kg)}</span> : <span>—</span>
      case "cost": return movement.unit_cost == null && movement.total_cost == null ? <span>—</span> : <div className="whitespace-nowrap text-xs" dir="ltr"><p>{movement.unit_cost == null ? "—" : formatInventoryCost(movement.unit_cost)}</p><p className="text-muted-foreground">الإجمالي: {movement.total_cost == null ? "—" : formatInventoryMoney(movement.total_cost)}</p></div>
      case "balance_after": return movement.balance_after_kg == null ? <span className="text-muted-foreground">غير متاح</span> : <span className="font-semibold" dir="ltr">{formatInventoryQuantity(movement.balance_after_kg)}</span>
      case "user": return movement.created_by?.name || "—"
      case "notes": return <p className="max-w-64 line-clamp-2 text-right" title={note || undefined}>{note || "—"}</p>
      case "direction": return <InventoryDirectionBadge direction={movement.direction} />
      case "source_type": return movement.source_type ? INVENTORY_SOURCE_TYPE_LABELS_AR[movement.source_type] ?? movement.source_type : "—"
      case "unit_cost": return movement.unit_cost == null ? "—" : <span dir="ltr">{formatInventoryCost(movement.unit_cost)}</span>
      case "total_cost": return movement.total_cost == null ? "—" : <span dir="ltr">{formatInventoryMoney(movement.total_cost)}</span>
      case "created_at": return <span className="whitespace-nowrap text-xs">{formatInventoryDate(movement.created_at, true)}</span>
      case "quantity": return <span className="font-semibold" dir="ltr">{formatInventoryQuantity(movement.quantity_kg)}</span>
      case "created_by": return movement.created_by?.name || "—"
      case "reason": return movementReason(movement) || "—"
    }
  }

  return (
    <div>
      {isLoading ? (
        <Table dir="rtl"><TableHeader><TableRow>{visibleColumns.map((id) => <TableHead key={id} className="text-center">{columnLabel(id)}</TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{visibleColumns.map((id) => <TableCell key={id}><Skeleton className="mx-auto h-5 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table>
      ) : movements.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground"><Move3d className="size-10" /><p>{emptyMessage}</p></div>
      ) : (
        <Table dir="rtl"><TableHeader><TableRow>{visibleColumns.map((id) => <TableHead key={id} className="whitespace-nowrap text-center font-semibold">{columnLabel(id)}</TableHead>)}</TableRow></TableHeader><TableBody>{movements.map((movement, index) => <TableRow key={movement.id}>{visibleColumns.map((column) => <TableCell key={column} className="text-center text-sm">{cell(column, movement, index)}</TableCell>)}</TableRow>)}</TableBody></Table>
      )}
      {!isLoading && movements.length > 0 && lastPage > 1 ? <div className="flex items-center justify-between border-t p-3"><p className="text-sm text-muted-foreground">{meta?.total ?? movements.length} حركة · صفحة {page} من {lastPage}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</Button><Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>التالي</Button></div></div> : null}
    </div>
  )
}

function columnLabel(id: InventoryMovementTableColumnId) {
  return INVENTORY_MOVEMENT_TABLE_COLUMNS.find((column) => column.id === id)?.label
}

function movementNote(movement: InventoryMovement) {
  const reason = movementReason(movement)
  return [reason, movement.notes].filter(Boolean).join(" · ")
}

function movementReason(movement: InventoryMovement) {
  return movement.reason
    ? WITHDRAWAL_REASON_LABELS_AR[movement.reason as keyof typeof WITHDRAWAL_REASON_LABELS_AR]
      ?? ADJUSTMENT_REASON_LABELS_AR[movement.reason as keyof typeof ADJUSTMENT_REASON_LABELS_AR]
      ?? movement.reason
    : null
}

function MovementSource({ movement }: { movement: InventoryMovement }) {
  if (!movement.source_number) return <span>—</span>
  const href = sourceDetailsHref(movement.source_type, movement.source_id)
  return href ? <Button variant="link" size="sm" asChild className="h-auto p-0 font-mono text-xs"><Link href={href} dir="ltr">{movement.source_number}</Link></Button> : <span className="font-mono text-xs" dir="ltr">{movement.source_number}</span>
}
