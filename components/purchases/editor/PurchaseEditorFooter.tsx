"use client"

import { Check, Loader2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type PurchaseEditorFooterProps = {
  onCancel: () => void
  onSaveDraft: () => void
  onComplete: () => void
  isSaving: boolean
  isCompleting: boolean
  disabled?: boolean
}

export function PurchaseEditorFooter({
  onCancel,
  onSaveDraft,
  onComplete,
  isSaving,
  isCompleting,
  disabled = false,
}: PurchaseEditorFooterProps) {
  const busy = isSaving || isCompleting

  return (
    <div className="rounded-xl border border-border/60 bg-background p-3 shadow-sm">
      <div className="grid gap-2">
        <Button
          type="button"
          className="h-11 w-full rounded-xl gap-2 shadow-sm"
          onClick={onComplete}
          disabled={disabled || busy}
          aria-busy={isCompleting}
        >
          {isCompleting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جارٍ الاعتماد
            </>
          ) : (
            <>
              <Check className="size-4" />
              اعتماد الفاتورة
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full rounded-xl gap-2"
          onClick={onSaveDraft}
          disabled={disabled || busy}
          aria-busy={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جارٍ الحفظ
            </>
          ) : (
            <>
              <Save className="size-4" />
              حفظ كمسودة
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-xl gap-2"
          onClick={onCancel}
          disabled={busy}
        >
          <X className="size-4" />
          إلغاء
        </Button>
      </div>
    </div>
  )
}
