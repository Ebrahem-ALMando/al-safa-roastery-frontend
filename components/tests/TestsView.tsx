"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Plus, Settings2, TestTubes } from "lucide-react"
import { AddTestDialog } from "@/components/tests/add-test-dialog"
import { EditTestDialog } from "@/components/tests/edit-test-dialog"
import { TestDetailsDialog } from "@/components/tests/test-details-dialog"
import { TestsDataView } from "@/components/tests/TestsDataView"
import { TestsFilters } from "@/components/tests/TestsFilters"
import { TestsSummary } from "@/components/tests/TestsSummary"
import { TestsViewModeToggle } from "@/components/tests/tests-view-mode-toggle"
import { DashboardPageHeader, OperationalDateScopeControls } from "@/components/dashboard"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
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
import { useTestActions, useTestsExcelExport, useTestsPage, type Test } from "@/features/tests"

export function TestsView() {
  const {
    dateScopePreset,
    setDateScopePreset,
    dateRange,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    isActive,
    setIsActive,
    setPage,
    config,
    setViewMode,
    setTreeInnerView,
    toggleShowKPI,
    toggleShowFilters,
    tests,
    meta,
    isLoading,
    error,
    mutate,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  } = useTestsPage()

  const { exportExcel, isExporting } = useTestsExcelExport({
    search,
    categoryId,
    isActive,
    dateRange,
    dateScopePreset,
  })

  const { createTest, updateTest, deleteTest } = useTestActions()

  const [addOpen, setAddOpen] = useState(false)
  const [addTestDefaultCategoryId, setAddTestDefaultCategoryId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editTest, setEditTest] = useState<Test | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTestId, setDetailsTestId] = useState<number | null>(null)

  function openEdit(test: Test) {
    setEditTest(test)
    setEditOpen(true)
  }

  function openDelete(test: Test) {
    setDeleteTarget(test)
    setDeleteOpen(true)
  }

  function openDetails(test: Test) {
    setDetailsTestId(test.id)
    setDetailsOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteTest(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      void mutate()
    } catch {
      // toasts from useAction
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            الفحوصات
            /
            <p className="text-md text-muted-foreground">إدارة الفحوصات المخبرية</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <OperationalDateScopeControls preset={dateScopePreset} onPresetChange={setDateScopePreset} />
          <Button onClick={() => setAddOpen(true)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            إضافة فحص
          </Button>

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
              <DropdownMenuItem
                className="gap-2"
                disabled={isExporting}
                onSelect={(event) => {
                  event.preventDefault()
                  void exportExcel()
                }}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {isExporting ? "جارٍ التصدير..." : "Excel"}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <FileText className="h-4 w-4" />
                PDF
                <span className="mr-auto text-xs text-muted-foreground">قريباً</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <FileText className="h-4 w-4" />
                CSV
                <span className="mr-auto text-xs text-muted-foreground">قريباً</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TestsViewModeToggle value={config.viewMode} onChange={setViewMode} />
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? <TestsSummary tests={tests} meta={meta} isLoading={isLoading} /> : null}

      {config.showFilters ? (
        <TestsFilters
          value={{ search, categoryId, isActive }}
          onChange={(next) => {
            setSearch(next.search)
            setCategoryId(next.categoryId)
            setIsActive(next.isActive)
          }}
          isLoading={isLoading}
        />
      ) : null}

      {error && !isLoading ? (
        <p className="text-center text-sm text-muted-foreground" role="status">
          تعذر تحميل البيانات. حاول مرة أخرى.
        </p>
      ) : null}

      <div
        className={
          config.viewMode === "table" || config.viewMode === "tree"
            ? "overflow-hidden rounded-xl border border-border/60 shadow-sm"
            : "overflow-hidden"
        }
      >
        <TestsDataView
          viewMode={config.viewMode}
          tests={tests}
          meta={meta}
          isLoading={isLoading}
          isFilteredNoHits={isFilteredNoHits}
          isTrueEmpty={isTrueEmpty}
          currentPage={currentPage}
          lastPage={lastPage}
          canPrev={canPrev}
          canNext={canNext}
          onPageChange={setPage}
          onAddTest={() => {
            setAddTestDefaultCategoryId(null)
            setAddOpen(true)
          }}
          onAddTestInCategory={(categoryId) => {
            setAddTestDefaultCategoryId(categoryId)
            setAddOpen(true)
          }}
          onViewDetails={openDetails}
          onEdit={openEdit}
          onDelete={openDelete}
          treeInnerView={config.treeInnerView}
          onTreeInnerViewChange={setTreeInnerView}
        />
      </div>

      <AddTestDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setAddTestDefaultCategoryId(null)
        }}
        defaultCategoryId={addTestDefaultCategoryId}
        onCreate={createTest}
        onTestSaved={() => {
          void mutate()
        }}
      />
      <EditTestDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditTest(null)
        }}
        test={editTest}
        onUpdate={updateTest}
        onTestUpdated={() => {
          void mutate()
        }}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (deleteLoading) return
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        title="حذف الفحص"
        description={
          deleteTarget ? (
            <>
              سيتم حذف «{deleteTarget.name}» نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </>
          ) : null
        }
        confirmLabel="حذف"
        isLoading={deleteLoading}
        loadingLabel="جارٍ الحذف..."
        icon={TestTubes}
        onConfirm={() => {
          void handleDeleteConfirm()
        }}
      />
      <TestDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) setDetailsTestId(null)
        }}
        testId={detailsTestId}
      />
    </div>
  )
}
