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
  Users,
  Wallet,
  Warehouse,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type UserRole = "admin" | "staff" | "manager" | string

export type MenuSection =
  | "main"
  | "admin"
  | "inventory"
  | "operations"
  | "finance"
  | "reports"
  | "settings"

export const menuSectionLabels: Record<MenuSection, string> = {
  main: "الرئيسية",
  admin: "الإدارة",
  inventory: "المخزون",
  operations: "التشغيل",
  finance: "المالية",
  reports: "التقارير",
  settings: "الإعدادات",
}

export const menuSectionOrder: readonly MenuSection[] = [
  "main",
  "admin",
  "inventory",
  "operations",
  "finance",
  "reports",
  "settings",
]

export interface MenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  section: MenuSection
  matchPrefix?: boolean
  excludedPrefixes?: readonly string[]
  hiddenForRoles?: UserRole[]
  comingSoon?: boolean
}

export const menuItems: readonly MenuItem[] = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "main",
  },
  {
    id: "suppliers",
    label: "الموردون",
    href: "/dashboard/suppliers",
    icon: Truck,
    section: "admin",
    matchPrefix: true,
  },
  {
    id: "customers",
    label: "العملاء",
    href: "/dashboard/customers",
    icon: Users,
    section: "admin",
    matchPrefix: true,
  },
  {
    id: "employees",
    label: "الموظفون",
    href: "/dashboard/employees",
    icon: UserCog,
    section: "admin",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "items",
    label: "الأصناف",
    href: "/dashboard/items",
    icon: Package,
    section: "inventory",
    matchPrefix: true,
  },
  {
    id: "products",
    label: "المنتجات",
    href: "/dashboard/products",
    icon: PackageCheck,
    section: "inventory",
    matchPrefix: true,
  },
  {
    id: "inventory-movements",
    label: "حركة المخزون",
    href: "/dashboard/inventory/movements",
    icon: ArrowLeftRight,
    section: "inventory",
    matchPrefix: true,
  },
  {
    id: "purchases",
    label: "المشتريات",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
    section: "operations",
    matchPrefix: true,
  },
  {
    id: "production",
    label: "الإنتاج",
    href: "/dashboard/production",
    icon: Factory,
    section: "operations",
    matchPrefix: true,
  },
  {
    id: "sales",
    label: "المبيعات",
    href: "/dashboard/sales",
    icon: Receipt,
    section: "operations",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "returns",
    label: "المرتجعات",
    href: "/dashboard/returns",
    icon: RotateCcw,
    section: "operations",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "cashbox",
    label: "الصندوق",
    href: "/dashboard/cashbox",
    icon: Wallet,
    section: "finance",
    matchPrefix: true,
  },
  {
    id: "expenses",
    label: "المصاريف",
    href: "/dashboard/expenses",
    icon: Banknote,
    section: "finance",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "payments",
    label: "الدفعات",
    href: "/dashboard/payments",
    icon: CreditCard,
    section: "finance",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "statements",
    label: "كشوف الحساب",
    href: "/dashboard/statements",
    icon: BookOpenText,
    section: "finance",
    matchPrefix: true,
  },
  {
    id: "reports",
    label: "التقارير",
    href: "/dashboard/reports",
    icon: BarChart3,
    section: "reports",
    matchPrefix: true,
    excludedPrefixes: [
      "/dashboard/reports/profits",
      "/dashboard/reports/sales",
      "/dashboard/reports/inventory",
    ],
  },
  {
    id: "reports-profits",
    label: "الأرباح",
    href: "/dashboard/reports/profits",
    icon: TrendingUp,
    section: "reports",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "reports-sales",
    label: "المبيعات",
    href: "/dashboard/reports/sales",
    icon: Receipt,
    section: "reports",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "reports-inventory",
    label: "المخزون",
    href: "/dashboard/reports/inventory",
    icon: Warehouse,
    section: "reports",
    matchPrefix: true,
    comingSoon: true,
  },
  {
    id: "settings",
    label: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
    section: "settings",
    matchPrefix: true,
  },
]
