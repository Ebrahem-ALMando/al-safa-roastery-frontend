import {
  Activity,
  Baby,
  Beaker,
  Bone,
  Brain,
  Droplet,
  Droplets,
  Dna,
  Eye,
  FlaskConical,
  FolderTree,
  Heart,
  Microscope,
  Pill,
  Scan,
  Shield,
  Sparkles,
  Stethoscope,
  Syringe,
  TestTube,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react"
import type { CategoryIconKey } from "@/lib/lab-catalog-types"

const map: Record<CategoryIconKey, LucideIcon> = {
  default: FolderTree,
  hematology: Droplets,
  biochemistry: FlaskConical,
  renal: Waves,
  liver: Activity,
  thyroid: Sparkles,
  serology: Syringe,
  microbiology: Microscope,
  immunology: Shield,
  cardiology: Heart,
  radiology: Scan,
  urinalysis: Beaker,
  hormones: Zap,
  coagulation: Droplet,
  vitamins: Pill,
  genetics: Dna,
  pathology: TestTube,
  stethoscope: Stethoscope,
  neurology: Brain,
  ophthalmology: Eye,
  pediatrics: Baby,
  orthopedics: Bone,
}

export function getCategoryIcon(key?: string): LucideIcon {
  if (key && key in map) return map[key as CategoryIconKey]
  return map.default
}

/** Curated medical icons for category picker (Arabic labels) */
export const CATEGORY_ICON_OPTIONS: {
  key: CategoryIconKey
  labelAr: string
}[] = [
  { key: "default", labelAr: "عام" },
  { key: "stethoscope", labelAr: "طبي عام" },
  { key: "hematology", labelAr: "تحاليل الدم" },
  { key: "biochemistry", labelAr: "كيمياء حيوية" },
  { key: "renal", labelAr: "وظائف الكلى" },
  { key: "liver", labelAr: "وظائف الكبد" },
  { key: "thyroid", labelAr: "الغدة الدرقية" },
  { key: "cardiology", labelAr: "قلب وأوعية" },
  { key: "radiology", labelAr: "أشعة وتصوير" },
  { key: "urinalysis", labelAr: "تحليل بول" },
  { key: "serology", labelAr: "مصلية" },
  { key: "microbiology", labelAr: "ميكروبيولوجي" },
  { key: "immunology", labelAr: "مناعة" },
  { key: "hormones", labelAr: "هرمونات" },
  { key: "coagulation", labelAr: "تخثر" },
  { key: "vitamins", labelAr: "فيتامينات" },
  { key: "genetics", labelAr: "وراثة" },
  { key: "pathology", labelAr: "أنسجة" },
  { key: "neurology", labelAr: "أعصاب" },
  { key: "ophthalmology", labelAr: "عيون" },
  { key: "pediatrics", labelAr: "أطفال" },
  { key: "orthopedics", labelAr: "عظام" },
]
