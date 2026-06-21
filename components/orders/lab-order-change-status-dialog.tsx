"use client"

import * as React from "react"
import { BadgeCheck, Ban, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { LabOrder } from "@/features/orders"
import type { LaravelSuccessResponse } from "@/lib/api"
import { useAction } from "@/lib/hooks/useAction"
import { getOrderStatusLabel } from "./orders-helpers"

export type ManualLabOrderStatus = "approved" | "cancelled"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: LabOrder | null
  onSuccess?: () => void | Promise<void>
}

export function LabOrderChangeStatusDialog({ open, onOpenChange, order, onSuccess }: Props) {
  const { execute } = useAction()
  const [choice, setChoice] = React.useState<ManualLabOrderStatus>("approved")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open && order) {
      setChoice(order.status === "cancelled" ? "cancelled" : "approved")
    }
  }, [open, order])

  const handleSubmit = async () => {
    if (!order) return
    setSubmitting(true)
    try {
      await execute<LaravelSuccessResponse<LabOrder>>({
        endpoint: `lab-orders/${order.id}/status`,
        method: "PUT",
        payload: { status: choice },
      })
      onOpenChange(false)
      await onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl text-right sm:max-w-lg" dir="rtl" lang="ar">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">تغيير حالة الطلب</DialogTitle>
          <DialogDescription className="text-pretty text-sm text-muted-foreground">
            الحالات التشغيلية (قيد الانتظار، قيد التنفيذ، مكتمل) تُحدَّث تلقائياً من النتائج. هنا يمكنك فقط{" "}
            <strong>اعتماد</strong> الطلب أو <strong>إلغائه</strong> يدوياً.
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="space-y-4 py-1">
            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm">
              <span className="text-muted-foreground">الطلب: </span>
              <span className="font-mono font-medium" dir="ltr">
                {order.order_number}
              </span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span>الحالة الحالية: {getOrderStatusLabel(order.status)}</span>
            </div>

            <RadioGroup
              value={choice}
              onValueChange={(v) => setChoice(v as ManualLabOrderStatus)}
              className="grid gap-3"
            >
              <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 p-3 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="approved" id="st-approved" className="shrink-0" />
                <BadgeCheck className="size-5 shrink-0 text-violet-600" aria-hidden />
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-medium">معتمد</p>
                  <p className="text-xs text-muted-foreground">إغلاق اعتباري للطلب بعد المراجعة.</p>
                </div>
              </div>
              <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 p-3 has-[[data-state=checked]]:border-destructive/35 has-[[data-state=checked]]:bg-destructive/5">
                <RadioGroupItem value="cancelled" id="st-cancelled" className="shrink-0" />
                <Ban className="size-5 shrink-0 text-destructive" aria-hidden />
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-medium">ملغي</p>
                  <p className="text-xs text-muted-foreground">إيقاف الطلب دون الاعتماد على النتائج.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={submitting}>
            إلغاء
          </Button>
          <Button type="button" className="rounded-xl" onClick={() => void handleSubmit()} disabled={!order || submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ…
              </span>
            ) : (
              "تأكيد"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
