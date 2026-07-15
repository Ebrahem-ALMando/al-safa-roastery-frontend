import type { InventoryItem, InventoryPaginationMeta, InventoryTableColumnId, InventoryViewMode } from "@/src/features/inventory"
import type { InventoryRowActionCallbacks } from "./inventory-row-actions-menu"
import { InventoryCards } from "./InventoryCards"
import { InventoryTable } from "./InventoryTable"

export function InventoryDataView(props: { viewMode: InventoryViewMode; items: InventoryItem[]; meta?: InventoryPaginationMeta; visibleColumns: InventoryTableColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void; actions: (item: InventoryItem) => InventoryRowActionCallbacks }) {
  return props.viewMode === "cards" ? <InventoryCards {...props} /> : <InventoryTable {...props} />
}
