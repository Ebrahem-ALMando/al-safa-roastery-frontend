"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { ApiRequestError } from "@/lib/api"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { CreateTestInput } from "@/features/tests"
import { useCategoriesTree } from "@/features/categories"
import { TestFormDialog } from "@/components/tests/test-form-dialog"
import { mapLabTestFormToCreateInput } from "@/components/tests/map-lab-test-form-to-api"
import type { LabTest } from "@/lib/lab-catalog-types"

interface AddTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** يُملأ اختيار التصنيف عند فتح «إضافة فحص» من شجرة التصنيفات */
  defaultCategoryId?: string | null
  onCreate?: (payload: CreateTestInput) => Promise<unknown>
  onTestSaved?: () => void
}

function mapSubmitError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 422) return "البيانات غير صحيحة"
    if (error.status === 401) return "غير مصرح"
    if (error.status === 403) return "الحساب غير مفعل"
    if (error.status >= 500) return "حدث خطأ في النظام"
    if (error.status === 0) return "تحقق من الاتصال"
  }
  return "تحقق من الاتصال"
}

export function AddTestDialog({
  open,
  onOpenChange,
  defaultCategoryId = null,
  onCreate,
  onTestSaved,
}: AddTestDialogProps) {
  const { categoryTree, isLoading: treeLoading } = useCategoriesTree(open)

  async function handleSubmit(data: Omit<LabTest, "id">) {
    if (!onCreate) return
    const payload = mapLabTestFormToCreateInput(data)
    try {
      await onCreate(payload)
      onTestSaved?.()
    } catch (err) {
      toast.error("تعذر الحفظ", { description: mapSubmitError(err) })
      throw err
    }
  }

  if (open && treeLoading && categoryTree.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir="rtl"
          lang="ar"
          className="max-w-md rounded-2xl border-border/60"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
            <p className="text-center text-sm text-muted-foreground">جارٍ تحميل التصنيفات…</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <TestFormDialog
      open={open}
      onOpenChange={onOpenChange}
      categoryTree={categoryTree}
      initial={null}
      defaultCategoryId={defaultCategoryId}
      title="فحص جديد"
      onSubmit={handleSubmit}
    />
  )
}
