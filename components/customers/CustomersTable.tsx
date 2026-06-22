"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
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
  formatArDateTime,
  formatBalanceAmount,
  formatUsdAmount,
  formatCustomerLastActivity,
  getCustomerColumnLabel,
  getCustomerTypeLabel,
  customerInitials,
  type Customer,
  type CustomerTableColumnId,
  type CustomersListMeta,
} from "@/features/customers"
import { CustomerBalanceBadge } from "./customer-balance-badge"
import { CustomerContactBadges } from "./customer-contact-badges"
import { CustomerRowActionsMenuContent } from "./customer-row-actions-menu"

interface CustomersTableProps {
  customers: Customer[]
  meta?: CustomersListMeta
  visibleColumns: CustomerTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddCustomer: () => void
  onViewDetails: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onToggleActive: (customer: Customer) => void
}

type ContextMenuState = {
  x: number
  y: number
  customer: Customer
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

export function CustomersTable({
  customers,
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
  onAddCustomer,
  onEdit,
  onDelete,
  onToggleActive,
}: CustomersTableProps) {
  const router = useRouter()
  const orderedCols = visibleColumns.map((id) => ({
    id,
    label: getCustomerColumnLabel(id),
  }))
  const perPage = meta?.per_page ?? 15

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const goToCustomer = useCallback(
    (id: number) => {
      router.push(`/dashboard/customers/${id}`)
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

  function renderCell(colId: CustomerTableColumnId, customer: Customer, rowIndex: number) {
    const key = `${customer.id}-${colId}`
    const rowNumber = (currentPage - 1) * perPage + rowIndex + 1
    const lastActivity = formatCustomerLastActivity(customer)

    switch (colId) {
      case "row_number":
        return (
          <TableCell key={key} className="w-12 text-center font-mono text-xs text-muted-foreground">
            {rowNumber}
          </TableCell>
        )
      case "customer_name":
        return (
          <TableCell key={key} className="text-right">
            <div className="flex items-center justify-start gap-2.5">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {customerInitials(customer.name) || "—"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{customer.name}</p>
                {customer.contact_person ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {customer.contact_person}
                  </p>
                ) : null}
                {customer.code ? (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {customer.code}
                  </p>
                ) : null}
              </div>
            </div>
          </TableCell>
        )
      case "contact_phone":
        return (
          <TableCell key={key} className="text-start">
            <CustomerContactBadges customer={customer} />
          </TableCell>
        )
      case "customer_type":
        return (
          <TableCell key={key} className="text-center text-sm">
            {getCustomerTypeLabel(customer.customer_type)}
          </TableCell>
        )
      case "code":
        return (
          <TableCell key={key} className="text-center font-mono text-xs" dir="ltr">
            {customer.code || "—"}
          </TableCell>
        )
      case "car_number":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {customer.car_number || "—"}
          </TableCell>
        )
      case "current_balance":
        return (
          <TableCell key={key} className="text-center">
            <CustomerBalanceBadge balance={customer.current_balance} />
          </TableCell>
        )
      case "opening_balance":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatBalanceAmount(customer.opening_balance)}
          </TableCell>
        )
      case "status":
        return (
          <TableCell key={key} className="text-center">
            {customer.is_active ? (
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
            <p className="text-xs">{lastActivity.primary}</p>
            {lastActivity.secondary ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{lastActivity.secondary}</p>
            ) : null}
          </TableCell>
        )
      case "whatsapp":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {customer.whatsapp || "—"}
          </TableCell>
        )
      case "email":
        return (
          <TableCell key={key} className="text-right text-sm">
            {customer.email || "—"}
          </TableCell>
        )
      case "address":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{customer.address || "—"}</span>
          </TableCell>
        )
      case "credit_limit":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatUsdAmount(customer.credit_limit)}
          </TableCell>
        )
      case "notes":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{customer.notes || "—"}</span>
          </TableCell>
        )
      case "created_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(customer.created_at)}
          </TableCell>
        )
      case "updated_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(customer.updated_at)}
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
              <CustomerRowActionsMenuContent
                customer={customer}
                stopPropagation
                onViewDetails={() => goToCustomer(customer.id)}
                onEdit={() => onEdit(customer)}
                onToggleActive={() => onToggleActive(customer)}
                onDelete={() => onDelete(customer)}
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
      {customers.map((customer, index) => (
        <TableRow
          key={customer.id}
          className="cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => goToCustomer(customer.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, customer })
          }}
        >
          {orderedCols.map((col) => renderCell(col.id, customer, index))}
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
          <p className="font-medium">لا يوجد زبائن مطابقون للبحث أو الفلاتر الحالية.</p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
            <Users className="size-10 animate-pulse" strokeWidth={1.25} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">لا يوجد زبائن حالياً</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة زبون جديد</p>
          </div>
          <Button type="button" onClick={onAddCustomer} className="gap-2 rounded-xl">
            <Plus className="size-4" />
            إضافة زبون
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

      {!isLoading && customers.length > 0 && meta != null && lastPage > 1 ? (
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
            <CustomerRowActionsMenuContent
              customer={contextMenu.customer}
              onViewDetails={() => {
                goToCustomer(contextMenu.customer.id)
                setContextMenu(null)
              }}
              onEdit={() => {
                onEdit(contextMenu.customer)
                setContextMenu(null)
              }}
              onToggleActive={() => {
                onToggleActive(contextMenu.customer)
                setContextMenu(null)
              }}
              onDelete={() => {
                onDelete(contextMenu.customer)
                setContextMenu(null)
              }}
            />
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  )
}
