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

function collectTestIdsNeedingEnrichment(orders: LabOrder[]): number[] {
  const ids = new Set<number>()
  for (const order of orders) {
    for (const id of getOrderTestIdsNeedingCatalogEnrichment(order)) {
      ids.add(id)
    }
  }
  return [...ids].sort((a, b) => a - b)
}

/**
 * Enriches many lab orders (e.g. patient history) with template section metadata.
 * One batched SWR fetch per distinct test_id that still lacks section fields.
 */
export function useOrdersTestCatalogEnrichment(orders: LabOrder[]) {
  const testIdsNeedingEnrichment = useMemo(
    () => collectTestIdsNeedingEnrichment(orders),
    [orders]
  )

  const swrKey =
    testIdsNeedingEnrichment.length > 0
      ? `patient-order-test-catalogs:${testIdsNeedingEnrichment.join(",")}`
      : null

  const { data: catalogs, isLoading: catalogsLoading } = useSWR(swrKey, () =>
    fetchTestCatalogs(testIdsNeedingEnrichment)
  )

  const enrichedOrders = useMemo(() => {
    if (testIdsNeedingEnrichment.length === 0) return orders
    if (!catalogs || catalogs.size === 0) return orders
    return orders.map((order) => enrichLabOrderWithTestCatalogs(order, catalogs))
  }, [orders, catalogs, testIdsNeedingEnrichment])

  return {
    orders: enrichedOrders,
    catalogsLoading: Boolean(catalogsLoading && swrKey),
  }
}
