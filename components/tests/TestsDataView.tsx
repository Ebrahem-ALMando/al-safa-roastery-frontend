"use client"

import type { ReactNode } from "react"
import type { Test, TestsListMeta, TestsTreeInnerView, TestsViewMode } from "@/features/tests"
import { TestsTableView } from "./TestsTableView"
import { TestsCardsView } from "./TestsCardsView"
import { TestsTreeView } from "./TestsTreeView"

interface TestsDataViewProps {
  viewMode: TestsViewMode
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
  onAddTestInCategory: (categoryId: string) => void
  onViewDetails: (test: Test) => void
  onEdit: (test: Test) => void
  onDelete: (test: Test) => void
  treeInnerView: TestsTreeInnerView
  onTreeInnerViewChange: (v: TestsTreeInnerView) => void
  treeHeaderActions?: ReactNode
}

export function TestsDataView(props: TestsDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <TestsCardsView
        tests={props.tests}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onAddTest={props.onAddTest}
        onViewDetails={props.onViewDetails}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        meta={props.meta}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
      />
    )
  }

  if (props.viewMode === "tree") {
    return (
      <TestsTreeView
        tests={props.tests}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onAddTest={props.onAddTest}
        onAddTestInCategory={props.onAddTestInCategory}
        onViewDetails={props.onViewDetails}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        meta={props.meta}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
        treeInnerView={props.treeInnerView}
        onTreeInnerViewChange={props.onTreeInnerViewChange}
        headerActions={props.treeHeaderActions}
      />
    )
  }

  return (
    <TestsTableView
      tests={props.tests}
      meta={props.meta}
      isLoading={props.isLoading}
      isFilteredNoHits={props.isFilteredNoHits}
      isTrueEmpty={props.isTrueEmpty}
      currentPage={props.currentPage}
      lastPage={props.lastPage}
      canPrev={props.canPrev}
      canNext={props.canNext}
      onPageChange={props.onPageChange}
      onAddTest={props.onAddTest}
      onViewDetails={props.onViewDetails}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
    />
  )
}
