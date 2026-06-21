"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Loader2, Trash2, X, type LucideIcon } from "lucide-react"
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

export interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  loadingLabel?: string
  /** افتراضي: سلة مهملات */
  icon?: LucideIcon
  className?: string
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "حذف",
  cancelLabel = "إلغاء",
  isLoading = false,
  loadingLabel = "جار المعالجة",
  icon: Icon = Trash2,
  className,
}: ConfirmDeleteDialogProps) {
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
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20"
            >
              <Icon className="size-5" aria-hidden />
            </motion.span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-right sm:text-right">
              <AlertDialogTitle className="text-lg font-bold tracking-tight">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-pretty text-xs leading-relaxed text-muted-foreground">
                {description}
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
              className="min-w-24 rounded-xl bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
              onClick={onConfirm}
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
