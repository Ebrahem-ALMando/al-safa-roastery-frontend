"use client";

import { DashboardPageHeader } from "@/components/dashboard";
import { DateRangeDialog } from "@/components/shared/DateRangeDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  defaultCustomPeriod,
  useProductActions,
  useProductSummary,
  useProductsPage,
  type Product,
} from "@/features/products";
import { cn } from "@/lib/utils";
import { LayoutGrid, Plus, RefreshCw, Settings2, Table } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductColumnCustomizer } from "./ProductColumnCustomizer";
import { ProductClearPricesDialog } from "./ProductClearPricesDialog";
import { ProductDeleteDialog } from "./ProductDeleteDialog";
import { ProductFormDialog } from "./ProductFormDialog";
import { ProductToggleActiveDialog } from "./ProductToggleActiveDialog";
import { ProductPricesDialog } from "./prices/ProductPricesDialog";
import { ProductPricesReadOnlyDialog } from "./prices/ProductPricesReadOnlyDialog";
import { ProductsDataView } from "./ProductsDataView";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsPeriodControls } from "./ProductsPeriodControls";
import { ProductsSummary } from "./ProductsSummary";

export function ProductsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    priceStatus,
    setPriceStatus,
    stockStatus,
    setStockStatus,
    linkedItems,
    setLinkedItems,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    products,
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
    setPage,
  } = useProductsPage();

  const summaryFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      is_active: isActive === "all" ? undefined : isActive === "active",
      price_status: priceStatus !== "all" ? priceStatus : undefined,
      stock_status: stockStatus !== "all" ? stockStatus : undefined,
      linked_item_ids: linkedItems.map((item) => item.id),
      date_from: dateRange?.from,
      date_to: dateRange?.to,
    }),
    [search, isActive, priceStatus, stockStatus, linkedItems, dateRange],
  );
  const {
    summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useProductSummary(summaryFilters);
  const {
    createProduct,
    updateProduct,
    toggleProductActive,
    deleteProduct,
    saveProductPrices,
    clearProductPrices,
  } = useProductActions();

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [priceTarget, setPriceTarget] = useState<Product | null>(null);
  const [viewPricesTarget, setViewPricesTarget] = useState<Product | null>(null);
  const [clearPricesTarget, setClearPricesTarget] = useState<Product | null>(null);
  const [toggleActiveTarget, setToggleActiveTarget] = useState<Product | null>(null);

  const customFrom = customPeriod?.from ?? defaultCustomPeriod().from;
  const customTo = customPeriod?.to ?? defaultCustomPeriod().to;

  useEffect(() => {
    const editId = Number(searchParams.get("edit"));
    if (!Number.isFinite(editId) || editId <= 0) return;
    const match = products.find((product) => product.id === editId);
    if (!match) return;
    openEditDialog(match);
    router.replace("/dashboard/products");
  }, [products, router, searchParams]);

  function openDetails(product: Product) {
    router.push(`/dashboard/products/${product.id}`);
  }

  function openCreateDialog() {
    setEditingProduct(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setDialogMode("edit");
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <div className="min-w-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              المنتجات / إدارة كتالوج المنتجات
            </h1>
            <p className="text-sm text-muted-foreground">المنتجات القابلة للبيع</p>
          </div>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <ProductsPeriodControls preset={periodPreset} onPresetChange={setPeriodPreset} />
          <Button variant="default" className="gap-2 rounded-xl" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            إضافة منتج
          </Button>
          <ProductColumnCustomizer visibleColumns={visibleColumns} onChange={setColumnVisibility} />
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
        <ProductsSummary
          summary={summary}
          isLoading={summaryLoading}
          error={summaryError}
          onActiveClick={() => setIsActive("active")}
          onPricedClick={() => setPriceStatus("priced")}
          onUnpricedClick={() => setPriceStatus("unpriced")}
          onReorderClick={() => setStockStatus("reorder_required")}
        />
      ) : null}

      {config.showFilters ? (
        <ProductsFilters
          value={{
            search,
            isActive,
            priceStatus,
            stockStatus,
            linkedItems,
          }}
          onChange={(next) => {
            setSearch(next.search);
            setIsActive(next.isActive);
            setPriceStatus(next.priceStatus);
            setStockStatus(next.stockStatus);
            setLinkedItems(next.linkedItems);
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

      <div className={config.viewMode === "cards" ? "overflow-hidden" : "overflow-hidden rounded-xl border border-border/60 shadow-sm"}>
        <ProductsDataView
          viewMode={config.viewMode}
          products={products}
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
          onViewDetails={openDetails}
          onEdit={openEditDialog}
          onViewPrices={setViewPricesTarget}
          onManagePrices={setPriceTarget}
          onClearPrices={setClearPricesTarget}
          onToggleActive={setToggleActiveTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      <ProductFormDialog
        key={`${dialogMode}-${editingProduct?.id ?? "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        product={editingProduct}
        onCreate={createProduct}
        onUpdate={updateProduct}
        onSavePrices={(id, payload) => saveProductPrices(id, payload, { notify: false })}
      />

      <ProductPricesDialog
        open={priceTarget !== null}
        onOpenChange={(next) => {
          if (!next) setPriceTarget(null);
        }}
        product={priceTarget}
      />

      <ProductPricesReadOnlyDialog
        open={viewPricesTarget !== null}
        onOpenChange={(next) => {
          if (!next) setViewPricesTarget(null);
        }}
        product={viewPricesTarget}
      />

      <ProductClearPricesDialog
        open={clearPricesTarget !== null}
        onOpenChange={(next) => {
          if (!next) setClearPricesTarget(null);
        }}
        product={clearPricesTarget}
        onConfirm={async (id) => {
          await clearProductPrices(id);
          void mutate();
        }}
      />

      <ProductToggleActiveDialog
        open={toggleActiveTarget !== null}
        onOpenChange={(next) => {
          if (!next) setToggleActiveTarget(null);
        }}
        product={toggleActiveTarget}
        onConfirm={async (product) => {
          await toggleProductActive(product);
          void mutate();
        }}
      />

      <DateRangeDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        from={customFrom}
        to={customTo}
        onApply={applyCustomPeriod}
      />

      <ProductDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        product={deleteTarget}
        onDelete={async (id) => {
          await deleteProduct(id);
          void mutate();
        }}
      />
    </div>
  );
}
