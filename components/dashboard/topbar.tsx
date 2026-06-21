"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Bell, Moon, Sun, User, LogOut, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuthActions } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopbarProps {
  sidebarCollapsed: boolean
}

export function Topbar({ sidebarCollapsed }: TopbarProps) {
  const router = useRouter()
  const { logout } = useAuthActions()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.header
      initial={false}
      animate={{ 
        marginRight: sidebarCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden"
    >
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="بحث عن مريض أو طلب..."
          className="h-10 w-full rounded-xl border-muted bg-muted/50 pr-10 text-sm placeholder:text-muted-foreground focus:bg-background"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              <span className="sr-only">تبديل الوضع</span>
            </Button>
          </motion.div>
        )}

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <Bell className="size-5" />
                <Badge 
                  className="absolute -top-1 -left-1 size-5 rounded-full p-0 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background"
                >
                  3
                </Badge>
                <span className="sr-only">الإشعارات</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl">
              <DropdownMenuLabel className="text-right">الإشعارات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="text-sm font-medium">نتائج جديدة جاهزة</span>
                <span className="text-xs text-muted-foreground">منذ 5 دقائق</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="text-sm font-medium">طلب تحليل جديد</span>
                <span className="text-xs text-muted-foreground">منذ 15 دقيقة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="text-sm font-medium">تنبيه: نتيجة غير طبيعية</span>
                <span className="text-xs text-muted-foreground">منذ ساعة</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="ghost" className="gap-3 rounded-xl px-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">د. مهران قهواتي</p>
                  <p className="text-xs text-muted-foreground">مدير المختبر</p>
                </div>
                <Avatar className="size-9">
                  <AvatarImage src="/doctor.png" alt="المستخدم" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">مق</AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="text-right">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="size-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="size-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              disabled={signingOut}
              onSelect={async (e) => {
                e.preventDefault()
                setSigningOut(true)
                try {
                  await logout()
                } catch {
                  // SWR cache cleared in hook; still navigate to login
                }
                router.replace("/login")
                router.refresh()
              }}
            >
              <LogOut className="size-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}
