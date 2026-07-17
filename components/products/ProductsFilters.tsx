"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Filter, Package, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemPickerDialog } from "@/components/purchases/editor/ItemPickerDialog";
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList";
import { cn } from "@/lib/utils";
import {
  PRODUCT_PRICE_STATUS_LABELS_AR,
  PRODUCT_STOCK_STATUS_LABELS_AR,
  type ProductsActiveStatus,
  type ProductsLinkedItemFilter,
  type ProductsPriceStatusFilter,
  type ProductsStockStatusFilter,
} from "@/features/products";

export interface ProductsFiltersValue {
  search: string;
  isActive: ProductsActiveStatus;
  priceStatus: ProductsPriceStatusFilter;
  stockStatus: ProductsStockStatusFilter;
  linkedItems: ProductsLinkedItemFilter[];
}

type ProductsFiltersProps = {
  value: ProductsFiltersValue;
  onChange: (value: ProductsFiltersValue) => void;
  isLoading?: boolean;
};

const DEBOUNCE_MS = 450;

function itemLabel(item: ItemPickerRow): string {
  return `${item.name}${item.code !== "—" && item.code !== "â€”" ? ` · ${item.code}` : ""}`;
}

export function ProductsFilters({ value, onChange, isLoading = false }: ProductsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch === value.search) return;
      onChange({ ...value, search: localSearch });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, onChange, value]);

  const statusLabel =
    value.isActive === "active" ? "فعال" : value.isActive === "inactive" ? "موقوف" : undefined;
  const priceStatusLabel =
    value.priceStatus !== "all" ? PRODUCT_PRICE_STATUS_LABELS_AR[value.priceStatus] : undefined;
  const stockStatusLabel =
    value.stockStatus !== "all" ? PRODUCT_STOCK_STATUS_LABELS_AR[value.stockStatus] : undefined;

  const hasActiveFilters =
    Boolean(value.search.trim()) ||
    value.isActive !== "all" ||
    value.priceStatus !== "all" ||
    value.stockStatus !== "all" ||
    value.linkedItems.length > 0;

  function clearAll() {
    setLocalSearch("");
    onChange({
      search: "",
      isActive: "all",
      priceStatus: "all",
      stockStatus: "all",
      linkedItems: [],
    });
  }

  function removeLinkedItem(id: number) {
    onChange({
      ...value,
      linkedItems: value.linkedItems.filter((item) => item.id !== id),
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم المنتج أو الكود..."
            className="w-full pr-10"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setShowAdvanced((prev) => !prev)}
            type="button"
          >
            <Filter className="h-4 w-4" />
            بحث متقدم
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
          </Button>
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              type="button"
            >
              <X className="ml-1 h-4 w-4" />
              مسح الفلاتر
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showAdvanced ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الحالة</Label>
            <Select
              value={value.isActive}
              disabled={isLoading}
              onValueChange={(selected) => onChange({ ...value, isActive: selected as ProductsActiveStatus })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">حالة التسعير</Label>
            <Select
              value={value.priceStatus}
              disabled={isLoading}
              onValueChange={(selected) =>
                onChange({ ...value, priceStatus: selected as ProductsPriceStatusFilter })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="priced">مسعّر</SelectItem>
                <SelectItem value="unpriced">بدون سعر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">حالة المخزون</Label>
            <Select
              value={value.stockStatus}
              disabled={isLoading}
              onValueChange={(selected) =>
                onChange({ ...value, stockStatus: selected as ProductsStockStatusFilter })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="reorder_required">يحتاج إعادة طلب</SelectItem>
                <SelectItem value="available">متوفر</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="out_of_stock">نافد</SelectItem>
                <SelectItem value="unlinked">غير مرتبط بصنف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الصنف المرتبط</Label>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-between rounded-md font-normal"
              disabled={isLoading}
              onClick={() => setItemPickerOpen(true)}
            >
              <span className="truncate">
                {value.linkedItems.length === 0
                  ? "اختر صنفا أو أكثر..."
                  : value.linkedItems.length === 1
                    ? value.linkedItems[0]?.label
                    : `${value.linkedItems.length} أصناف محددة`}
              </span>
              <Package className="ml-2 h-4 w-4 shrink-0 opacity-60" />
            </Button>
          </div>
        </div>
      </div>

      {value.linkedItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.linkedItems.map((item) => (
            <FilterChip key={item.id} label={item.label} onClear={() => removeLinkedItem(item.id)} />
          ))}
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {value.search.trim() ? (
            <FilterChip
              label={`البحث: ${value.search}`}
              onClear={() => {
                setLocalSearch("");
                onChange({ ...value, search: "" });
              }}
            />
          ) : null}
          {statusLabel ? <FilterChip label={`الحالة: ${statusLabel}`} onClear={() => onChange({ ...value, isActive: "all" })} /> : null}
          {priceStatusLabel ? <FilterChip label={`التسعير: ${priceStatusLabel}`} onClear={() => onChange({ ...value, priceStatus: "all" })} /> : null}
          {stockStatusLabel ? <FilterChip label={`المخزون: ${stockStatusLabel}`} onClear={() => onChange({ ...value, stockStatus: "all" })} /> : null}
        </div>
      ) : null}

      <ItemPickerDialog
        open={itemPickerOpen}
        onOpenChange={setItemPickerOpen}
        onSelect={(item) => {
          const next = { id: Number(item.id), label: itemLabel(item) };
          if (value.linkedItems.some((selected) => selected.id === next.id)) return;
          onChange({ ...value, linkedItems: [...value.linkedItems, next] });
        }}
        onSelectMany={(items) => {
          const map = new Map(value.linkedItems.map((item) => [item.id, item]));
          items.forEach((item) => {
            map.set(Number(item.id), { id: Number(item.id), label: itemLabel(item) });
          });
          onChange({ ...value, linkedItems: Array.from(map.values()) });
        }}
        itemType="ready"
        activeOnly
        selectionMode="multiple"
        excludeItemIds={value.linkedItems.map((item) => item.id)}
        title="اختيار الأصناف المرتبطة"
        description="ابحث بالاسم أو الكود ثم اختر صنفا أو أكثر لتصفية المنتجات."
      />
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
      {label}
      <button type="button" className="mr-1 rounded-full p-0.5 hover:bg-sky-200/80" onClick={onClear}>
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
