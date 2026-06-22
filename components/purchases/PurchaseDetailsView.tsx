"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Ban,
  ChevronLeft,
  DollarSign,
  Loader2,
  Printer,
  Receipt,
  Trash2,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatArDate,
  formatArDateTime,
  formatLinesCountAr,
  formatUsd,
  getPurchasePaymentMethodLabel,
  purchaseSupplierName,
  usePurchaseDetails,
  type PurchaseInvoice,
} from "@/features/purchases"
import { PurchasePaymentStatusBadge } from "./PurchasePaymentStatusBadge"
import { PurchaseStatusBadge } from "./PurchaseStatusBadge"

function StatBlock({
  icon: Icon,
  label,
  value,
  ltr,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  ltr?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold leading-snug" dir={ltr ? "ltr" : undefined}>
        {value}
      </p>
    </div>
  )
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-4">{children}</div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="min-w-[120px] text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{value ?? "—"}</span>
    </div>
  )
}

type PurchaseDetailsViewProps = {
  purchaseId: number
  onDelete?: (purchase: PurchaseInvoice) => void
  onCancel?: (purchase: PurchaseInvoice) => void
}

export function PurchaseDetailsView({ purchaseId, onDelete, onCancel }: PurchaseDetailsViewProps) {
  const router = useRouter()
  const { purchase, isLoading, error } = usePurchaseDetails(purchaseId)

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl" lang="ar">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8">
          <Skeleton className="h-24 w-full max-w-xl rounded-2xl" />
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive"
        dir="rtl"
        lang="ar"
      >
        <p className="flex items-center justify-center gap-2 font-medium">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          تعذّر تحميل بيانات الفاتورة.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div
        className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground"
        dir="rtl"
        lang="ar"
      >
        لا توجد فاتورة بهذا المعرف.
      </div>
    )
  }

  const canPrint = purchase.status === "completed" || purchase.status === "cancelled"
  const lines = purchase.lines ?? []

  return (
    <div className="space-y-6 pb-10" dir="rtl" lang="ar">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-bl from-primary/10 via-primary/5 to-transparent shadow-sm">
        <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
              <Receipt className="size-8 sm:size-10" strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-xl font-bold leading-tight sm:text-2xl" dir="ltr">
                  {purchase.invoice_number}
                </h1>
                <PurchaseStatusBadge status={purchase.status} />
                <PurchasePaymentStatusBadge status={purchase.payment_status} />
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Truck className="size-3.5" />
                {purchaseSupplierName(purchase)}
              </p>
              <p className="text-sm text-muted-foreground">
                تاريخ الفاتورة: {formatArDate(purchase.invoice_date)}
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
              {canPrint ? (
                <Button
                  className="gap-2 rounded-xl shadow-sm"
                  onClick={() => router.push(`/dashboard/purchases/${purchase.id}/print`)}
                >
                  <Printer className="size-4" />
                  طباعة
                </Button>
              ) : null}
              {purchase.status === "completed" && onCancel ? (
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl text-orange-700"
                  onClick={() => onCancel(purchase)}
                >
                  <Ban className="size-4" />
                  إلغاء الفاتورة
                </Button>
              ) : null}
              {purchase.status === "draft" && onDelete ? (
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl text-destructive"
                  onClick={() => onDelete(purchase)}
                >
                  <Trash2 className="size-4" />
                  حذف المسودة
                </Button>
              ) : null}
              <Button variant="outline" asChild className="gap-2 rounded-xl">
                <Link href="/dashboard/purchases">
                  <ChevronLeft className="size-4" />
                  قائمة المشتريات
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock icon={DollarSign} label="الإجمالي" value={formatUsd(purchase.total)} ltr />
            <StatBlock icon={DollarSign} label="المدفوع" value={formatUsd(purchase.paid_amount)} ltr />
            <StatBlock icon={DollarSign} label="المتبقي" value={formatUsd(purchase.remaining_amount)} ltr />
            <StatBlock
              icon={Receipt}
              label="عدد البنود"
              value={formatLinesCountAr(purchase.lines_count ?? lines.length)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="معلومات الفاتورة">
          <DetailRow label="رقم الفاتورة" value={<span dir="ltr">{purchase.invoice_number}</span>} />
          <DetailRow label="تاريخ الفاتورة" value={formatArDate(purchase.invoice_date)} />
          <DetailRow label="المورد" value={purchaseSupplierName(purchase)} />
          <DetailRow label="طريقة الدفع" value={getPurchasePaymentMethodLabel(purchase.payment_method)} />
          <DetailRow label="الخصم" value={<span dir="ltr">{formatUsd(purchase.discount)}</span>} />
          <DetailRow label="المجموع الفرعي" value={<span dir="ltr">{formatUsd(purchase.subtotal)}</span>} />
        </DetailSection>

        <DetailSection title="الحالة والتواريخ">
          <DetailRow label="حالة الفاتورة" value={<PurchaseStatusBadge status={purchase.status} />} />
          <DetailRow
            label="حالة الدفع"
            value={<PurchasePaymentStatusBadge status={purchase.payment_status} />}
          />
          <DetailRow label="تاريخ الإنشاء" value={formatArDateTime(purchase.created_at)} />
          {purchase.completed_at ? (
            <DetailRow label="تاريخ الإكمال" value={formatArDateTime(purchase.completed_at)} />
          ) : null}
          {purchase.cancelled_at ? (
            <DetailRow label="تاريخ الإلغاء" value={formatArDateTime(purchase.cancelled_at)} />
          ) : null}
          {purchase.cancel_reason ? (
            <DetailRow label="سبب الإلغاء" value={purchase.cancel_reason} />
          ) : null}
          {purchase.created_by ? (
            <DetailRow label="أنشئ بواسطة" value={purchase.created_by.name} />
          ) : null}
          {purchase.completed_by ? (
            <DetailRow label="أُكملت بواسطة" value={purchase.completed_by.name} />
          ) : null}
          {purchase.cancelled_by ? (
            <DetailRow label="أُلغيت بواسطة" value={purchase.cancelled_by.name} />
          ) : null}
        </DetailSection>

        {purchase.notes ? (
          <DetailSection title="ملاحظات">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {purchase.notes}
            </p>
          </DetailSection>
        ) : null}
      </div>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">بنود الفاتورة</h2>
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-center">الكمية (كغ)</TableHead>
                <TableHead className="text-center">سعر الوحدة</TableHead>
                <TableHead className="text-center">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    لا توجد بنود
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line, index) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-center font-mono text-xs">{index + 1}</TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{line.item?.name ?? `صنف #${line.item_id}`}</p>
                      {line.item?.code ? (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
                          {line.item.code}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-center" dir="ltr">
                      {line.quantity_kg}
                    </TableCell>
                    <TableCell className="text-center" dir="ltr">
                      {formatUsd(line.unit_price)}
                    </TableCell>
                    <TableCell className="text-center font-semibold" dir="ltr">
                      {formatUsd(line.line_total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
