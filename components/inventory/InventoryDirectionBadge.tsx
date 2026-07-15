import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { InventoryDirection } from "@/src/features/inventory"
export function InventoryDirectionBadge({ direction }: { direction: InventoryDirection }) { return direction === "in" ? <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15"><ArrowDownToLine className="size-3" />وارد</Badge> : <Badge className="gap-1 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15"><ArrowUpFromLine className="size-3" />صادر</Badge> }
