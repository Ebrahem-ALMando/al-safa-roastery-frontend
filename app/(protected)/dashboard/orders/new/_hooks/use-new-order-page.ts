"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { LabOrder, LabOrderItem } from "@/features/orders"
import { useLabOrder } from "@/features/orders"
import type { PatientPickerRow } from "@/features/patients"
import { usePatient, usePatientActions, usePatients } from "@/features/patients"
import type { DoctorPickerRow } from "@/features/users"
import { useDoctorPickerList } from "@/features/users"
import type { Test } from "@/features/tests"
import { useTests } from "@/features/tests"
import type { LaravelSuccessResponse } from "@/lib/api"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useAction } from "@/lib/hooks/useAction"
import { normalizeArabicSearch } from "@/lib/utils"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { OrderResultBarcodePrintJob } from "@/components/orders/order-result-barcode-print-portal"

function mapPatientToPickerRow(p: {
  id: number
  full_name: string | null
  phone: string | null
  patient_number: string | null
}): PatientPickerRow {
  return {
    id: String(p.id),
    name: p.full_name?.trim() ? p.full_name.trim() : "—",
    phone: p.phone?.trim() ? p.phone : "—",
    patientNumber: p.patient_number?.trim() ? p.patient_number : "—",
  }
}

function mapRequestedByUserToPickerRow(u: {
  id: number
  name: string
  username: string
  email: string
  is_active: boolean
}): DoctorPickerRow {
  return {
    id: String(u.id),
    name: u.name,
    username: u.username,
    email: u.email,
    isActive: Boolean(u.is_active),
  }
}

export function syntheticTestFromOrderItem(item: LabOrderItem): Test {
  return {
    id: item.test_id,
    name: item.test_name,
    code: "—",
    category_id: 0,
    category: null,
    icon_name: null,
    notes: null,
    is_active: true,
    fields: [],
    prices: [],
  }
}

export function testDisplayPrice(t: Test): number {
  if (!t.prices?.length) return 0
  return Math.min(...t.prices.map((p) => Number(p.amount) || 0))
}

const STRONG_MATCH = 85

function latinInParentheses(name: string): string[] {
  const parts: string[] = []
  const re = /\(([^)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(name)) !== null) {
    parts.push(m[1].trim().toLowerCase())
  }
  return parts
}

function testMatchScore(test: Test, rawQuery: string): number {
  const q = rawQuery.trim()
  if (!q) return 1
  const nq = normalizeArabicSearch(q)
  const ql = q.toLowerCase().replace(/\s+/g, "")
  const nName = normalizeArabicSearch(test.name)
  const nCat = normalizeArabicSearch(test.category?.name ?? "")
  const code = test.code.toLowerCase()
  let score = 0

  if (code === ql) score += 160
  else if (code.startsWith(ql)) score += 95
  else if (code.includes(ql)) score += 55

  for (const p of latinInParentheses(test.name)) {
    const compact = p.replace(/\s+/g, "")
    if (compact === ql || p === q.toLowerCase()) score += 140
    else if (compact.includes(ql) || p.includes(q.toLowerCase())) score += 75
  }

  if (nName.includes(nq)) score += 50
  if (nCat.includes(nq)) score += 28
  if (normalizeArabicSearch(test.code).includes(nq)) score += 40

  const tokens = nq.split(/\s+/).filter(Boolean)
  const blob = `${nName} ${nCat} ${code}`
  if (tokens.length > 0 && tokens.every((t) => blob.includes(t))) score += 42

  return score
}

export function useNewOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editParam = searchParams.get("edit")
  const editId = editParam != null && /^\d+$/.test(editParam.trim()) ? Number(editParam) : null
  const patientPresetRaw = searchParams.get("patient")
  const patientPresetId =
    editId == null &&
    patientPresetRaw != null &&
    /^\d+$/.test(patientPresetRaw.trim())
      ? Number(patientPresetRaw.trim())
      : null

  const { execute } = useAction()
  const { createPatient } = usePatientActions()

  const [patientSearch, setPatientSearch] = React.useState("")
  const debouncedPatientSearch = useDebouncedValue(patientSearch, 350)

  const [testQuery, setTestQuery] = React.useState("")
  const debouncedTestQuery = useDebouncedValue(testQuery, 350)

  const [selectedPatient, setSelectedPatient] = React.useState<PatientPickerRow | null>(null)
  const [selectedDoctor, setSelectedDoctor] = React.useState<DoctorPickerRow | null>(null)
  const [doctorSearch, setDoctorSearch] = React.useState("")
  const [selectedTests, setSelectedTests] = React.useState<Test[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = React.useState(false)
  const patientBoxRef = React.useRef<HTMLDivElement>(null)
  const [showDoctorDropdown, setShowDoctorDropdown] = React.useState(false)
  const doctorBoxRef = React.useRef<HTMLDivElement>(null)

  const [addPatientOpen, setAddPatientOpen] = React.useState(false)
  const [addPatientInitialName, setAddPatientInitialName] = React.useState("")
  const [patientSelectDialogOpen, setPatientSelectDialogOpen] = React.useState(false)
  const [doctorSelectDialogOpen, setDoctorSelectDialogOpen] = React.useState(false)

  const [categoryFilter, setCategoryFilter] = React.useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [orderNotes, setOrderNotes] = React.useState("")
  const notesHydratedForOrderId = React.useRef<number | null>(null)

  const { patients, isLoading: patientsLoading } = usePatients({
    page: 1,
    search: debouncedPatientSearch,
    columnFilters: {},
    perPage: 100,
    dateRange: null,
  })

  const { tests, isLoading: testsLoading } = useTests({
    page: 1,
    search: debouncedTestQuery,
    columnFilters: { is_active: true },
    perPage: 100,
    dateRange: null,
  })

  const { rows: doctorRows, isLoading: doctorsLoading } = useDoctorPickerList({
    open: showDoctorDropdown && doctorSearch.trim() !== "",
    search: doctorSearch,
    debounceMs: 350,
  })

  const { order: editOrder, isLoading: editOrderLoading } = useLabOrder({
    id: editId,
    enabled: editId != null,
  })

  const { patient: presetPatientFromUrl } = usePatient(patientPresetId)

  const presetPatientAppliedRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    presetPatientAppliedRef.current = null
  }, [patientPresetId, editId])

  React.useEffect(() => {
    if (editId != null) {
      presetPatientAppliedRef.current = null
      return
    }
    if (patientPresetId == null) {
      presetPatientAppliedRef.current = null
      return
    }
    if (!presetPatientFromUrl || presetPatientFromUrl.id !== patientPresetId) return
    if (presetPatientAppliedRef.current === patientPresetId) return
    setSelectedPatient(mapPatientToPickerRow(presetPatientFromUrl))
    setPatientSearch("")
    presetPatientAppliedRef.current = patientPresetId
  }, [editId, patientPresetId, presetPatientFromUrl])

  const pickerRows = React.useMemo(() => patients.map(mapPatientToPickerRow), [patients])

  const categoryOptions = React.useMemo(() => {
    const m = new Map<number, string>()
    for (const t of tests) {
      if (t.category) m.set(t.category.id, t.category.name)
    }
    return Array.from(m.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
  }, [tests])

  const lastHydratedOrderId = React.useRef<number | null>(null)

  React.useEffect(() => {
    lastHydratedOrderId.current = null
  }, [editId])

  React.useEffect(() => {
    if (editId == null) {
      setOrderNotes("")
      notesHydratedForOrderId.current = null
    }
  }, [editId])

  React.useEffect(() => {
    if (editId == null || !editOrder || editOrder.id !== editId) return
    if (notesHydratedForOrderId.current === editOrder.id) return
    setOrderNotes(typeof editOrder.notes === "string" ? editOrder.notes : "")
    notesHydratedForOrderId.current = editOrder.id
  }, [editId, editOrder])

  React.useEffect(() => {
    if (editId == null || !editOrder || editOrder.id !== editId) return

    if (editOrder.patient) {
      setSelectedPatient(mapPatientToPickerRow(editOrder.patient))
    } else {
      setSelectedPatient(null)
    }
    if (editOrder.requested_by_user) {
      setSelectedDoctor(mapRequestedByUserToPickerRow(editOrder.requested_by_user))
      setDoctorSearch("")
    } else if (editOrder.requesting_doctor_name) {
      setSelectedDoctor(null)
      setDoctorSearch(editOrder.requesting_doctor_name)
    } else {
      setSelectedDoctor(null)
      setDoctorSearch("")
    }

    if (tests.length === 0) return
    if (lastHydratedOrderId.current === editOrder.id) return

    const sorted = [...editOrder.items].sort((a, b) => a.sort_order - b.sort_order)
    const picked: Test[] = sorted.map((it) => {
      const full = tests.find((t) => t.id === it.test_id)
      return full ?? syntheticTestFromOrderItem(it)
    })
    setSelectedTests(picked)
    lastHydratedOrderId.current = editOrder.id
  }, [editId, editOrder, tests])

  React.useEffect(() => {
    if (!showPatientDropdown) return
    const onDown = (e: MouseEvent) => {
      if (patientBoxRef.current && !patientBoxRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [showPatientDropdown])

  React.useEffect(() => {
    if (!showDoctorDropdown) return
    const onDown = (e: MouseEvent) => {
      if (doctorBoxRef.current && !doctorBoxRef.current.contains(e.target as Node)) {
        setShowDoctorDropdown(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [showDoctorDropdown])

  const openAddPatientModal = React.useCallback((nameFromSearch: string) => {
    setAddPatientInitialName(nameFromSearch.trim())
    setAddPatientOpen(true)
    setShowPatientDropdown(false)
  }, [])

  const handlePatientSaved = React.useCallback((p: PatientPickerRow) => {
    setSelectedPatient(p)
    setPatientSearch("")
    setAddPatientOpen(false)
  }, [])

  const toggleTest = React.useCallback((test: Test) => {
    setSelectedTests((prev) =>
      prev.some((t) => t.id === test.id) ? prev.filter((t) => t.id !== test.id) : [...prev, test]
    )
  }, [])

  const removeTest = React.useCallback((testId: number) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== testId))
  }, [])

  const filteredTestGroups = React.useMemo(() => {
    const q = testQuery.trim()
    const minScore = 22
    const list = tests.filter((t) => categoryFilter == null || t.category_id === categoryFilter)
    const byCat = new Map<string, { test: Test; score: number }[]>()
    for (const test of list) {
      const score = testMatchScore(test, testQuery)
      if (q && score < minScore) continue
      const catName = test.category?.name ?? "بدون تصنيف"
      const arr = byCat.get(catName) ?? []
      arr.push({ test, score })
      byCat.set(catName, arr)
    }
    return Array.from(byCat.entries())
      .map(([name, items]) => ({
        name,
        items: [...items].sort((a, b) => b.score - a.score),
      }))
      .filter((g) => g.items.length > 0)
  }, [tests, testQuery, categoryFilter])

  const totalFilteredTests = React.useMemo(
    () => filteredTestGroups.reduce((n, g) => n + g.items.length, 0),
    [filteredTestGroups]
  )

  const totalPrice = React.useMemo(
    () => selectedTests.reduce((sum, t) => sum + testDisplayPrice(t), 0),
    [selectedTests]
  )

  const submitLabel = editId != null ? "حفظ التعديلات" : "إنشاء الطلب"
  const pageTitle = editId != null ? "تعديل طلب التحاليل" : "طلب تحاليل جديد"
  const pageDescription =
    editId != null
      ? "تحديث المريض أو قائمة الفحوصات ثم احفظ التغييرات."
      : "اختر المريض والفحوصات بسرعة — بحث ذكي يدعم العربية والرموز والأسماء الإنجليزية بين قوسين"

  const [labelCopies, setLabelCopies] = React.useState(1)
  const [isCustomLabelCopies, setIsCustomLabelCopies] = React.useState(false)
  const [customLabelCopiesInput, setCustomLabelCopiesInput] = React.useState("1")
  const [customLabelCopiesError, setCustomLabelCopiesError] = React.useState<string | null>(null)
  const [printJob, setPrintJob] = React.useState<OrderResultBarcodePrintJob | null>(null)

  const selectPresetLabelCopies = React.useCallback((count: number) => {
    setLabelCopies(count)
    setIsCustomLabelCopies(false)
    setCustomLabelCopiesError(null)
  }, [])

  const selectCustomLabelCopies = React.useCallback(() => {
    setIsCustomLabelCopies(true)
    setCustomLabelCopiesInput(String(labelCopies))
  }, [labelCopies])

  const applyCustomLabelCopies = React.useCallback((raw: string) => {
    setCustomLabelCopiesInput(raw)
    const trimmed = raw.trim()
    if (trimmed === "") {
      setLabelCopies(1)
      setCustomLabelCopiesError("أدخل رقماً بين 1 و 20")
      return
    }
    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed)) {
      setLabelCopies(1)
      setCustomLabelCopiesError("أدخل رقماً صحيحاً")
      return
    }
    if (parsed < 1) {
      setLabelCopies(1)
      setCustomLabelCopiesError("الحد الأدنى 1")
      return
    }
    if (parsed > 20) {
      setLabelCopies(20)
      setCustomLabelCopiesError("الحد الأقصى 20")
      return
    }
    setLabelCopies(parsed)
    setCustomLabelCopiesError(null)
  }, [])

  const clearPrintJob = React.useCallback(() => {
    setPrintJob(null)
  }, [])

  const handleSubmit = React.useCallback(async () => {
    if (!selectedPatient || selectedTests.length === 0) return
    const items = selectedTests.map((t, i) => ({ test_id: t.id, sort_order: i }))
    const notesTrimmed = orderNotes.trim()
    const notesPayload = notesTrimmed === "" ? null : notesTrimmed
    const doctorNameTrimmed = doctorSearch.trim()
    const basePayload = {
      patient_id: Number(selectedPatient.id),
      items,
      requested_by: selectedDoctor ? Number(selectedDoctor.id) : null,
      doctor_name_input: !selectedDoctor && doctorNameTrimmed !== "" ? doctorNameTrimmed : null,
    }
    setIsSubmitting(true)
    try {
      if (editId != null) {
        await execute<LaravelSuccessResponse<LabOrder>>({
          endpoint: `lab-orders/${editId}`,
          method: "PUT",
          payload: { ...basePayload, notes: notesPayload },
        })
        router.push("/dashboard/orders")
      } else {
        const response = await execute<LaravelSuccessResponse<LabOrder>>({
          endpoint: "lab-orders",
          method: "POST",
          payload: {
            ...basePayload,
            notes: notesPayload,
          },
          notify: false,
        })
        const createdOrderId = response.data?.id
        if (createdOrderId == null) {
          toast.error("تم إنشاء الطلب لكن لم يُعاد رقم الطلب — لم تُطبع اللصاقات.")
          router.push("/dashboard/orders")
          return
        }
        toast.success(
          `تم إنشاء الطلب بنجاح. سيتم طباعة ${labelCopies} لصاقة باركود للنتائج.`
        )
        setPrintJob({ orderId: createdOrderId, copies: labelCopies })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    selectedPatient,
    selectedTests,
    orderNotes,
    doctorSearch,
    selectedDoctor,
    editId,
    execute,
    router,
    labelCopies,
  ])

  return {
    editId,
    editOrderLoading,
    pageTitle,
    pageDescription,
    submitLabel,
    patientSearch,
    setPatientSearch,
    selectedPatient,
    setSelectedPatient,
    selectedDoctor,
    setSelectedDoctor,
    doctorSearch,
    setDoctorSearch,
    showDoctorDropdown,
    setShowDoctorDropdown,
    doctorBoxRef,
    doctorRows,
    doctorsLoading,
    showPatientDropdown,
    setShowPatientDropdown,
    patientBoxRef,
    patientsLoading,
    patientRows: pickerRows,
    addPatientOpen,
    setAddPatientOpen,
    addPatientInitialName,
    patientSelectDialogOpen,
    setPatientSelectDialogOpen,
    doctorSelectDialogOpen,
    setDoctorSelectDialogOpen,
    openAddPatientModal,
    handlePatientSaved,
    createPatient,
    testQuery,
    setTestQuery,
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    filteredTestGroups,
    totalFilteredTests,
    strongMatchThreshold: STRONG_MATCH,
    tests,
    testsLoading,
    selectedTests,
    toggleTest,
    removeTest,
    totalPrice,
    handleSubmit,
    isSubmitting,
    orderNotes,
    setOrderNotes,
    labelCopies,
    isCustomLabelCopies,
    customLabelCopiesInput,
    customLabelCopiesError,
    selectPresetLabelCopies,
    selectCustomLabelCopies,
    applyCustomLabelCopies,
    printJob,
    clearPrintJob,
  }
}
