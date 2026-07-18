"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Check, Info, Loader2, Package, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatCostPerKg, formatQuantityKg } from "@/features/items"
import type { ItemType } from "@/features/items"
import { useItemPickerList, type ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import { ItemTypeBadge } from "@/components/items/item-type-badge"

type ItemPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: ItemPickerRow) => void
  onSelectMany?: (items: ItemPickerRow[]) => void
  excludeItemIds?: number[]
  title?: string
  description?: string
  itemType?: ItemType
  activeOnly?: boolean
  selectionMode?: "single" | "multiple"
  variant?: "default" | "operation"
  selectedItemId?: number | string | null
  searchMode?: "local" | "server"
  clearSearchAfterEnterSelection?: boolean
  singleSelectionHint?: string
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
  title,
  description,
  itemType,
  activeOnly = true,
  selectionMode = "multiple",
  variant = "default",
  selectedItemId,
  searchMode = "server",
  clearSearchAfterEnterSelection = false,
  singleSelectionHint = "اختر صنفاً واحداً لتنفيذ العملية عليه.",
}: ItemPickerDialogProps) {
  const [query, setQuery] = React.useState("")
  const [selectedItems, setSelectedItems] = React.useState<Map<string, ItemPickerRow>>(() => new Map())
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [operationHasInteracted, setOperationHasInteracted] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement | null>(null)
  const rowRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const isOperationPicker = variant === "operation" && selectionMode === "single"

  const { rows, isLoading, error, isSearchPending } = useItemPickerList({
    open,
    search: query,
    activeOnly,
    itemType,
    clientSearch: searchMode === "local",
  })
  const filteredRows = React.useMemo(
    () => rows.filter((r) => !excludeItemIds.includes(Number.parseInt(r.id, 10))),
    [excludeItemIds, rows]
  )
  const selectedRows = React.useMemo(() => Array.from(selectedItems.values()), [selectedItems])
  const availableRows = React.useMemo(
    () => isOperationPicker ? filteredRows : filteredRows.filter((row) => !selectedItems.has(row.id)),
    [filteredRows, isOperationPicker, selectedItems]
  )
  const initialOperationIndex = isOperationPicker && !operationHasInteracted && query.trim() === "" && selectedItemId != null
    ? availableRows.findIndex((row) => row.id === String(selectedItemId))
    : -1
  const activeRowIndex = availableRows.length === 0
    ? 0
    : initialOperationIndex >= 0
      ? initialOperationIndex
      : Math.min(activeIndex, availableRows.length - 1)

  React.useEffect(() => {
    if (!open) return
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [open])

  React.useEffect(() => {
    const activeItem = availableRows[activeRowIndex]
    if (!activeItem) return
    rowRefs.current[activeItem.id]?.scrollIntoView({ block: "nearest" })
  }, [activeRowIndex, availableRows])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("")
      setSelectedItems(new Map())
      if (isOperationPicker) {
        setActiveIndex(0)
        setOperationHasInteracted(false)
      }
    }
    onOpenChange(nextOpen)
  }

  const handlePick = (item: ItemPickerRow) => {
    onSelect(item)
    handleOpenChange(false)
  }

  const toggleSelection = (item: ItemPickerRow) => {
    setSelectedItems((prev) => {
      if (selectionMode === "single") {
        return prev.has(item.id) ? new Map() : new Map([[item.id, item]])
      }

      const next = new Map(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.set(item.id, item)
      }
      return next
    })
  }

  const removeSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      next.delete(itemId)
      return next
    })
  }

  const handleConfirmSelection = () => {
    if (isOperationPicker) {
      const activeItem = availableRows[activeRowIndex]
      if (activeItem) handlePick(activeItem)
      return
    }

    const items = Array.from(selectedItems.values())
    if (items.length === 0) return
    if (selectionMode === "single") {
      onSelect(items[0])
      handleOpenChange(false)
      return
    }

    if (onSelectMany) {
      onSelectMany(items)
    } else {
      items.forEach(onSelect)
    }
    handleOpenChange(false)
  }

  const selectVisibleRows = () => {
    if (filteredRows.length === 0) return
    setSelectedItems((prev) => {
      const next = new Map(prev)
      filteredRows.forEach((item) => next.set(item.id, item))
      return next
    })
  }

  const handleDialogKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.nativeEvent.isComposing) return

    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault()
      if (selectedItems.size > 0) {
        handleConfirmSelection()
        return
      }
      const activeItem = availableRows[activeRowIndex]
      if (activeItem) {
        onSelect(activeItem)
        handleOpenChange(false)
      }
      return
    }

    if (selectionMode === "multiple" && event.altKey && event.code === "KeyS") {
      event.preventDefault()
      event.stopPropagation()
      handleConfirmSelection()
      return
    }

    if (selectionMode === "multiple" && event.altKey && event.code === "KeyA") {
      event.preventDefault()
      selectVisibleRows()
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (isOperationPicker) setOperationHasInteracted(true)
      setActiveIndex((current) => (
        availableRows.length === 0
          ? 0
          : Math.min((isOperationPicker ? activeRowIndex : current) + 1, availableRows.length - 1)
      ))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (isOperationPicker) setOperationHasInteracted(true)
      setActiveIndex((current) => Math.max((isOperationPicker ? activeRowIndex : current) - 1, 0))
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const activeItem = availableRows[activeRowIndex]
      if (activeItem) {
        if (selectionMode === "single") {
          handlePick(activeItem)
        } else {
          toggleSelection(activeItem)
          if (clearSearchAfterEnterSelection) {
            setQuery("")
            setActiveIndex(0)
          }
        }
      }
    }
  }

  const showMetaHint = false
  const showSkeleton = isLoading && availableRows.length === 0 && selectedRows.length === 0
  const showEmpty = !isLoading && !error && availableRows.length === 0
  const showList = availableRows.length > 0
  const showEndSpinner = isSearchPending || (isLoading && (availableRows.length > 0 || selectedRows.length > 0))
  const selectedCount = selectedItems.size

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex max-h-[min(88vh,720px)] w-[min(100%-1.25rem,560px)] max-w-[min(100%-1.25rem,560px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-[min(100%-1.25rem,560px)]"
        showCloseButton={false}
        onKeyDownCapture={handleDialogKeyboard}
      >
        <DialogHeader className="relative z-10 shrink-0 space-y-0 overflow-visible border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <div className="relative px-6 pt-6 pb-6">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute left-4 top-4 z-30 rounded-lg text-muted-foreground hover:bg-background/70 hover:text-foreground"
              onClick={() => handleOpenChange(false)}
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </Button>
            <div className="flex items-start gap-4" dir="rtl">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-card text-primary shadow-md">
                <Package className="size-7" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-xl font-bold">{title ?? "اختيار صنف"}</DialogTitle>
                <div className="flex items-start justify-between gap-3">
                  <DialogDescription className="min-w-0 flex-1 text-sm">
                    {description ?? "ابحث بالاسم أو الكود ثم اختر صنفاً نشطاً."}
                  </DialogDescription>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    {query.trim() !== "" ? (
                      <Badge variant="secondary" className="gap-1 rounded-lg text-[11px]">
                        {filteredRows.length} مطابقة
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="relative">
                {showEndSpinner ? (
                  <Loader2 className="pointer-events-none absolute right-4 top-1/2 z-1 size-4 -translate-y-1/2 animate-spin text-primary" />
                ) : null}
                <Search className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="الاسم أو الكود..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveIndex(0)
                    if (isOperationPicker) setOperationHasInteracted(true)
                  }}
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
            {!isOperationPicker && selectedRows.length > 0 ? (
              <div className="sticky top-0 z-10 mb-3 space-y-2 rounded-2xl border border-primary/20 bg-background/95 p-3 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-primary">الأصناف المحددة</p>
                  <Badge variant="secondary" className="rounded-lg">{selectedCount} محدد</Badge>
                </div>
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                  {selectedRows.map((item) => (
                    <Badge key={item.id} variant="outline" className="max-w-full gap-1.5 bg-primary/5 py-1.5 pe-1.5 ps-2">
                      <span className="max-w-52 truncate">{item.name}</span>
                      <button
                        type="button"
                        className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeSelection(item.id)}
                        aria-label={`إزالة ${item.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
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
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                    role={isOperationPicker ? "listbox" : undefined}
                    aria-label={isOperationPicker ? "الأصناف المتاحة" : undefined}
                  >
                    {showMetaHint ? (
                      <p className="text-center text-[11px] text-muted-foreground">
                        يُعرض أول {filteredRows.length} نتيجة — زِد دقة البحث.
                      </p>
                    ) : null}
                    {availableRows.map((item, index) => {
                      const isActive = index === activeRowIndex

                      return (
                      <motion.button
                        key={item.id}
                        ref={(el) => {
                          rowRefs.current[item.id] = el
                        }}
                        type="button"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        onClick={() => {
                          setActiveIndex(index)
                          if (isOperationPicker) {
                            setOperationHasInteracted(true)
                          } else {
                            toggleSelection(item)
                          }
                        }}
                        onDoubleClick={() => handlePick(item)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-right transition-all",
                          "hover:border-primary/35 hover:bg-card hover:shadow-md",
                          isActive && "border-primary/45 ring-2 ring-primary/20"
                        )}
                        dir="rtl"
                        role={isOperationPicker ? "option" : undefined}
                        aria-pressed={isOperationPicker ? undefined : false}
                        aria-selected={isOperationPicker ? isActive : undefined}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                          )}
                        >
                          <Package className="size-4" />
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
                      )
                    })}
                  </motion.div>
                ) : showEmpty ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center"
                  >
                    <Search className="size-6 text-muted-foreground" />
                    <p className="font-semibold">{selectedCount > 0 ? "لا توجد نتائج إضافية" : "لا توجد نتائج"}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
            </div>
          </ScrollArea>
        </div>

        <div className="shrink-0 border-t border-border/50 bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className={cn("text-xs text-muted-foreground", isOperationPicker ? "leading-relaxed" : "truncate")}>
                {isOperationPicker
                  ? singleSelectionHint
                  : selectedCount > 0
                  ? `تم تحديد ${selectedCount} صنف`
                  : selectionMode === "single"
                    ? singleSelectionHint
                    : "يمكنك تحديد أكثر من صنف ثم إضافتها دفعة واحدة."}
              </p>
              {!isOperationPicker ? <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 shrink-0 rounded-lg text-muted-foreground"
                    aria-label="اختصارات اختيار الأصناف"
                  >
                    <Info className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" dir="rtl" className="max-w-sm text-right leading-relaxed">
                  <div className="space-y-2">
                    <p className="font-medium">اختصارات الموديل</p>
                    <p className="flex items-center gap-2">
                      <Kbd>↑</Kbd>
                      <Kbd>↓</Kbd>
                      التنقل بين النتائج.
                    </p>
                    <p className="flex items-center gap-2">
                      <Kbd>Enter</Kbd>
                      تحديد النتيجة الحالية.
                    </p>
                    {selectionMode === "multiple" ? (
                      <p className="flex items-center gap-2">
                        <Kbd>Alt+A</Kbd>
                        تحديد النتائج الظاهرة.
                      </p>
                    ) : null}
                    <p className="flex items-center gap-2">
                      <Kbd>{selectionMode === "multiple" ? "Alt+S" : "Ctrl+Enter"}</Kbd>
                      {selectionMode === "single" ? "اختيار الصنف المحدد." : "إضافة المحدد دفعة واحدة."}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip> : null}
            </div>
            <Button
              type="button"
              className="min-w-32 gap-2 rounded-xl"
              disabled={isOperationPicker ? !availableRows[activeRowIndex] : selectedCount === 0}
              onClick={handleConfirmSelection}
            >
              <Check className="size-4" />
              {selectionMode === "single" ? "اختيار الصنف" : "إضافة المحدد"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
