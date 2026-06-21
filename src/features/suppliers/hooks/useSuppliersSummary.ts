"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildReportDateQueryParams } from "../lib/suppliers.api"
import { findReportCardValue } from "../lib/suppliers.helpers"
import { useActiveSuppliersCount } from "./useSuppliers"
import type { ReportPayload, SuppliersSummaryData } from "../types/supplier.types"

export function useSuppliersSummary(dateRange: ResolvedOperationalDateRange | null) {
  const { count: activeCount, isLoading: activeLoading } = useActiveSuppliersCount()

  const purchasesParams = useMemo(
    () => buildReportDateQueryParams(dateRange),
    [dateRange]
  )
  const purchasesKey = useMemo(
    () => `suppliers-summary:purchases:${JSON.stringify(purchasesParams)}`,
    [purchasesParams]
  )

  const {
    data: purchasesReport,
    isLoading: purchasesLoading,
    error: purchasesError,
    mutate: mutatePurchases,
  } = useApiQuery<ReportPayload>(purchasesKey, "reports/purchases", {
    queryParams: purchasesParams,
  })

  const balancesKey = "suppliers-summary:balances"
  const {
    data: balancesReport,
    isLoading: balancesLoading,
    error: balancesError,
    mutate: mutateBalances,
  } = useApiQuery<ReportPayload>(balancesKey, "reports/balances")

  const summary = useMemo<SuppliersSummaryData>(() => {
    const purchasesTotal = findReportCardValue(purchasesReport?.cards, "total_purchases")
    const payableTotal = findReportCardValue(balancesReport?.cards, "total_supplier_payables")
    const creditTotal = findReportCardValue(balancesReport?.cards, "supplier_credit_total")

    return {
      activeSuppliersCount: activeCount,
      purchasesTotalInPeriod:
        purchasesTotal != null ? String(purchasesTotal) : null,
      suppliersPayableTotal: payableTotal != null ? String(payableTotal) : null,
      supplierCreditTotal: creditTotal != null ? String(creditTotal) : null,
    }
  }, [activeCount, purchasesReport, balancesReport])

  const isLoading = activeLoading || purchasesLoading || balancesLoading
  const error = purchasesError ?? balancesError

  const mutate = () => Promise.all([mutatePurchases(), mutateBalances()])

  return { summary, isLoading, error: error as Error | undefined, mutate }
}
