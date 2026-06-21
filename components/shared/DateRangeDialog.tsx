"use client"

import * as React from "react"
import { CalendarRange, Check, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { isValidCustomPeriod } from "@/features/suppliers/lib/suppliers.helpers"

export interface DateRangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  from: string
  to: string
  onApply: (from: string, to: string) => void
  title?: string
  description?: string
  applyLabel?: string
}

export function DateRangeDialog({
  open,
  onOpenChange,
  from: initialFrom,
  to: initialTo,
  onApply,
  title = "تحديد فترة مخصصة",
  description = "اختر تاريخ البداية والنهاية للفترة المطلوبة.",
  applyLabel = "تطبيق الفترة",
}: DateRangeDialogProps) {
  const [from, setFrom] = React.useState(initialFrom)
  const [to, setTo] = React.useState(initialTo)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setFrom(initialFrom)
    setTo(initialTo)
  }, [open, initialFrom, initialTo])

  function handleApply() {
    if (!isValidCustomPeriod(from, to)) {
      toast.error("تأكد من اختيار تاريخين صحيحين (من ≤ إلى)")
      return
    }
    setSubmitting(true)
    try {
      onApply(from, to)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,480px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[480px]"
      >
        <div className="relative shrink-0 border-b border-border/50 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-4 pt-6">
          <DialogHeader className="space-y-2 text-right sm:text-right">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <CalendarRange className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <DialogTitle className="text-lg font-bold leading-snug tracking-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                  {description}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="date-range-from">من تاريخ</Label>
            <Input
              id="date-range-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-range-to">إلى تاريخ</Label>
            <Input
              id="date-range-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-border/50 bg-gradient-to-t from-muted/30 to-background px-6 py-4">
          <div className="flex w-full flex-wrap items-center justify-start gap-2">
            <Button
              type="button"
              className="min-w-36 rounded-xl shadow-sm gap-2"
              onClick={handleApply}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              {applyLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl gap-2"
            >
              <X className="size-4" />
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
