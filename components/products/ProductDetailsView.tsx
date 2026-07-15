"use client"

import Link from "next/link"
import { ArrowRight, CalendarClock, CircleDollarSign, DollarSign, Info, Package, RefreshCw, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatArDateTime,
  formatProductPrice,
  formatQuantityKg,
  linkedItemCode,
  linkedItemName,
  type Product,
  PRODUCT_PRICE_TYPE_LABELS_AR,
  type ProductPriceType,
} from "@/features/products"
import { useProductDetails } from "@/features/products"
import { ItemTypeBadge } from "@/components/items/item-type-badge"
import { ProductPriceStatusBadge } from "./ProductPriceStatusBadge"
import { ProductStatusBadge } from "./ProductStatusBadge"
import { ProductStockStatusBadge } from "./ProductStockStatusBadge"
import { ProductPricesDialog } from "./prices/ProductPricesDialog"

export function ProductDetailsView({ productId }: { productId: number }) {
  const { product, isLoading, error, mutate } = useProductDetails(productId)
  const [pricesOpen, setPricesOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6 p-4" dir="rtl">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-6 text-center" dir="rtl">
        <p className="text-sm text-muted-foreground">تعذر تحميل المنتج.</p>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => void mutate()}>
          <RefreshCw className="size-4" />
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon" className="mt-0.5 rounded-xl" aria-label="العودة">
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">المنتجات / تفاصيل المنتج</p>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="font-mono text-xs text-muted-foreground" dir="ltr">
              {product.code || product.barcode || "—"}
            </p>
            <div className="flex flex-wrap gap-2">
              <ProductStatusBadge isActive={product.is_active} />
              <ProductPriceStatusBadge status={product.price_status} />
              <ProductStockStatusBadge product={product} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DetailsCard icon={Info} title="معلومات المنتج">
            <InfoGrid rows={[
              ["الاسم", product.name],
              ["الكود", product.code || "—"],
              ["الباركود", product.barcode || "—"],
              ["SKU", product.sku || "—"],
              ["الحالة", product.is_active ? "فعال" : "موقوف"],
              ["ملاحظات", product.notes || "—"],
            ]} />
          </DetailsCard>

          <DetailsCard icon={Package} title="الصنف المرتبط">
            <InfoGrid rows={[
              ["الصنف", linkedItemName(product)],
              ["كود الصنف", linkedItemCode(product) || "—"],
              ["نوع الصنف", product.linked_item?.item_type ? <ItemTypeBadge key="type" itemType={product.linked_item.item_type} /> : "—"],
              ["الكمية الحالية", formatQuantityKg(product.current_quantity_kg)],
              ["الحد الأدنى", formatQuantityKg(product.minimum_quantity_kg)],
              ["متوسط التكلفة", formatProductPrice(product.average_cost)],
            ]} />
          </DetailsCard>

          <DetailsCard icon={DollarSign} title="التسعير">
            <div className="mb-4 flex justify-end">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setPricesOpen(true)}>
                <CircleDollarSign className="size-4" />
                إدارة الأسعار
              </Button>
            </div>
            <InfoGrid rows={[
              ["السعر الحالي", formatProductPrice(product.current_price ?? product.default_price)],
              ["نوع السعر الحالي", product.current_price_type || "—"],
              ["حالة التسعير", <ProductPriceStatusBadge key="price-status" status={product.price_status} />],
            ]} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["car", "wholesale", "retail", "consumer"] as ProductPriceType[]).map((priceType) => {
                const price = product.prices?.find((item) => item.price_type === priceType)
                return (
                  <div key={priceType} className="rounded-xl border border-border/60 bg-muted/15 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{PRODUCT_PRICE_TYPE_LABELS_AR[priceType]}</span>
                      <span className={price?.is_active ? "text-xs font-medium text-emerald-700 dark:text-emerald-300" : "text-xs font-medium text-muted-foreground"}>
                        {price?.is_active ? "فعال" : "موقوف"}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-bold tabular-nums" dir="ltr">
                      {price ? formatProductPrice(price.price) : "غير محدد"}
                    </p>
                    {price?.notes ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{price.notes}</p> : null}
                  </div>
                )
              })}
            </div>
          </DetailsCard>
        </div>

        <div className="space-y-6">
          <DetailsCard icon={CalendarClock} title="النشاط / آخر تحديث">
            <InfoGrid rows={[
              ["آخر نشاط", "—"],
              ["آخر تحديث", formatArDateTime(product.updated_at)],
            ]} />
          </DetailsCard>

          <DetailsCard icon={Settings} title="معلومات النظام">
            <InfoGrid rows={[
              ["أنشئ في", formatArDateTime(product.created_at)],
              ["أنشئ بواسطة", product.created_by?.name || "—"],
              ["حُدّث في", formatArDateTime(product.updated_at)],
              ["حُدّث بواسطة", product.updated_by?.name || "—"],
            ]} />
          </DetailsCard>
        </div>
      </div>
      <ProductPricesDialog
        open={pricesOpen}
        onOpenChange={setPricesOpen}
        product={product}
      />
    </div>
  )
}

function DetailsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="size-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function InfoGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-sm font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
