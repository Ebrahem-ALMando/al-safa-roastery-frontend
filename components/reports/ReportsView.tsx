"use client"

import { Download, FileSpreadsheet, FileText, Settings2 } from "lucide-react"
import { DashboardPageHeader, OperationalDateScopeControls } from "@/components/dashboard"
import { ReportsDataView } from "@/components/reports/ReportsDataView"
import { ReportsFilters } from "@/components/reports/ReportsFilters"
import { ReportsSummary } from "@/components/reports/ReportsSummary"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useReportsPage } from "@/features/reports"

export function ReportsView() {
  const {
    dateScopePreset,
    setDateScopePreset,
    search,
    setSearch,
    setPage,
    config,
    toggleShowKPI,
    toggleShowFilters,
    orders,
    meta,
    isLoading,
    error,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  } = useReportsPage()

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            التقارير
            /
            <p className="text-md text-muted-foreground">الطلبات المكتملة الجاهزة للمعاينة والطباعة</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <OperationalDateScopeControls preset={dateScopePreset} onPresetChange={setDateScopePreset} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings2 className="h-4 w-4" />
                تخصيص الصفحة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>خيارات العرض</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={config.showKPI}
                onCheckedChange={(checked) => toggleShowKPI(Boolean(checked))}
              >
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={config.showFilters}
                onCheckedChange={(checked) => toggleShowFilters(Boolean(checked))}
              >
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? <ReportsSummary orders={orders} meta={meta} isLoading={isLoading} /> : null}

      {config.showFilters ? (
        <ReportsFilters
          value={{ search }}
          onChange={(next) => setSearch(next.search)}
          isLoading={isLoading}
        />
      ) : null}

      {error && !isLoading ? (
        <p className="text-center text-sm text-muted-foreground" role="status">
          تعذر تحميل البيانات. حاول مرة أخرى.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm">
        <ReportsDataView
          orders={orders}
          meta={meta}
          isLoading={isLoading}
          isFilteredNoHits={isFilteredNoHits}
          isTrueEmpty={isTrueEmpty}
          currentPage={currentPage}
          lastPage={lastPage}
          canPrev={canPrev}
          canNext={canNext}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
