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
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-border/50 bg-gradient-to-t from-muted/30 to-background px-4 py-4 sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-start gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl gap-2"
          onClick={onCancel}
          disabled={busy}
        >
          <X className="size-4" />
          إلغاء
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-w-36 rounded-xl gap-2"
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
          className="min-w-36 rounded-xl gap-2 shadow-sm"
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
      </div>
    </div>
  )
}
