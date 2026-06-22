"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  formatArDateTime,
  formatCostPerKg,
  formatItemLastActivity,
  formatQuantityKg,
  getItemColumnLabel,
  itemInitials,
  type Item,
  type ItemTableColumnId,
  type ItemsListMeta,
} from "@/features/items"
import { ItemStockBadge } from "./item-stock-badge"
import { ItemTypeBadge } from "./item-type-badge"
import { ItemRowActionsMenuContent } from "./item-row-actions-menu"

interface ItemsTableProps {
  items: Item[]
  meta?: ItemsListMeta
  visibleColumns: ItemTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddItem: () => void
  onViewDetails: (item: Item) => void
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  onToggleActive: (item: Item) => void
}

type ContextMenuState = {
  x: number
  y: number
  item: Item
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

export function ItemsTable({
  items,
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
  onAddItem,
  onEdit,
  onDelete,
  onToggleActive,
}: ItemsTableProps) {
  const router = useRouter()
  const orderedCols = visibleColumns.map((id) => ({
    id,
    label: getItemColumnLabel(id),
  }))
  const perPage = meta?.per_page ?? 15

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const goToItem = useCallback(
    (id: number) => {
      router.push(`/dashboard/items/${id}`)
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

  function renderCell(colId: ItemTableColumnId, item: Item, rowIndex: number) {
    const key = `${item.id}-${colId}`
    const rowNumber = (currentPage - 1) * perPage + rowIndex + 1
    const lastActivity = formatItemLastActivity(item)

    switch (colId) {
      case "row_number":
        return (
          <TableCell key={key} className="w-12 text-center font-mono text-xs text-muted-foreground">
            {rowNumber}
          </TableCell>
        )
      case "item_name":
        return (
          <TableCell key={key} className="text-right">
            <div className="flex items-center justify-start gap-2.5">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {itemInitials(item.name) || "—"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                {item.code ? (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {item.code}
                  </p>
                ) : null}
              </div>
            </div>
          </TableCell>
        )
      case "item_type":
        return (
          <TableCell key={key} className="text-center">
            <ItemTypeBadge itemType={item.item_type} />
          </TableCell>
        )
      case "current_quantity":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatQuantityKg(item.current_quantity_kg)}
          </TableCell>
        )
      case "average_cost":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatCostPerKg(item.average_cost)}
          </TableCell>
        )
      case "stock_status":
        return (
          <TableCell key={key} className="text-center">
            <ItemStockBadge item={item} />
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
      case "is_active":
        return (
          <TableCell key={key} className="text-center">
            {item.is_active ? (
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
      case "code":
        return (
          <TableCell key={key} className="text-center font-mono text-xs" dir="ltr">
            {item.code || "—"}
          </TableCell>
        )
      case "minimum_quantity":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatQuantityKg(item.minimum_quantity_kg)}
          </TableCell>
        )
      case "last_purchase_price":
        return (
          <TableCell key={key} className="text-center text-sm" dir="ltr">
            {formatCostPerKg(item.last_purchase_price)}
          </TableCell>
        )
      case "unit":
        return (
          <TableCell key={key} className="text-center text-sm">
            {item.unit || "—"}
          </TableCell>
        )
      case "notes":
        return (
          <TableCell key={key} className="text-right text-sm">
            <span className="line-clamp-2">{item.notes || "—"}</span>
          </TableCell>
        )
      case "created_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(item.created_at)}
          </TableCell>
        )
      case "updated_at":
        return (
          <TableCell key={key} className="text-center text-xs">
            {formatArDateTime(item.updated_at)}
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
              <ItemRowActionsMenuContent
                item={item}
                stopPropagation
                onViewDetails={() => goToItem(item.id)}
                onEdit={() => onEdit(item)}
                onToggleActive={() => onToggleActive(item)}
                onDelete={() => onDelete(item)}
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
      {items.map((item, index) => (
        <TableRow
          key={item.id}
          className="cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => goToItem(item.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, item })
          }}
        >
          {orderedCols.map((col) => renderCell(col.id, item, index))}
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
          <p className="font-medium">لا يوجد أصناف مطابقة للبحث أو الفلاتر الحالية.</p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
            <Package className="size-10 animate-pulse" strokeWidth={1.25} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">لا يوجد أصناف حالياً</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة صنف جديد</p>
          </div>
          <Button type="button" onClick={onAddItem} className="gap-2 rounded-xl">
            <Plus className="size-4" />
            إضافة صنف
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

      {!isLoading && items.length > 0 && meta != null && lastPage > 1 ? (
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
            <ItemRowActionsMenuContent
              item={contextMenu.item}
              onViewDetails={() => {
                goToItem(contextMenu.item.id)
                setContextMenu(null)
              }}
              onEdit={() => {
                onEdit(contextMenu.item)
                setContextMenu(null)
              }}
              onToggleActive={() => {
                onToggleActive(contextMenu.item)
                setContextMenu(null)
              }}
              onDelete={() => {
                onDelete(contextMenu.item)
                setContextMenu(null)
              }}
            />
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  )
}
