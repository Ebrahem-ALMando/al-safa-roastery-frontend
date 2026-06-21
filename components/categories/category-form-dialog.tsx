"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, FolderTree, Loader2, Search, Tag, X } from "lucide-react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { ApiRequestError } from "@/lib/api/api.types"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { CategoryIconKey, CategoryNode } from "@/lib/lab-catalog-types"
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon,
} from "@/components/categories/category-icons"

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

export interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  /** للإضافة: معرف الأب أو null للجذر */
  parentForAdd: string | null
  /** للتعديل */
  editingCategory: CategoryNode | null
  onSubmit: (payload: { name: string; iconKey: CategoryIconKey; isActive: boolean }) => Promise<void>
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

function isIconKey(v: string): v is CategoryIconKey {
  return CATEGORY_ICON_OPTIONS.some((o) => o.key === v)
}

function filterIconOptions(
  query: string
): typeof CATEGORY_ICON_OPTIONS {
  const raw = query.trim()
  if (!raw) return CATEGORY_ICON_OPTIONS
  const lower = raw.toLowerCase()
  return CATEGORY_ICON_OPTIONS.filter((o) => {
    if (o.labelAr.includes(raw)) return true
    if (o.key.toLowerCase().includes(lower)) return true
    return false
  })
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  parentForAdd,
  editingCategory,
  onSubmit,
}: CategoryFormDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (submitting) return
    onOpenChange(next)
  }

  const [name, setName] = React.useState("")
  const [iconKey, setIconKey] = React.useState<CategoryIconKey>("default")
  const [iconSearch, setIconSearch] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setIconSearch("")
    if (mode === "edit" && editingCategory) {
      setName(editingCategory.name)
      const k = editingCategory.iconKey
      setIconKey(
        k && isIconKey(k) ? k : "default"
      )
      setIsActive(editingCategory.is_active ?? true)
    } else {
      setName("")
      setIconKey("default")
      setIsActive(true)
    }
  }, [open, mode, editingCategory])

  const filteredIcons = React.useMemo(
    () => filterIconOptions(iconSearch),
    [iconSearch]
  )

  const title =
    mode === "edit"
      ? "تعديل التصنيف"
      : parentForAdd
        ? "تصنيف فرعي جديد"
        : "تصنيف رئيسي جديد"

  const subtitle =
    mode === "edit"
      ? "حدّث الاسم والأيقونة كما تظهر في الشجرة والفحوصات"
      : "اسم التصنيف والأيقونة كما تظهر في الشجرة والفحوصات والتقارير"

  const HeaderIcon = getCategoryIcon(iconKey)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("أدخل اسم التصنيف")
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: trimmed, iconKey, isActive })
      onOpenChange(false)
    } catch (error) {
      toast.error(mapSubmitError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(88vh,640px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[480px]"
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="relative z-10 shrink-0 border-b border-border/50 bg-linear-to-b from-background via-background to-background/95 px-6 pb-4 pt-6 backdrop-blur-sm">
            <DialogHeader className="space-y-1.5 text-right sm:text-right">
              <div className="flex items-center gap-3">
                <motion.span
                  key={iconKey}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
                >
                  <HeaderIcon className="size-5" aria-hidden />
                </motion.span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                    {subtitle}
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="إغلاق"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
            </DialogHeader>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="pointer-events-none sticky top-0 z-1 -mb-3 h-3 bg-linear-to-b from-background to-transparent" />

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-5 px-6 py-4"
            >
              <motion.fieldset
                variants={fadeUp}
                className="min-w-0 space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4"
              >
                <legend className="px-1.5 text-[13px] font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <Tag className="size-3.5 opacity-80" aria-hidden />
                    التسمية
                  </span>
                </legend>
                <div className="space-y-1.5">
                  <Label htmlFor="catName" className="text-[13px] text-foreground/80">
                    اسم التصنيف <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                      aria-hidden
                    >
                      <FolderTree className="size-4" />
                    </span>
                    <Input
                      id="catName"
                      name="catName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: الكيمياء الحيوية"
                      className="h-10 rounded-xl bg-background ps-10 shadow-none transition-shadow focus:shadow-sm"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium">حالة التصنيف</p>
                    <p className="text-[11px] text-muted-foreground">
                      {isActive ? "نشط ويظهر في القوائم" : "غير نشط ومخفى من الاستخدام"}
                    </p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} disabled={submitting} />
                </div>
              </motion.fieldset>

              <motion.fieldset
                variants={fadeUp}
                className="min-w-0 space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4 pb-4"
              >
                <legend className="px-1.5 text-[13px] font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <HeaderIcon className="size-3.5 opacity-80" aria-hidden />
                    أيقونة التصنيف
                  </span>
                </legend>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  اختر أيقونة طبية تسهّل التعرف على التصنيف في الشجرة والقوائم.
                  يمكنك البحث بالاسم العربي أو بالاسم الإنجليزي للأيقونة.
                </p>
                <div className="space-y-2">
                  <Label
                    htmlFor="iconSearch"
                    className="sr-only"
                  >
                    بحث في الأيقونات
                  </Label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                      aria-hidden
                    >
                      <Search className="size-4" />
                    </span>
                    <Input
                      id="iconSearch"
                      type="search"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault()
                      }}
                      placeholder="ابحث عن أيقونة… (مثال: دم، heart، كيمياء)"
                      className="h-9 rounded-xl bg-background ps-10 text-sm shadow-none placeholder:text-muted-foreground/70"
                      autoComplete="off"
                      dir="auto"
                      aria-describedby="icon-search-hint"
                    />
                  </div>
                  <p
                    id="icon-search-hint"
                    className="text-[11px] text-muted-foreground"
                    aria-live="polite"
                  >
                    {iconSearch.trim()
                      ? `عرض ${filteredIcons.length} من ${CATEGORY_ICON_OPTIONS.length}`
                      : `إجمالي ${CATEGORY_ICON_OPTIONS.length} أيقونة`}
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="أيقونة التصنيف"
                  // max-h-[min(42vh,300px)] overflow-y-auto
                  className=" overscroll-contain rounded-xl border border-border/40 bg-background/50 p-1.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                >
                  {filteredIcons.length === 0 ? (
                    <p className="py-8 text-center text-[13px] text-muted-foreground">
                      لا توجد أيقونات تطابق «{iconSearch.trim()}». جرّب كلمة أخرى أو امسح البحث.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {filteredIcons.map(({ key, labelAr }) => {
                        const Icon = getCategoryIcon(key)
                        const selected = iconKey === key
                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setIconKey(key)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-all",
                              "hover:border-primary/40 hover:bg-primary/5",
                              selected
                                ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/25"
                                : "border-border/60 bg-background",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-9 items-center justify-center rounded-lg",
                                selected
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted/80 text-muted-foreground",
                              )}
                            >
                              <Icon className="size-[18px] shrink-0" aria-hidden />
                            </span>
                            <span
                              className={cn(
                                "line-clamp-2 text-[10px] font-medium leading-tight",
                                selected ? "text-primary" : "text-foreground/80",
                              )}
                            >
                              {labelAr}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.fieldset>
            </motion.div>

            <div className="pointer-events-none sticky bottom-0 z-1 -mt-3 h-3 bg-linear-to-t from-background to-transparent" />
          </div>

          <div className="shrink-0 border-t border-border/50 bg-linear-to-t from-muted/30 to-background px-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                className="min-w-28 rounded-xl shadow-sm gap-2"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    <span>{mode === "edit" ? "جار التعديل" : "جار الحفظ"}</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" aria-hidden />
                    <span>{mode === "edit" ? "حفظ التغييرات" : "إضافة التصنيف"}</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl text-muted-foreground"
                disabled={submitting}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
