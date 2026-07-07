"use client"

import { Receipt, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { type PurchaseInvoice, type PurchasesListMeta } from "@/features/purchases"
import { PurchaseCard } from "./purchase-card"

interface PurchasesCardsProps {
  purchases: PurchaseInvoice[]
  meta?: PurchasesListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onViewDetails: (purchase: PurchaseInvoice) => void
  onEdit: (purchase: PurchaseInvoice) => void
  onPrint: (purchase: PurchaseInvoice) => void
  onCancel: (purchase: PurchaseInvoice) => void
  onDelete: (purchase: PurchaseInvoice) => void
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border/40 bg-card p-5 shadow-xl space-y-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="border-t border-border/40 pt-3 flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

export function PurchasesCards({
  purchases,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
  onViewDetails,
  onEdit,
  onPrint,
  onCancel,
  onDelete,
}: PurchasesCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isFilteredNoHits) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
        <Search className="size-6 opacity-60" />
        <p className="font-medium">لا توجد فواتير مطابقة للبحث أو الفلاتر الحالية.</p>
      </div>
    )
  }

  if (isTrueEmpty) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <Receipt className="size-10 text-primary" strokeWidth={1.25} />
        <p className="text-lg font-semibold">لا توجد فواتير مشتريات حالياً</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 *:min-w-0">
        {purchases.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={purchase}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onPrint={onPrint}
            onCancel={onCancel}
            onDelete={onDelete}
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
