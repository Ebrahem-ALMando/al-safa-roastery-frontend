"use client"

import { TestTubes } from "lucide-react"
import { TestCard } from "@/components/cards/test-card"
import { Button } from "@/components/ui/button"
import type { Test, TestsListMeta } from "@/features/tests"
import { toTestCardData } from "./tests-helpers"

interface TestsCardsViewProps {
  tests: Test[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  onAddTest: () => void
  onViewDetails: (test: Test) => void
  onEdit: (test: Test) => void
  onDelete: (test: Test) => void
  meta?: TestsListMeta
  currentPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
}

export function TestsCardsView({
  tests,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  onAddTest,
  onViewDetails,
  onEdit,
  onDelete,
  meta,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
}: TestsCardsViewProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-sm text-muted-foreground">جارِ التحميل...</div>
  }

  if (isFilteredNoHits) {
    return <div className="p-6 text-center text-sm text-muted-foreground">لم يتم العثور على نتائج</div>
  }

  if (isTrueEmpty) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
          <TestTubes className="size-10 animate-pulse" strokeWidth={1.25} />
        </div>
        <p className="text-lg font-semibold">لا توجد فحوصات</p>
        <Button onClick={onAddTest} className="gap-2 rounded-xl">
          إضافة فحص
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 *:min-w-0">
        {tests.map((test, index) => (
          <TestCard
            key={test.id}
            test={toTestCardData(test)}
            index={index}
            onViewDetails={() => onViewDetails(test)}
            onEdit={() => onEdit(test)}
            onDelete={() => onDelete(test)}
          />
        ))}
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={!canPrev}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground" dir="ltr">
            صفحة {currentPage} من {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      ) : null}
    </div>
  )
}
