"use client"

import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HeaderLeft } from "./HeaderLeft"
import { HeaderCenter } from "./HeaderCenter"
import { HeaderRight } from "./HeaderRight"
import { defaultRouteConfig, routeMatchers, type RouteConfig } from "./routeConfig"

interface HeaderProps {
  className?: string
  onMenuToggle?: () => void
}

function getRouteInfo(pathname: string): RouteConfig {
  const sorted = [...routeMatchers].sort((a, b) => b.path.length - a.path.length)
  const match = sorted.find((item) =>
    item.matchPrefix ? pathname === item.path || pathname.startsWith(`${item.path}/`) : pathname === item.path
  )
  return match ?? defaultRouteConfig
}

export function Header({ className, onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const route = getRouteInfo(pathname)

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
            aria-label="فتح القائمة"
          >
            <Menu className="h-4.5 w-4.5" />
          </Button>
          <HeaderRight title={route.title} icon={route.icon} />
        </div>

        <HeaderCenter />
        <HeaderLeft />
      </div>
    </header>
  )
}
