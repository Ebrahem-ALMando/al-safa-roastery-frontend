import { ClipboardList, Microscope, ShieldCheck, Stethoscope, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type UserRole =
  | "admin"
  | "doctor"
  | "staff"
  | "lab_manager"
  | "technician"
  | "lab_technician"
  | "receptionist"
  | string

interface RoleConfig {
  label: string
  icon: LucideIcon
  className: string
}

const fallbackRoleConfig: RoleConfig = {
  label: "مستخدم النظام",
  icon: UserRound,
  className: "bg-primary/10 text-primary",
}

const roleConfigMap: Record<string, RoleConfig> = {
  admin: {
    label: "مدير النظام",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary",
  },
  doctor: {
    label: "طبيب",
    icon: Stethoscope,
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  lab_manager: {
    label: "مدير المختبر",
    icon: Stethoscope,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  staff: {
    label: "فريق المختبر",
    icon: UserRound,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  technician: {
    label: "فني مخبري",
    icon: Stethoscope,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  lab_technician: {
    label: "مخبري",
    icon: Microscope,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  receptionist: {
    label: "موظف استقبال",
    icon: ClipboardList,
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  super_admin: {
    label: "مدير عام",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary",
  },
  manager: {
    label: "مدير",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary",
  },
  user: {
    label: "مستخدم النظام",
    icon: UserRound,
    className: "bg-primary/10 text-primary",
  },
}

function normalizeRoleKey(role: string): string {
  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
}

export function getRoleConfig(role?: UserRole): RoleConfig {
  if (!role) return fallbackRoleConfig
  const normalizedRole = normalizeRoleKey(role)
  return roleConfigMap[normalizedRole] ?? fallbackRoleConfig
}
