import {
  ArrowLeftRight,
  Banknote,
  BarChart3,
  BookOpenText,
  CreditCard,
  Factory,
  LayoutDashboard,
  Package,
  PackageCheck,
  Receipt,
  RotateCcw,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCog,
  UserRound,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface RouteConfig {
  title: string
  icon: LucideIcon
}

export interface RouteMatcher extends RouteConfig {
  path: string
  matchPrefix?: boolean
}

export const routeMatchers: readonly RouteMatcher[] = [
  { path: "/dashboard", title: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/dashboard/suppliers", title: "الموردون", icon: Truck, matchPrefix: true },
  { path: "/dashboard/customers", title: "العملاء", icon: Users, matchPrefix: true },
  { path: "/dashboard/employees", title: "الموظفون", icon: UserCog, matchPrefix: true },
  { path: "/dashboard/items", title: "الأصناف", icon: Package, matchPrefix: true },
  { path: "/dashboard/products", title: "المنتجات", icon: PackageCheck, matchPrefix: true },
  { path: "/dashboard/inventory/movements", title: "حركة المخزون", icon: ArrowLeftRight, matchPrefix: true },
  { path: "/dashboard/inventory", title: "المخزون", icon: Warehouse, matchPrefix: true },
  { path: "/dashboard/purchases", title: "المشتريات", icon: ShoppingCart, matchPrefix: true },
  { path: "/dashboard/production", title: "الإنتاج", icon: Factory, matchPrefix: true },
  { path: "/dashboard/sales", title: "المبيعات", icon: Receipt, matchPrefix: true },
  { path: "/dashboard/returns", title: "المرتجعات", icon: RotateCcw, matchPrefix: true },
  { path: "/dashboard/cashbox", title: "الصندوق", icon: Wallet, matchPrefix: true },
  { path: "/dashboard/expenses", title: "المصاريف", icon: Banknote, matchPrefix: true },
  { path: "/dashboard/payments", title: "الدفعات", icon: CreditCard, matchPrefix: true },
  { path: "/dashboard/statements", title: "كشوف الحساب", icon: BookOpenText, matchPrefix: true },
  { path: "/dashboard/reports/profits", title: "تقرير الأرباح", icon: TrendingUp, matchPrefix: true },
  { path: "/dashboard/reports/sales", title: "تقرير المبيعات", icon: Receipt, matchPrefix: true },
  { path: "/dashboard/reports/inventory", title: "تقرير المخزون", icon: Warehouse, matchPrefix: true },
  { path: "/dashboard/reports", title: "التقارير", icon: BarChart3, matchPrefix: true },
  { path: "/dashboard/settings", title: "الإعدادات", icon: Settings, matchPrefix: true },
  { path: "/profile", title: "الملف الشخصي", icon: UserRound, matchPrefix: true },
]

export const defaultRouteConfig: RouteConfig = {
  title: "لوحة التحكم",
  icon: LayoutDashboard,
}
