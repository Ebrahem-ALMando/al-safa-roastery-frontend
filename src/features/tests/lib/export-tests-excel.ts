import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type { TestsExportFilterSummary, TestsExportRow } from "./tests-export-types"

const FONT = "Tajawal"
const COL_COUNT = 12

const AR_HEADERS = [
  "الرقم",
  "كود الفحص",
  "اسم الفحص",
  "التصنيف",
  "وحدة القياس",
  "نوع النتيجة",
  "الحالة",
  "السعر الأساسي",
  "العملة",
  "عدد الحقول",
  "تاريخ الإنشاء",
  "آخر تحديث",
] as const

const EN_HEADERS = [
  "#",
  "Test Code",
  "Test Name",
  "Category",
  "Unit",
  "Result Type",
  "Status",
  "Base Price",
  "Currency",
  "Fields Count",
  "Created At",
  "Updated At",
] as const

const COL_WIDTHS = [6, 14, 28, 20, 12, 14, 12, 14, 10, 12, 20, 20]

const COLORS = {
  titleBg: "FF1E3A5F",
  titleFg: "FFFFFFFF",
  metaBg: "FFF1F5F9",
  metaFg: "FF334155",
  headerBg: "FF0F766E",
  headerFg: "FFFFFFFF",
  border: "FFD1D5DB",
  zebraA: "FFFFFFFF",
  zebraB: "FFF8FAFC",
  activeBg: "FFD1FAE5",
  activeFg: "FF047857",
  inactiveBg: "FFFEE2E2",
  inactiveFg: "FFB91C1C",
}

type SheetLocale = "ar" | "en"

type SheetCopy = {
  sheetName: string
  title: string
  generatedAtLabel: string
  totalLabel: string
  filterLabels: {
    search: string
    status: string
    category: string
    period: string
  }
  headers: readonly string[]
  rtl: boolean
}

const SHEET_COPY: Record<SheetLocale, SheetCopy> = {
  ar: {
    sheetName: "التحاليل",
    title: "تقرير الفحوصات المخبرية",
    generatedAtLabel: "تاريخ التصدير",
    totalLabel: "إجمالي الفحوصات",
    filterLabels: {
      search: "البحث",
      status: "الحالة",
      category: "التصنيف",
      period: "الفترة",
    },
    headers: AR_HEADERS,
    rtl: true,
  },
  en: {
    sheetName: "Tests",
    title: "Laboratory Tests Report",
    generatedAtLabel: "Generated at",
    totalLabel: "Total records",
    filterLabels: {
      search: "Search",
      status: "Status",
      category: "Category",
      period: "Period",
    },
    headers: EN_HEADERS,
    rtl: false,
  },
}

function formatExportTimestamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatFileTimestamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}`
}

function applyFont(cell: ExcelJS.Cell, opts?: Partial<ExcelJS.Font>) {
  cell.font = { name: FONT, size: 11, ...opts }
}

function applyBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: COLORS.border } },
    left: { style: "thin", color: { argb: COLORS.border } },
    bottom: { style: "thin", color: { argb: COLORS.border } },
    right: { style: "thin", color: { argb: COLORS.border } },
  }
}

function rowValues(row: TestsExportRow, locale: SheetLocale): (string | number)[] {
  if (locale === "ar") {
    return [
      row.index,
      row.code,
      row.name,
      row.category,
      row.unit,
      row.resultTypeAr,
      row.statusAr,
      row.basePrice,
      row.currency,
      row.fieldsCount,
      row.createdAt,
      row.updatedAt,
    ]
  }
  return [
    row.index,
    row.code,
    row.name,
    row.category,
    row.unit,
    row.resultTypeEn,
    row.statusEn,
    row.basePrice,
    row.currency,
    row.fieldsCount,
    row.createdAt,
    row.updatedAt,
  ]
}

function buildFilterMetaRows(
  summary: TestsExportFilterSummary,
  locale: SheetLocale
): { label: string; value: string }[] {
  const copy = SHEET_COPY[locale].filterLabels
  const rows: { label: string; value: string }[] = []
  if (summary.search) rows.push({ label: copy.search, value: summary.search })
  if (locale === "ar" && summary.statusAr) {
    rows.push({ label: copy.status, value: summary.statusAr })
  } else if (locale === "en" && summary.statusEn) {
    rows.push({ label: copy.status, value: summary.statusEn })
  }
  if (locale === "ar" && summary.categoryAr) {
    rows.push({ label: copy.category, value: summary.categoryAr })
  } else if (locale === "en" && summary.categoryEn) {
    rows.push({ label: copy.category, value: summary.categoryEn })
  }
  if (locale === "ar" && summary.periodAr) {
    rows.push({ label: copy.period, value: summary.periodAr })
  } else if (locale === "en" && summary.periodEn) {
    rows.push({ label: copy.period, value: summary.periodEn })
  }
  return rows
}

function populateSheet(
  sheet: ExcelJS.Worksheet,
  locale: SheetLocale,
  rows: TestsExportRow[],
  filterSummary: TestsExportFilterSummary,
  generatedAt: Date
) {
  const copy = SHEET_COPY[locale]
  sheet.views = [{ rightToLeft: copy.rtl, state: "frozen", ySplit: 0 }]
  COL_WIDTHS.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w
  })

  let r = 1

  sheet.mergeCells(r, 1, r, COL_COUNT)
  const titleCell = sheet.getCell(r, 1)
  titleCell.value = copy.title
  applyFont(titleCell, { size: 18, bold: true, color: { argb: COLORS.titleFg } })
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.titleBg } }
  sheet.getRow(r).height = 36
  r += 1

  const metaPairs: { label: string; value: string }[] = [
    { label: copy.generatedAtLabel, value: formatExportTimestamp(generatedAt) },
    { label: copy.totalLabel, value: String(rows.length) },
    ...buildFilterMetaRows(filterSummary, locale),
  ]

  for (const pair of metaPairs) {
    const labelCell = sheet.getCell(r, 1)
    const valueCell = sheet.getCell(r, 2)
    labelCell.value = pair.label
    valueCell.value = pair.value
    sheet.mergeCells(r, 2, r, COL_COUNT)
    for (let c = 1; c <= COL_COUNT; c++) {
      const cell = sheet.getCell(r, c)
      applyFont(cell, { bold: c === 1, color: { argb: COLORS.metaFg } })
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.metaBg } }
      cell.alignment = {
        horizontal: copy.rtl ? (c === 1 ? "right" : "left") : c === 1 ? "left" : "left",
        vertical: "middle",
        wrapText: true,
      }
    }
    sheet.getRow(r).height = 20
    r += 1
  }

  r += 1

  const headerRowIndex = r
  const headerRow = sheet.getRow(headerRowIndex)
  copy.headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    applyFont(cell, { bold: true, color: { argb: COLORS.headerFg } })
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    applyBorder(cell)
  })
  headerRow.height = 26

  const dataStart = headerRowIndex + 1
  rows.forEach((row, idx) => {
    const excelRow = sheet.getRow(dataStart + idx)
    const values = rowValues(row, locale)
    const isEven = idx % 2 === 0
    const bg = isEven ? COLORS.zebraA : COLORS.zebraB

    values.forEach((val, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1)
      cell.value = val
      applyFont(cell)
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } }
      applyBorder(cell)

      const col = colIdx + 1
      const wrapCols = new Set([3, 4])
      const centerCols = new Set([1, 6, 7, 8, 9, 10])
      cell.alignment = {
        horizontal: centerCols.has(col) ? "center" : copy.rtl ? "right" : "left",
        vertical: "middle",
        wrapText: wrapCols.has(col),
      }

      if (col === 2) {
        cell.font = { name: "Consolas", size: 10, bold: true }
      }

      if (col === 7) {
        const active = row.isActive
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: active ? COLORS.activeBg : COLORS.inactiveBg },
        }
        applyFont(cell, {
          bold: true,
          color: { argb: active ? COLORS.activeFg : COLORS.inactiveFg },
        })
        cell.alignment = { horizontal: "center", vertical: "middle" }
      }

      if (col === 8 && val !== "—") {
        const num = Number(val)
        if (!Number.isNaN(num)) {
          cell.value = num
          cell.numFmt = "#,##0.00"
        }
      }
    })
    excelRow.height = 22
  })

  const lastDataRow = dataStart + Math.max(rows.length, 1) - 1
  sheet.views = [
    {
      rightToLeft: copy.rtl,
      state: "frozen",
      ySplit: headerRowIndex,
      activeCell: `A${dataStart}`,
    },
  ]

  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: lastDataRow, column: COL_COUNT },
    }
  }
}

export async function exportTestsToExcel(
  rows: TestsExportRow[],
  filterSummary: TestsExportFilterSummary
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Lab Management System"
  workbook.created = new Date()

  const generatedAt = new Date()
  const arSheet = workbook.addWorksheet(SHEET_COPY.ar.sheetName)
  const enSheet = workbook.addWorksheet(SHEET_COPY.en.sheetName)

  populateSheet(arSheet, "ar", rows, filterSummary, generatedAt)
  populateSheet(enSheet, "en", rows, filterSummary, generatedAt)

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, `lab-tests-report-${formatFileTimestamp(generatedAt)}.xlsx`)
}
