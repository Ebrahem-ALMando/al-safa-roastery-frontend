"use client"

import Link from "next/link"
import { LayoutGrid, RefreshCw, Settings2, Table, Warehouse } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { ItemsPeriodControls } from "@/components/items/ItemsPeriodControls"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { defaultInventoryPeriod, useInventoryMovementsPage } from "@/src/features/inventory"
import { InventoryMovementsColumnCustomizer } from "./InventoryMovementsColumnCustomizer"
import { InventoryMovementsDataView } from "./InventoryMovementsDataView"
import { InventoryMovementsFilters } from "./InventoryMovementsFilters"
import { InventoryMovementsSummary } from "./InventoryMovementsSummary"

export function InventoryMovementsView() {
  const page = useInventoryMovementsPage()
  const dialogDefault = defaultInventoryPeriod()
  const filterValue = { search: page.search, selectedItems: page.selectedItems, movementType: page.movementType, direction: page.direction, sourceType: page.sourceType }

  return <div className="space-y-6" dir="rtl" lang="ar">
    <DashboardPageHeader>
      <DashboardPageHeader.Lead><h1 className="flex items-center gap-2 text-md font-bold">حركات المخزون / <span className="font-normal text-muted-foreground">سجل تدقيق جميع الحركات</span></h1></DashboardPageHeader.Lead>
      <DashboardPageHeader.Actions>
        <ItemsPeriodControls preset={page.periodPreset} onPresetChange={page.setPeriodPreset} />
        <InventoryMovementsColumnCustomizer visibleColumns={page.visibleColumns} onChange={page.setVisibleColumns} />
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-xl"><Settings2 className="size-4" />تخصيص الصفحة</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>خيارات العرض</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuCheckboxItem checked={page.config.showKPI} onCheckedChange={(value) => page.toggleShowKPI(Boolean(value))}>إظهار الإحصائيات</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={page.config.showFilters} onCheckedChange={(value) => page.toggleShowFilters(Boolean(value))}>إظهار الفلاتر</DropdownMenuCheckboxItem></DropdownMenuContent></DropdownMenu>
        <div className="flex rounded-lg border p-1"><Button size="sm" variant={page.config.viewMode === "cards" ? "default" : "ghost"} className={cn("gap-2", page.config.viewMode === "cards" && "bg-primary")} onClick={() => page.setViewMode("cards")}><LayoutGrid className="size-4" />بطاقات</Button><Button size="sm" variant={page.config.viewMode === "table" ? "default" : "ghost"} className="gap-2" onClick={() => page.setViewMode("table")}><Table className="size-4" />جدول</Button></div>
        <Button variant="outline" asChild className="gap-2 rounded-xl"><Link href="/dashboard/inventory"><Warehouse className="size-4" />المستودع</Link></Button>
      </DashboardPageHeader.Actions>
    </DashboardPageHeader>

    {page.config.showKPI ? <InventoryMovementsSummary summary={page.movementSummary} isLoading={page.summaryIsLoading} error={page.summaryError} /> : null}
    {page.config.showFilters ? <InventoryMovementsFilters value={filterValue} onChange={(next) => { page.setSearch(next.search); page.setSelectedItems(next.selectedItems); page.setMovementType(next.movementType); page.setDirection(next.direction); page.setSourceType(next.sourceType) }} onReset={page.resetFilters} isLoading={page.isLoading} /> : null}
    {page.error && !page.isLoading ? <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6"><p className="text-sm text-destructive">تعذر تحميل حركات المخزون. حاول مجدداً.</p><Button variant="outline" onClick={() => void page.mutate()} className="gap-2"><RefreshCw className="size-4" />إعادة المحاولة</Button></div> : <div className={page.config.viewMode === "table" ? "overflow-hidden rounded-xl border shadow-sm" : "overflow-hidden"}><InventoryMovementsDataView viewMode={page.config.viewMode} movements={page.movements} meta={page.meta} visibleColumns={page.visibleColumns} isLoading={page.isLoading} page={page.page} onPageChange={page.setPage} /></div>}
    <DateRangeDialog open={page.customDialogOpen} onOpenChange={page.setCustomDialogOpen} from={page.customPeriod?.from ?? dialogDefault.from} to={page.customPeriod?.to ?? dialogDefault.to} onApply={page.applyCustomPeriod} />
  </div>
}
