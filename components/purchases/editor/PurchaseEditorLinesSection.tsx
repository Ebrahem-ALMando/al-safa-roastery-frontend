"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Info, Package, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  error,
  disabled,
}: LineAmountFieldProps) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        inputMode="decimal"
        value={value}
        disabled={disabled}
        placeholder="0.00"
        ref={inputRef}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn(
          "h-11 rounded-xl border-border/70 bg-muted/10 text-center font-semibold tabular-nums shadow-inner transition-colors focus-visible:bg-background",
          error && "border-destructive/60"
        )}
        dir="ltr"
      />
      {error ? <p className="text-[10px] text-destructive">{error}</p> : null}
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
  const lineRefs = React.useRef<Record<string, HTMLDivElement | null>>({})
  const inputRefs = React.useRef<Record<string, { quantity?: HTMLInputElement | null; price?: HTMLInputElement | null }>>({})

  const excludeIds = lines.map((l) => l.itemId)

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (disabled || pickerOpen) return
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName
      const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target?.isContentEditable

      if (isTyping) return

      event.preventDefault()
      setPickerOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, pickerOpen])

  function handleAddItem(row: ItemPickerRow) {
    const itemId = Number.parseInt(row.id, 10)
    const existing = lines.find((l) => l.itemId === itemId)
    if (existing) {
      toast.info(PURCHASE_MESSAGES.duplicateItem)
      const el = lineRefs.current[existing.key]
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      onChange(
        lines.map((l) =>
          l.key === existing.key ? { ...l, highlight: true } : { ...l, highlight: false }
        )
      )
      window.setTimeout(() => {
        onChange(lines.map((l) => ({ ...l, highlight: l.key === existing.key ? false : l.highlight })))
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
    onChange(lines.filter((l) => l.key !== key))
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

  return (
    <>
      <ItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddItem}
        onSelectMany={handleAddItems}
        excludeItemIds={excludeIds}
      />

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
              type="button"
              className="gap-2 rounded-xl"
              disabled={disabled}
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="size-4" />
              إضافة أصناف
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
              <TooltipContent side="bottom" align="start" dir="rtl" className="max-w-xs text-right leading-relaxed">
                <div className="space-y-2">
                  <p className="font-medium">اختصارات إدخال الأصناف</p>
                  <p className="flex items-center gap-2">
                    <Kbd>/</Kbd>
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
                      "rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-[box-shadow,border-color]",
                      line.highlight && "border-amber-400/70 bg-amber-50/60 ring-2 ring-amber-400/40 dark:bg-amber-950/25"
                    )}
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,1.8fr)] lg:items-center">
                      <div className="min-w-0 space-y-1 text-right">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold">{line.itemName}</p>
                          <ItemTypeBadge itemType={line.itemType} />
                        </div>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {line.itemCode ?? "—"}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(120px,0.8fr)_40px] sm:items-end">
                        <LineAmountField
                          label="الكمية (كغ)"
                          value={line.quantityKg}
                          disabled={disabled}
                          error={qtyError}
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
                          inputRef={(el) => {
                            inputRefs.current[line.key] = {
                              ...inputRefs.current[line.key],
                              price: el,
                            }
                          }}
                          onKeyDown={(event) => handleAmountEnter(event, index, "price")}
                          onChange={(value) => updateLine(line.key, { unitPrice: value })}
                        />
                        <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-2.5 text-center">
                          <p className="text-xs font-medium text-muted-foreground">الإجمالي</p>
                          <p className="mt-1 truncate text-base font-black tabular-nums text-primary" dir="ltr">
                            {formatUsd(lineTotal)}
                          </p>
                        </div>
                        <div className="flex h-11 items-center justify-center sm:mb-0.5">
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
