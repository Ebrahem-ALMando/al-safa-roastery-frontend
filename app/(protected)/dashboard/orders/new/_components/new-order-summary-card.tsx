"use client"

import { AnimatePresence, motion } from "framer-motion"
import { NotepadText, Receipt, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PatientPickerRow } from "@/features/patients"
import type { DoctorPickerRow } from "@/features/users"
import type { Test } from "@/features/tests"
import { PatientPickAvatar } from "./patient-pick-avatar"
import { testDisplayPrice } from "../_hooks/use-new-order-page"

const ORDER_NOTES_MAX = 2000

type NewOrderSummaryCardProps = {
  selectedPatient: PatientPickerRow | null
  selectedDoctor: DoctorPickerRow | null
  doctorName: string
  selectedTests: Test[]
  onRemoveTest: (testId: number) => void
  totalPrice: number
  orderNotes: string
  onOrderNotesChange: (value: string) => void
  submitLabel: string
  onSubmit: () => void
  isSubmitting: boolean
  canSubmit: boolean
  showLabelPrinting?: boolean
  labelCopies?: number
  isCustomLabelCopies?: boolean
  customLabelCopiesInput?: string
  customLabelCopiesError?: string | null
  onSelectPresetLabelCopies?: (count: number) => void
  onSelectCustomLabelCopies?: () => void
  onCustomLabelCopiesInputChange?: (value: string) => void
}

export function NewOrderSummaryCard({
  selectedPatient,
  selectedDoctor,
  doctorName,
  selectedTests,
  onRemoveTest,
  totalPrice,
  orderNotes,
  onOrderNotesChange,
  submitLabel,
  onSubmit,
  isSubmitting,
  canSubmit,
  showLabelPrinting = false,
  labelCopies = 1,
  isCustomLabelCopies = false,
  customLabelCopiesInput = "1",
  customLabelCopiesError = null,
  onSelectPresetLabelCopies,
  onSelectCustomLabelCopies,
  onCustomLabelCopiesInputChange,
}: NewOrderSummaryCardProps) {
  const notesLen = orderNotes.length
  const notesNearLimit = notesLen > ORDER_NOTES_MAX * 0.9
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="size-5 text-primary" />
          ملخص الطلب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPatient ? (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">المريض</Label>
            <div
              className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-linear-to-l from-primary/8 via-primary/4 to-transparent p-3 shadow-sm"
              dir="rtl"
            >
              <PatientPickAvatar name={selectedPatient.name} size="md" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">
                  {selectedPatient.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground tabular-nums sm:text-sm" dir="ltr">
                  {selectedPatient.phone}
                  {selectedPatient.patientNumber && selectedPatient.patientNumber !== "—" ? (
                    <span className="text-muted-foreground/80"> · {selectedPatient.patientNumber}</span>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-right text-sm text-muted-foreground">
            لم يتم اختيار مريض بعد
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">الطبيب المُحيل</Label>
          {selectedDoctor ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-right">
              <p className="text-sm font-semibold">{selectedDoctor.name}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                @{selectedDoctor.username}
              </p>
            </div>
          ) : doctorName.trim() !== "" ? (
            <div className="rounded-xl border border-amber-300/60 bg-amber-50/40 p-3 text-right dark:border-amber-700/40 dark:bg-amber-900/10">
              <p className="text-sm font-semibold">{doctorName.trim()}</p>
              <p className="text-xs text-muted-foreground">سيتم إنشاء حساب طبيب غير نشط تلقائيًا عند حفظ الطلب</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-right text-sm text-muted-foreground">
              لم يتم اختيار طبيب بعد
            </div>
          )}
        </div>

        <div className="text-right">
          <Label className="text-xs text-muted-foreground">الفحوصات المختارة ({selectedTests.length})</Label>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <AnimatePresence mode="popLayout">
              {selectedTests.map((test) => (
                <motion.div
                  key={test.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                >
                  <Badge variant="secondary" className="gap-1 rounded-lg py-1 ps-1.5 pe-1">
                    {test.code}
                    <button
                      type="button"
                      onClick={() => onRemoveTest(test.id)}
                      className="ms-0.5 inline-flex rounded-full p-0.5 hover:bg-muted"
                      aria-label={`إزالة ${test.code}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {selectedTests.length === 0 && <p className="text-sm text-muted-foreground">لم يتم اختيار فحوصات بعد</p>}
          </div>
        </div>

        {selectedTests.length > 0 && (
          <div className="space-y-2 border-t border-border/50 pt-4">
            {selectedTests.map((test) => (
              <div key={test.id} className="flex justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground">{test.name}</span>
                <span className="shrink-0 tabular-nums">
                  {testDisplayPrice(test) > 0 ? `${testDisplayPrice(test)} ر.س` : "—"}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border/50 pt-2 font-bold">
              <span>الإجمالي</span>
              <span className="text-primary tabular-nums">{totalPrice > 0 ? `${totalPrice} ر.س` : "—"}</span>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-border/50 bg-muted/15 p-3 shadow-inner">
          <div className="flex items-start justify-between gap-2">
            <Label htmlFor="order-notes" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <NotepadText className="size-4 shrink-0 text-primary" aria-hidden />
              ملاحظات الطلب
            </Label>
            <span
              className={`shrink-0 tabular-nums text-[11px] font-medium ${notesNearLimit ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
              aria-live="polite"
            >
              {notesLen}/{ORDER_NOTES_MAX}
            </span>
          </div>
          <p className="text-right text-[11px]  leading-relaxed text-muted-foreground">
            اختياري — تعليمات للمختبر، صيام، دواء، أو أي سياق يساعد على تنفيذ التحاليل بدقة.
          </p>
          <Textarea
            id="order-notes"
            value={orderNotes}
            onChange={(e) => onOrderNotesChange(e.target.value)}
            maxLength={ORDER_NOTES_MAX}
            placeholder="مثال: مريض صائم منذ 12 ساعة — طلب عاجل — تكرار بعد أسبوع…"
            rows={4}
            className="min-h-22 resize-y rounded-xl border-border/70 bg-background/80 text-right text-sm leading-relaxed shadow-sm transition-colors focus-visible:bg-background"
            dir="auto"
          />
        </div>

        {showLabelPrinting ? (
          <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/15 p-3">
            <div className="space-y-1 text-right">
              <Label className="text-sm font-semibold">طباعة لصاقات الطلب</Label>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                اختر عدد اللصاقات التي سيتم طباعتها بعد إنشاء الطلب.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">عدد اللصاقات</Label>
              <div className="flex  gap-2">
                {[1, 2, 3, 4, 5].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    size="sm"
                    variant={!isCustomLabelCopies && labelCopies === count ? "default" : "outline"}
                    className="min-w-10 rounded-lg tabular-nums"
                    onClick={() => onSelectPresetLabelCopies?.(count)}
                  >
                    {count}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={isCustomLabelCopies ? "default" : "outline"}
                  className="rounded-lg"
                  onClick={() => onSelectCustomLabelCopies?.()}
                >
                  مخصص
                </Button>
              </div>

              {isCustomLabelCopies ? (
                <div className="space-y-1">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={customLabelCopiesInput}
                    onChange={(e) => onCustomLabelCopiesInputChange?.(e.target.value)}
                    className="h-9 w-full tabular-nums"
                    dir="ltr"
                  />
                  {customLabelCopiesError ? (
                    <p className="text-xs text-destructive">{customLabelCopiesError}</p>
                  ) : null}
                </div>
              ) : null}

              <p className="text-xs text-muted-foreground">
                سيتم طباعة {labelCopies} لصاقة بعد إنشاء الطلب
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                بعد إنشاء الطلب سيتم فتح نافذة الطباعة. اترك Copies = 1 لأن النظام يولّد عدد
                اللصاقات المختار.
              </p>
            </div>
          </div>
        ) : null}

        <Button
          className="w-full rounded-xl"
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={() => onSubmit()}
        >
          {isSubmitting ? "جاري الحفظ…" : submitLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
