"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatProductPrice,
  formatQuantityKg,
  linkedItemName,
  type Product,
  type ProductsListMeta,
} from "@/features/products";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  Search,
} from "lucide-react";
import { ProductPriceStatusBadge } from "./ProductPriceStatusBadge";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductStockStatusBadge } from "./ProductStockStatusBadge";
import { ProductRowActionsMenuContent } from "./product-row-actions-menu";

type ProductsCardsProps = {
  products: Product[];
  meta?: ProductsListMeta;
  isLoading?: boolean;
  isFilteredNoHits: boolean;
  isTrueEmpty: boolean;
  currentPage: number;
  canPrev: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
};

function ProductCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function ProductsCards({
  products,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isFilteredNoHits) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
        <Search className="size-6 opacity-60" />
        <p className="font-medium">
          لا توجد منتجات مطابقة للبحث أو الفلاتر الحالية.
        </p>
      </div>
    );
  }

  if (isTrueEmpty) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <Package className="size-10 text-primary" strokeWidth={1.25} />
        <p className="text-lg font-semibold">لا توجد منتجات حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 *:min-w-0">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer gap-4 rounded-xl border-border/60 py-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            onClick={() => onViewDetails(product)}
          >
            <CardHeader className="px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">
                    {product.name}
                  </CardTitle>
                  <p
                    className="mt-1 font-mono text-xs text-muted-foreground"
                    dir="ltr"
                  >
                    {product.code || product.barcode || "—"}
                  </p>
                </div>
                <ProductStatusBadge isActive={product.is_active} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4">
              <InfoLine label="الصنف المرتبط" value={linkedItemName(product)} />
              <InfoLine
                label="السعر"
                value={formatProductPrice(
                  product.current_price ?? product.default_price,
                )}
                dir="ltr"
              />
              <InfoLine
                label="المخزون المتاح"
                value={
                  product.ready_item_id
                    ? formatQuantityKg(product.current_quantity_kg)
                    : "—"
                }
                dir="ltr"
              />
              <div className="flex flex-wrap gap-2">
                <ProductPriceStatusBadge status={product.price_status} />
                <ProductStockStatusBadge product={product} />
              </div>
              <div className="flex justify-end border-t border-border/50 pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <ProductRowActionsMenuContent
                    product={product}
                    stopPropagation
                    onViewDetails={() => onViewDetails(product)}
                    onEdit={() => onEdit(product)}
                    onToggleActive={() => onToggleActive(product)}
                    onDelete={() => onDelete(product)}
                  />
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <ChevronRight className="size-4" />
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {currentPage} من {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            التالي
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function InfoLine({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-semibold" dir={dir}>
        {value}
      </span>
    </div>
  );
}
