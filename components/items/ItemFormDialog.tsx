"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Info, Loader2, Package, Pencil, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ApiRequestError } from "@/lib/api"
import { adminFormLabelClass } from "@/components/shared/forms/administrative-form-styles"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { CreateItemInput, Item, UpdateItemInput } from "@/features/items"
import {
  ItemFormFields,
  emptyItemForm,
  formToCreatePayload,
  formToUpdatePayload,
  itemToForm,
  type ItemFormState,
} from "./item-form-fields"

const MINIMUM_QUANTITY_TOOLTIP =
  "الكمية التي يبدأ عندها النظام بتنبيهك لإعادة طلب الصنف."
const MINIMUM_QUANTITY_HINT =
  "عند الوصول لهذا الحد يظهر الصنف ضمن أصناف تحتاج إعادة طلب."

function ItemMinimumQuantityLabel({ htmlFor }: { htmlFor: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className={adminFormLabelClass}>
        الحد الأدنى للكمية (كغ)
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={MINIMUM_QUANTITY_TOOLTIP}
          >
            <Info className="size-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" dir="rtl" className="max-w-xs text-right text-xs leading-relaxed">
          {MINIMUM_QUANTITY_TOOLTIP}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function mapSubmitError(error: unknown): string | null {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return null
    if (error.status === 422) return "البيانات غير صحيحة"
    if (error.status === 403) return "الحساب غير مفعل"
    if (error.status >= 500) return "حدث خطأ في النظام"
    if (error.status === 0) return "تحقق من الاتصال"
  }
  return "تحقق من الاتصال"
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  item?: Item | null
  onCreate?: (payload: CreateItemInput) => Promise<unknown>
  onUpdate?: (id: number, payload: UpdateItemInput) => Promise<unknown>
  onSaved?: () => void
}

export function ItemFormDialog({
  open,
  onOpenChange,
  mode,
  item,
  onCreate,
  onUpdate,
  onSaved,
}: ItemFormDialogProps) {
  const [form, setForm] = React.useState<ItemFormState>(emptyItemForm())
  const [submitting, setSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})

  React.useEffect(() => {
    if (!open) return
    setFieldErrors({})
    if (mode === "edit" && item) {
      setForm(itemToForm(item))
    } else {
      setForm(emptyItemForm())
    }
  }, [open, mode, item])

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setForm(emptyItemForm())
      setFieldErrors({})
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const name = form.name.trim()
    if (name.length < 1) {
      toast.error("اسم الصنف مطلوب")
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    try {
      if (mode === "create" && onCreate) {
        await onCreate(formToCreatePayload(form))
      } else if (mode === "edit" && item && onUpdate) {
        await onUpdate(item.id, formToUpdatePayload(form))
      }
      onSaved?.()
      handleOpenChange(false)
    } catch (err) {
      if (err instanceof ApiRequestError && err.errors) {
        setFieldErrors(err.errors)
      }
      const message = mapSubmitError(err)
      if (message) {
        toast.error(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isCreate = mode === "create"
  const HeaderIcon = isCreate ? Package : Pencil
  const minimumQuantityFieldId = isCreate ? "add-item-minimumQuantity" : "edit-item-minimumQuantity"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:min-h-[min(52vh,400px)] sm:max-w-[640px]"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="relative z-10 shrink-0 border-b border-border/50 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-4 pt-6 backdrop-blur-sm">
            <DialogHeader className="space-y-2 text-right sm:text-right">
              <div className="flex items-start gap-3">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
                  aria-hidden
                >
                  <HeaderIcon className="size-5" />
                </motion.span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <DialogTitle className="text-lg font-bold leading-snug tracking-tight">
                    {isCreate ? "إضافة صنف جديد" : "تعديل بيانات الصنف"}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                      {isCreate ? (
                        <>
                          <p>
                            املأ الحقول التالية بعناية لإنشاء صنف جديد. يولّد النظام{" "}
                            <span className="font-medium text-foreground/90">كود الصنف تلقائياً</span>{" "}
                            بعد الحفظ.
                          </p>
                          <p>
                            <span className="text-destructive">*</span> يشير إلى حقل مطلوب.
                          </p>
                        </>
                      ) : item ? (
                        <>
                          <p>
                            <span className="font-medium text-foreground/90">{item.name}</span>
                            {item.code ? <> — كود الصنف: {item.code}</> : <> — دون كود</>}
                          </p>
                          <p>عدّل بيانات الصنف ثم احفظ التغييرات. الكمية والتكلفة غير قابلة للتعديل هنا.</p>
                        </>
                      ) : (
                        <p>عدّل بيانات الصنف ثم احفظ التغييرات.</p>
                      )}
                    </div>
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="إغلاق"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M1 1l12 12M13 1 1 13" />
                  </svg>
                </button>
              </div>
            </DialogHeader>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="pointer-events-none sticky top-0 z-[1] -mb-2 h-2 bg-gradient-to-b from-background to-transparent" />
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-3 px-6 py-4"
            >
              <motion.fieldset variants={fadeUp} className="min-w-0 space-y-0 border-0 p-0">
                <ItemFormFields
                  form={form}
                  onChange={setForm}
                  idPrefix={isCreate ? "add-item" : "edit-item"}
                  mode={mode}
                  item={item}
                  fieldErrors={fieldErrors}
                  nameFieldAutoFocus={isCreate}
                  formKey={`${mode}-${item?.id ?? "new"}-${open}`}
                  minimumQuantityLabel={
                    <ItemMinimumQuantityLabel htmlFor={minimumQuantityFieldId} />
                  }
                  minimumQuantityHint={
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {MINIMUM_QUANTITY_HINT}
                    </p>
                  }
                />
              </motion.fieldset>
            </motion.div>
            <div className="pointer-events-none sticky bottom-0 z-[1] -mt-2 h-2 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="shrink-0 border-t border-border/50 bg-gradient-to-t from-muted/30 to-background px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-start gap-2">
              <Button
                type="submit"
                className="min-w-36 rounded-xl shadow-sm gap-2"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    <span>جارٍ الحفظ</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" aria-hidden />
                    {isCreate ? "حفظ الصنف" : "حفظ التغييرات"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl gap-2"
              >
                <X className="size-4" aria-hidden />
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
