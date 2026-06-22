"use client"

import { Package, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { type Item, type ItemsListMeta } from "@/features/items"
import { ItemCard } from "./item-card"

interface ItemsCardsProps {
  items: Item[]
  meta?: ItemsListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddItem: () => void
  onViewDetails: (item: Item) => void
  onEdit: (item: Item) => void
  onDelete?: (item: Item) => void
  onToggleActive?: (item: Item) => void
}

function ItemCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border/40 bg-card p-5 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="border-t border-border/40 pt-3 flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function ItemsCards({
  items,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
  onAddItem,
  onEdit,
  onDelete,
  onToggleActive,
}: ItemsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isFilteredNoHits) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
        <Search className="size-6 opacity-60" />
        <p className="font-medium">لا يوجد أصناف مطابقة للبحث أو الفلاتر الحالية.</p>
      </div>
    )
  }

  if (isTrueEmpty) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <Package className="size-10 text-primary" strokeWidth={1.25} />
        <p className="text-lg font-semibold">لا يوجد أصناف حالياً</p>
        <Button onClick={onAddItem} className="gap-2 rounded-xl">
          <Plus className="size-4" />
          إضافة صنف
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 *:min-w-0">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={onEdit}
            onRequestDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <ChevronRight className="size-4" />
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {currentPage} من {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            التالي
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
