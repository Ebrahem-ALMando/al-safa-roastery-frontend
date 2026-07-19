import {
  BarChart3,
  BookOpenText,
  ClipboardList,
  ClipboardPenLine,
  FolderTree,
  Factory,
  History,
  LayoutDashboard,
  Package,
  PackageCheck,
  Warehouse,
  ScanBarcode,
  ScanLine,
  Settings,
  ShoppingCart,
  TestTubes,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type UserRole = "admin" | "staff" | "lab_manager" | "technician" | string

export interface MenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  section?: "main" | "management"
  matchPrefix?: boolean
  excludedPrefixes?: readonly string[]
  hiddenForRoles?: UserRole[]
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
    section: "management",
    matchPrefix: true,
  },
  {
    id: "customers",
    label: "الزبائن",
    href: "/dashboard/customers",
    icon: Users,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "statements",
    label: "كشوف الحساب",
    href: "/dashboard/statements",
    icon: BookOpenText,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "items",
    label: "الأصناف",
    href: "/dashboard/items",
    icon: Package,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "products",
    label: "المنتجات",
    href: "/dashboard/products",
    icon: PackageCheck,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "inventory",
    label: "المستودع",
    href: "/dashboard/inventory",
    icon: Warehouse,
    section: "management",
    matchPrefix: true,
    excludedPrefixes: ["/dashboard/inventory/movements"],
  },
  {
    id: "production",
    label: "الإنتاج",
    href: "/dashboard/production",
    icon: Factory,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "inventory-movements",
    label: "حركات المستودع",
    href: "/dashboard/inventory/movements",
    icon: History,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "purchases",
    label: "المشتريات",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "cashbox",
    label: "الصندوق",
    href: "/dashboard/cashbox",
    icon: Wallet,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "patients",
    label: "المرضى",
    href: "/dashboard/patients",
    icon: Users,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "orders",
    label: "طلبات التحاليل",
    href: "/dashboard/orders",
    icon: ClipboardList,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "results",
    label: "إدخال النتائج",
    href: "/dashboard/results",
    icon: ClipboardPenLine,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "categories",
    label: "تصنيفات الفحوصات",
    href: "/dashboard/categories",
    icon: FolderTree,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "tests",
    label: "إدارة الفحوصات",
    href: "/dashboard/tests",
    icon: TestTubes,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "reports",
    label: "التقارير",
    href: "/dashboard/reports",
    icon: BarChart3,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "settings",
    label: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
    section: "management",
    matchPrefix: true,
  },
  {
    id: "barcode-test",
    label: "تجربة الباركود",
    href: "/dashboard/barcode-test",
    icon: ScanBarcode,
    section: "management",
  },
  {
    id: "barcode-scan-test",
    label: "تجربة قراءة الباركود",
    href: "/dashboard/barcode-scan-test",
    icon: ScanLine,
    section: "management",
  },
]
