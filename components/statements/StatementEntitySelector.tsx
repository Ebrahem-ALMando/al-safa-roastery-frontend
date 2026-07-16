"use client"

import { useState } from "react"
import { AlertCircle, Loader2, Search, Truck, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useStatementEntityOptions, type StatementEntityOption, type StatementEntityType } from "@/src/features/statements"

export function StatementEntitySelector({ type, value, onChange }: { type: StatementEntityType; value: StatementEntityOption | null; onChange: (value: StatementEntityOption | null) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { options, meta, isLoading, isSearchPending, error } = useStatementEntityOptions(type, open, search)
  const EntityIcon = type === "customer" ? Users : Truck
  const entityLabel = type === "customer" ? "الزبون" : "المورد"

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setSearch("")
  }

  return <>
    <Button type="button" variant="outline" onClick={() => setOpen(true)} className={cn("h-11 w-full justify-between gap-3 rounded-xl border-dashed px-3", value && "border-solid border-primary/30 bg-primary/5")}>
      <span className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><EntityIcon className="size-4" /></span><span className="min-w-0 text-right"><span className="block truncate font-semibold">{value?.name || `اختر ${entityLabel}`}</span>{value?.code ? <span className="block font-mono text-[11px] text-muted-foreground" dir="ltr">{value.code}</span> : null}</span></span>
      {value ? <span role="button" tabIndex={0} className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" onClick={(event) => { event.stopPropagation(); onChange(null) }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onChange(null) } }} aria-label={`مسح ${entityLabel}`}><X className="size-4" /></span> : <Search className="size-4 text-muted-foreground" />}
    </Button>

    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" lang="ar" className="flex max-h-[min(88vh,720px)] max-w-xl flex-col overflow-hidden rounded-3xl p-0" showCloseButton>
        <DialogHeader className="border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent px-6 py-5 text-right sm:text-right">
          <DialogTitle>اختيار {entityLabel}</DialogTitle>
          <DialogDescription>ابحث بالاسم أو الكود أو رقم الهاتف ثم اختر من القائمة.</DialogDescription>
          <div className="relative pt-3"><Search className="absolute right-3 top-[26px] size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="الاسم أو الكود أو الهاتف..." className="h-11 pr-10" />{isSearchPending ? <Loader2 className="absolute left-3 top-[26px] size-4 animate-spin text-primary" /> : null}</div>
        </DialogHeader>
        <ScrollArea className="max-h-[480px] flex-1">
          <div className="space-y-2 p-4">
            {error ? <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive"><AlertCircle className="size-6" /><p>تعذر تحميل قائمة {type === "customer" ? "الزبائن" : "الموردين"}.</p></div>
              : isLoading && options.length === 0 ? Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-xl" />)
                : options.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground"><Search className="size-7" /><p>لا توجد نتائج مطابقة.</p></div>
                  : <>{typeof meta?.total === "number" && meta.total > options.length ? <p className="text-center text-xs text-muted-foreground">تظهر أول {options.length} نتيجة؛ استخدم البحث للوصول إلى نتائج أخرى.</p> : null}{options.map((entity) => <button key={entity.id} type="button" onClick={() => { onChange(entity); handleOpenChange(false) }} className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-right transition hover:border-primary/40 hover:bg-primary/5"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><EntityIcon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{entity.name}</span><span className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="font-mono" dir="ltr">{entity.code || `#${entity.id}`}</span>{entity.phone ? <span dir="ltr">{entity.phone}</span> : null}</span></span></button>)}</>}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  </>
}
