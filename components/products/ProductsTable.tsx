"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatArDateTime,
  getProductDisplayPrice,
  formatQuantityKg,
  getProductColumnLabel,
  linkedItemCode,
  linkedItemName,
  productInitials,
  type Product,
  type ProductTableColumnId,
  type ProductsListMeta,
} from "@/features/products";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductPriceStatusBadge } from "./ProductPriceStatusBadge";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductStockStatusBadge } from "./ProductStockStatusBadge";
import { ProductRowActionsMenuContent } from "./product-row-actions-menu";

type ProductsTableProps = {
  products: Product[];
  meta?: ProductsListMeta;
  visibleColumns: ProductTableColumnId[];
  isLoading?: boolean;
  isFilteredNoHits: boolean;
  isTrueEmpty: boolean;
  currentPage: number;
  lastPage: number;
  canPrev: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onViewPrices?: (product: Product) => void;
  onManagePrices: (product: Product) => void;
  onClearPrices?: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
};

type ContextMenuState = { x: number; y: number; product: Product };

function TableRowSkeleton({ colCount }: { colCount: number }) {
  return (
    <TableRow>
      {Array.from({ length: colCount }, (_, i) => (
        <TableCell key={i} className="text-center">
          <Skeleton className="mx-auto h-4 w-20" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function ProductsTable({
  products,
  meta,
  visibleColumns,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  lastPage,
  canPrev,
  canNext,
  onPageChange,
  onEdit,
  onViewPrices,
  onManagePrices,
  onClearPrices,
  onDelete,
  onToggleActive,
}: ProductsTableProps) {
  const router = useRouter();
  const perPage = meta?.per_page ?? 15;
  const orderedCols = visibleColumns.map((id) => ({
    id,
    label: getProductColumnLabel(id),
  }));
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  function goToProduct(id: number) {
    router.push(`/dashboard/products/${id}`);
  }

  useEffect(() => {
    if (!contextMenu) return;
    function close() {
      setContextMenu(null);
    }
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [contextMenu]);

  function renderCell(
    colId: ProductTableColumnId,
    product: Product,
    rowIndex: number,
  ) {
    const key = `${product.id}-${colId}`;
    const rowNumber = (currentPage - 1) * perPage + rowIndex + 1;
    const itemCode = linkedItemCode(product);

    switch (colId) {
      case "row_number":
        return (
          <TableCell
            key={key}
            className="w-12 text-center font-mono text-xs text-muted-foreground"
          >
            {rowNumber}
          </TableCell>
        );
      case "product":
        return (
          <TableCell key={key} className="text-right">
            <div className="flex items-center justify-start gap-2.5">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {productInitials(product.name) || "—"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p
                  className="mt-0.5 font-mono text-[11px] text-muted-foreground"
                  dir="ltr"
                >
                  {product.code || product.barcode || "—"}
                </p>
              </div>
            </div>
          </TableCell>
        );
      case "linked_item":
        return (
          <TableCell key={key} className="text-right text-sm">
            <p className="font-medium">{linkedItemName(product)}</p>
            <p
              className="mt-0.5 font-mono text-[11px] text-muted-foreground"
              dir="ltr"
            >
              {itemCode || "—"}
            </p>
          </TableCell>
        );
      case "price":
        const displayPrice = getProductDisplayPrice(product);
        return (
          <TableCell
            key={key}
            className="text-center"
          >
            {displayPrice ? (
              <div className="space-y-0.5">
                <p className="font-semibold tabular-nums" dir="ltr">
                  {displayPrice.amount}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {displayPrice.label}
                </p>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">غير مسعّر</span>
            )}
          </TableCell>
        );
      case "price_status":
        return (
          <TableCell key={key} className="text-center">
            <ProductPriceStatusBadge status={product.price_status} />
          </TableCell>
        );
      case "available_stock":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {product.ready_item_id
              ? formatQuantityKg(product.current_quantity_kg)
              : "—"}
          </TableCell>
        );
      case "stock_status":
        return (
          <TableCell key={key} className="text-center">
            <ProductStockStatusBadge product={product} />
          </TableCell>
        );
      case "is_active":
        return (
          <TableCell key={key} className="text-center">
            <ProductStatusBadge isActive={product.is_active} />
          </TableCell>
        );
      case "code":
      case "barcode":
      case "sku":
        return (
          <TableCell
            key={key}
            className="text-center font-mono text-xs"
            dir="ltr"
          >
            {product[colId] || "—"}
          </TableCell>
        );
      case "notes":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{product.notes || "—"}</span>
          </TableCell>
        );
      case "created_at":
      case "updated_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(product[colId])}
          </TableCell>
        );
      case "created_by":
      case "updated_by":
        return (
          <TableCell key={key} className="text-center text-sm">
            {product[colId]?.name || "—"}
          </TableCell>
        );
      case "actions":
        return (
          <TableCell key={key} className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">الإجراءات</span>
                </Button>
              </DropdownMenuTrigger>
              <ProductRowActionsMenuContent
                product={product}
                stopPropagation
                onViewDetails={() => goToProduct(product.id)}
                onEdit={() => onEdit(product)}
                onViewPrices={onViewPrices ? () => onViewPrices(product) : undefined}
                onManagePrices={() => onManagePrices(product)}
                onClearPrices={onClearPrices ? () => onClearPrices(product) : undefined}
                onToggleActive={() => onToggleActive(product)}
                onDelete={() => onDelete(product)}
              />
            </DropdownMenu>
          </TableCell>
        );
    }
  }

  return (
    <div className="p-0">
      {isLoading ? (
        <Table className="w-full" dir="rtl">
          <TableHeader>
            <TableRow>
              {orderedCols.map((col) => (
                <TableHead key={col.id} className="text-center font-semibold">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }, (_, i) => (
              <TableRowSkeleton key={i} colCount={orderedCols.length} />
            ))}
          </TableBody>
        </Table>
      ) : isFilteredNoHits ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Search className="size-6 opacity-60" />
          <p className="font-medium">
            لا توجد منتجات مطابقة للبحث أو الفلاتر الحالية.
          </p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <Package className="size-10 text-primary" strokeWidth={1.25} />
          <p className="text-lg font-semibold">لا توجد منتجات حالياً</p>
        </div>
      ) : (
        <Table className="w-full" dir="rtl">
          <TableHeader>
            <TableRow>
              {orderedCols.map((col) => (
                <TableHead key={col.id} className="text-center font-semibold">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow
                key={product.id}
                className="cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => goToProduct(product.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    product,
                  });
                }}
              >
                {orderedCols.map((col) => renderCell(col.id, product, index))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && products.length > 0 && meta != null && lastPage > 1 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <p
            className="text-center text-sm text-muted-foreground sm:text-start"
            dir="ltr"
          >
            {meta.total} - صفحة {currentPage} من {lastPage}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!canPrev}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNext}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {contextMenu ? (
        <div ref={contextMenuRef}>
          <DropdownMenu
            open
            onOpenChange={(open) => !open && setContextMenu(null)}
          >
            <DropdownMenuTrigger asChild>
              <span
                className="fixed"
                style={{
                  top: contextMenu.y,
                  left: contextMenu.x,
                  width: 1,
                  height: 1,
                  pointerEvents: "none",
                }}
              />
            </DropdownMenuTrigger>
            <ProductRowActionsMenuContent
              product={contextMenu.product}
              onViewDetails={() => {
                goToProduct(contextMenu.product.id);
                setContextMenu(null);
              }}
              onEdit={() => {
                onEdit(contextMenu.product);
                setContextMenu(null);
              }}
              onViewPrices={onViewPrices ? () => {
                onViewPrices(contextMenu.product);
                setContextMenu(null);
              } : undefined}
              onManagePrices={() => {
                onManagePrices(contextMenu.product);
                setContextMenu(null);
              }}
              onClearPrices={onClearPrices ? () => {
                onClearPrices(contextMenu.product);
                setContextMenu(null);
              } : undefined}
              onToggleActive={() => {
                onToggleActive(contextMenu.product);
                setContextMenu(null);
              }}
              onDelete={() => {
                onDelete(contextMenu.product);
                setContextMenu(null);
              }}
            />
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  );
}
