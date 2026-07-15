"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, RefreshCw, Settings2, Table } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { ItemsPeriodControls } from "@/components/items/ItemsPeriodControls"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { defaultInventoryPeriod, type InventoryItem, useInventoryPage, useInventorySummary } from "@/src/features/inventory"
import { InventoryAdjustmentDialog } from "./InventoryAdjustmentDialog"
import { InventoryColumnCustomizer } from "./InventoryColumnCustomizer"
import { InventoryDataView } from "./InventoryDataView"
import { InventoryFilters } from "./InventoryFilters"
import { InventorySummary } from "./InventorySummary"
import { InventoryWithdrawalDialog } from "./InventoryWithdrawalDialog"

export function InventoryView() {
  const router = useRouter(); const page = useInventoryPage(); const [withdrawItem, setWithdrawItem] = useState<InventoryItem | null>(null); const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const summaryFilters = useMemo(() => ({ date_from: page.dateRange?.from, date_to: page.dateRange?.to, item_type: page.itemType === "all" ? undefined : page.itemType, stock_status: page.stockStatus === "all" ? undefined : page.stockStatus, item_id: page.itemId ?? undefined }), [page.dateRange, page.itemType, page.stockStatus, page.itemId])
  const summary = useInventorySummary(summaryFilters, page.hydrated)
  const filterValue = { search: page.search, itemType: page.itemType, stockStatus: page.stockStatus, itemId: page.itemId, quantityMin: page.quantityMin, quantityMax: page.quantityMax }
  const dialogDefault = defaultInventoryPeriod()
  return <div className="space-y-6" dir="rtl" lang="ar"><DashboardPageHeader><DashboardPageHeader.Lead><h1 className="flex items-center gap-2 text-md font-bold">المستودع / <span className="font-normal text-muted-foreground">إدارة الأرصدة وحركات المخزون</span></h1></DashboardPageHeader.Lead><DashboardPageHeader.Actions><ItemsPeriodControls preset={page.periodPreset} onPresetChange={page.setPeriodPreset} /><InventoryColumnCustomizer visibleColumns={page.visibleColumns} onChange={page.setVisibleColumns} /><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-xl"><Settings2 className="size-4" />تخصيص الصفحة</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>خيارات العرض</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuCheckboxItem checked={page.config.showKPI} onCheckedChange={(v) => page.toggleShowKPI(Boolean(v))}>إظهار الإحصائيات</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={page.config.showFilters} onCheckedChange={(v) => page.toggleShowFilters(Boolean(v))}>إظهار الفلاتر</DropdownMenuCheckboxItem></DropdownMenuContent></DropdownMenu><div className="flex rounded-lg border p-1"><Button size="sm" variant={page.config.viewMode === "cards" ? "default" : "ghost"} className={cn("gap-2", page.config.viewMode === "cards" && "bg-primary")} onClick={() => page.setViewMode("cards")}><LayoutGrid className="size-4" />بطاقات</Button><Button size="sm" variant={page.config.viewMode === "table" ? "default" : "ghost"} className="gap-2" onClick={() => page.setViewMode("table")}><Table className="size-4" />جدول</Button></div></DashboardPageHeader.Actions></DashboardPageHeader>
    {page.config.showKPI ? <InventorySummary summary={summary.summary} isLoading={summary.isLoading} error={summary.error} onAvailable={() => page.setStockStatus("available")} onReorder={() => page.setStockStatus("reorder_required")} onMovements={() => document.getElementById("inventory-list")?.scrollIntoView({ behavior: "smooth" })} /> : null}
    {page.config.showFilters ? <InventoryFilters value={filterValue} onChange={(next) => { page.setSearch(next.search); page.setItemType(next.itemType); page.setStockStatus(next.stockStatus); page.setItemId(next.itemId); page.setQuantityMin(next.quantityMin); page.setQuantityMax(next.quantityMax) }} onReset={page.resetFilters} isLoading={page.isLoading} /> : null}
    {page.error && !page.isLoading ? <div className="flex flex-col items-center gap-3"><p className="text-sm text-muted-foreground">تعذر تحميل بيانات المخزون.</p><Button variant="outline" onClick={() => void page.mutate()} className="gap-2"><RefreshCw className="size-4" />إعادة المحاولة</Button></div> : null}
    <div id="inventory-list" className={page.config.viewMode === "table" ? "overflow-hidden rounded-xl border shadow-sm" : "overflow-hidden"}><InventoryDataView viewMode={page.config.viewMode} items={page.items} meta={page.meta} visibleColumns={page.visibleColumns} isLoading={page.isLoading} page={page.page} onPageChange={page.setPage} actions={(item) => ({ onDetails: () => router.push(`/dashboard/inventory/items/${item.id}`), onWithdraw: () => setWithdrawItem(item), onAdjust: () => setAdjustItem(item) })} /></div>
    <DateRangeDialog open={page.customDialogOpen} onOpenChange={page.setCustomDialogOpen} from={page.customPeriod?.from ?? dialogDefault.from} to={page.customPeriod?.to ?? dialogDefault.to} onApply={page.applyCustomPeriod} />
    <InventoryWithdrawalDialog key={withdrawItem?.id ?? "withdrawal-closed"} item={withdrawItem} open={withdrawItem !== null} onOpenChange={(open) => { if (!open) setWithdrawItem(null) }} /><InventoryAdjustmentDialog key={adjustItem?.id ?? "adjustment-closed"} item={adjustItem} open={adjustItem !== null} onOpenChange={(open) => { if (!open) setAdjustItem(null) }} />
  </div>
}
