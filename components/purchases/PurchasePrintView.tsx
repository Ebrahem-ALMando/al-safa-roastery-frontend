"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatArDate,
  formatArDateTime,
  formatUsd,
  getPurchasePaymentMethodLabel,
  getPurchasePaymentStatusLabel,
  getPurchaseStatusLabel,
  purchaseSupplierName,
  type PurchaseInvoice,
} from "@/features/purchases"

type PurchasePrintViewProps = {
  purchase: PurchaseInvoice
}

export function PurchasePrintView({ purchase }: PurchasePrintViewProps) {
  const isCancelled = purchase.status === "cancelled"
  const lines = purchase.lines ?? []

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-white text-black print:min-h-0">
      <div className="sticky top-0 z-10 border-b bg-white/95 p-4 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[210mm] justify-end">
          <Button type="button" className="gap-2 rounded-xl" onClick={() => window.print()}>
            <Printer className="size-4" />
            طباعة
          </Button>
        </div>
      </div>

      <div id="purchase-print-root" className="relative mx-auto max-w-[210mm] bg-white p-8 print:p-6">
        {isCancelled ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            <span className="rotate-[-25deg] select-none text-[6rem] font-black uppercase tracking-widest text-red-500/15 sm:text-[8rem]">
              ملغاة
            </span>
          </div>
        ) : null}

        <header className="relative border-b-2 border-black pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">فاتورة مشتريات</h1>
              <p className="mt-1 text-sm text-neutral-600">محمصة الصفا</p>
            </div>
            <div className="text-left" dir="ltr">
              <p className="font-mono text-xl font-bold">{purchase.invoice_number}</p>
              <p className="mt-1 text-sm">{formatArDate(purchase.invoice_date)}</p>
            </div>
          </div>
        </header>

        <section className="relative mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-2 font-semibold">المورد</p>
            <p>{purchaseSupplierName(purchase)}</p>
            {purchase.supplier?.code ? (
              <p className="mt-1 font-mono text-xs text-neutral-600" dir="ltr">
                {purchase.supplier.code}
              </p>
            ) : null}
          </div>
          <div className="text-left">
            <p className="mb-2 font-semibold">حالة الفاتورة</p>
            <p>{getPurchaseStatusLabel(purchase.status)}</p>
            <p className="mt-2 font-semibold">حالة الدفع</p>
            <p>{getPurchasePaymentStatusLabel(purchase.payment_status)}</p>
            <p className="mt-2 font-semibold">طريقة الدفع</p>
            <p>{getPurchasePaymentMethodLabel(purchase.payment_method)}</p>
          </div>
        </section>

        <table className="relative mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-center">#</th>
              <th className="py-2 text-right">الصنف</th>
              <th className="py-2 text-center">الكمية (كغ)</th>
              <th className="py-2 text-center">سعر الوحدة</th>
              <th className="py-2 text-center">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={line.id} className="border-b border-neutral-300">
                <td className="py-2 text-center">{index + 1}</td>
                <td className="py-2 text-right">
                  {line.item?.name ?? `صنف #${line.item_id}`}
                </td>
                <td className="py-2 text-center" dir="ltr">
                  {line.quantity_kg}
                </td>
                <td className="py-2 text-center" dir="ltr">
                  {formatUsd(line.unit_price)}
                </td>
                <td className="py-2 text-center font-medium" dir="ltr">
                  {formatUsd(line.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="relative mt-8 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span>المجموع الفرعي</span>
            <span dir="ltr">{formatUsd(purchase.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>الخصم</span>
            <span dir="ltr">{formatUsd(purchase.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-2 text-base font-bold">
            <span>الإجمالي</span>
            <span dir="ltr">{formatUsd(purchase.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>المدفوع</span>
            <span dir="ltr">{formatUsd(purchase.paid_amount)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>المتبقي</span>
            <span dir="ltr">{formatUsd(purchase.remaining_amount)}</span>
          </div>
        </section>

        {purchase.notes ? (
          <section className="relative mt-8 text-sm">
            <p className="font-semibold">ملاحظات</p>
            <p className="mt-1 whitespace-pre-wrap text-neutral-700">{purchase.notes}</p>
          </section>
        ) : null}

        {isCancelled && purchase.cancel_reason ? (
          <section className="relative mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm">
            <p className="font-semibold text-red-800">سبب الإلغاء</p>
            <p className="mt-1 text-red-700">{purchase.cancel_reason}</p>
            {purchase.cancelled_at ? (
              <p className="mt-2 text-xs text-red-600">
                {formatArDateTime(purchase.cancelled_at)}
              </p>
            ) : null}
          </section>
        ) : null}

        <footer className="relative mt-12 border-t pt-4 text-center text-xs text-neutral-500">
          <p>تم إنشاء هذه الوثيقة إلكترونياً — محمصة الصفا</p>
        </footer>
      </div>
    </div>
  )
}
