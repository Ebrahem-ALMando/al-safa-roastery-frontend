import type { CashboxPaginationMeta, CashboxTableColumnId, CashboxTransaction, CashboxViewMode } from "@/src/features/cashbox"
import { CashboxCards } from "./CashboxCards"
import { CashboxTable } from "./CashboxTable"

type Props = { viewMode: CashboxViewMode; transactions: CashboxTransaction[]; meta?: CashboxPaginationMeta; visibleColumns: CashboxTableColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void; onDetails: (transaction: CashboxTransaction) => void }

export function CashboxDataView(props: Props) {
  return props.viewMode === "cards" ? <CashboxCards {...props} /> : <CashboxTable {...props} />
}
