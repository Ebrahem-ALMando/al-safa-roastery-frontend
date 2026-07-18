"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutGrid, Search, Truck, UserPlus, X } from "lucide-react"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { Supplier } from "@/features/suppliers/types/supplier.types"
import { useSupplierActions } from "@/features/suppliers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatUsd } from "@/features/purchases"
import type { PurchaseEditorSupplier } from "@/features/purchases/types/purchase-editor.types"
import type { SupplierPickerRow } from "@/features/purchases/hooks/useSupplierPickerList"
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog"
import { SupplierSelectionDialog } from "./SupplierSelectionDialog"

type PurchaseEditorSupplierSectionProps = {
  value: PurchaseEditorSupplier | null
  onChange: (value: PurchaseEditorSupplier | null) => void
  error?: string
  disabled?: boolean
}

function mapPickerToEditor(supplier: SupplierPickerRow): PurchaseEditorSupplier {
  return {
    id: Number.parseInt(supplier.id, 10),
    name: supplier.name,
    code: supplier.code === "—" ? null : supplier.code,
    phone: supplier.phone === "—" ? null : supplier.phone,
    current_balance: supplier.currentBalance,
  }
}

function mapApiToEditor(s: Supplier): PurchaseEditorSupplier {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    phone: s.phone,
    current_balance: s.current_balance ?? null,
  }
}

export function PurchaseEditorSupplierSection({
  value,
  onChange,
  error,
  disabled = false,
}: PurchaseEditorSupplierSectionProps) {
  const [search, setSearch] = React.useState("")
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [supplierFormOpen, setSupplierFormOpen] = React.useState(false)
  const [supplierFormPrefill, setSupplierFormPrefill] = React.useState("")
  const boxRef = React.useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebouncedValue(search, 350)
  const { createSupplier } = useSupplierActions()

  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = React.useMemo(() => {
    const q: Record<string, string | number> = { page: 1, per_page: 100, is_active: 1 }
    const s = debouncedSearch.trim()
    if (s) q.search = s
    return q
  }, [debouncedSearch])

  const swrKey = authReady && showDropdown && debouncedSearch.trim() !== ""
    ? `suppliers-inline:${JSON.stringify(queryParams)}`
    : null

  const { data, isLoading } = useApiQuery<Supplier[]>(swrKey, "suppliers", { queryParams })
  const rows = React.useMemo(() => (data ?? []).map(mapApiToEditor), [data])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  function openAddSupplier(prefill = search) {
    setSupplierFormPrefill(prefill.trim())
    setShowDropdown(false)
    setDialogOpen(false)
    window.setTimeout(() => setSupplierFormOpen(true), 0)
  }

  async function handleCreateSupplier(payload: Parameters<typeof createSupplier>[0]) {
    const created = await createSupplier(payload)
    onChange(mapApiToEditor(created))
    setSearch("")
    return created
  }

  return (
    <>
      <SupplierSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={(s) => onChange(mapPickerToEditor(s))}
        onRequestAddSupplier={openAddSupplier}
      />

      <SupplierFormDialog
        open={supplierFormOpen}
        onOpenChange={setSupplierFormOpen}
        mode="create"
        initialName={supplierFormPrefill}
        onCreate={handleCreateSupplier}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="size-5 text-primary" />
            المورد <span className="text-destructive">*</span>
          </CardTitle>
          <CardDescription>ابحث بالاسم أو الكود أو اختر من البطاقات</CardDescription>
        </CardHeader>
        <CardContent>
          {value ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group flex items-center gap-3 rounded-2xl border border-primary/25 bg-linear-to-l from-primary/8 via-primary/4 to-transparent p-4 shadow-sm"
              dir="rtl"
              tabIndex={-1}
              data-purchase-field="supplier_id"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-base font-semibold leading-tight">{value.name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground tabular-nums" dir="ltr">
                  {value.code ?? "—"}
                  {value.phone ? <span className="text-muted-foreground/80"> · {value.phone}</span> : null}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                  الرصيد: {formatUsd(value.current_balance)}
                </p>
              </div>
              {!disabled ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={() => onChange(null)}
                  className="shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="إلغاء اختيار المورد"
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </motion.div>
          ) : (
            <div ref={boxRef} className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو الكود..."
                  value={search}
                  disabled={disabled}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  data-purchase-field="supplier_id"
                  className={cn(
                    "h-12 rounded-xl border-border/70 pe-10 ps-3 shadow-sm",
                    error && "border-destructive/60"
                  )}
                  aria-autocomplete="list"
                  aria-expanded={showDropdown}
                />
                <AnimatePresence>
                  {showDropdown && search.trim() !== "" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute end-0 start-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg"
                      role="listbox"
                    >
                      <ScrollArea className="h-60">
                        <div className="p-1.5">
                          {isLoading ? (
                            <div className="space-y-2 p-2">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-xl" />
                              ))}
                            </div>
                          ) : rows.length > 0 ? (
                            rows.map((supplier) => (
                              <button
                                key={supplier.id}
                                type="button"
                                role="option"
                                aria-selected={false}
                                onClick={() => {
                                  onChange(supplier)
                                  setSearch("")
                                  setShowDropdown(false)
                                }}
                                className="flex w-full items-center gap-3 rounded-xl p-3 text-right transition-colors hover:bg-muted/80"
                                dir="rtl"
                              >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <Truck className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">{supplier.name}</p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                                    {supplier.code ?? "—"}
                                    {supplier.phone ? ` · ${supplier.phone}` : ""}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="space-y-3 p-4 text-center">
                              <p className="text-sm text-muted-foreground">لا يوجد مورد يطابق البحث</p>
                              <Button
                                type="button"
                                className="w-full gap-2 rounded-xl"
                                disabled={disabled}
                                onClick={() => openAddSupplier(search)}
                              >
                                <UserPlus className="size-4" />
                                إضافة مورد
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  disabled={disabled}
                  onClick={() => openAddSupplier(search)}
                >
                  <UserPlus className="size-4" />
                  إضافة مورد
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  disabled={disabled}
                  onClick={() => setDialogOpen(true)}
                >
                  <LayoutGrid className="size-4" />
                  عرض البطاقات
                </Button>
              </div>
            </div>
          )}
          {error ? (
            <p className="mt-2 text-[11px] font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
