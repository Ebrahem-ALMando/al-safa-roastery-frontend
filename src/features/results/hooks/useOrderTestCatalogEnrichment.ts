"use client"

import { useMemo } from "react"
import useSWR from "swr"
import type { LabOrder } from "@/features/orders/types/order.types"
import { apiExecutor, type LaravelSuccessResponse } from "@/lib/api"
import type { Test } from "@/features/tests/types/test.types"
import { enrichLabOrderWithTestCatalogs } from "../lib/enrich-order-test-catalog"
import { getOrderTestIdsNeedingCatalogEnrichment } from "../lib/order-test-metadata"

async function fetchTestCatalogs(testIds: number[]): Promise<Map<number, Test>> {
  const map = new Map<number, Test>()

  await Promise.all(
    testIds.map(async (id) => {
      const response = await apiExecutor<LaravelSuccessResponse<Test>>(`tests/${id}`, "GET")
      if (response?.data) {
        map.set(id, response.data)
      }
    })
  )

  return map
}

/**
 * Uses template metadata from the lab order payload when complete.
 * Fetches GET /tests/{id} only for distinct test_ids still missing section/template fields.
 */
export function useOrderTestCatalogEnrichment(order: LabOrder | null) {
  const testIdsNeedingEnrichment = useMemo(() => {
    if (!order) return []
    return getOrderTestIdsNeedingCatalogEnrichment(order)
  }, [order])

  const swrKey =
    testIdsNeedingEnrichment.length > 0
      ? `order-test-catalogs:${testIdsNeedingEnrichment.join(",")}`
      : null

  const { data: catalogs, isLoading: catalogsLoading } = useSWR(swrKey, () =>
    fetchTestCatalogs(testIdsNeedingEnrichment)
  )

  const enrichedOrder = useMemo(() => {
    if (!order) return null
    if (testIdsNeedingEnrichment.length === 0) return order
    if (!catalogs || catalogs.size === 0) return order
    return enrichLabOrderWithTestCatalogs(order, catalogs)
  }, [order, catalogs, testIdsNeedingEnrichment])

  return {
    order: enrichedOrder,
    catalogsLoading: Boolean(catalogsLoading && swrKey),
  }
}
