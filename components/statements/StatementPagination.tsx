import { Button } from "@/components/ui/button"
import type { StatementPaginationMeta } from "@/src/features/statements"

export function StatementPagination({ meta, page, onPageChange, noun }: { meta?: StatementPaginationMeta; page: number; onPageChange: (page: number) => void; noun: string }) {
  if (!meta || meta.last_page <= 1) return null
  return <div className="flex flex-col items-center justify-between gap-2 border-t p-3 text-sm text-muted-foreground sm:flex-row" dir="rtl"><p>{meta.total} {noun} · صفحة {page} من {meta.last_page}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => onPageChange(page + 1)}>التالي</Button></div></div>
}
