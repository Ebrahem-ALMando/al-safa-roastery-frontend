"use client"

import { FolderTree, List } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CategoriesViewMode } from "@/features/categories"

interface CategoriesViewToggleProps {
  value: CategoriesViewMode
  onChange: (value: CategoriesViewMode) => void
  className?: string
}

export function CategoriesViewToggle({
  value,
  onChange,
  className,
}: CategoriesViewToggleProps) {
  const modes: {
    id: CategoriesViewMode
    label: string
    icon: typeof FolderTree
  }[] = [
    { id: "tree", label: "شجرة", icon: FolderTree },
    { id: "table", label: "جدول", icon: List },
  ]

  return (
    <div
      className={cn(
        "inline-flex shrink-0 flex-nowrap items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-1",
        className
      )}
      role="tablist"
      aria-label="طريقة عرض التصنيفات"
    >
      {modes.map(({ id, label, icon: Icon }) => (
        <motion.div key={id} whileTap={{ scale: 0.97 }} className="inline-flex">
          <Button
            type="button"
            role="tab"
            aria-selected={value === id}
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
