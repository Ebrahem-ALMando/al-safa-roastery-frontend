"use client"

import { motion } from "framer-motion"
import { Search, SlidersHorizontal, Sparkles, TestTubes, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { Test } from "@/features/tests"
import { cn } from "@/lib/utils"
import { testDisplayPrice } from "../_hooks/use-new-order-page"

type Group = {
  name: string
  items: { test: Test; score: number }[]
}

type NewOrderTestsSectionProps = {
  testQuery: string
  onTestQueryChange: (v: string) => void
  categoryFilter: number | null
  onCategoryFilterChange: (id: number | null) => void
  categoryOptions: { id: number; name: string }[]
  filteredTestGroups: Group[]
  totalFilteredTests: number
  strongMatchThreshold: number
  selectedTests: Test[]
  onToggleTest: (test: Test) => void
  testsLoading: boolean
}

export function NewOrderTestsSection({
  testQuery,
  onTestQueryChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  filteredTestGroups,
  totalFilteredTests,
  strongMatchThreshold,
  selectedTests,
  onToggleTest,
  testsLoading,
}: NewOrderTestsSectionProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTubes className="size-5 text-primary" />
              اختيار الفحوصات
            </CardTitle>
            <CardDescription>
              فلترة حسب التصنيف وبحث ذكي بالاسم العربي أو الرمز أو الاسم اللاتيني (مثل CBC)
            </CardDescription>
          </div>
          {testQuery.trim() !== "" && (
            <Badge variant="secondary" className="w-fit rounded-lg font-normal">
              {totalFilteredTests} نتيجة
            </Badge>
          )}
        </div>

        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث: مثلاً سكر، TSH، CBC، كوليسترول..."
              value={testQuery}
              onChange={(e) => onTestQueryChange(e.target.value)}
              className="h-11 rounded-xl pe-10 ps-10"
            />
            {testQuery.trim() !== "" && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute start-1.5 top-1/2 -translate-y-1/2 rounded-lg text-muted-foreground"
                onClick={() => onTestQueryChange("")}
                aria-label="مسح البحث"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="size-3.5" />
              التصنيف:
            </span>
            <Button
              type="button"
              size="sm"
              variant={categoryFilter === null ? "default" : "outline"}
              className="h-8 rounded-lg px-3 text-xs"
              onClick={() => onCategoryFilterChange(null)}
            >
              الكل
            </Button>
            {categoryOptions.map(({ id, name }) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={categoryFilter === id ? "default" : "outline"}
                className="h-8 rounded-lg px-3 text-xs"
                onClick={() => onCategoryFilterChange(categoryFilter === id ? null : id)}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {testsLoading && filteredTestGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
            جاري تحميل قائمة الفحوصات…
          </div>
        ) : filteredTestGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
            لا توجد فحوصات مطابقة. جرّب كلمات أخرى أو أزل فلتر التصنيف.
          </div>
        ) : (
          filteredTestGroups.map((group) => (
            <div key={group.name} className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                <span className="text-xs text-muted-foreground">{group.items.length} فحص</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map(({ test, score }) => {
                  const isSelected = selectedTests.some((t) => t.id === test.id)
                  const strong = score >= strongMatchThreshold && testQuery.trim() !== ""
                  const price = testDisplayPrice(test)
                  return (
                    <motion.div key={test.id} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
                      <label
                        className={cn(
                          "relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                          isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/40",
                          strong && !isSelected && "border-primary/30 bg-primary/[0.03]"
                        )}
                      >
                        <Checkbox checked={isSelected} onCheckedChange={() => onToggleTest(test)} />
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex flex-wrap items-center  gap-1.5">
                            <p className="text-sm font-medium text-right leading-snug">{test.name}</p>
                            {strong && (
                              <Badge
                                variant="outline"
                                className="h-5 gap-0.5 rounded-md border-primary/25 bg-primary/5 px-1.5 text-[10px] font-normal text-primary"
                              >
                                <Sparkles className="size-3" />
                                تطابق قوي
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                            {test.code}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">
                          {price > 0 ? `${price} ر.س` : "—"}
                        </span>
                      </label>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
