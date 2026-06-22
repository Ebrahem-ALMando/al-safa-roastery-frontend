"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, Plus, RefreshCw, Settings2, Table } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { defaultCustomPeriod } from "@/features/items/lib/items.helpers"
import {
  useItemActions,
  useItemSummary,
  useItemsPage,
  type Item,
} from "@/features/items"
import { ItemsDataView } from "./ItemsDataView"
import { ItemsFilters } from "./ItemsFilters"
import { ItemsPeriodControls } from "./ItemsPeriodControls"
import { ItemsSummary } from "./ItemsSummary"
import { ItemColumnCustomizer } from "./ItemColumnCustomizer"
import { ItemFormDialog } from "./ItemFormDialog"
import { ItemDeleteDialog } from "./ItemDeleteDialog"
import { ItemToggleActiveDialog } from "./ItemToggleActiveDialog"

export function ItemsView() {
  const router = useRouter()
  const {
    periodPreset,
    setPeriodPreset,
    customPeriod,
    customDialogOpen,
    setCustomDialogOpen,
    applyCustomPeriod,
    dateRange,
    search,
    setSearch,
    isActive,
    setIsActive,
    itemType,
    setItemType,
    stockStatus,
    setStockStatus,
    quantityMin,
    setQuantityMin,
    quantityMax,
    setQuantityMax,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    items,
    meta,
    isLoading,
    error,
    mutate,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  } = useItemsPage()

  const { summary, isLoading: summaryLoading, error: summaryError } = useItemSummary(dateRange)

  const { createItem, updateItem, deleteItem, toggleItemActive } = useItemActions()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [toggleActiveOpen, setToggleActiveOpen] = useState(false)
  const [toggleActiveTarget, setToggleActiveTarget] = useState<Item | null>(null)

  function openCreate() {
    setFormMode("create")
    setEditItem(null)
    setFormOpen(true)
  }

  function openEdit(item: Item) {
    setFormMode("edit")
    setEditItem(item)
    setFormOpen(true)
  }

  function openDetails(item: Item) {
    router.push(`/dashboard/items/${item.id}`)
  }

  function openDelete(item: Item) {
    setDeleteTarget(item)
    setDeleteOpen(true)
  }

  function openToggleActive(item: Item) {
    setToggleActiveTarget(item)
    setToggleActiveOpen(true)
  }

  const customFrom = customPeriod?.from ?? defaultCustomPeriod().from
  const customTo = customPeriod?.to ?? defaultCustomPeriod().to

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            الأصناف
            /
            <p className="text-md text-muted-foreground">إدارة أصناف المخزون</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <ItemsPeriodControls preset={periodPreset} onPresetChange={setPeriodPreset} />
          <Button onClick={openCreate} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            إضافة صنف
          </Button>
          <ItemColumnCustomizer visibleColumns={visibleColumns} onChange={setColumnVisibility} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings2 className="h-4 w-4" />
                تخصيص الصفحة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>خيارات العرض</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={config.showKPI}
                onCheckedChange={(checked) => toggleShowKPI(Boolean(checked))}
              >
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={config.showFilters}
                onCheckedChange={(checked) => toggleShowFilters(Boolean(checked))}
              >
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={config.viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className={cn("gap-2", config.viewMode === "cards" && "bg-primary text-primary-foreground")}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">بطاقات</span>
            </Button>
            <Button
              variant={config.viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className={cn("gap-2", config.viewMode === "table" && "bg-primary text-primary-foreground")}
              onClick={() => setViewMode("table")}
            >
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">جدول</span>
            </Button>
          </div>
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? (
        <ItemsSummary summary={summary} isLoading={summaryLoading} error={summaryError} />
      ) : null}

      {config.showFilters ? (
        <ItemsFilters
          value={{
            search,
            isActive,
            itemType,
            stockStatus,
            quantityMin,
            quantityMax,
          }}
          onChange={(next) => {
            setSearch(next.search)
            setIsActive(next.isActive)
            setItemType(next.itemType)
            setStockStatus(next.stockStatus)
            setQuantityMin(next.quantityMin)
            setQuantityMax(next.quantityMax)
          }}
          isLoading={isLoading}
        />
      ) : null}

      {error && !isLoading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-center text-sm text-muted-foreground" role="status">
            تعذر تحميل البيانات. حاول مرة أخرى.
          </p>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => void mutate()}>
            <RefreshCw className="size-4" />
            إعادة المحاولة
          </Button>
        </div>
      ) : null}

      <div
        className={
          config.viewMode === "cards"
            ? "overflow-hidden"
            : "overflow-hidden rounded-xl border border-border/60 shadow-sm"
        }
      >
        <ItemsDataView
          viewMode={config.viewMode}
          items={items}
          meta={meta}
          visibleColumns={visibleColumns}
          isLoading={isLoading}
          isFilteredNoHits={isFilteredNoHits}
          isTrueEmpty={isTrueEmpty}
          currentPage={currentPage}
          lastPage={lastPage}
          canPrev={canPrev}
          canNext={canNext}
          onPageChange={setPage}
          onAddItem={openCreate}
          onViewDetails={openDetails}
          onEdit={openEdit}
          onDelete={openDelete}
          onToggleActive={openToggleActive}
        />
      </div>

      <DateRangeDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        from={customFrom}
        to={customTo}
        onApply={applyCustomPeriod}
      />

      <ItemFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditItem(null)
        }}
        mode={formMode}
        item={editItem}
        onCreate={createItem}
        onUpdate={updateItem}
        onSaved={() => void mutate()}
      />

      <ItemToggleActiveDialog
        open={toggleActiveOpen}
        onOpenChange={(open) => {
          setToggleActiveOpen(open)
          if (!open) setToggleActiveTarget(null)
        }}
        item={toggleActiveTarget}
        onConfirm={async (item) => {
          await toggleItemActive(item)
          void mutate()
        }}
      />

      <ItemDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        item={deleteTarget}
        onDelete={async (id) => {
          await deleteItem(id)
          void mutate()
        }}
      />
    </div>
  )
}
