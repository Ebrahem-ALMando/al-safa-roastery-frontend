import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { INVENTORY_STOCK_STATUS_LABELS_AR, type InventoryItem, type InventoryStockStatus } from "@/src/features/inventory"

export function InventoryStockStatusBadge({ item, status, reorderLabel = false }: { item?: Pick<InventoryItem, "stock_status" | "reorder_required">; status?: InventoryStockStatus; reorderLabel?: boolean }) {
  const value = status ?? item?.stock_status ?? "out_of_stock"
  const label = reorderLabel && item?.reorder_required ? INVENTORY_STOCK_STATUS_LABELS_AR.reorder_required : INVENTORY_STOCK_STATUS_LABELS_AR[value]
  return <Badge variant="outline" className={cn("rounded-full", value === "available" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700", value === "low" && "border-amber-500/40 bg-amber-500/10 text-amber-700", value === "out_of_stock" && "border-rose-500/40 bg-rose-500/10 text-rose-700")}>{label}</Badge>
}
