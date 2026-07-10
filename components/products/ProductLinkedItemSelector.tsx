"use client";

import { ItemTypeBadge } from "@/components/items/item-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCostPerKg, formatQuantityKg } from "@/features/items";
import {
  useItemPickerList,
  type ItemPickerRow,
} from "@/features/purchases/hooks/useItemPickerList";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Package, Search, XCircle } from "lucide-react";
import * as React from "react";

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

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ProductLinkedItemSelector({
  open,
  onOpenChange,
  value,
  onSelect,
  preview,
  error,
}: ProductLinkedItemSelectorProps) {
  const [query, setQuery] = React.useState("");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setQuery("");
    }
  }

  const {
    rows,
    meta,
    isLoading,
    error: loadError,
    isSearchPending,
  } = useItemPickerList({
    open,
    search: query,
    itemType: "ready",
    activeOnly: true,
  });

  const showSkeleton = isLoading && rows.length === 0;
  const showEmpty = !isLoading && !loadError && rows.length === 0;
  const showList = rows.length > 0;
  const showEndSpinner = isSearchPending || (isLoading && rows.length > 0);

  function handlePick(item: ItemPickerRow) {
    onSelect({
      id: Number(item.id),
      name: item.name,
      code: item.code === "—" ? null : item.code,
      itemType: item.itemType,
      currentQuantityKg: item.currentQuantityKg,
      averageCost: item.averageCost,
    });
    onOpenChange(false);
  }

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
            error ? "border-destructive/60" : "border-border/60",
          )}
          onClick={() => onOpenChange(true)}
        >
          {preview ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{preview.name}</p>
                <p
                  className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground"
                  dir="ltr"
                >
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
              <span dir="ltr">
                {formatQuantityKg(preview.currentQuantityKg)}
              </span>
              <span dir="ltr">{formatCostPerKg(preview.averageCost)}</span>
            </div>
          ) : null}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          dir="rtl"
          lang="ar"
          className="flex max-h-[min(88vh,720px)] w-[min(100%-1.25rem,560px)] max-w-[min(100%-1.25rem,560px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-[min(100%-1.25rem,560px)]"
          showCloseButton
        >
          <DialogHeader className="relative space-y-0 overflow-hidden border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
            <div className="relative px-6 pt-6 pb-5">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-card text-primary shadow-md">
                  <Package className="size-7" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <DialogTitle className="text-xl font-bold">
                    اختيار الصنف المرتبط
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    ابحث بالاسم أو الكود ثم اختر صنفاً جاهزاً نشطاً.
                  </DialogDescription>
                  {query.trim() !== "" ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 rounded-lg text-[11px]"
                    >
                      {rows.length} مطابقة
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="relative mt-5">
                {showEndSpinner ? (
                  <Loader2 className="pointer-events-none absolute right-4 top-1/2 z-1 size-4 -translate-y-1/2 animate-spin text-primary" />
                ) : null}
                <Search className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="الاسم أو الكود..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={cn(
                    "h-11 rounded-xl border-border/60 bg-card/80",
                    showEndSpinner ? "pe-16" : "pe-10",
                    query.trim() !== "" ? "ps-16" : "ps-3",
                  )}
                  aria-label="بحث الأصناف"
                />
                {query.trim() !== "" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 left-1 h-8 -translate-y-1/2 rounded-lg text-xs text-muted-foreground"
                    onClick={() => setQuery("")}
                  >
                    مسح
                  </Button>
                ) : null}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(88vh-220px)] flex-1">
            <div className="space-y-2 p-4">
              {loadError ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
                  <AlertCircle className="size-6 text-destructive" />
                  <p className="font-semibold text-destructive">
                    تعذر تحميل الأصناف
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {showSkeleton ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <RowSkeleton key={i} />
                      ))}
                    </motion.div>
                  ) : showList ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {typeof meta?.total === "number" &&
                      meta.total > rows.length &&
                      rows.length > 0 ? (
                        <p className="text-center text-[11px] text-muted-foreground">
                          يُعرض أول {rows.length} نتيجة — زِد دقة البحث.
                        </p>
                      ) : null}
                      {rows.map((item, index) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.3) }}
                          onClick={() => handlePick(item)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-right transition-all",
                            "hover:border-primary/35 hover:bg-card hover:shadow-md",
                          )}
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                            <Package className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-bold">
                                {item.name}
                              </p>
                              <ItemTypeBadge itemType={item.itemType} />
                            </div>
                            <p
                              className="mt-0.5 truncate text-xs text-muted-foreground"
                              dir="ltr"
                            >
                              {item.code} ·{" "}
                              {formatQuantityKg(item.currentQuantityKg)} ·{" "}
                              {formatCostPerKg(item.averageCost)}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : showEmpty ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center"
                    >
                      <Search className="size-6 text-muted-foreground" />
                      <p className="font-semibold">لا توجد نتائج</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
