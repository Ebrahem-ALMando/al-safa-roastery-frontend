import { Coffee, ShieldCheck, UserRound, Warehouse } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type UserRole =
  | "admin"
  | "manager"
  | "staff"
  | "accountant"
  | "warehouse"
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
  super_admin: {
    label: "مدير عام",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary",
  },
  manager: {
    label: "مدير المحمصة",
    icon: Coffee,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  staff: {
    label: "موظف",
    icon: UserRound,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  accountant: {
    label: "محاسب",
    icon: ShieldCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  warehouse: {
    label: "أمين مخزن",
    icon: Warehouse,
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
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
