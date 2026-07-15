"use client";

import { ProductPriceStatusBadge } from "@/components/products/ProductPriceStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/custom-toast-with-icons";
import {
  emptyProductPricesForm,
  productPricesToForm,
  productPricesToPayload,
  useProductActions,
  useProductPrices,
  validateProductPrices,
  type Product,
  type ProductPrice,
  type ProductPricesFormValue,
} from "@/features/products";
import { ApiRequestError } from "@/lib/api";
import { motion } from "framer-motion";
import { Check, CircleDollarSign, Loader2, X } from "lucide-react";
import * as React from "react";
import { ProductPricesManager } from "./ProductPricesManager";

type ProductPricesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

export function ProductPricesDialog({ open, onOpenChange, product }: ProductPricesDialogProps) {
  const query = useProductPrices(product?.id ?? null, open);
  return (
    <ProductPricesDialogState
      key={`${product?.id ?? "none"}-${open ? "open" : "closed"}-${query.isLoading ? "loading" : "ready"}`}
      open={open}
      onOpenChange={onOpenChange}
      product={product}
      prices={query.prices}
      isLoading={query.isLoading}
      error={query.error}
    />
  );
}

type ProductPricesDialogStateProps = ProductPricesDialogProps & {
  prices: ProductPrice[];
  isLoading: boolean;
  error?: Error;
};

function ProductPricesDialogState({
  open,
  onOpenChange,
  product,
  prices,
  isLoading,
  error,
}: ProductPricesDialogStateProps) {
  const { saveProductPrices } = useProductActions();
  const [value, setValue] = React.useState<ProductPricesFormValue>(() => productPricesToForm(prices));
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = React.useState(false);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setValue(emptyProductPricesForm());
      setFieldErrors({});
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!product || submitting) return;
    const validationErrors = validateProductPrices(value);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    try {
      await saveProductPrices(product.id, productPricesToPayload(value));
      handleOpenChange(false);
    } catch (submitError) {
      if (submitError instanceof ApiRequestError && submitError.errors) {
        setFieldErrors(submitError.errors);
      } else if (!(submitError instanceof ApiRequestError && submitError.status === 401)) {
        toast.error("تعذر تنفيذ العملية. حاول مجدداً.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:min-h-[min(60vh,560px)] sm:max-w-[760px]"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="relative z-10 shrink-0 border-b border-border/50 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-4 pt-6 backdrop-blur-sm">
            <DialogHeader className="space-y-2 text-right sm:text-right">
              <div className="flex items-start gap-3">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
                  aria-hidden
                >
                  <CircleDollarSign className="size-5" />
                </motion.span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <DialogTitle className="text-lg font-bold leading-snug tracking-tight">إدارة أسعار المنتج</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                      <p>حدد أسعار البيع حسب نوع الزبون. يمكن تفعيل أو إيقاف كل سعر بشكل مستقل.</p>
                      {product ? (
                        <div className="flex flex-wrap items-center gap-2 text-foreground/90">
                          <span className="font-semibold">{product.name}</span>
                          <span className="font-mono" dir="ltr">{product.code || product.barcode || "—"}</span>
                          <ProductPriceStatusBadge status={product.price_status} />
                        </div>
                      ) : null}
                      <p><span className="text-destructive">*</span> يشير إلى حقل مطلوب.</p>
                    </div>
                  </DialogDescription>
                </div>
                <button type="button" onClick={() => handleOpenChange(false)} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground" aria-label="إغلاق">
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="pointer-events-none sticky top-0 z-[1] -mb-2 h-2 bg-gradient-to-b from-background to-transparent" />
            <div className="space-y-3 px-6 py-4">
              {isLoading ? (
                Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 w-full rounded-2xl" />)
              ) : error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center text-sm text-destructive">
                  تعذر تحميل أسعار المنتج. أغلق النافذة وحاول مجدداً.
                </div>
              ) : (
                <ProductPricesManager value={value} onChange={setValue} defaultExpanded errors={fieldErrors} disabled={submitting} />
              )}
            </div>
            <div className="pointer-events-none sticky bottom-0 z-[1] -mt-2 h-2 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="shrink-0 border-t border-border/50 bg-gradient-to-t from-muted/30 to-background px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-start gap-2">
              <Button type="submit" className="min-w-36 gap-2 rounded-xl shadow-sm" disabled={submitting || isLoading || Boolean(error)} aria-busy={submitting}>
                {submitting ? <><Loader2 className="size-4 animate-spin" /><span>جارٍ الحفظ</span></> : <><Check className="size-4" />حفظ الأسعار</>}
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="gap-2 rounded-xl">
                <X className="size-4" />إلغاء
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
