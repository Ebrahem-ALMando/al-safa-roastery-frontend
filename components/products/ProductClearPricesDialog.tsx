"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { Product } from "@/features/products";

type ProductClearPricesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: (id: number) => Promise<void>;
};

export function ProductClearPricesDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: ProductClearPricesDialogProps) {
  const [loading, setLoading] = React.useState(false);

  async function handleConfirm() {
    if (!product) return;
    setLoading(true);
    try {
      await onConfirm(product.id);
      onOpenChange(false);
    } catch {
      /* toast handled by action hook */
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={(next) => {
        if (!loading) onOpenChange(next);
      }}
      title="حذف تسعيرات المنتج؟"
      description={
        product ? (
          <span>
            سيتم حذف/إلغاء تسعيرات هذا المنتج الحالية، وسيظهر المنتج كمنتج بدون سعر.
            <span className="mt-2 block font-semibold text-foreground">«{product.name}»</span>
          </span>
        ) : (
          "سيظهر المنتج كمنتج بدون سعر."
        )
      }
      onConfirm={() => void handleConfirm()}
      isLoading={loading}
      loadingLabel="جار حذف التسعيرات"
      confirmLabel="حذف التسعيرات"
    />
  );
}
