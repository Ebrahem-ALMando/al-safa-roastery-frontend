"use client"

import { ChevronLeft, ChevronRight, Factory, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { formatProductionCost, formatProductionDate, formatProductionMoney, formatProductionQuantity, productionBatchNumber, productionCostPerOutput, productionInputCost, productionOutput } from "@/src/features/production"
import type { ProductionDataViewProps } from "./ProductionDataView"
import { ProductionStatusBadge } from "./ProductionStatusBadge"
import { ProductionRowActionsMenu } from "./production-row-actions-menu"

export function ProductionCards(props: ProductionDataViewProps) {
  if (props.isLoading) return <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-4 rounded-xl border p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-8 w-full" /></div>)}</div>
  if (props.isFilteredNoHits || props.isTrueEmpty) return <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">{props.isFilteredNoHits ? <Search className="size-8 text-primary" /> : <Factory className="size-8 text-primary" />}<p className="font-medium">{props.isFilteredNoHits ? "لا توجد عمليات مطابقة للفلاتر الحالية." : "لا توجد عمليات إنتاج حالياً."}</p></div>
  return (
    <div className="space-y-4">
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {props.batches.map((batch) => { const output = productionOutput(batch); return <Card key={batch.id} className="cursor-pointer gap-4 rounded-xl border-border/60 py-4 shadow-sm hover:border-primary/30 hover:shadow-md" onClick={() => props.onView(batch)}><CardHeader className="px-4"><div className="flex items-start justify-between gap-3"><div><CardTitle className="font-mono text-base" dir="ltr">{productionBatchNumber(batch)}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{formatProductionDate(batch.production_date)}</p></div><ProductionStatusBadge status={batch.status} /></div></CardHeader><CardContent className="space-y-3 px-4"><Info label="الصنف الناتج" value={output?.ready_item?.name ?? "—"} /><Info label="الكمية المنتجة" value={formatProductionQuantity(batch.total_output_weight_kg)} ltr /><Info label="المواد الداخلة" value={`${batch.inputs_count ?? batch.inputs?.length ?? 0} صنف`} /><Info label={batch.status === "draft" ? "تكلفة المواد المتوقعة" : "تكلفة المواد"} value={formatProductionMoney(productionInputCost(batch))} ltr /><Info label={batch.status === "draft" ? "تكلفة الكيلو المتوقعة" : "تكلفة الكيلو"} value={formatProductionCost(productionCostPerOutput(batch))} ltr /><div className="flex justify-end border-t pt-2"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" onClick={(event) => event.stopPropagation()}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><ProductionRowActionsMenu batch={batch} onView={() => props.onView(batch)} onEdit={() => props.onEdit(batch)} onComplete={() => props.onComplete(batch)} onCancel={() => props.onCancel(batch)} onDelete={() => props.onDelete(batch)} /></DropdownMenu></div></CardContent></Card> })}
      </div>
      {props.lastPage > 1 ? <div className="flex items-center justify-center gap-2 border-t py-3"><Button variant="outline" size="sm" disabled={!props.canPrev} onClick={() => props.onPageChange(props.currentPage - 1)}><ChevronRight className="size-4" />السابق</Button><span className="text-sm text-muted-foreground">صفحة {props.currentPage} من {props.lastPage}</span><Button variant="outline" size="sm" disabled={!props.canNext} onClick={() => props.onPageChange(props.currentPage + 1)}>التالي<ChevronLeft className="size-4" /></Button></div> : null}
    </div>
  )
}

function Info({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) { return <div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="truncate font-semibold" dir={ltr ? "ltr" : undefined}>{value}</span></div> }
