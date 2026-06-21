"use client"

import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Power,
  Search,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  SUPPLIER_TABLE_COLUMNS,
  formatArDateTime,
  formatUsdAmount,
  getBalanceStatusLabel,
  supplierInitials,
  type Supplier,
  type SupplierTableColumnId,
  type SuppliersListMeta,
} from "@/features/suppliers"

interface SuppliersTableProps {
  suppliers: Supplier[]
  meta?: SuppliersListMeta
  visibleColumns: SupplierTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddSupplier: () => void
  onViewDetails: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onToggleActive: (supplier: Supplier) => void
}

function TableRowSkeleton({ colCount }: { colCount: number }) {
  return (
    <TableRow>
      {Array.from({ length: colCount }, (_, i) => (
        <TableCell key={i} className="text-center">
          <Skeleton className="mx-auto h-4 w-20" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function SuppliersTable({
  suppliers,
  meta,
  visibleColumns,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  lastPage,
  canPrev,
  canNext,
  onPageChange,
  onAddSupplier,
  onViewDetails,
  onEdit,
  onDelete,
  onToggleActive,
}: SuppliersTableProps) {
  const visibleSet = new Set(visibleColumns)
  const orderedCols = SUPPLIER_TABLE_COLUMNS.filter((c) => visibleSet.has(c.id))

  function renderCell(colId: SupplierTableColumnId, supplier: Supplier) {
    const key = `${supplier.id}-${colId}`
    switch (colId) {
      case "code":
        return (
          <TableCell key={key} className="text-center font-mono text-xs" dir="ltr">
            {supplier.code || "—"}
          </TableCell>
        )
      case "name":
        return (
          <TableCell key={key} className="text-right">
            <div className="flex items-center justify-start gap-2.5">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {supplierInitials(supplier.name) || "—"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{supplier.name}</p>
                {supplier.contact_person ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {supplier.contact_person}
                  </p>
                ) : null}
              </div>
            </div>
          </TableCell>
        )
      case "contact":
        return (
          <TableCell key={key} className="text-right">
            <div className="flex flex-col items-start gap-1">
              <Badge variant="secondary" className="max-w-[170px]">
                <Phone className="size-3.5" />
                <span className="truncate" dir="ltr">{supplier.phone || "—"}</span>
              </Badge>
              {supplier.contact_person ? (
                <Badge variant="outline" className="max-w-[170px]">
                  <User className="size-3.5" />
                  <span className="truncate">{supplier.contact_person}</span>
                </Badge>
              ) : null}
            </div>
          </TableCell>
        )
      case "current_balance": {
        const balanceInfo = getBalanceStatusLabel(supplier.current_balance)
        return (
          <TableCell key={key} className="text-center">
            <p className="text-sm font-semibold" dir="ltr">
              {formatUsdAmount(supplier.current_balance)}
            </p>
            <Badge variant="outline" className="mt-1 text-xs">
              {balanceInfo.label}
            </Badge>
          </TableCell>
        )
      }
      case "status":
        return (
          <TableCell key={key} className="text-center">
            {supplier.is_active ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
                <CheckCircle2 className="size-3.5" />
                فعال
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                <XCircle className="size-3.5" />
                موقوف
              </Badge>
            )}
          </TableCell>
        )
      case "last_activity":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(supplier.updated_at)}
          </TableCell>
        )
      case "email":
        return (
          <TableCell key={key} className="text-right text-sm">
            {supplier.email || "—"}
          </TableCell>
        )
      case "address":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{supplier.address || "—"}</span>
          </TableCell>
        )
      case "credit_limit":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatUsdAmount(supplier.credit_limit)}
          </TableCell>
        )
      case "notes":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{supplier.notes || "—"}</span>
          </TableCell>
        )
      case "created_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(supplier.created_at)}
          </TableCell>
        )
      case "updated_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(supplier.updated_at)}
          </TableCell>
        )
      case "actions":
        return (
          <TableCell key={key} className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">الإجراءات</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem onClick={() => onViewDetails(supplier)}>
                  <Eye className="size-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(supplier)}>
                  <Pencil className="size-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(supplier)}>
                  <Power className="size-4" />
                  {supplier.is_active ? "إيقاف" : "تفعيل"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(supplier)}
                >
                  <Trash2 className="size-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )
      default:
        return <TableCell key={key}>—</TableCell>
    }
  }

  return (
    <div className="p-0">
      {isLoading ? (
        <Table className="w-full" dir="rtl">
          <TableHeader>
            <TableRow>
              {orderedCols.map((col) => (
                <TableHead key={col.id} className="text-center font-semibold">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }, (_, u) => (
              <TableRowSkeleton key={u} colCount={orderedCols.length} />
            ))}
          </TableBody>
        </Table>
      ) : isFilteredNoHits ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Search className="size-6 opacity-60" />
          <p className="font-medium">لا يوجد موردون مطابقون للبحث أو الفلاتر الحالية.</p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
            <Truck className="size-10 animate-pulse" strokeWidth={1.25} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">لا يوجد موردون حالياً</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة مورد جديد</p>
          </div>
          <Button type="button" onClick={onAddSupplier} className="gap-2 rounded-xl">
            <Plus className="size-4" />
            إضافة مورد
          </Button>
        </div>
      ) : (
        <Table className="w-full" dir="rtl">
            <TableHeader>
              <TableRow>
                {orderedCols.map((col) => (
                  <TableHead key={col.id} className="text-center font-semibold">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => onViewDetails(supplier)}
                >
                  {orderedCols.map((col) => renderCell(col.id, supplier))}
                </TableRow>
              ))}
            </TableBody>
        </Table>
      )}

      {!isLoading && suppliers.length > 0 && meta != null && lastPage > 1 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <p className="text-center text-sm text-muted-foreground sm:text-start" dir="ltr">
            {meta.total} — صفحة {currentPage} من {lastPage}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!canPrev}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNext}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
