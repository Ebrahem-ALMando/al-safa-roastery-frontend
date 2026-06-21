"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  TestTubes,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderTree,
} from "lucide-react"
import { LAB_LOGO_PATH } from "@/lib/lab-brand"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// TODO: Add roastery-specific navigation items (Suppliers, Customers, etc.)
const navItems = [
  {
    title: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // TODO: Add new roastery modules here (hide lab-specific items for now)
  // {
  //   title: "الموردين",
  //   href: "/dashboard/suppliers",
  //   icon: Users,
  // },
  // {
  //   title: "العملاء",
  //   href: "/dashboard/customers",
  //   icon: Users,
  // },
  // {
  //   title: "الموظفين",
  //   href: "/dashboard/employees",
  //   icon: Users,
  // },
  // {
  //   title: "الأصناف",
  //   href: "/dashboard/items",
  //   icon: FolderTree,
  // },
  // {
  //   title: "المنتجات",
  //   href: "/dashboard/products",
  //   icon: TestTubes,
  // },
  // {
  //   title: "المخزون",
  //   href: "/dashboard/inventory",
  //   icon: ClipboardList,
  // },
  // {
  //   title: "المشتريات",
  //   href: "/dashboard/purchases",
  //   icon: FileText,
  // },
  // {
  //   title: "الإنتاج",
  //   href: "/dashboard/production",
  //   icon: BarChart3,
  // },
  // {
  //   title: "المبيعات",
  //   href: "/dashboard/sales",
  //   icon: BarChart3,
  // },
  // {
  //   title: "المدفوعات",
  //   href: "/dashboard/payments",
  //   icon: BarChart3,
  // },
  // {
  //   title: "المرتجعات",
  //   href: "/dashboard/returns",
  //   icon: BarChart3,
  // },
  // {
  //   title: "المصروفات",
  //   href: "/dashboard/expenses",
  //   icon: BarChart3,
  // },
  // {
  //   title: "المرتبات",
  //   href: "/dashboard/payroll",
  //   icon: BarChart3,
  // },
  // {
  //   title: "الصندوق",
  //   href: "/dashboard/cashbox",
  //   icon: BarChart3,
  // },
  // {
  //   title: "القوائم",
  //   href: "/dashboard/statements",
  //   icon: BarChart3,
  // },
  // {
  //   title: "التقارير",
  //   href: "/dashboard/reports",
  //   icon: BarChart3,
  // },
  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/** تبويب واحد نشط: /dashboard لا يُطابق المسارات الفرعية (مثل /dashboard/reports) */
function isNavItemActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (href === "/dashboard") return false
  return pathname.startsWith(`${href}/`)
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 z-40 flex h-screen flex-col border-l border-sidebar-border bg-sidebar print:hidden"
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-white shadow-sm dark:bg-white">
                <Image
                  src={LAB_LOGO_PATH}
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground">محمصة الصفا</span>
                <span className="text-xs text-muted-foreground">نظام إدارة</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="relative mx-auto flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-white shadow-sm dark:bg-white">
            <Image
              src={LAB_LOGO_PATH}
              alt=""
              width={40}
              height={40}
              className="object-contain p-1"
              priority
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("size-5 shrink-0", collapsed && "mx-auto")} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  )
}
