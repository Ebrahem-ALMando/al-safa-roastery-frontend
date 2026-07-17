"use client"

import Link from "next/link"
import {
  ArrowRight,
  BadgeInfo,
  Barcode,
  Box,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  DollarSign,
  FileText,
  Hash,
  Info,
  Package,
  Pencil,
  Power,
  RefreshCw,
  Settings,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatArDateTime,
  formatProductPrice,
  formatQuantityKg,
  linkedItemCode,
  linkedItemName,
  useProductActions,
  useProductDetails,
  type Product,
  type ProductPrice,
  type ProductPriceType,
} from "@/features/products"
import { cn } from "@/lib/utils"
import { ItemTypeBadge } from "@/components/items/item-type-badge"
import { ProductPriceStatusBadge } from "./ProductPriceStatusBadge"
import { ProductStatusBadge } from "./ProductStatusBadge"
import { ProductStockStatusBadge } from "./ProductStockStatusBadge"
import { ProductClearPricesDialog } from "./ProductClearPricesDialog"
import { ProductFormDialog } from "./ProductFormDialog"
import { ProductToggleActiveDialog } from "./ProductToggleActiveDialog"
import { ProductPricesDialog } from "./prices/ProductPricesDialog"
import { ProductPricesReadOnlyDialog } from "./prices/ProductPricesReadOnlyDialog"
import {
  getProductPriceTheme,
  PRODUCT_PRICE_DISPLAY_ORDER,
} from "./prices/product-price-theme"

export function ProductDetailsView({ productId }: { productId: number }) {
  const { product, isLoading, error, mutate } = useProductDetails(productId)
  const { toggleProductActive, clearProductPrices, updateProduct, saveProductPrices } = useProductActions()
  const [editOpen, setEditOpen] = useState(false)
  const [managePricesOpen, setManagePricesOpen] = useState(false)
  const [viewPricesOpen, setViewPricesOpen] = useState(false)
  const [clearPricesOpen, setClearPricesOpen] = useState(false)
  const [toggleActiveOpen, setToggleActiveOpen] = useState(false)

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
      <div className="rounded-3xl border border-border/60 bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button variant="ghost" size="icon" className="mt-0.5 rounded-xl" asChild aria-label="العودة">
              <Link href="/dashboard/products">
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-muted-foreground">المنتجات / تفاصيل المنتج</p>
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                {product.code || "غير محدد"}
              </p>
              <div className="flex flex-wrap gap-2">
                <ProductStatusBadge isActive={product.is_active} />
                <ProductPriceStatusBadge status={product.price_status} />
                <ProductStockStatusBadge product={product} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              تعديل المنتج
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setManagePricesOpen(true)}>
              <CircleDollarSign className="size-4" />
              إدارة الأسعار
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setViewPricesOpen(true)}>
              <BadgeInfo className="size-4" />
              عرض الأسعار
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl border-amber-500/40 text-amber-700" onClick={() => setClearPricesOpen(true)}>
              <Trash2 className="size-4" />
              حذف التسعيرات
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => setToggleActiveOpen(true)}
            >
              <Power className="size-4" />
              {product.is_active ? "إيقاف" : "تفعيل"}
            </Button>
          </div>
        </div>
      </div>

      <DetailsCard icon={Info} title="معلومات المنتج">
        <div className="grid gap-3 lg:grid-cols-2">
          <DetailTile icon={Package} label="الاسم" value={product.name} />
          <DetailTile icon={FileText} label="الملاحظات" value={product.notes || "غير محدد"} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailTile icon={Hash} label="كود المنتج" value={product.code || "غير محدد"} dir="ltr" />
          <DetailTile icon={Barcode} label="SKU" value={product.sku || "غير محدد"} dir="ltr" />
          <DetailTile icon={Settings} label="الحالة" value={<ProductStatusBadge isActive={product.is_active} />} />
          <DetailTile icon={CircleDollarSign} label="حالة التسعير" value={<ProductPriceStatusBadge status={product.price_status} />} />
        </div>
      </DetailsCard>

      <DetailsCard icon={Package} title="الصنف المرتبط">
        {product.linked_item || product.ready_item ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailTile icon={Package} label="اسم الصنف" value={linkedItemName(product)} />
              <DetailTile icon={Hash} label="كود الصنف" value={linkedItemCode(product) || "غير محدد"} dir="ltr" />
              <DetailTile icon={ClipboardList} label="نوع الصنف" value={product.linked_item?.item_type ? <ItemTypeBadge itemType={product.linked_item.item_type} /> : "غير محدد"} />
              <DetailTile icon={BadgeInfo} label="حالة المخزون" value={<ProductStockStatusBadge product={product} />} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailTile icon={Box} label="الكمية الحالية" value={formatQuantityKg(product.current_quantity_kg)} dir="ltr" />
              <DetailTile icon={Box} label="الحد الأدنى" value={formatQuantityKg(product.minimum_quantity_kg)} dir="ltr" />
              <DetailTile icon={DollarSign} label="متوسط التكلفة" value={formatProductPrice(product.average_cost)} dir="ltr" />
              <DetailTile icon={DollarSign} label="آخر سعر شراء" value={formatProductPrice(product.linked_item?.last_purchase_price ?? product.ready_item?.last_purchase_price ?? product.last_purchase_price)} dir="ltr" />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            لا يوجد صنف مرتبط بهذا المنتج.
          </div>
        )}
      </DetailsCard>

      <DetailsCard icon={CircleDollarSign} title="التسعير">
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setViewPricesOpen(true)}>
            <BadgeInfo className="size-4" />
            عرض الأسعار
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setManagePricesOpen(true)}>
            <CircleDollarSign className="size-4" />
            إدارة الأسعار
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl border-amber-500/40 text-amber-700" onClick={() => setClearPricesOpen(true)}>
            حذف التسعيرات
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PRODUCT_PRICE_DISPLAY_ORDER.map((priceType) => (
            <PriceCard
              key={priceType}
              priceType={priceType}
              price={product.prices?.find((item) => item.price_type === priceType)}
            />
          ))}
        </div>
      </DetailsCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailsCard icon={CalendarClock} title="النشاط / آخر تحديث">
          <InfoGrid rows={[
            ["آخر نشاط", "غير محدد"],
            ["آخر تحديث", formatArDateTime(product.updated_at)],
          ]} />
        </DetailsCard>
        <DetailsCard icon={Settings} title="معلومات النظام">
          <InfoGrid rows={[
            ["أنشئ في", formatArDateTime(product.created_at)],
            ["أنشئ بواسطة", product.created_by?.name || "غير محدد"],
            ["حُدث في", formatArDateTime(product.updated_at)],
            ["حُدث بواسطة", product.updated_by?.name || "غير محدد"],
          ]} />
        </DetailsCard>
      </div>

      <ProductPricesDialog open={managePricesOpen} onOpenChange={setManagePricesOpen} product={product} />
      <ProductPricesReadOnlyDialog open={viewPricesOpen} onOpenChange={setViewPricesOpen} product={product} />
      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        product={product}
        onUpdate={updateProduct}
        onSavePrices={(id, payload) => saveProductPrices(id, payload, { notify: false })}
        onSaved={() => void mutate()}
      />
      <ProductClearPricesDialog
        open={clearPricesOpen}
        onOpenChange={setClearPricesOpen}
        product={product}
        onConfirm={async (id) => {
          await clearProductPrices(id)
          await mutate()
        }}
      />
      <ProductToggleActiveDialog
        open={toggleActiveOpen}
        onOpenChange={setToggleActiveOpen}
        product={product}
        onConfirm={async (target) => {
          await toggleProductActive(target)
          await mutate()
        }}
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

function DetailTile({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: typeof Info
  label: string
  value: React.ReactNode
  dir?: "ltr" | "rtl"
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold" dir={dir}>{value}</dd>
    </div>
  )
}

function PriceCard({
  priceType,
  price,
}: {
  priceType: ProductPriceType
  price?: ProductPrice
}) {
  const theme = getProductPriceTheme(priceType)
  const Icon = theme.icon
  const isActive = Boolean(price?.is_active)

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", theme.styles.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{theme.title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums" dir="ltr">
            {price ? formatProductPrice(price.price) : "غير محدد"}
          </p>
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl ring-1", theme.styles.iconBox)}>
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className={
            isActive
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700"
              : "border-slate-300 bg-slate-100 text-slate-700"
          }
        >
          {isActive ? "فعال" : "موقوف"}
        </Badge>
      </div>
      {price?.notes ? (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {price.notes}
        </p>
      ) : null}
    </div>
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
