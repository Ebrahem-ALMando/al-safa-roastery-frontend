"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowLeftRight, Loader2, Search, Truck, X } from "lucide-react"
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
import { useSupplierPickerList, type SupplierPickerRow } from "@/features/purchases"

export type SupplierPickerValue = {
  id: number
  name: string
} | null

type SupplierPickerProps = {
  value: SupplierPickerValue
  onChange: (value: SupplierPickerValue) => void
  disabled?: boolean
  className?: string
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function SupplierPicker({ value, onChange, disabled = false, className }: SupplierPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const { rows, meta, isLoading, error, isSearchPending } = useSupplierPickerList({
    open,
    search: query,
  })

  const handlePick = (supplier: SupplierPickerRow) => {
    onChange({ id: Number.parseInt(supplier.id, 10), name: supplier.name })
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const totalInDb = meta?.total
  const showMetaHint =
    typeof totalInDb === "number" && totalInDb > rows.length && rows.length > 0
  const showSkeleton = isLoading && rows.length === 0
  const showEmpty = !isLoading && !error && rows.length === 0
  const showList = rows.length > 0
  const showEndSpinner = isSearchPending || (isLoading && rows.length > 0)

  return (
    <>
      <div className={cn("relative w-full", className)}>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={cn(
            "group relative flex h-10 w-full items-center justify-between gap-3 overflow-hidden rounded-xl border px-3 transition-all duration-300",
            "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.99]",
            value ? "border-primary/20 bg-primary/5" : "border-dashed border-muted-foreground/20"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110",
                value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              <Truck className="size-4" />
            </div>
            <span
              className={cn(
                "truncate font-bold tracking-tight transition-colors text-sm",
                value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {value ? value.name : "كل الموردين"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-muted-foreground group-hover:text-primary">
            {value ? (
              <span
                role="button"
                tabIndex={0}
                className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange(null)
                  }
                }}
                aria-label="مسح المورد"
              >
                <X className="size-3.5" />
              </span>
            ) : null}
            <ArrowLeftRight className="size-3.5 transition-transform group-hover:rotate-180" />
          </div>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
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
                  <Truck className="size-7" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <DialogTitle className="text-xl font-bold">اختيار المورد</DialogTitle>
                  <DialogDescription className="text-sm">
                    ابحث بالاسم أو الكود ثم اختر مورداً من القائمة.
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

          <ScrollArea className="max-h-[calc(88vh-220px)] flex-1">
            <div className="space-y-2 p-4">
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
                      className="space-y-2"
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <RowSkeleton key={i} />
                      ))}
                    </motion.div>
                  ) : showList ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {showMetaHint ? (
                        <p className="text-center text-[11px] text-muted-foreground">
                          يُعرض أول {rows.length} نتيجة من أصل {totalInDb?.toLocaleString("ar-SA")} — زِد دقة البحث.
                        </p>
                      ) : null}
                      {rows.map((supplier, index) => (
                        <motion.button
                          key={supplier.id}
                          type="button"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.3) }}
                          onClick={() => handlePick(supplier)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-right transition-all",
                            "hover:border-primary/35 hover:bg-card hover:shadow-md",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          )}
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Truck className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{supplier.name}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                              {supplier.code}
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
                      <p className="text-sm text-muted-foreground">لم يُعثر على موردين يطابقون البحث.</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
