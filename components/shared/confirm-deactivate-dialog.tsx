"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Loader2, PowerOff, X, type LucideIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmDeactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  /** Displayed below the description, e.g. «اسم المورد» */
  entityName?: string | null
  onConfirm: () => void | Promise<void>
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  loadingLabel?: string
  icon?: LucideIcon
  /** Tailwind classes for the confirm action button */
  confirmClassName?: string
  className?: string
}

export function ConfirmDeactivateDialog({
  open,
  onOpenChange,
  title,
  description,
  entityName,
  onConfirm,
  confirmLabel = "إلغاء التنشيط",
  cancelLabel = "إلغاء",
  isLoading = false,
  loadingLabel = "جار المعالجة",
  icon: Icon = PowerOff,
  confirmClassName,
  className,
}: ConfirmDeactivateDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (isLoading) return
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        dir="rtl"
        lang="ar"
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[440px]",
          className
        )}
      >
        <div className="relative z-10 shrink-0 border-b border-border/50 bg-linear-to-b from-background via-background to-background/95 px-6 pb-4 pt-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <motion.span
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400"
            >
              <Icon className="size-5" aria-hidden />
            </motion.span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-right sm:text-right">
              <AlertDialogTitle className="text-lg font-bold tracking-tight">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                  <p>{description}</p>
                  {entityName ? (
                    <p className="text-sm font-medium text-foreground/90">«{entityName}»</p>
                  ) : null}
                </div>
              </AlertDialogDescription>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="إغلاق"
              disabled={isLoading}
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-border/50 bg-linear-to-t from-muted/30 to-background px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <AlertDialogAction
              className={cn(
                "min-w-28 rounded-xl bg-amber-500 text-white shadow-sm hover:bg-amber-600",
                confirmClassName
              )}
              onClick={() => void onConfirm()}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span>{loadingLabel}</span>
                </span>
              ) : (
                confirmLabel
              )}
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl text-muted-foreground"
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
            </AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
