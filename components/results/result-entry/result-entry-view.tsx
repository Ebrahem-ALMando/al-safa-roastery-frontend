"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Inbox } from "lucide-react"
import { useResultEntry } from "@/features/results"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { ResultEntryHeader } from "./result-entry-header"
import { ResultEntryPatientStrip } from "./result-entry-patient-strip"
import { ResultEntryItemCard } from "./result-entry-item-card"

type ResultEntryViewProps = {
  orderId: number | null
}

export function ResultEntryView({ orderId }: ResultEntryViewProps) {
  const {
    order,
    isLoading,
    error,
    values,
    setCellValue,
    sortedItems,
    saveAll,
    saveDraft,
    saveItem,
    saving,
    savingDraft,
    savingItemId,
    disabled,
  } = useResultEntry(orderId)

  const handleSaveAll = async () => {
    try {
      await saveAll()
      toast.success("تم حفظ النتائج")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "تعذر حفظ النتائج"
      toast.error(msg)
    }
  }

  const handleSaveItem = async (item: Parameters<typeof saveItem>[0]) => {
    try {
      await saveItem(item)
      toast.success(`تم حفظ نتائج: ${item.test_name}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "تعذر الحفظ"
      toast.error(msg)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft()
      toast.success("تم حفظ المسودة")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "تعذر حفظ المسودة"
      toast.error(msg)
    }
  }

  if (orderId == null) {
    return (
      <div className="space-y-4 p-6 text-center" dir="rtl">
        <p className="font-semibold text-destructive">معرّف الطلب غير صالح</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12" dir="rtl" lang="ar">
      <ResultEntryHeader
        order={order}
        isLoading={isLoading}
        saving={saving}
        savingDraft={savingDraft}
        disabled={disabled}
        onSaveAll={handleSaveAll}
        onSaveDraft={handleSaveDraft}
      />

      <AnimatePresence>
        {error && !isLoading ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertCircle className="size-5 shrink-0" />
            تعذر تحميل بيانات الطلب.
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {disabled && order ? (
          <motion.div
            key="disabled"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100"
          >
            {order.status === "cancelled"
              ? "هذا الطلب ملغى — لا يمكن تعديل النتائج."
              : "هذا الطلب معتمد — تعديل النتائج غير متاح من هذه الشاشة."}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isLoading && !order ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : null}

      {order ? (
        <>
          <ResultEntryPatientStrip order={order} />

          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">لا توجد بنود فحص في هذا الطلب.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.35, ease: "easeOut" }}
                >
                  <ResultEntryItemCard
                    item={item}
                    patient={order.patient ?? null}
                    values={values}
                    onChange={setCellValue}
                    onSaveItem={handleSaveItem}
                    savingItemId={savingItemId}
                    disabled={disabled}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
