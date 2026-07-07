"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Loader2, Search, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatUsd, useSupplierPickerList, type SupplierPickerRow } from "@/features/purchases"

type SupplierSelectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (supplier: SupplierPickerRow) => void
}

function RowSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/50 bg-card/50 p-5">
      <Skeleton className="mb-4 size-14 shrink-0 rounded-2xl" />
      <Skeleton className="mb-2 h-5 w-full max-w-[140px]" />
      <Skeleton className="mb-1.5 h-4 w-full max-w-[100px]" />
      <Skeleton className="h-3.5 w-full max-w-[120px]" />
    </div>
  )
}

export function SupplierSelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: SupplierSelectionDialogProps) {
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const { rows, meta, isLoading, error, isSearchPending } = useSupplierPickerList({
    open,
    search: query,
  })

  const handlePick = (supplier: SupplierPickerRow) => {
    onSelect(supplier)
    onOpenChange(false)
  }

  const totalInDb = meta?.total
  const showMetaHint =
    typeof totalInDb === "number" && totalInDb > rows.length && rows.length > 0
  const showSkeleton = isLoading && rows.length === 0
  const showEmpty = !isLoading && !error && rows.length === 0
  const showGrid = rows.length > 0
  const showEndSpinner = isSearchPending || (isLoading && rows.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex max-h-[min(92vh,860px)] w-[min(100%-1.25rem,940px)] max-w-[min(100%-1.25rem,940px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-[min(100%-1.25rem,940px)]"
        showCloseButton
      >
        <DialogHeader className="relative space-y-0 overflow-hidden border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
                <Truck className="size-8 sm:size-10" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-xl font-bold leading-tight sm:text-2xl">
                  اختيار المورد
                </DialogTitle>
                <DialogDescription className="text-sm">
                  ابحث بالاسم أو الكود — ثم اختر مورداً من الشبكة.
                </DialogDescription>
                {query.trim() !== "" ? (
                  <Badge variant="secondary" className="gap-1 rounded-lg text-[11px]">
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
                  query.trim() !== "" ? "ps-16" : "ps-3"
                )}
                aria-label="بحث الموردين"
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

        <ScrollArea className="max-h-[calc(92vh-240px)] flex-1">
          <div className="p-4 sm:p-6">
            {error ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
                <AlertCircle className="size-6 text-destructive" />
                <p className="font-semibold text-destructive">تعذر تحميل الموردين</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {showSkeleton ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <RowSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : showGrid ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {showMetaHint ? (
                      <p className="text-center text-[11px] text-muted-foreground">
                        يُعرض أول {rows.length} نتيجة من أصل {totalInDb?.toLocaleString("ar-SA")} — زِد
                        دقة البحث.
                      </p>
                    ) : null}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {rows.map((supplier, index) => (
                        <motion.button
                          key={supplier.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                          onClick={() => handlePick(supplier)}
                          className={cn(
                            "group flex flex-col items-center rounded-2xl border border-border/60 bg-card/70 p-5 text-center transition-all",
                            "hover:border-primary/35 hover:bg-card hover:shadow-md",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          )}
                        >
                          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Truck className="size-6" />
                          </div>
                          <p className="line-clamp-2 text-sm font-bold leading-snug">{supplier.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                            {supplier.code}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                            {supplier.phone}
                          </p>
                          <p className="mt-2 text-xs font-medium tabular-nums text-foreground/80" dir="ltr">
                            {formatUsd(supplier.currentBalance)}
                          </p>
                        </motion.button>
                      ))}
                    </div>
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
                    <p className="text-sm text-muted-foreground">لم يُعثر على موردين يطابقون البحث.</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
