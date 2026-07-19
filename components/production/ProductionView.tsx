"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Factory, LayoutGrid, Plus, RefreshCw, Settings2, Table } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { defaultProductionPeriod, formatProductionMoney, formatProductionQuantity, productionBatchNumber, productionInputCost, productionOutput, useProductionActions, useProductionPage, useProductionSummary, type ProductionBatch } from "@/src/features/production"
import { ProductionCancelDialog } from "./ProductionCancelDialog"
import { ProductionColumnCustomizer } from "./ProductionColumnCustomizer"
import { ProductionCompleteConfirmDialog } from "./ProductionCompleteConfirmDialog"
import { ProductionDataView } from "./ProductionDataView"
import { ProductionDeleteDialog } from "./ProductionDeleteDialog"
import { ProductionFilters } from "./ProductionFilters"
import { ProductionPeriodControls } from "./ProductionPeriodControls"
import { ProductionSummary } from "./ProductionSummary"

export function ProductionView() {
  const router = useRouter()
  const page = useProductionPage()
  const summaryFilters = useMemo(() => page.filters, [page.filters])
  const summary = useProductionSummary(summaryFilters)
  const actions = useProductionActions()
  const [completeTarget, setCompleteTarget] = useState<ProductionBatch | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ProductionBatch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductionBatch | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const output = completeTarget ? productionOutput(completeTarget) : null

  return <div className="space-y-6" dir="rtl" lang="ar">
    <DashboardPageHeader><DashboardPageHeader.Lead><div className="min-w-0 space-y-1"><h1 className="text-xl font-bold sm:text-2xl">الإنتاج / إدارة عمليات الإنتاج</h1><p className="text-sm text-muted-foreground">تحويل المواد الخام إلى أصناف جاهزة مع أثر مخزني وتكلفة موثقة</p></div></DashboardPageHeader.Lead><DashboardPageHeader.Actions>
      <ProductionPeriodControls preset={page.periodPreset} onPresetChange={page.setPeriodPreset} />
      <Button className="gap-2 rounded-xl" onClick={() => router.push("/dashboard/production/new")}><Plus className="size-4" />عملية إنتاج</Button>
      <ProductionColumnCustomizer visibleColumns={page.visibleColumns} onChange={page.setVisibleColumns} />
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-xl"><Settings2 className="size-4" />تخصيص الصفحة</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>خيارات العرض</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuCheckboxItem checked={page.config.showKPI} onCheckedChange={(value) => page.toggleShowKPI(Boolean(value))}>إظهار الإحصائيات</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={page.config.showFilters} onCheckedChange={(value) => page.toggleShowFilters(Boolean(value))}>إظهار الفلاتر</DropdownMenuCheckboxItem></DropdownMenuContent></DropdownMenu>
      <div className="flex rounded-lg border p-1"><Button size="sm" variant={page.config.viewMode === "cards" ? "default" : "ghost"} className={cn("gap-2", page.config.viewMode === "cards" && "bg-primary")} onClick={() => page.setViewMode("cards")}><LayoutGrid className="size-4" />بطاقات</Button><Button size="sm" variant={page.config.viewMode === "table" ? "default" : "ghost"} className="gap-2" onClick={() => page.setViewMode("table")}><Table className="size-4" />جدول</Button></div>
    </DashboardPageHeader.Actions></DashboardPageHeader>
    {page.config.showKPI ? <ProductionSummary summary={summary.summary} isLoading={summary.isLoading} error={summary.error} onAll={() => page.setStatus("all")} onCompleted={() => page.setStatus("completed")} /> : null}
    {page.config.showFilters ? <ProductionFilters value={{ search: page.search, status: page.status, outputItem: page.outputItem, inputItems: page.inputItems, quantityMin: page.quantityMin, quantityMax: page.quantityMax }} onChange={(value) => { page.setSearch(value.search); page.setStatus(value.status); page.setOutputItem(value.outputItem); page.setInputItems(value.inputItems); page.setQuantityMin(value.quantityMin); page.setQuantityMax(value.quantityMax) }} isLoading={page.isLoading} /> : null}
    {page.error && !page.isLoading ? <div className="flex flex-col items-center gap-3 py-5"><p className="text-sm text-muted-foreground">تعذر تحميل عمليات الإنتاج. حاول مجدداً.</p><Button variant="outline" className="gap-2" onClick={() => void page.mutate()}><RefreshCw className="size-4" />إعادة المحاولة</Button></div> : null}
    <div className={page.config.viewMode === "table" ? "overflow-hidden rounded-xl border shadow-sm" : "overflow-hidden"}><ProductionDataView viewMode={page.config.viewMode} batches={page.batches} meta={page.meta} visibleColumns={page.visibleColumns} isLoading={page.isLoading} isTrueEmpty={page.isTrueEmpty} isFilteredNoHits={page.isFilteredNoHits} currentPage={page.currentPage} lastPage={page.lastPage} canPrev={page.canPrev} canNext={page.canNext} onPageChange={page.setPage} onView={(batch) => router.push(`/dashboard/production/${batch.id}`)} onEdit={(batch) => router.push(`/dashboard/production/${batch.id}/edit`)} onComplete={setCompleteTarget} onCancel={setCancelTarget} onDelete={setDeleteTarget} /></div>
    <DateRangeDialog open={page.customDialogOpen} onOpenChange={page.setCustomDialogOpen} from={page.customPeriod?.from ?? defaultProductionPeriod().from} to={page.customPeriod?.to ?? defaultProductionPeriod().to} onApply={page.applyCustomPeriod} />
    <ProductionCompleteConfirmDialog open={completeTarget !== null} onOpenChange={(open) => { if (!open) setCompleteTarget(null) }} preview={completeTarget ? { batchNumber: productionBatchNumber(completeTarget), outputName: output?.ready_item?.name ?? "—", outputQuantity: formatProductionQuantity(completeTarget.total_output_weight_kg), inputsCount: completeTarget.inputs_count ?? completeTarget.inputs?.length ?? 0, totalInputCost: formatProductionMoney(productionInputCost(completeTarget)), inventoryEffects: "سيتم سحب المواد الداخلة وإضافة الكمية الناتجة إلى المخزون." } : null} isSubmitting={submitting} onConfirm={async () => { if (!completeTarget) return; setSubmitting(true); try { await actions.complete(completeTarget.id); setCompleteTarget(null) } finally { setSubmitting(false) } }} />
    <ProductionCancelDialog open={cancelTarget !== null} onOpenChange={(open) => { if (!open) setCancelTarget(null) }} batch={cancelTarget} onConfirm={async (id, reason) => { await actions.cancel(id, { cancel_reason: reason }); setCancelTarget(null) }} />
    <ProductionDeleteDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }} batch={deleteTarget} onConfirm={async (id) => { await actions.deleteDraft(id); setDeleteTarget(null) }} />
  </div>
}
