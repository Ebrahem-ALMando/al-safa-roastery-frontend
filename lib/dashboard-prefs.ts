/** مفاتيح تفضيلات لوحة التحكم — تُقرأ في Shell وتُحدَّث من صفحة الإعدادات */

export const LS_SIDEBAR_COLLAPSED = "lab-sidebar-collapsed"
export const LS_MOTION_ENABLED = "lab-motion-enabled"
export const LS_NOTIFICATION_PREFS = "lab-notification-prefs"
export const LS_LAB_PROFILE = "lab-settings-lab-profile"
export const LS_ACCOUNT_PROFILE = "lab-settings-account-profile"

export const PREFS_CHANGED_EVENT = "lab-dashboard-prefs-changed"

export function dispatchDashboardPrefsChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT))
}

export function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(LS_SIDEBAR_COLLAPSED) === "1"
  } catch {
    return false
  }
}

export function writeSidebarCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_SIDEBAR_COLLAPSED, collapsed ? "1" : "0")
    dispatchDashboardPrefsChanged()
  } catch {
    /* ignore */
  }
}

/** تفعيل الحركات والانتقالات (true = عادي، false = تقليل قوي) */
export function readMotionEnabled(): boolean {
  if (typeof window === "undefined") return true
  try {
    const v = localStorage.getItem(LS_MOTION_ENABLED)
    if (v === null) return true
    return v === "1"
  } catch {
    return true
  }
}

export function applyMotionDataset(enabled: boolean) {
  if (typeof document === "undefined") return
  if (enabled) {
    delete document.documentElement.dataset.appMotion
  } else {
    document.documentElement.dataset.appMotion = "reduce"
  }
}

export function writeMotionEnabled(enabled: boolean) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_MOTION_ENABLED, enabled ? "1" : "0")
    applyMotionDataset(enabled)
    dispatchDashboardPrefsChanged()
  } catch {
    /* ignore */
  }
}

export function hydrateMotionFromStorage() {
  applyMotionDataset(readMotionEnabled())
}

export type NotificationPrefs = {
  newOrders: boolean
  abnormal: boolean
  reportsReady: boolean
  systemUpdates: boolean
}

const defaultNotificationPrefs: NotificationPrefs = {
  newOrders: true,
  abnormal: true,
  reportsReady: true,
  systemUpdates: false,
}

export function readNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return { ...defaultNotificationPrefs }
  try {
    const raw = localStorage.getItem(LS_NOTIFICATION_PREFS)
    if (!raw) return { ...defaultNotificationPrefs }
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return { ...defaultNotificationPrefs, ...parsed }
  } catch {
    return { ...defaultNotificationPrefs }
  }
}

export function writeNotificationPrefs(next: NotificationPrefs) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_NOTIFICATION_PREFS, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export type LabProfile = {
  labName: string
  labPhone: string
  labEmail: string
  labLicense: string
  labAddress: string
}

export const defaultLabProfile: LabProfile = {
  labName: "محمصة الصفا",
  labPhone: "920012345",
  labEmail: "info@alsafaroastery.com",
  labLicense: "CR-12345-SA",
  labAddress: "الرياض - المملكة العربية السعودية",
}

export function readLabProfile(): LabProfile {
  if (typeof window === "undefined") return { ...defaultLabProfile }
  try {
    const raw = localStorage.getItem(LS_LAB_PROFILE)
    if (!raw) return { ...defaultLabProfile }
    return { ...defaultLabProfile, ...JSON.parse(raw) }
  } catch {
    return { ...defaultLabProfile }
  }
}

export function writeLabProfile(profile: LabProfile) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_LAB_PROFILE, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}

export type AccountProfile = {
  userName: string
  userEmail: string
  userPhone: string
  userRole: string
}

export const defaultAccountProfile: AccountProfile = {
  userName: "مدير النظام",
  userEmail: "admin@alsafaroastery.com",
  userPhone: "0501234567",
  userRole: "مدير المحمصة",
}

export function readAccountProfile(): AccountProfile {
  if (typeof window === "undefined") return { ...defaultAccountProfile }
  try {
    const raw = localStorage.getItem(LS_ACCOUNT_PROFILE)
    if (!raw) return { ...defaultAccountProfile }
    return { ...defaultAccountProfile, ...JSON.parse(raw) }
  } catch {
    return { ...defaultAccountProfile }
  }
}

export function writeAccountProfile(profile: AccountProfile) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_ACCOUNT_PROFILE, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}
