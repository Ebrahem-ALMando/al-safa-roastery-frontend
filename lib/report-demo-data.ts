import type { ReportData } from "@/components/reports/report-template"

/** بيانات تجريبية — لاحقاً تُستبدل بجلب من API حسب المعرّف */
export const demoReportData: ReportData = {
  orderId: "ORD-2024-001",
  orderDbId: 1,
  date: "2024-01-15",
  issueDate: "2024-01-16",
  patient: {
    name: "محمد أحمد علي",
    id: "PAT-000001",
    dbId: 1,
    age: 35,
    gender: "ذكر",
    phone: "0501234567",
  },
  doctor: "مهران قهواتي",
  labInfo: {
    name: "مختبر التحاليل الطبية المتقدم",
    subtitle: "تقرير نتائج التحاليل الطبية",
    phone: "011-234-5678",
    address: "حلب - شارع فيصل",
  },
  testGroups: [
    {
      category: "صورة الدم الكاملة (CBC)",
      tests: [
        {
          name: "كريات الدم البيضاء",
          code: "WBC",
          value: "13.2",
          unit: "×10³/µL",
          referenceRange: "4-11",
          isAbnormal: true,
          abnormalType: "high",
          attachments: [
            {
              id: "att-1",
              name: "blood_sample_image.jpg",
              url: "/placeholder.svg",
              type: "image/jpeg",
              uploadDate: "2024-01-15T10:30:00Z",
            },
          ],
        },
        {
          name: "كريات الدم الحمراء",
          code: "RBC",
          value: "5.2",
          unit: "×10⁶/µL",
          referenceRange: "4.5-5.5",
          isAbnormal: false,
        },
        {
          name: "الهيموجلوبين",
          code: "HGB",
          value: "10.5",
          unit: "g/dL",
          referenceRange: "12-16",
          isAbnormal: true,
          abnormalType: "low",
        },
        {
          name: "الصفائح الدموية",
          code: "PLT",
          value: "250",
          unit: "×10³/µL",
          referenceRange: "150-400",
          isAbnormal: false,
        },
      ],
    },
    {
      category: "سكر الدم",
      tests: [
        {
          name: "سكر الدم الصائم",
          code: "FBS",
          value: "95",
          unit: "mg/dL",
          referenceRange: "70-100",
          isAbnormal: false,
        },
      ],
    },
    {
      category: "الفحوصات المصلية",
      tests: [
        {
          name: "فحص HIV",
          code: "HIV",
          value: "سلبي",
          unit: "",
          referenceRange: "سلبي",
          isAbnormal: false,
          attachments: [
            {
              id: "att-2",
              name: "hiv_test_result.pdf",
              url: "/placeholder.pdf",
              type: "application/pdf",
              uploadDate: "2024-01-15T11:00:00Z",
            },
            {
              id: "att-3",
              name: "additional_notes.pdf",
              url: "/placeholder.pdf",
              type: "application/pdf",
              uploadDate: "2024-01-15T11:15:00Z",
            },
          ],
        },
      ],
    },
  ],
  /** اختياري في التجربة — الإرشادات العامة الثابتة تُعرض من القالب عبر توغل منفصل. */
  notes: [],
}

export function getDemoReportById(_id: string): ReportData {
  return demoReportData
}
