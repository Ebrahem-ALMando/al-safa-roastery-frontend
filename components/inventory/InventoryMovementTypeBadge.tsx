import { Badge } from "@/components/ui/badge"
export function InventoryMovementTypeBadge({ label }: { label: string }) { return <Badge variant="outline" className="whitespace-nowrap rounded-full border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">{label || "حركة مخزون"}</Badge> }
