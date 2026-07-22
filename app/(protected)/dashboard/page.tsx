"use client"

import {
  Banknote,
  CircleDollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { BrandedEmptyState } from "@/components/shared/BrandedEmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BRAND_NAME_AR } from "@/lib/brand"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardWelcomeHero } from "@/components/dashboard/dashboard-welcome-hero"

export default function DashboardPage() {
  return (
    <div className="page-enter space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          نظرة سريعة على أداء {BRAND_NAME_AR}
        </p>
      </header>

      <DashboardWelcomeHero />

      <DashboardQuickActions />

      <section aria-labelledby="dashboard-kpi-title" className="space-y-4">
        <h2 id="dashboard-kpi-title" className="sr-only">
          مؤشرات الأداء
        </h2>
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
      </section>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">آخر النشاط</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandedEmptyState
            title="لا توجد بيانات حالياً"
            description={`ابدأ بإضافة أول صنف في ${BRAND_NAME_AR} لمتابعة النشاط هنا`}
            className="min-h-36 border-none bg-transparent p-2"
          />
        </CardContent>
      </Card>
    </div>
  )
}
