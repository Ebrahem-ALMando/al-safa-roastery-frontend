"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatProductPrice,
  PRODUCT_PRICE_TYPES,
  PRODUCT_PRICE_TYPE_LABELS_AR,
  useProductPrices,
  type Product,
  type ProductPrice,
  type ProductPriceType,
} from "@/features/products";
import { cn } from "@/lib/utils";
import { Boxes, CarFront, CircleDollarSign, ShoppingBag, UserRound, X } from "lucide-react";

type ProductPricesReadOnlyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

const cardTheme = {
  consumer: {
    icon: UserRound,
    card: "border-violet-200/80 bg-violet-50/35 dark:border-violet-900 dark:bg-violet-950/25",
    iconBox: "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800",
  },
  retail: {
    icon: ShoppingBag,
    card: "border-emerald-200/80 bg-emerald-50/35 dark:border-emerald-900 dark:bg-emerald-950/25",
    iconBox: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  },
  wholesale: {
    icon: Boxes,
    card: "border-amber-200/80 bg-amber-50/35 dark:border-amber-900 dark:bg-amber-950/25",
    iconBox: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  },
  car: {
    icon: CarFront,
    card: "border-sky-200/80 bg-sky-50/35 dark:border-sky-900 dark:bg-sky-950/25",
    iconBox: "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
  },
} as const;

export function ProductPricesReadOnlyDialog({
  open,
  onOpenChange,
  product,
}: ProductPricesReadOnlyDialogProps) {
  const { prices, isLoading, error } = useProductPrices(product?.id ?? null, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,760px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[720px]"
      >
        <div className="relative z-10 shrink-0 border-b border-border/50 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-4 pt-6">
          <DialogHeader className="space-y-2 text-right sm:text-right">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <CircleDollarSign className="size-5" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <DialogTitle className="text-lg font-bold leading-snug">أسعار المنتج</DialogTitle>
                <DialogDescription className="text-xs leading-relaxed">
                  عرض أسعار البيع حسب نوع الزبون.
                </DialogDescription>
                {product ? (
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center text-sm text-destructive">
              تعذر تحميل أسعار المنتج. أغلق النافذة وحاول مجددا.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {PRODUCT_PRICE_TYPES.map((type) => (
                <ReadOnlyPriceCard
                  key={type}
                  type={type}
                  price={prices.find((item) => item.price_type === type)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyPriceCard({
  type,
  price,
}: {
  type: ProductPriceType;
  price?: ProductPrice;
}) {
  const theme = cardTheme[type];
  const Icon = theme.icon;
  const isActive = Boolean(price?.is_active);

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", theme.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{PRODUCT_PRICE_TYPE_LABELS_AR[type]}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums" dir="ltr">
            {price ? formatProductPrice(price.price) : "غير محدد"}
          </p>
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl ring-1", theme.iconBox)}>
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={
            isActive
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700"
              : "border-slate-300 bg-slate-100 text-slate-700"
          }
        >
          {isActive ? "فعال" : "موقوف"}
        </Badge>
      </div>
      {price?.notes ? (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {price.notes}
        </p>
      ) : null}
    </div>
  );
}
