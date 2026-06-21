"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { LabCatalogProvider } from "@/components/providers/lab-catalog-provider"
import {
  PREFS_CHANGED_EVENT,
  hydrateMotionFromStorage,
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from "@/lib/dashboard-prefs"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  React.useEffect(() => {
    setSidebarCollapsed(readSidebarCollapsed())
    hydrateMotionFromStorage()
    const onPrefs = () => {
      setSidebarCollapsed(readSidebarCollapsed())
      hydrateMotionFromStorage()
    }
    window.addEventListener(PREFS_CHANGED_EVENT, onPrefs)
    return () => window.removeEventListener(PREFS_CHANGED_EVENT, onPrefs)
  }, [])

  return (
    <LabCatalogProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed((c) => {
              const next = !c
              writeSidebarCollapsed(next)
              return next
            })
          }
        />

        <motion.div
          initial={false}
          animate={{
            marginRight: sidebarCollapsed ? 80 : 280,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex min-h-screen flex-col print:!mr-0 print:!min-h-0"
        >
          <Topbar sidebarCollapsed={sidebarCollapsed} />

          <motion.main
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex-1 p-6 print:!m-0 print:!min-h-0 print:!p-0 print:!shadow-none"
          >
            {children}
          </motion.main>
        </motion.div>
      </div>
    </LabCatalogProvider>
  )
}
