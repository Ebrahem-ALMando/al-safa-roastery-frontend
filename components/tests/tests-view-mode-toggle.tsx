"use client"

import { LayoutGrid, List, FolderTree } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TestsViewMode } from "@/features/tests"

export type { TestsViewMode }

interface TestsViewModeToggleProps {
  value: TestsViewMode
  onChange: (value: TestsViewMode) => void
  className?: string
}

export function TestsViewModeToggle({
  value,
  onChange,
  className,
}: TestsViewModeToggleProps) {
  const modes: { id: TestsViewMode; label: string; icon: typeof List }[] = [
    { id: "table", label: "جدول", icon: List },
    { id: "cards", label: "بطاقات", icon: LayoutGrid },
    { id: "tree", label: "شجرة", icon: FolderTree },
  ]

  return (
    <div
      className={cn(
        "inline-flex shrink-0 flex-nowrap items-center gap-0.5 rounded-xl border bg-muted/30 p-1",
        className
      )}
    >
      {modes.map(({ id, label, icon: Icon }) => (
        <motion.div key={id} whileTap={{ scale: 0.97 }} className="inline-flex">
          <Button
            variant={value === id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onChange(id)}
            className={cn(
              "gap-1.5 rounded-lg px-2.5 transition-all sm:gap-2 sm:px-3",
              value === id && "shadow-sm"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="text-xs sm:text-sm">{label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
