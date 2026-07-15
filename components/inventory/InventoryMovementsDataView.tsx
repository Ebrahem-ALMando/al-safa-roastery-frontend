import type { InventoryMovement, InventoryMovementTableColumnId, InventoryPaginationMeta, InventoryViewMode } from "@/src/features/inventory"
import { InventoryMovementsCards } from "./InventoryMovementsCards"
import { InventoryMovementsTable } from "./InventoryMovementsTable"

type Props = { viewMode: InventoryViewMode; movements: InventoryMovement[]; meta?: InventoryPaginationMeta; visibleColumns: InventoryMovementTableColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void }
export function InventoryMovementsDataView(props: Props) {
  return props.viewMode === "cards" ? <InventoryMovementsCards {...props} /> : <InventoryMovementsTable {...props} />
}
