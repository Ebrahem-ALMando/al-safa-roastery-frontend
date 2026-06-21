"use client"

import * as React from "react"
import { Search, X, Check, Smile, Heart, Activity, Thermometer, ShieldAlert, FlaskConical, Droplets, Microscope, Stethoscope, Dna, Brain, Eye, Baby, Syringe, Pill, Bone, Waves } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/components/categories/category-icons"

interface IconPickerProps {
  value: string | null | undefined
  onChange: (key: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredIcons = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return CATEGORY_ICON_OPTIONS
    return CATEGORY_ICON_OPTIONS.filter(
      (opt) => opt.labelAr.includes(q) || opt.key.toLowerCase().includes(q)
    )
  }, [search])

  const SelectedIcon = getCategoryIcon(value || "default")

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="group relative flex h-16 w-full items-center justify-between overflow-hidden rounded-2xl border-2 px-4 transition-all hover:border-primary/40 hover:bg-primary/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <SelectedIcon className="size-5" />
          </div>
          <div className="flex flex-col items-start gap-0.5 text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">أيقونة الفحص</span>
            <span className="text-base font-semibold">
              {CATEGORY_ICON_OPTIONS.find(o => o.key === value)?.labelAr || "اختر أيقونة"}
            </span>
          </div>
        </div>
        <div className="text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">تغيير</div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-2xl flex-col gap-0 overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl sm:w-full" dir="rtl">
          <div className="relative z-10 shrink-0 border-b border-border/40 bg-background/95 px-6 pb-6 pt-8 backdrop-blur-md">
            <DialogHeader className="flex flex-row items-start justify-between gap-6 space-y-0 text-right">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <SelectedIcon className="size-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <DialogTitle className="text-xl font-bold text-right">اختر أيقونة طبية</DialogTitle>
                  <DialogDescription className="text-right">تظهر هذه الأيقونة بجانب اسم الفحص في التقارير والنتائج</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 relative">
              <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عن أيقونة... (مثال: قلب، دم، كيمياء)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-2xl border-2 border-border/60 bg-muted/30 pr-11 text-base focus-visible:border-primary/50 focus-visible:bg-background"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/5 p-6">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filteredIcons.map((opt) => {
                const Icon = getCategoryIcon(opt.key)
                const isSelected = value === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      onChange(opt.key)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all hover:scale-105",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
                        : "border-border/40 bg-background hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn("size-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-[10px] font-bold text-center", isSelected ? "text-primary" : "text-muted-foreground")}>
                      {opt.labelAr}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="size-3 text-primary" strokeWidth={4} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
