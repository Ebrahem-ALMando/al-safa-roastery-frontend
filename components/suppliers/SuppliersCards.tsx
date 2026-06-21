"use client"

import {
  CheckCircle2,
  Eye,
  Pencil,
  Phone,
  Plus,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatArDateTime,
  formatUsdAmount,
  getBalanceStatusLabel,
  type Supplier,
  type SuppliersListMeta,
} from "@/features/suppliers"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SuppliersCardsProps {
  suppliers: Supplier[]
  meta?: SuppliersListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddSupplier: () => void
  onViewDetails: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
}

function SupplierCardSkeleton() {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function SuppliersCards({
  suppliers,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
  onAddSupplier,
  onViewDetails,
  onEdit,
}: SuppliersCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SupplierCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isFilteredNoHits) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
        <Search className="size-6 opacity-60" />
        <p className="font-medium">لا يوجد موردون مطابقون للبحث أو الفلاتر الحالية.</p>
      </div>
    )
  }

  if (isTrueEmpty) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <Truck className="size-10 text-primary" strokeWidth={1.25} />
        <p className="text-lg font-semibold">لا يوجد موردون حالياً</p>
        <Button onClick={onAddSupplier} className="gap-2 rounded-xl">
          <Plus className="size-4" />
          إضافة مورد
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 *:min-w-0">
        {suppliers.map((supplier) => {
          const balanceInfo = getBalanceStatusLabel(supplier.current_balance)
          return (
            <Card
              key={supplier.id}
              className="rounded-xl border-border/60 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{supplier.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
                      {supplier.code || "—"}
                    </p>
                  </div>
                  {supplier.is_active ? (
                    <Badge className="shrink-0 bg-emerald-500/10 text-emerald-700">
                      <CheckCircle2 className="size-3" />
                      فعال
                    </Badge>
                  ) : (
                    <Badge className="shrink-0 bg-muted text-muted-foreground">
                      <XCircle className="size-3" />
                      موقوف
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {supplier.phone ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" />
                    <span dir="ltr">{supplier.phone}</span>
                  </div>
                ) : null}
                {supplier.contact_person ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="size-3.5 shrink-0" />
                    <span className="truncate">{supplier.contact_person}</span>
                  </div>
                ) : null}
                <div>
                  <p className="font-semibold" dir="ltr">
                    {formatUsdAmount(supplier.current_balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">{balanceInfo.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  آخر تحديث: {formatArDateTime(supplier.updated_at)}
                </p>
              </CardContent>
              <CardFooter className="gap-2 border-t border-border/40 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 rounded-lg"
                  onClick={() => onViewDetails(supplier)}
                >
                  <Eye className="size-3.5" />
                  التفاصيل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 rounded-lg"
                  onClick={() => onEdit(supplier)}
                >
                  <Pencil className="size-3.5" />
                  تعديل
                </Button>
              </CardFooter>
            </Card>
          )
        })}
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
