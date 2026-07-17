"use client"

import { useMemo, useState } from "react"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import type {
  StatementEntityType,
  StatementInvoice,
  StatementInvoiceSummary,
  StatementPayment,
  StatementPaymentSummary,
  StatementQuery,
  StatementReturn,
  StatementReturnSummary,
  StatementTab,
} from "../types/statement.types"
import { useStatementTabData } from "./useStatementTabData"

const DEFAULT_PAGES = { invoices: 1, payments: 1, returns: 1 }

export function useStatementTabsPage(type: StatementEntityType, entityId: number | null, period: StatementQuery, enabled = true) {
  const [activeTab, setActiveTab] = useState<StatementTab>("movements")
  const [pagination, setPagination] = useState({ contextKey: "", pages: DEFAULT_PAGES })
  const [invoiceSearch, setInvoiceSearchState] = useState("")
  const [paymentSearch, setPaymentSearchState] = useState("")
  const [returnSearch, setReturnSearchState] = useState("")
  const [invoiceStatus, setInvoiceStatusState] = useState("")
  const [invoicePaymentStatus, setInvoicePaymentStatusState] = useState("")
  const [paymentMethod, setPaymentMethodState] = useState("")
  const [returnStatus, setReturnStatusState] = useState("")
  const debouncedInvoiceSearch = useDebouncedValue(invoiceSearch, 300)
  const debouncedPaymentSearch = useDebouncedValue(paymentSearch, 300)
  const debouncedReturnSearch = useDebouncedValue(returnSearch, 300)
  const periodKey = `${period.date_from ?? ""}:${period.date_to ?? ""}`
  const contextKey = `${type}:${entityId ?? ""}:${periodKey}`
  const pages = pagination.contextKey === contextKey ? pagination.pages : DEFAULT_PAGES

  const invoiceQuery = useMemo(() => ({
    ...period,
    page: pages.invoices,
    per_page: 15,
    search: debouncedInvoiceSearch || undefined,
    status: invoiceStatus || undefined,
    payment_status: invoicePaymentStatus || undefined,
    sort_by: "invoice_date",
    sort_direction: "desc" as const,
  }), [period, pages.invoices, debouncedInvoiceSearch, invoiceStatus, invoicePaymentStatus])

  const paymentQuery = useMemo(() => ({
    ...period,
    page: pages.payments,
    per_page: 15,
    search: debouncedPaymentSearch || undefined,
    payment_method: paymentMethod || undefined,
    sort_by: "payment_date",
    sort_direction: "desc" as const,
  }), [period, pages.payments, debouncedPaymentSearch, paymentMethod])

  const returnQuery = useMemo(() => ({
    ...period,
    page: pages.returns,
    per_page: 15,
    search: debouncedReturnSearch || undefined,
    status: returnStatus || undefined,
    sort_by: "return_date",
    sort_direction: "desc" as const,
  }), [period, pages.returns, debouncedReturnSearch, returnStatus])

  const invoices = useStatementTabData<StatementInvoice, StatementInvoiceSummary>(type, entityId, "invoices", invoiceQuery, enabled && activeTab === "invoices")
  const payments = useStatementTabData<StatementPayment, StatementPaymentSummary>(type, entityId, "payments", paymentQuery, enabled && activeTab === "payments")
  const returns = useStatementTabData<StatementReturn, StatementReturnSummary>(type, entityId, "returns", returnQuery, enabled && activeTab === "returns")

  const setPage = (tab: keyof typeof DEFAULT_PAGES, page: number) => setPagination({ contextKey, pages: { ...pages, [tab]: page } })
  const resetPage = (tab: keyof typeof DEFAULT_PAGES) => setPage(tab, 1)

  return {
    activeTab,
    setActiveTab,
    pages,
    setPage,
    invoiceSearch,
    setInvoiceSearch: (value: string) => { setInvoiceSearchState(value); resetPage("invoices") },
    invoiceStatus,
    setInvoiceStatus: (value: string) => { setInvoiceStatusState(value); resetPage("invoices") },
    invoicePaymentStatus,
    setInvoicePaymentStatus: (value: string) => { setInvoicePaymentStatusState(value); resetPage("invoices") },
    paymentSearch,
    setPaymentSearch: (value: string) => { setPaymentSearchState(value); resetPage("payments") },
    paymentMethod,
    setPaymentMethod: (value: string) => { setPaymentMethodState(value); resetPage("payments") },
    returnSearch,
    setReturnSearch: (value: string) => { setReturnSearchState(value); resetPage("returns") },
    returnStatus,
    setReturnStatus: (value: string) => { setReturnStatusState(value); resetPage("returns") },
    invoices,
    payments,
    returns,
  }
}
