"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, MoreHorizontal, Receipt, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatArDate,
  formatArDateTime,
  formatLinesCountAr,
  formatUsd,
  getPurchaseColumnLabel,
  getPurchasePaymentMethodLabel,
  purchaseSupplierName,
  type PurchaseInvoice,
  type PurchaseTableColumnId,
  type PurchasesListMeta,
} from "@/features/purchases"
import { PurchasePaymentStatusBadge } from "./PurchasePaymentStatusBadge"
import { PurchaseStatusBadge } from "./PurchaseStatusBadge"
import { PurchaseRowActionsMenuContent } from "./purchase-row-actions-menu"

interface PurchasesTableProps {
  purchases: PurchaseInvoice[]
  meta?: PurchasesListMeta
  visibleColumns: PurchaseTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onViewDetails: (purchase: PurchaseInvoice) => void
  onEdit: (purchase: PurchaseInvoice) => void
  onPrint: (purchase: PurchaseInvoice) => void
  onCancel: (purchase: PurchaseInvoice) => void
  onDelete: (purchase: PurchaseInvoice) => void
}

type ContextMenuState = {
  x: number
  y: number
  purchase: PurchaseInvoice
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

export function PurchasesTable({
  purchases,
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
  onViewDetails,
  onEdit,
  onPrint,
  onCancel,
  onDelete,
}: PurchasesTableProps) {
  const router = useRouter()
  const orderedCols = visibleColumns.map((id) => ({
    id,
    label: getPurchaseColumnLabel(id),
  }))
  const perPage = meta?.per_page ?? 15

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const goToPurchase = useCallback(
    (id: number) => {
      router.push(`/dashboard/purchases/${id}`)
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

  function renderCell(colId: PurchaseTableColumnId, purchase: PurchaseInvoice, rowIndex: number) {
    const key = `${purchase.id}-${colId}`
    const rowNumber = (currentPage - 1) * perPage + rowIndex + 1

    switch (colId) {
      case "row_number":
        return (
          <TableCell key={key} className="w-12 text-center font-mono text-xs text-muted-foreground">
            {rowNumber}
          </TableCell>
        )
      case "invoice_number":
        return (
          <TableCell key={key} className="text-center font-mono text-sm font-semibold" dir="ltr">
            {purchase.invoice_number}
          </TableCell>
        )
      case "invoice_date":
        return (
          <TableCell key={key} className="text-center text-sm">
            {formatArDate(purchase.invoice_date)}
          </TableCell>
        )
      case "supplier_name":
        return (
          <TableCell key={key} className="text-right text-sm font-medium">
            {purchaseSupplierName(purchase)}
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={key} className="text-center">
            <PurchaseStatusBadge status={purchase.status} />
          </TableCell>
        )
      case "payment_status":
        return (
          <TableCell key={key} className="text-center">
            <PurchasePaymentStatusBadge status={purchase.payment_status} />
          </TableCell>
        )
      case "payment_method":
        return (
          <TableCell key={key} className="text-center text-sm">
            {getPurchasePaymentMethodLabel(purchase.payment_method)}
          </TableCell>
        )
      case "total":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatUsd(purchase.total)}
          </TableCell>
        )
      case "paid_amount":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatUsd(purchase.paid_amount)}
          </TableCell>
        )
      case "remaining_amount":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatUsd(purchase.remaining_amount)}
          </TableCell>
        )
      case "lines_count":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatLinesCountAr(purchase.lines_count)}
          </TableCell>
        )
      case "notes":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{purchase.notes || "—"}</span>
          </TableCell>
        )
      case "completed_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(purchase.completed_at)}
          </TableCell>
        )
      case "cancelled_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(purchase.cancelled_at)}
          </TableCell>
        )
      case "created_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(purchase.created_at)}
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
              <PurchaseRowActionsMenuContent
                purchase={purchase}
                stopPropagation
                onViewDetails={() => onViewDetails(purchase)}
                onEdit={
                  purchase.status === "draft" ? () => onEdit(purchase) : undefined
                }
                onPrint={
                  purchase.status !== "draft" ? () => onPrint(purchase) : undefined
                }
                onCancel={
                  purchase.status === "completed" ? () => onCancel(purchase) : undefined
                }
                onDelete={purchase.status === "draft" ? () => onDelete(purchase) : undefined}
              />
            </DropdownMenu>
          </TableCell>
        )
      default:
        return <TableCell key={key}>—</TableCell>
    }
  }

  const tableBody = (
    <>
      {purchases.map((purchase, index) => (
        <TableRow
          key={purchase.id}
          className="cursor-pointer transition-colors hover:bg-muted/40"
          onClick={() => goToPurchase(purchase.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, purchase })
          }}
        >
          {orderedCols.map((col) => renderCell(col.id, purchase, index))}
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
          <p className="font-medium">لا توجد فواتير مطابقة للبحث أو الفلاتر الحالية.</p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
            <Receipt className="size-10 animate-pulse" strokeWidth={1.25} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">لا توجد فواتير مشتريات حالياً</p>
            <p className="text-sm text-muted-foreground">ستظهر الفواتير هنا عند إنشائها من النظام.</p>
          </div>
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

      {!isLoading && purchases.length > 0 && meta != null && lastPage > 1 ? (
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
                style={{
                  top: contextMenu.y,
                  left: contextMenu.x,
                  width: 1,
                  height: 1,
                  pointerEvents: "none",
                }}
              />
            </DropdownMenuTrigger>
            <PurchaseRowActionsMenuContent
              purchase={contextMenu.purchase}
              onViewDetails={() => {
                onViewDetails(contextMenu.purchase)
                setContextMenu(null)
              }}
              onEdit={
                contextMenu.purchase.status === "draft"
                  ? () => {
                      onEdit(contextMenu.purchase)
                      setContextMenu(null)
                    }
                  : undefined
              }
              onPrint={
                contextMenu.purchase.status !== "draft"
                  ? () => {
                      onPrint(contextMenu.purchase)
                      setContextMenu(null)
                    }
                  : undefined
              }
              onCancel={
                contextMenu.purchase.status === "completed"
                  ? () => {
                      onCancel(contextMenu.purchase)
                      setContextMenu(null)
                    }
                  : undefined
              }
              onDelete={
                contextMenu.purchase.status === "draft"
                  ? () => {
                      onDelete(contextMenu.purchase)
                      setContextMenu(null)
                    }
                  : undefined
              }
            />
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  )
}
