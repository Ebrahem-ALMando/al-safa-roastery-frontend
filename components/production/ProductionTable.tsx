"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Factory, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatProductionCost, formatProductionDate, formatProductionMoney, formatProductionQuantity, getProductionColumnLabel, productionBatchNumber, productionCostPerOutput, productionInputCost, productionOutput, type ProductionBatch, type ProductionTableColumnId } from "@/src/features/production"
import type { ProductionDataViewProps } from "./ProductionDataView"
import { ProductionStatusBadge } from "./ProductionStatusBadge"
import { ProductionRowActionsMenu } from "./production-row-actions-menu"

type ContextState = { x: number; y: number; batch: ProductionBatch }

export function ProductionTable(props: ProductionDataViewProps) {
  const [context, setContext] = useState<ContextState | null>(null)
  useEffect(() => { if (!context) return; const close = () => setContext(null); document.addEventListener("click", close); document.addEventListener("scroll", close, true); return () => { document.removeEventListener("click", close); document.removeEventListener("scroll", close, true) } }, [context])
  const perPage = props.meta?.per_page ?? 15
  const columns = props.visibleColumns.map((id) => ({ id, label: getProductionColumnLabel(id) }))

  function cell(batch: ProductionBatch, column: ProductionTableColumnId, index: number) {
    const output = productionOutput(batch)
    const item = output?.ready_item
    const value = (() => {
      switch (column) {
        case "row_number": return (props.currentPage - 1) * perPage + index + 1
        case "batch_number": return <span className="font-mono font-semibold" dir="ltr">{productionBatchNumber(batch)}</span>
        case "production_date": return formatProductionDate(batch.production_date)
        case "output_item": return <div className="text-right"><p className="font-medium">{item?.name ?? "—"}</p><p className="font-mono text-[11px] text-muted-foreground" dir="ltr">{item?.code ?? "—"}</p></div>
        case "output_quantity": return <span dir="ltr">{formatProductionQuantity(batch.total_output_weight_kg)}</span>
        case "inputs_count": return `${batch.inputs_count ?? batch.inputs?.length ?? 0} صنف`
        case "total_input_cost": return <span dir="ltr">{formatProductionMoney(productionInputCost(batch))}</span>
        case "cost_per_output_kg": return <span dir="ltr">{formatProductionCost(productionCostPerOutput(batch))}</span>
        case "status": return <ProductionStatusBadge status={batch.status} />
        case "created_at": return formatProductionDate(batch.created_at, true)
        case "updated_at": return formatProductionDate(batch.updated_at, true)
        case "completed_at": return formatProductionDate(batch.completed_at, true)
        case "cancelled_at": return formatProductionDate(batch.cancelled_at, true)
        case "created_by": return batch.created_by?.name ?? "—"
        case "completed_by": return batch.completed_by?.name ?? "—"
        case "cancelled_by": return batch.cancelled_by?.name ?? "—"
        case "notes": return <span className="line-clamp-2 text-right">{batch.notes || "—"}</span>
        case "yield_percentage": return <span dir="ltr">{Number(batch.yield_percentage).toFixed(2)}%</span>
        case "input_items_summary": return <span className="line-clamp-2 text-right">{batch.inputs?.map((line) => line.raw_item?.name).filter(Boolean).join("، ") || "—"}</span>
        case "actions": return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" onClick={(event) => event.stopPropagation()}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><ProductionRowActionsMenu batch={batch} onView={() => props.onView(batch)} onEdit={() => props.onEdit(batch)} onComplete={() => props.onComplete(batch)} onCancel={() => props.onCancel(batch)} onDelete={() => props.onDelete(batch)} /></DropdownMenu>
      }
    })()
    return <TableCell key={`${batch.id}-${column}`} className={column === "output_item" || column === "notes" || column === "input_items_summary" ? "text-right" : "text-center text-sm"}>{value}</TableCell>
  }

  return (
    <div>
      {props.isLoading ? <Table dir="rtl"><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.id} className="text-center">{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({ length: 6 }, (_, row) => <TableRow key={row}>{columns.map((column) => <TableCell key={column.id}><Skeleton className="mx-auto h-4 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table>
      : props.isFilteredNoHits ? <Empty icon={Search} text="لا توجد عمليات إنتاج مطابقة للبحث أو الفلاتر الحالية." />
      : props.isTrueEmpty ? <Empty icon={Factory} text="لا توجد عمليات إنتاج حالياً." />
      : <Table dir="rtl"><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.id} className="text-center font-semibold">{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{props.batches.map((batch, index) => <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/40" onClick={() => props.onView(batch)} onContextMenu={(event) => { event.preventDefault(); setContext({ x: event.clientX, y: event.clientY, batch }) }}>{columns.map((column) => cell(batch, column.id, index))}</TableRow>)}</TableBody></Table>}
      {!props.isLoading && props.batches.length > 0 && props.lastPage > 1 ? <Pagination {...props} /> : null}
      {context ? <DropdownMenu open onOpenChange={(open) => { if (!open) setContext(null) }}><DropdownMenuTrigger asChild><span className="fixed size-px" style={{ left: context.x, top: context.y }} /></DropdownMenuTrigger><ProductionRowActionsMenu batch={context.batch} onView={() => props.onView(context.batch)} onEdit={() => props.onEdit(context.batch)} onComplete={() => props.onComplete(context.batch)} onCancel={() => props.onCancel(context.batch)} onDelete={() => props.onDelete(context.batch)} /></DropdownMenu> : null}
    </div>
  )
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) { return <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center"><Icon className="size-9 text-primary" strokeWidth={1.25} /><p className="font-medium">{text}</p></div> }
function Pagination(props: ProductionDataViewProps) { return <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"><p className="text-sm text-muted-foreground">{props.meta?.total ?? 0} — صفحة {props.currentPage} من {props.lastPage}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!props.canPrev} onClick={() => props.onPageChange(props.currentPage - 1)}><ChevronRight className="size-4" />السابق</Button><Button variant="outline" size="sm" disabled={!props.canNext} onClick={() => props.onPageChange(props.currentPage + 1)}>التالي<ChevronLeft className="size-4" /></Button></div></div> }
