"use client"

import * as React from "react"
import { FileText, Loader2, Pencil, Truck, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSupplier } from "@/features/suppliers"
import {
  formatArDateTime,
  formatUsdAmount,
  getBalanceStatusLabel,
  type Supplier,
} from "@/features/suppliers"

interface SupplierDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: number | null
  fallbackSupplier?: Supplier | null
  onEdit?: (supplier: Supplier) => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-left">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
        {children}
      </div>
    </section>
  )
}

export function SupplierDetailsDialog({
  open,
  onOpenChange,
  supplierId,
  fallbackSupplier,
  onEdit,
}: SupplierDetailsDialogProps) {
  const { supplier: fetched, isLoading } = useSupplier(open && supplierId ? supplierId : null)
  const supplier = fetched ?? fallbackSupplier ?? null
  const balanceInfo = supplier ? getBalanceStatusLabel(supplier.current_balance) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="max-h-[min(92vh,680px)] overflow-y-auto rounded-2xl sm:max-w-[560px]"
      >
        <DialogHeader className="text-right">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </span>
            <div className="flex-1">
              <DialogTitle>{supplier?.name ?? "تفاصيل المورد"}</DialogTitle>
              {supplier?.code ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
                  {supplier.code}
                </p>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {isLoading && !supplier ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : supplier ? (
          <div className="space-y-5">
            <Section title="معلومات المورد">
              <DetailRow label="الاسم" value={supplier.name} />
              <DetailRow label="الكود" value={supplier.code || "—"} />
              <DetailRow label="الشخص المسؤول" value={supplier.contact_person || "—"} />
              <DetailRow
                label="الحالة"
                value={
                  supplier.is_active ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700">فعال</Badge>
                  ) : (
                    <Badge variant="secondary">موقوف</Badge>
                  )
                }
              />
            </Section>

            <Section title="معلومات التواصل">
              <DetailRow label="الهاتف" value={supplier.phone || "—"} />
              <DetailRow label="هاتف إضافي" value={supplier.secondary_phone || "—"} />
              <DetailRow label="واتساب" value={supplier.whatsapp || "—"} />
              <DetailRow label="البريد" value={supplier.email || "—"} />
              <DetailRow label="العنوان" value={supplier.address || "—"} />
            </Section>

            <Section title="الوضع المالي">
              <DetailRow
                label="الرصيد الحالي"
                value={
                  <span dir="ltr">
                    {formatUsdAmount(supplier.current_balance)} — {balanceInfo?.label}
                  </span>
                }
              />
              <DetailRow
                label="الحد الائتماني"
                value={<span dir="ltr">{formatUsdAmount(supplier.credit_limit)}</span>}
              />
              <DetailRow label="ملاحظات" value={supplier.notes || "—"} />
            </Section>

            <Section title="معلومات النظام">
              <DetailRow label="تاريخ الإنشاء" value={formatArDateTime(supplier.created_at)} />
              <DetailRow label="آخر تحديث" value={formatArDateTime(supplier.updated_at)} />
              {supplier.created_by ? (
                <DetailRow label="أنشئ بواسطة" value={supplier.created_by.name} />
              ) : null}
              {supplier.updated_by ? (
                <DetailRow label="حدّث بواسطة" value={supplier.updated_by.name} />
              ) : null}
            </Section>

            <Separator />

            <div className="flex flex-wrap gap-2">
              {onEdit ? (
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl"
                  onClick={() => {
                    onEdit(supplier)
                    onOpenChange(false)
                  }}
                >
                  <Pencil className="size-4" />
                  تعديل
                </Button>
              ) : null}
              <Button variant="ghost" className="gap-2 rounded-xl text-muted-foreground" disabled>
                <FileText className="size-4" />
                كشف الحساب (قريباً)
              </Button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">تعذر تحميل بيانات المورد.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
