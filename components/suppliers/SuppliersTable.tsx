"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Power,
  Search,
  Trash2,
  Truck,
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
  formatSupplierLastActivity,
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

type ContextMenuState = {
  x: number
  y: number
  supplier: Supplier
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

function formatLastActivity(supplier: Supplier): string {
  return formatSupplierLastActivity(supplier).primary
}

function formatLastActivityDate(supplier: Supplier): string | null {
  return formatSupplierLastActivity(supplier).secondary
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
  onEdit,
  onDelete,
  onToggleActive,
}: SuppliersTableProps) {
  const router = useRouter()
  const visibleSet = new Set(visibleColumns)
  const orderedCols = SUPPLIER_TABLE_COLUMNS.filter((c) => visibleSet.has(c.id))
  const perPage = meta?.per_page ?? 15

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const goToSupplier = useCallback(
    (id: number) => {
      router.push(`/dashboard/suppliers/${id}`)
    },
    [router]
  )

  useEffect(() => {
    if (!contextMenu) return
    function handleClick() {
      setContextMenu(null)
    }
    document.addEventListener("click", handleClick)
    document.addEventListener("scroll", handleClick, true)
    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("scroll", handleClick, true)
    }
  }, [contextMenu])

  function renderCell(colId: SupplierTableColumnId, supplier: Supplier, rowIndex: number) {
    const key = `${supplier.id}-${colId}`
    const rowNumber = (currentPage - 1) * perPage + rowIndex + 1

    switch (colId) {
      case "row_number":
        return (
          <TableCell key={key} className="w-12 text-center font-mono text-xs text-muted-foreground">
            {rowNumber}
          </TableCell>
        )
      case "supplier_name":
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
                {supplier.code ? (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {supplier.code}
                  </p>
                ) : null}
              </div>
            </div>
          </TableCell>
        )
      case "contact_phone":
        return (
          <TableCell key={key} className="text-right">
            <div className="flex flex-col items-start gap-0.5">
              {supplier.contact_person ? (
                <p className="text-sm">{supplier.contact_person}</p>
              ) : null}
              {supplier.phone ? (
                <p
                  className={
                    supplier.contact_person
                      ? "text-xs text-muted-foreground"
                      : "text-sm"
                  }
                  dir="ltr"
                >
                  {supplier.phone}
                </p>
              ) : !supplier.contact_person ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : null}
            </div>
          </TableCell>
        )
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
                <span className="truncate" dir="ltr">
                  {supplier.phone || "—"}
                </span>
              </Badge>
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
      case "last_activity": {
        const activityDate = formatLastActivityDate(supplier)
        return (
          <TableCell key={key} className="text-center text-xs">
            <p className="text-xs">{formatLastActivity(supplier)}</p>
            {activityDate ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{activityDate}</p>
            ) : null}
          </TableCell>
        )
      }
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
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    goToSupplier(supplier.id)
                  }}
                >
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(supplier)
                  }}
                >
                  <Pencil className="size-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleActive(supplier)
                  }}
                >
                  <Power className="size-4" />
                  {supplier.is_active ? "إيقاف" : "تفعيل"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(supplier)
                  }}
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

  const tableBody = (
    <>
      {suppliers.map((supplier, index) => (
        <TableRow
          key={supplier.id}
          className="cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => goToSupplier(supplier.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, supplier })
          }}
        >
          {orderedCols.map((col) => renderCell(col.id, supplier, index))}
        </TableRow>
      ))}
    </>
  )

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
          <TableBody>{tableBody}</TableBody>
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

      {contextMenu ? (
        <div ref={contextMenuRef}>
          <DropdownMenu
            open
            onOpenChange={(open) => {
              if (!open) setContextMenu(null)
            }}
          >
            <DropdownMenuTrigger asChild>
              <span
                className="fixed"
                style={{ top: contextMenu.y, left: contextMenu.x, width: 1, height: 1, pointerEvents: "none" }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem
                onClick={() => {
                  goToSupplier(contextMenu.supplier.id)
                  setContextMenu(null)
                }}
              >
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onEdit(contextMenu.supplier)
                  setContextMenu(null)
                }}
              >
                <Pencil className="size-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onToggleActive(contextMenu.supplier)
                  setContextMenu(null)
                }}
              >
                <Power className="size-4" />
                {contextMenu.supplier.is_active ? "إيقاف" : "تفعيل"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  onDelete(contextMenu.supplier)
                  setContextMenu(null)
                }}
              >
                <Trash2 className="size-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  )
}
