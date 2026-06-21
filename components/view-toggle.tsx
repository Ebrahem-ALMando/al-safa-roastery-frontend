"use client"

import { LayoutGrid, List } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ViewMode = "table" | "cards"

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-xl border bg-muted/30 p-1",
        className
      )}
    >
      <motion.div whileTap={{ scale: 0.97 }} className="inline-flex">
        <Button
          variant={value === "table" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChange("table")}
          className={cn(
            "gap-2 rounded-lg transition-all",
            value === "table" && "shadow-sm"
          )}
        >
          <List className="size-4" />
          <span className="hidden sm:inline">جدول</span>
        </Button>
      </motion.div>
      <motion.div whileTap={{ scale: 0.97 }} className="inline-flex">
        <Button
          variant={value === "cards" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChange("cards")}
          className={cn(
            "gap-2 rounded-lg transition-all",
            value === "cards" && "shadow-sm"
          )}
        >
          <LayoutGrid className="size-4" />
          <span className="hidden sm:inline">بطاقات</span>
        </Button>
      </motion.div>
    </div>
  )
}
