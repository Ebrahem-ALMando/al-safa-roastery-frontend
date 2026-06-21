"use client"

import { CheckCircle2, Eye, Pencil, Plus, Search, TestTubes, Trash2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Test, TestsListMeta } from "@/features/tests"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { allPriceLabels, fieldsCount, getTestIcon } from "./tests-helpers"

interface TestsTableViewProps {
  tests: Test[]
  meta?: TestsListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddTest: () => void
  onViewDetails: (test: Test) => void
  onEdit: (test: Test) => void
  onDelete: (test: Test) => void
  /**
   * عند العرض داخل «شجرة» — جدول فقط بلا ترويسة الصفحة/التصفح السفلي.
   */
  embedded?: boolean
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="text-center">
        <Skeleton className="mx-auto h-4 w-6" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="mx-auto h-6 w-12 rounded-full" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="mx-auto h-4 w-20" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="mx-auto h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="mx-auto h-8 w-24" />
      </TableCell>
    </TableRow>
  )
}

function PricesBadges({ prices, id }: { prices: Test["prices"]; id: number }) {
  const labels = allPriceLabels(prices)
  if (!labels.length) return <Badge variant="outline" className="text-[11px]">—</Badge>
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {labels.slice(0, 2).map((price) => (
        <Badge key={`${id}-${price}`} variant="secondary" className="text-[11px] font-mono" dir="ltr">
          {price}
        </Badge>
      ))}
      {labels.length > 2 ? <Badge variant="outline" className="text-[11px]">+{labels.length - 2}</Badge> : null}
    </div>
  )
}

export function TestsTableView({
  tests,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  lastPage,
  canPrev,
  canNext,
  onPageChange,
  onAddTest,
  onViewDetails,
  onEdit,
  onDelete,
  embedded = false,
}: TestsTableViewProps) {
  if (embedded) {
    if (!isLoading && tests.length === 0) return null
    return (
      <div className="p-0">
        {isLoading ? (
          <div className="w-full p-2">
            <Table className="w-full table-fixed" dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[4%] text-center font-semibold">#</TableHead>
                  <TableHead className="w-[24%] text-right font-semibold">الفحص</TableHead>
                  <TableHead className="w-[16%] text-right font-semibold">التصنيف</TableHead>
                  <TableHead className="w-[10%] text-center font-semibold">الحقول</TableHead>
                  <TableHead className="w-[14%] text-center font-semibold">السعر</TableHead>
                  <TableHead className="w-[12%] text-center font-semibold">الحالة</TableHead>
                  <TableHead className="w-[20%] text-center font-semibold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }, (_, u) => (
                  <TableRowSkeleton key={`sk-emb-${u}`} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <TooltipProvider delayDuration={200}>
            <div className="w-full">
              <Table className="w-full table-fixed" dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[4%] text-center font-semibold">#</TableHead>
                    <TableHead className="w-[24%] text-right font-semibold">الفحص</TableHead>
                    <TableHead className="w-[16%] text-right font-semibold">التصنيف</TableHead>
                    <TableHead className="w-[10%] text-center font-semibold">الحقول</TableHead>
                    <TableHead className="w-[14%] text-center font-semibold">السعر</TableHead>
                    <TableHead className="w-[12%] text-center font-semibold">الحالة</TableHead>
                    <TableHead className="w-[20%] text-center font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test: Test, index: number) => (
                    <TableRow
                      key={test.id}
                      className="cursor-pointer transition-all duration-200 hover:bg-muted/40"
                      onClick={() => onEdit(test)}
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-start gap-2.5">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {(() => {
                              const Icon = getTestIcon(test.icon_name)
                              return <Icon className="size-4" />
                            })()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-tight">{test.name}</p>
                            <p className="mt-1 truncate font-mono text-xs text-muted-foreground" dir="ltr">
                              {test.code}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="max-w-full truncate">
                          {test.category?.name ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="tabular-nums">
                          {fieldsCount(test.fields)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <PricesBadges prices={test.prices} id={test.id} />
                      </TableCell>
                      <TableCell className="text-center">
                        {test.is_active ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
                            <CheckCircle2 className="size-3.5" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                            <XCircle className="size-3.5" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg hover:text-primary"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onViewDetails(test)
                                }}
                              >
                                <Eye className="size-4" />
                                <span className="sr-only">عرض التفاصيل</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                              عرض التفاصيل
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg hover:text-primary"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onEdit(test)
                                }}
                              >
                                <Pencil className="size-4" />
                                <span className="sr-only">تعديل</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                              تعديل
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg text-destructive hover:text-destructive"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onDelete(test)
                                }}
                              >
                                <Trash2 className="size-4" />
                                <span className="sr-only">حذف</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                              حذف
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        )}
      </div>
    )
  }

  return (
    <div className="p-0">
      {isLoading ? (
        <div className="w-full">
          <Table className="w-full table-fixed" dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[4%] text-center font-semibold">#</TableHead>
                <TableHead className="w-[24%] text-right font-semibold">الفحص</TableHead>
                <TableHead className="w-[16%] text-right font-semibold">التصنيف</TableHead>
                <TableHead className="w-[10%] text-center font-semibold">الحقول</TableHead>
                <TableHead className="w-[14%] text-center font-semibold">السعر</TableHead>
                <TableHead className="w-[12%] text-center font-semibold">الحالة</TableHead>
                <TableHead className="w-[20%] text-center font-semibold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }, (_, u) => (
                <TableRowSkeleton key={`sk-${u}`} />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : isFilteredNoHits ? (
        <div className="min-h-[240px]">
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 border-0 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/30 text-muted-foreground">
              <Search className="size-6 opacity-60" />
            </div>
            <p className="font-medium">لم يتم العثور على نتائج</p>
            <p className="max-w-sm text-sm text-muted-foreground">جرّب تغيير البحث أو إعادة التصفية</p>
          </div>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
            <TestTubes className="size-10 animate-pulse" strokeWidth={1.25} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">لا توجد فحوصات بعد</p>
            <p className="text-sm text-muted-foreground">أضف فحصاً جديداً واربطه بالتصنيف المناسب</p>
          </div>
          <Button type="button" onClick={onAddTest} className="gap-2 rounded-xl">
            <Plus className="size-4" />
            إضافة فحص
          </Button>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="w-full">
            <Table className="w-full table-fixed" dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[4%] text-center font-semibold">#</TableHead>
                  <TableHead className="w-[24%] text-right font-semibold">الفحص</TableHead>
                  <TableHead className="w-[16%] text-right font-semibold">التصنيف</TableHead>
                  <TableHead className="w-[10%] text-center font-semibold">الحقول</TableHead>
                  <TableHead className="w-[14%] text-center font-semibold">السعر</TableHead>
                  <TableHead className="w-[12%] text-center font-semibold">الحالة</TableHead>
                  <TableHead className="w-[20%] text-center font-semibold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test: Test, index: number) => (
                  <TableRow
                    key={test.id}
                    className="cursor-pointer transition-all duration-200 hover:bg-muted/40"
                    onClick={() => onEdit(test)}
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-start gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {(() => {
                            const Icon = getTestIcon(test.icon_name)
                            return <Icon className="size-4" />
                          })()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold leading-tight">{test.name}</p>
                          <p className="mt-1 truncate font-mono text-xs text-muted-foreground" dir="ltr">
                            {test.code}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Badge variant="secondary" className="max-w-full truncate">
                        {test.category?.name ?? "—"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className="tabular-nums">
                        {fieldsCount(test.fields)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <PricesBadges prices={test.prices} id={test.id} />
                    </TableCell>

                    <TableCell className="text-center">
                      {test.is_active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
                          <CheckCircle2 className="size-3.5" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                          <XCircle className="size-3.5" />
                          غير نشط
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg hover:text-primary"
                              onClick={(event) => {
                                event.stopPropagation()
                                onViewDetails(test)
                              }}
                            >
                              <Eye className="size-4" />
                              <span className="sr-only">عرض التفاصيل</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                            عرض التفاصيل
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg hover:text-primary"
                              onClick={(event) => {
                                event.stopPropagation()
                                onEdit(test)
                              }}
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">تعديل</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                            تعديل
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg text-destructive hover:text-destructive"
                              onClick={(event) => {
                                event.stopPropagation()
                                onDelete(test)
                              }}
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">حذف</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                            حذف
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}

      {!isLoading && tests.length > 0 && meta != null && lastPage > 1 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <p className="text-center text-sm text-muted-foreground sm:text-start" dir="ltr">
            {meta.total} — صفحة {currentPage} من {lastPage}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!canPrev}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNext}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
