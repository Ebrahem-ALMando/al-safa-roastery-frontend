"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Check, Loader2, Package, Search } from "lucide-react"
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
import { formatCostPerKg, formatQuantityKg } from "@/features/items"
import { useItemPickerList, type ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import { ItemTypeBadge } from "@/components/items/item-type-badge"

type ItemPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: ItemPickerRow) => void
  onSelectMany?: (items: ItemPickerRow[]) => void
  excludeItemIds?: number[]
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3" dir="rtl">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="ms-auto h-4 w-2/3" />
        <Skeleton className="ms-auto h-3 w-1/2" />
      </div>
    </div>
  )
}

export function ItemPickerDialog({
  open,
  onOpenChange,
  onSelect,
  onSelectMany,
  excludeItemIds = [],
}: ItemPickerDialogProps) {
  const [query, setQuery] = React.useState("")
  const [selectedItems, setSelectedItems] = React.useState<Map<string, ItemPickerRow>>(() => new Map())

  const { rows, meta, isLoading, error, isSearchPending } = useItemPickerList({ open, search: query })
  const filteredRows = rows.filter((r) => !excludeItemIds.includes(Number.parseInt(r.id, 10)))

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("")
      setSelectedItems(new Map())
    }
    onOpenChange(nextOpen)
  }

  const handlePick = (item: ItemPickerRow) => {
    onSelect(item)
    handleOpenChange(false)
  }

  const toggleSelection = (item: ItemPickerRow) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.set(item.id, item)
      }
      return next
    })
  }

  const handleConfirmSelection = () => {
    const items = Array.from(selectedItems.values())
    if (items.length === 0) return
    if (onSelectMany) {
      onSelectMany(items)
    } else {
      items.forEach(onSelect)
    }
    handleOpenChange(false)
  }

  const totalInDb = meta?.total
  const showMetaHint =
    query.trim() !== "" &&
    typeof totalInDb === "number" &&
    totalInDb > filteredRows.length &&
    filteredRows.length > 0
  const showSkeleton = isLoading && filteredRows.length === 0
  const showEmpty = !isLoading && !error && filteredRows.length === 0
  const showList = filteredRows.length > 0
  const showEndSpinner = isSearchPending || (isLoading && filteredRows.length > 0)
  const selectedCount = selectedItems.size

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex max-h-[min(88vh,720px)] w-[min(100%-1.25rem,560px)] max-w-[min(100%-1.25rem,560px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-[min(100%-1.25rem,560px)]"
        showCloseButton
      >
        <DialogHeader className="relative z-10 shrink-0 space-y-0 overflow-visible border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <div className="relative px-6 pt-6 pb-6">
            <div className="flex items-start gap-4" dir="rtl">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-card text-primary shadow-md">
                <Package className="size-7" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-xl font-bold">اختيار صنف</DialogTitle>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    {selectedCount > 0 ? (
                      <Badge className="gap-1 rounded-lg text-[11px]">
                        {selectedCount} محدد
                      </Badge>
                    ) : null}
                    {query.trim() !== "" ? (
                      <Badge variant="secondary" className="gap-1 rounded-lg text-[11px]">
                        {filteredRows.length} مطابقة
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <DialogDescription className="text-sm">
                  ابحث بالاسم أو الكود ثم اختر صنفاً نشطاً.
                </DialogDescription>
              </div>
            </div>
            <div className="mt-5">
              <div className="relative">
                {showEndSpinner ? (
                  <Loader2 className="pointer-events-none absolute right-4 top-1/2 z-1 size-4 -translate-y-1/2 animate-spin text-primary" />
                ) : null}
                <Search className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="الاسم أو الكود..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={cn(
                    "h-11 rounded-xl border-border/60 bg-card/80 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/70",
                    showEndSpinner ? "pe-16" : "pe-10",
                    query.trim() !== "" ? "ps-16" : "ps-3"
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
          </div>
        </DialogHeader>

        <div className="relative z-0 min-h-0 flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full" dir="rtl">
            <div className="space-y-2 p-4 pb-5" dir="rtl">
            {error ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
                <AlertCircle className="size-6 text-destructive" />
                <p className="font-semibold text-destructive">تعذر تحميل الأصناف</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {showSkeleton ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <RowSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : showList ? (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {showMetaHint ? (
                      <p className="text-center text-[11px] text-muted-foreground">
                        يُعرض أول {filteredRows.length} نتيجة — زِد دقة البحث.
                      </p>
                    ) : null}
                    {filteredRows.map((item, index) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        onClick={() => toggleSelection(item)}
                        onDoubleClick={() => handlePick(item)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-right transition-all",
                          "hover:border-primary/35 hover:bg-card hover:shadow-md",
                          selectedItems.has(item.id) && "border-primary/50 bg-primary/5 ring-2 ring-primary/15"
                        )}
                        dir="rtl"
                        aria-pressed={selectedItems.has(item.id)}
                      >
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
                            selectedItems.has(item.id) && "bg-primary text-primary-foreground"
                          )}
                        >
                          {selectedItems.has(item.id) ? <Check className="size-4" /> : <Package className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex flex-wrap items-center justify-start gap-2">
                            <p className="truncate text-sm font-bold">{item.name}</p>
                            <ItemTypeBadge itemType={item.itemType} />
                          </div>
                          <p className="sr-only">
                            {item.code} {formatQuantityKg(item.currentQuantityKg)} {formatCostPerKg(item.averageCost)}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <span>الكود:</span>
                              <span className="font-medium tabular-nums" dir="ltr">{item.code}</span>
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="inline-flex items-center gap-1">
                              <span>المخزون:</span>
                              <span className="tabular-nums" dir="ltr">{formatQuantityKg(item.currentQuantityKg)}</span>
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="inline-flex items-center gap-1">
                              <span>التكلفة:</span>
                              <span className="tabular-nums" dir="ltr">{formatCostPerKg(item.averageCost)}</span>
                            </span>
                          </div>
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
        </div>

        <div className="shrink-0 border-t border-border/50 bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {selectedCount > 0 ? `تم تحديد ${selectedCount} صنف` : "يمكنك تحديد أكثر من صنف ثم إضافتها دفعة واحدة."}
            </p>
            <Button
              type="button"
              className="min-w-32 gap-2 rounded-xl"
              disabled={selectedCount === 0}
              onClick={handleConfirmSelection}
            >
              <Check className="size-4" />
              إضافة المحدد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
