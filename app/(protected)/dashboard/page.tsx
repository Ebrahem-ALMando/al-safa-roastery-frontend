"use client"

import { Users, ClipboardList, CheckCircle, Clock, Package, ShoppingCart, Coffee, DollarSign } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"

// TODO: Replace with real dashboard data from Al Safa Roastery backend
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لوحة تحكم محمصة الصفا</h1>
        <p className="text-muted-foreground">سيتم ربط مؤشرات المبيعات والمخزون والصندوق والتقارير في المراحل القادمة</p>
      </div>

      {/* Stats Cards (Placeholder) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="الموردين"
          value="—"
          icon={Users}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="العملاء"
          value="—"
          icon={Users}
          iconClassName="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          title="الأصناف"
          value="—"
          icon={Package}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="الصندوق"
          value="—"
          icon={DollarSign}
          iconClassName="bg-warning/10 text-warning"
        />
      </div>

      {/* TODO: Add roastery-specific charts and tables here */}
    </div>
  )
}
