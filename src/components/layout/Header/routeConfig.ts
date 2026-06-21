import {
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  ScanBarcode,
  ScanLine,
  Settings,
  TestTubes,
  UserRound,
  Users,
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
  { path: "/dashboard/patients", title: "المرضى", icon: Users, matchPrefix: true },
  { path: "/dashboard/orders", title: "طلبات التحاليل", icon: ClipboardList, matchPrefix: true },
  { path: "/dashboard/categories", title: "تصنيفات الفحوصات", icon: FolderTree, matchPrefix: true },
  { path: "/dashboard/tests", title: "إدارة الفحوصات", icon: TestTubes, matchPrefix: true },
  { path: "/dashboard/results", title: "النتائج", icon: Activity, matchPrefix: true },
  { path: "/dashboard/reports", title: "التقارير", icon: BarChart3, matchPrefix: true },
  { path: "/dashboard/settings", title: "الإعدادات", icon: Settings, matchPrefix: true },
  { path: "/dashboard/barcode-test", title: "تجربة باركود المريض", icon: ScanBarcode },
  { path: "/dashboard/barcode-scan-test", title: "تجربة قراءة الباركود", icon: ScanLine },
  { path: "/profile", title: "الملف الشخصي", icon: UserRound, matchPrefix: true },
  { path: "/print/report", title: "طباعة التقرير", icon: FileText, matchPrefix: true },
]

export const defaultRouteConfig: RouteConfig = {
  title: "لوحة التحكم",
  icon: LayoutDashboard,
}
