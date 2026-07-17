"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STATEMENT_PAYMENT_METHOD_LABELS_AR } from "@/src/features/statements"

const allValue = (value: string) => value || "all"
const fromAll = (value: string) => value === "all" ? "" : value

export function StatementInvoiceFilters({ search, status, paymentStatus, onSearch, onStatus, onPaymentStatus, disabled }: { search: string; status: string; paymentStatus: string; onSearch: (value: string) => void; onStatus: (value: string) => void; onPaymentStatus: (value: string) => void; disabled?: boolean }) {
  const active = Boolean(search || status || paymentStatus)
  return <FilterShell search={search} onSearch={onSearch} placeholder="ابحث برقم الفاتورة أو الملاحظات..." disabled={disabled}>{<><Select value={allValue(status)} onValueChange={(value) => onStatus(fromAll(value))} disabled={disabled}><SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger><SelectContent dir="rtl"><SelectItem value="all">كل حالات الفاتورة</SelectItem><SelectItem value="draft">مسودة</SelectItem><SelectItem value="completed">مكتمل</SelectItem><SelectItem value="cancelled">ملغى</SelectItem></SelectContent></Select><Select value={allValue(paymentStatus)} onValueChange={(value) => onPaymentStatus(fromAll(value))} disabled={disabled}><SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger><SelectContent dir="rtl"><SelectItem value="all">كل حالات الدفع</SelectItem><SelectItem value="unpaid">غير مدفوع</SelectItem><SelectItem value="partial">مدفوع جزئياً</SelectItem><SelectItem value="paid">مدفوع</SelectItem></SelectContent></Select>{active ? <ClearButton onClick={() => { onSearch(""); onStatus(""); onPaymentStatus("") }} /> : null}</>}</FilterShell>
}

export function StatementPaymentFilters({ search, paymentMethod, onSearch, onPaymentMethod, disabled }: { search: string; paymentMethod: string; onSearch: (value: string) => void; onPaymentMethod: (value: string) => void; disabled?: boolean }) {
  return <FilterShell search={search} onSearch={onSearch} placeholder="ابحث برقم الدفعة أو الملاحظات..." disabled={disabled}><Select value={allValue(paymentMethod)} onValueChange={(value) => onPaymentMethod(fromAll(value))} disabled={disabled}><SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger><SelectContent dir="rtl"><SelectItem value="all">كل طرق الدفع</SelectItem>{Object.entries(STATEMENT_PAYMENT_METHOD_LABELS_AR).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{search || paymentMethod ? <ClearButton onClick={() => { onSearch(""); onPaymentMethod("") }} /> : null}</FilterShell>
}

export function StatementReturnFilters({ search, status, onSearch, onStatus, disabled }: { search: string; status: string; onSearch: (value: string) => void; onStatus: (value: string) => void; disabled?: boolean }) {
  return <FilterShell search={search} onSearch={onSearch} placeholder="ابحث برقم المرتجع أو الملاحظات..." disabled={disabled}><Select value={allValue(status)} onValueChange={(value) => onStatus(fromAll(value))} disabled={disabled}><SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger><SelectContent dir="rtl"><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="draft">مسودة</SelectItem><SelectItem value="completed">مكتمل</SelectItem><SelectItem value="cancelled">ملغى</SelectItem></SelectContent></Select>{search || status ? <ClearButton onClick={() => { onSearch(""); onStatus("") }} /> : null}</FilterShell>
}

function FilterShell({ search, onSearch, placeholder, disabled, children }: { search: string; onSearch: (value: string) => void; placeholder: string; disabled?: boolean; children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 md:flex-row md:items-center" dir="rtl"><div className="relative min-w-0 flex-1"><Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} className="pr-9" disabled={disabled} /></div>{children}</div>
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return <Button type="button" variant="ghost" size="sm" onClick={onClick} className="gap-1 text-muted-foreground"><X className="size-4" />مسح</Button>
}
