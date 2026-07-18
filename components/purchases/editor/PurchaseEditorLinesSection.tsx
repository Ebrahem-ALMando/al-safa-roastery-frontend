"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Info, Package, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ItemTypeBadge } from "@/components/items/item-type-badge"
import {
  calculateLineTotal,
  createEditorLineFromItem,
  formatUsd,
  PURCHASE_MESSAGES,
} from "@/features/purchases"
import type { PurchaseEditorLine } from "@/features/purchases/types/purchase-editor.types"
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import type { Item } from "@/features/items/types/item.types"
import { ItemPickerDialog } from "./ItemPickerDialog"

type PurchaseEditorLinesSectionProps = {
  lines: PurchaseEditorLine[]
  onChange: (lines: PurchaseEditorLine[]) => void
  fieldErrors: Record<string, string | undefined>
  disabled?: boolean
}

type LineAmountFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef?: React.Ref<HTMLInputElement>
  dataField: string
  error?: string
  disabled?: boolean
}

function pickerRowToItem(row: ItemPickerRow): Item {
  return {
    id: Number.parseInt(row.id, 10),
    name: row.name,
    code: row.code === "—" ? null : row.code,
    item_type: row.itemType,
    unit: null,
    current_quantity_kg: row.currentQuantityKg,
    average_cost: row.averageCost,
    last_purchase_price: row.lastPurchasePrice,
    minimum_quantity_kg: null,
    auto_create_default_product: false,
    is_active: true,
    notes: null,
    last_activity: null,
    created_at: null,
    updated_at: null,
  }
}

function parseAmount(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const parsed = Number.parseFloat(String(value).replaceAll(",", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function LineAmountField({
  label,
  value,
  onChange,
  onKeyDown,
  inputRef,
  dataField,
  error,
  disabled,
}: LineAmountFieldProps) {
  return (
    <label className="grid h-full min-w-0 grid-rows-[1rem_2.75rem_minmax(2.5rem,auto)] gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        inputMode="decimal"
        value={value}
        disabled={disabled}
        placeholder="0.00"
        ref={inputRef}
        data-purchase-field={dataField}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn(
          "h-11 rounded-xl border-border/70 bg-muted/10 text-center font-semibold tabular-nums shadow-inner transition-colors focus-visible:bg-background",
          error && "border-destructive/60"
        )}
        dir="ltr"
      />
      <p className="min-h-10 whitespace-normal break-words text-right text-[10px] leading-4 text-destructive" aria-live="polite">
        {error ?? ""}
      </p>
    </label>
  )
}

export function PurchaseEditorLinesSection({
  lines,
  onChange,
  fieldErrors,
  disabled = false,
}: PurchaseEditorLinesSectionProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = React.useState(false)
  const [selectedLineKey, setSelectedLineKey] = React.useState<string | null>(null)
  const [duplicateHighlightKey, setDuplicateHighlightKey] = React.useState<string | null>(null)
  const lineRefs = React.useRef<Record<string, HTMLDivElement | null>>({})
  const inputRefs = React.useRef<Record<string, { quantity?: HTMLInputElement | null; price?: HTMLInputElement | null }>>({})
  const addItemsButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const duplicateHighlightTimerRef = React.useRef<number | null>(null)

  const excludeIds = lines.map((l) => l.itemId)

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (disabled || pickerOpen) return
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.code !== "KeyN") return
      if (document.querySelector('[data-slot="dialog-content"][data-state="open"], [data-slot="alert-dialog-content"][data-state="open"]')) return

      event.preventDefault()
      event.stopPropagation()
      setPickerOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, pickerOpen])

  React.useEffect(() => () => {
    if (duplicateHighlightTimerRef.current !== null) {
      window.clearTimeout(duplicateHighlightTimerRef.current)
    }
  }, [])

  function handleAddItem(row: ItemPickerRow) {
    const itemId = Number.parseInt(row.id, 10)
    const existing = lines.find((l) => l.itemId === itemId)
    if (existing) {
      toast.info(PURCHASE_MESSAGES.duplicateItem)
      const el = lineRefs.current[existing.key]
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      setSelectedLineKey(existing.key)
      setDuplicateHighlightKey(existing.key)
      if (duplicateHighlightTimerRef.current !== null) {
        window.clearTimeout(duplicateHighlightTimerRef.current)
      }
      duplicateHighlightTimerRef.current = window.setTimeout(() => {
        setDuplicateHighlightKey(null)
        duplicateHighlightTimerRef.current = null
      }, 1500)
      return
    }
    const nextLine = createEditorLineFromItem(pickerRowToItem(row))
    onChange([...lines, nextLine])
    queueFocusLineInput(nextLine.key, "quantity")
  }

  function handleAddItems(rows: ItemPickerRow[]) {
    const existingIds = new Set(lines.map((l) => l.itemId))
    const nextLines = [...lines]
    let skipped = 0

    const addedLines: PurchaseEditorLine[] = []

    rows.forEach((row) => {
      const itemId = Number.parseInt(row.id, 10)
      if (existingIds.has(itemId)) {
        skipped += 1
        return
      }
      existingIds.add(itemId)
      const nextLine = createEditorLineFromItem(pickerRowToItem(row))
      nextLines.push(nextLine)
      addedLines.push(nextLine)
    })

    if (skipped > 0) {
      toast.info(PURCHASE_MESSAGES.duplicateItem)
    }
    if (nextLines.length !== lines.length) {
      onChange(nextLines)
      queueFocusLineInput(addedLines[0]?.key, "quantity")
    }
  }

  function updateLine(key: string, patch: Partial<PurchaseEditorLine>) {
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  function removeLine(key: string) {
    const index = lines.findIndex((line) => line.key === key)
    if (index < 0) return
    const nextLines = lines.filter((line) => line.key !== key)
    const nextTarget = nextLines[index] ?? nextLines[index - 1]
    onChange(nextLines)
    setSelectedLineKey(nextTarget?.key ?? null)
    window.setTimeout(() => {
      if (nextTarget) {
        focusLineInput(nextTarget.key, "quantity")
      } else {
        addItemsButtonRef.current?.focus()
      }
    }, 0)
  }

  function clearAllLines() {
    onChange([])
    setSelectedLineKey(null)
    setDuplicateHighlightKey(null)
    setDeleteAllOpen(false)
    window.setTimeout(() => addItemsButtonRef.current?.focus(), 80)
  }

  function focusLineInput(lineKey: string | undefined, field: "quantity" | "price") {
    if (!lineKey) return
    window.requestAnimationFrame(() => {
      inputRefs.current[lineKey]?.[field]?.focus()
      inputRefs.current[lineKey]?.[field]?.select()
    })
  }

  function queueFocusLineInput(lineKey: string | undefined, field: "quantity" | "price") {
    window.setTimeout(() => focusLineInput(lineKey, field), 0)
  }

  function handleAmountEnter(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: "quantity" | "price"
  ) {
    if (event.key !== "Enter") return
    event.preventDefault()

    if (field === "quantity") {
      focusLineInput(lines[index]?.key, "price")
      return
    }
    focusLineInput(lines[index + 1]?.key, "quantity")
  }

  function handleLineKeyDown(event: React.KeyboardEvent<HTMLDivElement>, index: number, lineKey: string) {
    if (disabled) return
    const altDelete = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.code === "Delete"
    if (altDelete) {
      if (document.querySelector('[data-slot="dialog-content"][data-state="open"], [data-slot="alert-dialog-content"][data-state="open"]')) return
      event.preventDefault()
      event.stopPropagation()
      removeLine(lineKey)
      return
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      const targetIndex = event.key === "ArrowUp" ? index - 1 : index + 1
      const targetLine = lines[targetIndex]
      if (targetLine) {
        setSelectedLineKey(targetLine.key)
        focusLineInput(targetLine.key, "quantity")
      }
      return
    }

    const target = event.target as HTMLElement
    const lineContainerFocused = target === event.currentTarget
    const shiftedDelete = event.shiftKey && event.key === "Delete"
    if (event.key === "Delete" && (lineContainerFocused || shiftedDelete)) {
      event.preventDefault()
      removeLine(lineKey)
    }
  }

  return (
    <>
      <ItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddItem}
        onSelectMany={handleAddItems}
        excludeItemIds={excludeIds}
        searchMode="local"
        clearSearchAfterEnterSelection
      />

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent dir="rtl" lang="ar" className="gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-md">
          <AlertDialogHeader className="border-b bg-linear-to-b from-rose-50/80 to-background px-6 py-5 text-right sm:text-right dark:from-rose-950/20">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20"><Trash2 className="size-5" /></span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <AlertDialogTitle>حذف جميع أصناف الفاتورة؟</AlertDialogTitle>
                <AlertDialogDescription className="text-right leading-6">
                  سيتم حذف جميع أصناف الفاتورة الحالية. لا يمكن التراجع عن هذا الإجراء إلا بإضافة الأصناف مرة أخرى.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse justify-start border-t bg-muted/20 px-6 py-4 sm:justify-start">
            <AlertDialogAction onClick={clearAllLines} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف الكل</AlertDialogAction>
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="size-5 text-primary" />
              أصناف الفاتورة
            </CardTitle>
            <CardDescription>
              أضف الأصناف دفعة واحدة، ثم أدخل الكمية وسعر الكيلو لكل صنف.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              ref={addItemsButtonRef}
              type="button"
              className="gap-2 rounded-xl"
              disabled={disabled}
              onClick={() => setPickerOpen(true)}
              data-purchase-field="lines"
            >
              <Plus className="size-4" />
              إضافة أصناف
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              disabled={disabled || lines.length === 0}
              onClick={() => setDeleteAllOpen(true)}
            >
              <Trash2 className="size-4" />
              حذف الكل
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                  aria-label="اختصارات إدخال الأصناف"
                >
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" dir="rtl" className="max-w-sm text-right leading-relaxed">
                <div className="space-y-2">
                  <p className="font-medium">اختصارات إدخال الأصناف</p>
                  <p className="flex items-center gap-2">
                    <Kbd>Alt+N</Kbd>
                    فتح اختيار الأصناف.
                  </p>
                  <p className="flex items-center gap-2">
                    <Kbd>Enter</Kbd>
                    من الكمية إلى سعر الكيلو.
                  </p>
                  <p className="flex items-center gap-2">
                    <Kbd>Enter</Kbd>
                    من السعر إلى كمية الصنف التالي.
                  </p>
                  <p className="flex items-center gap-2">
                    <Kbd>Alt+Delete</Kbd>
                    حذف السطر الحالي.
                  </p>
                  <p className="flex items-center gap-2">
                    <Kbd>Alt+Enter</Kbd>
                    اعتماد الفاتورة.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          {fieldErrors.lines ? (
            <p className="mb-3 text-[11px] font-medium text-destructive" role="alert">
              {fieldErrors.lines}
            </p>
          ) : null}

          {lines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center">
              <p className="font-semibold">لم تتم إضافة أصناف إلى الفاتورة بعد.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ابدأ باختيار صنف أو أكثر لإضافته إلى الفاتورة.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => {
                const lineTotal = calculateLineTotal(line.quantityKg, line.unitPrice)
                const qtyError = fieldErrors[`lines.${index}.quantity_kg`]
                const priceError = fieldErrors[`lines.${index}.unit_price`]
                const price = parseAmount(line.unitPrice)
                const referenceCost = parseAmount(line.referenceCost)
                const priceDiffRatio =
                  price > 0 && referenceCost > 0 ? Math.abs(price - referenceCost) / referenceCost : 0
                const showPriceWarning = priceDiffRatio >= 0.15
                return (
                  <motion.div
                    key={line.key}
                    ref={(el) => {
                      lineRefs.current[line.key] = el
                    }}
                    layout
                    className={cn(
                      "rounded-2xl border border-border/60 bg-background p-4 shadow-sm outline-none transition-[box-shadow,border-color,background-color] focus-visible:ring-2 focus-visible:ring-primary/30",
                      selectedLineKey === line.key && "border-primary/55 bg-primary/[0.025] shadow-md ring-2 ring-primary/10",
                      (line.highlight || duplicateHighlightKey === line.key) && "border-amber-400/70 bg-amber-50/60 ring-2 ring-amber-400/40 dark:bg-amber-950/25"
                    )}
                    tabIndex={0}
                    role="group"
                    data-purchase-line-index={index}
                    onFocusCapture={() => setSelectedLineKey(line.key)}
                    onKeyDown={(event) => handleLineKeyDown(event, index, line.key)}
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,1.8fr)] lg:items-center">
                      <div className="min-w-0 space-y-1 text-right">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-xs font-bold tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>
                          <p className="truncate font-semibold">{line.itemName}</p>
                          <ItemTypeBadge itemType={line.itemType} />
                        </div>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {line.itemCode ?? "—"}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(120px,0.8fr)_40px] sm:items-stretch">
                        <LineAmountField
                          label="الكمية (كغ)"
                          value={line.quantityKg}
                          disabled={disabled}
                          error={qtyError}
                          dataField={`lines.${index}.quantity_kg`}
                          inputRef={(el) => {
                            inputRefs.current[line.key] = {
                              ...inputRefs.current[line.key],
                              quantity: el,
                            }
                          }}
                          onKeyDown={(event) => handleAmountEnter(event, index, "quantity")}
                          onChange={(value) => updateLine(line.key, { quantityKg: value })}
                        />
                        <LineAmountField
                          label="سعر الكيلو"
                          value={line.unitPrice}
                          disabled={disabled}
                          error={priceError}
                          dataField={`lines.${index}.unit_price`}
                          inputRef={(el) => {
                            inputRefs.current[line.key] = {
                              ...inputRefs.current[line.key],
                              price: el,
                            }
                          }}
                          onKeyDown={(event) => handleAmountEnter(event, index, "price")}
                          onChange={(value) => updateLine(line.key, { unitPrice: value })}
                        />
                        <div className="grid h-full min-w-0 grid-rows-[1rem_2.75rem_minmax(2.5rem,auto)] gap-1.5">
                          <p className="text-xs font-medium text-muted-foreground">الإجمالي</p>
                          <div className="flex h-11 items-center justify-center rounded-xl border border-border/60 bg-muted/15 px-3 text-center">
                            <p className="truncate text-base font-black tabular-nums text-primary" dir="ltr">{formatUsd(lineTotal)}</p>
                          </div>
                          <span className="min-h-10" aria-hidden />
                        </div>
                        <div className="flex h-11 items-center justify-center sm:mt-[1.375rem]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={disabled}
                            onClick={() => removeLine(line.key)}
                            className="rounded-full text-destructive hover:bg-destructive/10"
                            aria-label="حذف الصنف"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {showPriceWarning ? (
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200 lg:col-span-2">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>
                            السعر بعيد عن التكلفة المرجعية {formatUsd(referenceCost)}.
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
