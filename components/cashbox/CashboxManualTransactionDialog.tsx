"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Wallet, X } from "lucide-react"
import { OperationNotesAccordion, OtherReasonHelper } from "@/components/shared/OperationNotesAccordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiRequestError } from "@/lib/api"
import { formatLocalYmd } from "@/lib/date-scope/resolve-operational-date-range"
import {
  CASHBOX_MANUAL_DEPOSIT_REASON_LABELS_AR,
  CASHBOX_MANUAL_WITHDRAWAL_REASON_LABELS_AR,
  CASHBOX_PAYMENT_METHOD_LABELS_AR,
  formatCashboxMoney,
  type CashboxPaymentMethod,
  useCashboxActions,
} from "@/src/features/cashbox"

type Mode = "deposit" | "withdrawal"

export function CashboxManualTransactionDialog({ mode, open, onOpenChange, currentBalance }: {
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
}) {
  const [date, setDate] = useState(() => formatLocalYmd(new Date()))
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<CashboxPaymentMethod>("cash")
  const [reason, setReason] = useState(mode === "deposit" ? "capital" : "personal_withdrawal")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { manualDeposit, manualWithdrawal } = useCashboxActions()
  const reasonLabels = mode === "deposit" ? CASHBOX_MANUAL_DEPOSIT_REASON_LABELS_AR : CASHBOX_MANUAL_WITHDRAWAL_REASON_LABELS_AR
  const numericAmount = Number.parseFloat(amount.replaceAll(",", "")) || 0
  const balanceAfter = mode === "deposit" ? currentBalance + numericAmount : currentBalance - numericAmount
  const insufficient = mode === "withdrawal" && numericAmount > currentBalance
  const Icon = mode === "deposit" ? ArrowDownToLine : ArrowUpFromLine
  const tone = mode === "deposit" ? "emerald" : "rose"
  const title = mode === "deposit" ? "إيداع يدوي في الصندوق" : "سحب يدوي من الصندوق"
  const description = mode === "deposit"
    ? "سجّل مبلغًا واردًا إلى الصندوق مع تحديد السبب وطريقة الدفع."
    : "سجّل مبلغًا صادرًا من الصندوق مع تحديد السبب وطريقة الدفع."

  const reasonOptions = useMemo(() => Object.entries(reasonLabels), [reasonLabels])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setDate(formatLocalYmd(new Date()))
      setAmount("")
      setPaymentMethod("cash")
      setReason(mode === "deposit" ? "capital" : "personal_withdrawal")
      setNotes("")
      setError("")
    }
    onOpenChange(next)
  }

  async function submit() {
    if (!date) {
      setError("تاريخ العملية مطلوب.")
      return
    }
    if (numericAmount <= 0) {
      setError("أدخل مبلغًا صحيحًا أكبر من صفر.")
      return
    }
    if (insufficient) {
      setError("الرصيد الحالي في الصندوق غير كافٍ لتنفيذ هذا السحب.")
      return
    }
    const reasonLabel = (reasonLabels as Record<string, string>)[reason] ?? reason
    setSubmitting(true)
    setError("")
    try {
      const payload = {
        transaction_date: date,
        amount: numericAmount,
        payment_method: paymentMethod,
        description: reasonLabel,
        notes: notes.trim() || null,
      }
      if (mode === "deposit") await manualDeposit(payload)
      else await manualWithdrawal(payload)
      handleOpenChange(false)
    } catch (submitError) {
      setError(
        submitError instanceof ApiRequestError && submitError.code === "INSUFFICIENT_CASHBOX_BALANCE"
          ? "الرصيد الحالي في الصندوق غير كافٍ لتنفيذ هذا السحب."
          : "تعذر تنفيذ العملية. حاول مجددًا.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[94vh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className={`shrink-0 border-b bg-linear-to-bl ${tone === "emerald" ? "from-emerald-500/10" : "from-rose-500/10"} via-background to-background px-6 py-5 text-right sm:text-right`}>
          <div className="flex items-start gap-3">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${tone === "emerald" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-rose-500/20 bg-rose-500/10 text-rose-700"}`}><Icon className="size-5" /></span>
            <div className="min-w-0 flex-1"><DialogTitle>{title}</DialogTitle><DialogDescription className="mt-1.5 leading-relaxed">{description}</DialogDescription><p className="mt-2 text-xs text-muted-foreground"><span className="text-destructive">*</span> يشير إلى حقل مطلوب.</p></div>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" onClick={() => handleOpenChange(false)} aria-label="إغلاق"><X className="size-4" /></Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">بيانات العملية</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="التاريخ" required><Input type="date" value={date} onChange={(event) => { setDate(event.target.value); setError("") }} disabled={submitting} /></Field>
              <Field label="المبلغ" required><Input value={amount} onChange={(event) => { setAmount(event.target.value); setError("") }} inputMode="decimal" placeholder="0.00" dir="ltr" disabled={submitting} /></Field>
              <Field label="طريقة الدفع" required>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as CashboxPaymentMethod)} disabled={submitting}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent dir="rtl">{Object.entries(CASHBOX_PAYMENT_METHOD_LABELS_AR).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="السبب" required>
                <Select value={reason} onValueChange={(value) => { setReason(value); setError("") }} disabled={submitting}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent dir="rtl">{reasonOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            {reason === "other" ? <OtherReasonHelper /> : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">معاينة الرصيد</h3>
            <div className="grid gap-3 rounded-xl border bg-muted/15 p-3 sm:grid-cols-3">
              <Preview label="الرصيد الحالي" value={formatCashboxMoney(currentBalance)} />
              <Preview label="المبلغ" value={formatCashboxMoney(numericAmount)} />
              <Preview label="الرصيد بعد العملية" value={formatCashboxMoney(balanceAfter)} tone={balanceAfter < 0 ? "danger" : mode === "deposit" ? "success" : "default"} />
            </div>
            {insufficient ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">الرصيد الحالي في الصندوق غير كافٍ لتنفيذ هذا السحب.</p> : null}
            {error ? <p className="text-sm font-medium text-destructive" role="alert">{error}</p> : null}
          </section>

          <OperationNotesAccordion value={notes} onChange={setNotes} placeholder="ملاحظات إضافية عن العملية (اختياري)" tone={mode === "deposit" ? "emerald" : "rose"} disabled={submitting} />
        </div>

        <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap gap-2 border-t bg-background/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] backdrop-blur">
          <Button type="button" onClick={submit} disabled={submitting || insufficient} className="gap-2 rounded-xl">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}{mode === "deposit" ? "تسجيل الإيداع" : "تسجيل السحب"}
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting} className="rounded-xl">إلغاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>
}

function Preview({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger" }) {
  return <div className="rounded-lg bg-background p-3 text-right"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet className="size-3.5" />{label}</p><p className={`mt-1 font-bold tabular-nums ${tone === "success" ? "text-emerald-700" : tone === "danger" ? "text-destructive" : ""}`} dir="ltr">{value}</p></div>
}
