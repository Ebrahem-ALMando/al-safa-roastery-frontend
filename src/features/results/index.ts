export { useResultsPage } from "./hooks/useResultsPage"
export type { ResultsPageConfig, ResultsViewMode } from "./hooks/useResultsPage"
export { useResultEntry } from "./hooks/useResultEntry"
export { buildResultRowsForItem, itemHasAllRequiredFilled } from "./lib/build-results-payload"
export {
  buildOrderItemResultSectionGroups,
  orderItemFieldGroupsForEntry,
  shouldGroupOrderItemResults,
  sortOrderItemResultsByFieldOrder,
} from "./lib/order-item-result-sections"
export { useOrderTestCatalogEnrichment } from "./hooks/useOrderTestCatalogEnrichment"
export { useOrdersTestCatalogEnrichment } from "./hooks/useOrdersTestCatalogEnrichment"
export {
  getOrderTestIdsNeedingCatalogEnrichment,
  isLabOrderTemplateMetadataComplete,
  isOrderItemTestMetadataComplete,
} from "./lib/order-test-metadata"
export { parseSelectOptions, type SelectOptionRow } from "./lib/select-options"
