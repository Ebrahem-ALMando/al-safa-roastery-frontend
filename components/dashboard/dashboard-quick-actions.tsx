"use client"

import { Boxes, Factory, PackagePlus, ReceiptText } from "lucide-react"
import { QuickActionCard, type QuickActionTheme } from "./quick-action-card"

const actions: readonly {
  href: string
  title: string
  description: string
  icon: typeof PackagePlus
  theme: QuickActionTheme
}[] = [
  {
    href: "/dashboard/items",
    title: "إضافة صنف",
    description: "تسجيل مادة خام أو صنف جاهز جديد",
    icon: PackagePlus,
    theme: "cyan",
  },
  {
    href: "/dashboard/products",
    title: "إضافة منتج",
    description: "إنشاء منتج بيع وربطه بالمخزون",
    icon: Boxes,
    theme: "indigo",
  },
  {
    href: "/dashboard/purchases/new",
    title: "فاتورة شراء",
    description: "إدخال مشتريات جديدة من مورد",
    icon: ReceiptText,
    theme: "amber",
  },
  {
    href: "/dashboard/production/new",
    title: "عملية إنتاج",
    description: "تحويل المواد الخام إلى أصناف جاهزة",
    icon: Factory,
    theme: "emerald",
  },
] as const

export function DashboardQuickActions() {
  return (
    <section aria-labelledby="dashboard-quick-actions-title" className="space-y-4">
      <header className="space-y-1 text-right">
        <h2 id="dashboard-quick-actions-title" className="text-lg font-bold tracking-tight">
          إجراءات سريعة
        </h2>
        <p className="text-sm text-muted-foreground">ابدأ أكثر العمليات استخداماً مباشرة</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <QuickActionCard key={action.href} {...action} />
        ))}
      </div>
    </section>
  )
}
