"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  CheckCircle2,
  ChevronLeft,
  FileText,
  Loader2,
  Package,
  Pencil,
  Scale,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatArDateTime,
  formatCostPerKg,
  formatItemLastActivity,
  formatQuantityKg,
  getItemTypeLabel,
  itemInitials,
  useItem,
} from "@/features/items"
import { ItemStockBadge } from "@/components/items/item-stock-badge"
import { ItemTypeBadge } from "@/components/items/item-type-badge"

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
      <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3">
        {children}
      </div>
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

export default function ItemDetailPage() {
  const params = useParams<{ itemId: string }>()
  const router = useRouter()
  const raw = params?.itemId
  const idNum = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN
  const itemId = Number.isFinite(idNum) && idNum > 0 ? idNum : null

  const { item, isLoading, error } = useItem(itemId)

  if (itemId === null) {
    return (
      <div
        className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive"
        dir="rtl"
        lang="ar"
      >
        معرّف الصنف غير صالح.
      </div>
    )
  }

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
          تعذّر تحميل بيانات الصنف.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div
        className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground"
        dir="rtl"
        lang="ar"
      >
        لا يوجد صنف بهذا المعرف.
      </div>
    )
  }

  const lastActivity = formatItemLastActivity(item)

  return (
    <div className="space-y-6 pb-10" dir="rtl" lang="ar">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-bl from-primary/10 via-primary/5 to-transparent shadow-sm">
        <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="relative shrink-0">
              <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
              <Avatar className="size-16 border border-primary/20 shadow-md ring-2 ring-primary/15 sm:size-20">
                <AvatarFallback className="rounded-3xl bg-card text-lg font-bold text-primary sm:text-xl">
                  {itemInitials(item.name) || <Package className="size-6" />}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold leading-tight sm:text-2xl">{item.name}</h1>
                {item.is_active ? (
                  <Badge className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100">
                    <CheckCircle2 className="size-3" />
                    فعال
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 rounded-full">
                    <XCircle className="size-3" />
                    موقوف
                  </Badge>
                )}
                <ItemTypeBadge itemType={item.item_type} />
                <ItemStockBadge item={item} />
              </div>
              {item.code ? (
                <p className="font-mono text-sm text-muted-foreground" dir="ltr">
                  {item.code}
                </p>
              ) : null}
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
              <Button
                className="gap-2 rounded-xl shadow-sm"
                onClick={() => {
                  router.push(`/dashboard/items/${item.id}?edit=true`)
                }}
              >
                <Pencil className="size-4" />
                تعديل الصنف
              </Button>
              <Button variant="outline" asChild className="gap-2 rounded-xl">
                <Link href="/dashboard/items">
                  <ChevronLeft className="size-4" />
                  قائمة الأصناف
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock
              icon={Scale}
              label="الكمية الحالية"
              value={formatQuantityKg(item.current_quantity_kg)}
              ltr
            />
            <StatBlock
              icon={Package}
              label="متوسط التكلفة"
              value={formatCostPerKg(item.average_cost)}
              ltr
            />
            <StatBlock
              icon={Scale}
              label="الحد الأدنى"
              value={formatQuantityKg(item.minimum_quantity_kg)}
              ltr
            />
            <StatBlock
              icon={Package}
              label="كود الصنف"
              value={item.code || `#${item.id}`}
              ltr
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="معلومات المخزون">
          <DetailRow
            label="الكمية الحالية"
            value={<span dir="ltr">{formatQuantityKg(item.current_quantity_kg)}</span>}
          />
          <DetailRow
            label="متوسط التكلفة"
            value={<span dir="ltr">{formatCostPerKg(item.average_cost)}</span>}
          />
          <DetailRow
            label="آخر سعر شراء"
            value={<span dir="ltr">{formatCostPerKg(item.last_purchase_price)}</span>}
          />
          <DetailRow
            label="الحد الأدنى للكمية"
            value={<span dir="ltr">{formatQuantityKg(item.minimum_quantity_kg)}</span>}
          />
          <DetailRow label="حالة المخزون" value={<ItemStockBadge item={item} />} />
          <DetailRow label="الوحدة" value={item.unit || "كغ"} />
        </DetailSection>

        <DetailSection title="آخر نشاط">
          <DetailRow label="النشاط" value={lastActivity.primary} />
          <DetailRow label="التاريخ" value={lastActivity.secondary || "—"} />
        </DetailSection>

        <DetailSection title="معلومات النظام">
          <DetailRow label="نوع الصنف" value={getItemTypeLabel(item.item_type)} />
          <DetailRow label="تاريخ الإنشاء" value={formatArDateTime(item.created_at)} />
          <DetailRow label="آخر تحديث" value={formatArDateTime(item.updated_at)} />
          {item.created_by ? (
            <DetailRow label="أنشئ بواسطة" value={item.created_by.name} />
          ) : null}
          {item.updated_by ? (
            <DetailRow label="حدّث بواسطة" value={item.updated_by.name} />
          ) : null}
        </DetailSection>

        {item.notes ? (
          <DetailSection title="ملاحظات">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {item.notes}
            </p>
          </DetailSection>
        ) : null}
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" className="gap-2 rounded-xl text-muted-foreground" disabled>
          <FileText className="size-4" />
          كشف حركة المخزون (قريباً)
        </Button>
      </div>
    </div>
  )
}
