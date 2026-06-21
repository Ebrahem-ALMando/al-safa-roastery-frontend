"use client"

import { useState } from "react"
import { LabCatalogProvider } from "@/components/providers/lab-catalog-provider"
import { cn } from "@/lib/utils"
import { GlobalBarcodeScannerListener } from "../GlobalBarcodeScannerListener"
import { Header } from "../Header"
import { Sidebar } from "../Sidebar"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <LabCatalogProvider>
      <GlobalBarcodeScannerListener />
      <div className="h-dvh overflow-hidden bg-background" data-lab-app-shell>
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div
          className={cn(
            "mr-0 flex h-dvh flex-col transition-all duration-300",
            sidebarCollapsed ? "md:mr-20" : "md:mr-[260px]"
          )}
        >
          <Header onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </LabCatalogProvider>
  )
}
