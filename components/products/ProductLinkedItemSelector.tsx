"use client";

import { ItemTypeBadge } from "@/components/items/item-type-badge";
import { ItemPickerDialog } from "@/components/purchases/editor/ItemPickerDialog";
import { Button } from "@/components/ui/button";
import { formatCostPerKg, formatQuantityKg } from "@/features/items";
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList";
import { cn } from "@/lib/utils";
import { Package, XCircle } from "lucide-react";

export type ProductLinkedItemPreview = {
  id: number;
  name: string;
  code: string | null;
  itemType: "raw" | "ready";
  currentQuantityKg: string | number | null;
  averageCost: string | number | null;
};

type ProductLinkedItemSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number | null;
  onSelect: (item: ProductLinkedItemPreview | null) => void;
  preview: ProductLinkedItemPreview | null;
  error?: string;
};

function pickerRowToPreview(item: ItemPickerRow): ProductLinkedItemPreview {
  return {
    id: Number(item.id),
    name: item.name,
    code: item.code === "—" || item.code === "â€”" ? null : item.code,
    itemType: item.itemType,
    currentQuantityKg: item.currentQuantityKg,
    averageCost: item.averageCost,
  };
}

export function ProductLinkedItemSelector({
  open,
  onOpenChange,
  value,
  onSelect,
  preview,
  error,
}: ProductLinkedItemSelectorProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            الصنف المرتبط <span className="text-destructive">*</span>
          </span>
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-2 text-xs text-muted-foreground"
              onClick={() => onSelect(null)}
            >
              <XCircle className="ml-1 size-3.5" />
              إزالة
            </Button>
          ) : null}
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(
            "flex h-auto w-full flex-col items-stretch gap-2 rounded-xl border px-3 py-3 text-right",
            error ? "border-destructive/60" : "border-border/60"
          )}
          onClick={() => onOpenChange(true)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "product-ready-item-error" : undefined}
        >
          {preview ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{preview.name}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground" dir="ltr">
                  {preview.code || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ItemTypeBadge itemType={preview.itemType} />
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="size-4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-sm">اختر صنفاً جاهزاً نشطاً</span>
              <Package className="size-4" />
            </div>
          )}

          {preview ? (
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span dir="ltr">{formatQuantityKg(preview.currentQuantityKg)}</span>
              <span dir="ltr">{formatCostPerKg(preview.averageCost)}</span>
            </div>
          ) : null}
        </Button>

        {error ? (
          <p id="product-ready-item-error" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <ItemPickerDialog
        open={open}
        onOpenChange={onOpenChange}
        onSelect={(item) => onSelect(pickerRowToPreview(item))}
        itemType="ready"
        activeOnly
        selectionMode="single"
        title="اختيار الصنف المرتبط"
        description="ابحث بالاسم أو الكود ثم اختر صنفاً جاهزاً نشطاً لربطه بالمنتج."
        excludeItemIds={value ? [value] : []}
      />
    </>
  );
}
