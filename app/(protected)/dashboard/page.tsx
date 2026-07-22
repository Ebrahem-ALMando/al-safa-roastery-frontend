"use client"

import {
  Banknote,
  CircleDollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { BrandedEmptyState } from "@/components/shared/BrandedEmptyState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BRAND_NAME_AR } from "@/lib/brand"

const quickLinks = [
  { href: "/dashboard/items", label: "إضافة صنف" },
  { href: "/dashboard/products", label: "إضافة منتج" },
  { href: "/dashboard/purchases/new", label: "فاتورة شراء" },
  { href: "/dashboard/production/new", label: "عملية إنتاج" },
] as const

export default function DashboardPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لوحة تحكم {BRAND_NAME_AR}</h1>
        <p className="text-muted-foreground">
          نظرة سريعة على أداء المحمصة — المبيعات، المخزون، والصندوق
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="قيمة المخزون"
          value="—"
          description="إجمالي قيمة الأصناف والمنتجات"
          icon={Package}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="مبيعات اليوم"
          value="—"
          description="إجمالي مبيعات اليوم الحالي"
          icon={ShoppingBag}
          iconClassName="bg-chart-2/15 text-amber-700"
        />
        <StatCard
          title="أرباح الشهر"
          value="—"
          description="صافي الأرباح للشهر الجاري"
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="المصاريف"
          value="—"
          description="مصاريف التشغيل للفترة الحالية"
          icon={Banknote}
          iconClassName="bg-destructive/10 text-destructive"
        />
        <StatCard
          title="رصيد الصندوق"
          value="—"
          description="الرصيد الحالي للصندوق"
          icon={Wallet}
          iconClassName="bg-warning/10 text-amber-700"
        />
        <StatCard
          title="عدد المنتجات"
          value="—"
          description="المنتجات النشطة في النظام"
          icon={CircleDollarSign}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Button key={link.href} asChild variant="outline" className="rounded-xl">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">آخر النشاط</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandedEmptyState
              title="لا توجد بيانات حالياً"
              description={`ابدأ بإضافة أول صنف في ${BRAND_NAME_AR} لمتابعة النشاط هنا`}
              className="min-h-40 border-none bg-transparent p-4"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
