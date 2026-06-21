/**
 * SummaryCards Themes Configuration
 *
 * Defines color themes for summary cards
 * Supports multiple theme sets (default, ocean, sunset, forest)
 * Each theme has color configurations for different card types
 */

export interface ThemeColors {
  bg: string
  bgDark: string
  text: string
  icon: string
  iconBg: string
  border: string
  preview?: string[]
}

export interface ThemeColorSet {
  primary: ThemeColors
  success: ThemeColors
  warning: ThemeColors
  danger: ThemeColors
  info: ThemeColors
  secondary: ThemeColors
  accent: ThemeColors
  muted: ThemeColors
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColorSet
}

/**
 * Default theme colors matching the visual identity
 */
export const defaultTheme: Theme = {
  id: 'default',
  name: 'افتراضي',
  colors: {
    primary: {
      bg: 'from-primary/10 via-primary/5 to-primary/10',
      bgDark: 'dark:from-primary/20 dark:via-primary/10 dark:to-primary/20',
      text: 'text-primary dark:text-primary',
      icon: 'text-primary dark:text-primary',
      iconBg: 'from-primary/20 to-primary/20 dark:from-primary/30 dark:to-primary/30',
      border: 'border-primary/20 dark:border-primary/40',
      preview: ['bg-primary', 'bg-primary/80', 'bg-emerald-500', 'bg-purple-500'],
    },
    success: {
      bg: 'from-emerald-50 via-green-50 to-teal-50',
      bgDark: 'dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20',
      text: 'text-emerald-600 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      preview: ['bg-emerald-500', 'bg-green-500', 'bg-teal-500', 'bg-cyan-500'],
    },
    warning: {
      bg: 'from-amber-50 via-orange-50 to-yellow-50',
      bgDark: 'dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20',
      text: 'text-amber-600 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
      iconBg: 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
      border: 'border-amber-200 dark:border-amber-800',
      preview: ['bg-amber-500', 'bg-orange-500', 'bg-yellow-500', 'bg-red-500'],
    },
    danger: {
      bg: 'from-red-50 via-rose-50 to-pink-50',
      bgDark: 'dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20',
      text: 'text-red-600 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
      border: 'border-red-200 dark:border-red-800',
      preview: ['bg-red-500', 'bg-rose-500', 'bg-pink-500', 'bg-orange-500'],
    },
    info: {
      bg: 'from-purple-50 via-violet-50 to-indigo-50',
      bgDark: 'dark:from-purple-950/20 dark:via-violet-950/20 dark:to-indigo-950/20',
      text: 'text-purple-600 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      iconBg: 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30',
      border: 'border-purple-200 dark:border-purple-800',
      preview: ['bg-purple-500', 'bg-violet-500', 'bg-indigo-500', 'bg-blue-500'],
    },
    secondary: {
      bg: 'from-blue-50 via-cyan-50 to-sky-50',
      bgDark: 'dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-sky-950/20',
      text: 'text-blue-600 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      preview: ['bg-blue-500', 'bg-cyan-500', 'bg-sky-500', 'bg-indigo-500'],
    },
    accent: {
      bg: 'from-teal-50 via-emerald-50 to-green-50',
      bgDark: 'dark:from-teal-950/20 dark:via-emerald-950/20 dark:to-green-950/20',
      text: 'text-teal-600 dark:text-teal-300',
      icon: 'text-teal-600 dark:text-teal-400',
      iconBg: 'from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30',
      border: 'border-teal-200 dark:border-teal-800',
      preview: ['bg-teal-500', 'bg-emerald-500', 'bg-green-500', 'bg-cyan-500'],
    },
    muted: {
      bg: 'from-indigo-50 via-blue-50 to-purple-50',
      bgDark: 'dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-purple-950/20',
      text: 'text-indigo-600 dark:text-indigo-300',
      icon: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30',
      border: 'border-indigo-200 dark:border-indigo-800',
      preview: ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-violet-500'],
    },
  },
}

/**
 * Ocean theme
 */
export const oceanTheme: Theme = {
  id: 'ocean',
  name: 'المحيط',
  colors: {
    primary: {
      bg: 'from-blue-50 via-cyan-50 to-teal-50',
      bgDark: 'dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20',
      text: 'text-blue-600 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      preview: ['bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-sky-500'],
    },
    success: {
      bg: 'from-teal-50 via-emerald-50 to-green-50',
      bgDark: 'dark:from-teal-950/20 dark:via-emerald-950/20 dark:to-green-950/20',
      text: 'text-teal-600 dark:text-teal-300',
      icon: 'text-teal-600 dark:text-teal-400',
      iconBg: 'from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30',
      border: 'border-teal-200 dark:border-teal-800',
      preview: ['bg-teal-500', 'bg-emerald-500', 'bg-green-500', 'bg-cyan-500'],
    },
    warning: {
      bg: 'from-slate-50 via-gray-50 to-zinc-50',
      bgDark: 'dark:from-slate-950/20 dark:via-gray-950/20 dark:to-zinc-950/20',
      text: 'text-slate-600 dark:text-slate-300',
      icon: 'text-slate-600 dark:text-slate-400',
      iconBg: 'from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30',
      border: 'border-slate-200 dark:border-slate-800',
      preview: ['bg-slate-500', 'bg-gray-500', 'bg-zinc-500', 'bg-blue-500'],
    },
    danger: {
      bg: 'from-red-50 via-orange-50 to-amber-50',
      bgDark: 'dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20',
      text: 'text-red-600 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30',
      border: 'border-red-200 dark:border-red-800',
      preview: ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-rose-500'],
    },
    info: {
      bg: 'from-cyan-50 via-sky-50 to-blue-50',
      bgDark: 'dark:from-cyan-950/20 dark:via-sky-950/20 dark:to-blue-950/20',
      text: 'text-cyan-600 dark:text-cyan-300',
      icon: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'from-cyan-100 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/30',
      border: 'border-cyan-200 dark:border-cyan-800',
      preview: ['bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500'],
    },
    secondary: {
      bg: 'from-indigo-50 via-purple-50 to-violet-50',
      bgDark: 'dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-violet-950/20',
      text: 'text-indigo-600 dark:text-indigo-300',
      icon: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30',
      border: 'border-indigo-200 dark:border-indigo-800',
      preview: ['bg-indigo-500', 'bg-purple-500', 'bg-violet-500', 'bg-blue-500'],
    },
    accent: {
      bg: 'from-emerald-50 via-teal-50 to-cyan-50',
      bgDark: 'dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20',
      text: 'text-emerald-600 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      preview: ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'],
    },
    muted: {
      bg: 'from-blue-50 via-indigo-50 to-purple-50',
      bgDark: 'dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20',
      text: 'text-blue-600 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      preview: ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-violet-500'],
    },
  },
}

/**
 * Sunset theme
 */
export const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'الغروب',
  colors: {
    primary: {
      bg: 'from-orange-50 via-red-50 to-rose-50',
      bgDark: 'dark:from-orange-950/20 dark:via-red-950/20 dark:to-rose-950/20',
      text: 'text-orange-600 dark:text-orange-300',
      icon: 'text-orange-600 dark:text-orange-400',
      iconBg: 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30',
      border: 'border-orange-200 dark:border-orange-800',
      preview: ['bg-orange-500', 'bg-red-500', 'bg-rose-500', 'bg-amber-500'],
    },
    success: {
      bg: 'from-pink-50 via-rose-50 to-red-50',
      bgDark: 'dark:from-pink-950/20 dark:via-rose-950/20 dark:to-red-950/20',
      text: 'text-pink-600 dark:text-pink-300',
      icon: 'text-pink-600 dark:text-pink-400',
      iconBg: 'from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30',
      border: 'border-pink-200 dark:border-pink-800',
      preview: ['bg-pink-500', 'bg-rose-500', 'bg-red-500', 'bg-fuchsia-500'],
    },
    warning: {
      bg: 'from-amber-50 via-yellow-50 to-orange-50',
      bgDark: 'dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20',
      text: 'text-amber-600 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
      iconBg: 'from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
      border: 'border-amber-200 dark:border-amber-800',
      preview: ['bg-amber-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'],
    },
    danger: {
      bg: 'from-red-50 via-rose-50 to-pink-50',
      bgDark: 'dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20',
      text: 'text-red-600 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
      border: 'border-red-200 dark:border-red-800',
      preview: ['bg-red-500', 'bg-rose-500', 'bg-pink-500', 'bg-orange-500'],
    },
    info: {
      bg: 'from-violet-50 via-purple-50 to-fuchsia-50',
      bgDark: 'dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20',
      text: 'text-violet-600 dark:text-violet-300',
      icon: 'text-violet-600 dark:text-violet-400',
      iconBg: 'from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30',
      border: 'border-violet-200 dark:border-violet-800',
      preview: ['bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'],
    },
    secondary: {
      bg: 'from-rose-50 via-pink-50 to-fuchsia-50',
      bgDark: 'dark:from-rose-950/20 dark:via-pink-950/20 dark:to-fuchsia-950/20',
      text: 'text-rose-600 dark:text-rose-300',
      icon: 'text-rose-600 dark:text-rose-400',
      iconBg: 'from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30',
      border: 'border-rose-200 dark:border-rose-800',
      preview: ['bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-violet-500'],
    },
    accent: {
      bg: 'from-orange-50 via-amber-50 to-yellow-50',
      bgDark: 'dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20',
      text: 'text-orange-600 dark:text-orange-300',
      icon: 'text-orange-600 dark:text-orange-400',
      iconBg: 'from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30',
      border: 'border-orange-200 dark:border-orange-800',
      preview: ['bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-red-500'],
    },
    muted: {
      bg: 'from-red-50 via-orange-50 to-amber-50',
      bgDark: 'dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20',
      text: 'text-red-600 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30',
      border: 'border-red-200 dark:border-red-800',
      preview: ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500'],
    },
  },
}

/**
 * Forest theme
 */
export const forestTheme: Theme = {
  id: 'forest',
  name: 'الغابة',
  colors: {
    primary: {
      bg: 'from-green-50 via-emerald-50 to-teal-50',
      bgDark: 'dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20',
      text: 'text-green-600 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      border: 'border-green-200 dark:border-green-800',
      preview: ['bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-lime-500'],
    },
    success: {
      bg: 'from-emerald-50 via-teal-50 to-cyan-50',
      bgDark: 'dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20',
      text: 'text-emerald-600 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      preview: ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'],
    },
    warning: {
      bg: 'from-lime-50 via-green-50 to-emerald-50',
      bgDark: 'dark:from-lime-950/20 dark:via-green-950/20 dark:to-emerald-950/20',
      text: 'text-lime-600 dark:text-lime-300',
      icon: 'text-lime-600 dark:text-lime-400',
      iconBg: 'from-lime-100 to-green-100 dark:from-lime-900/30 dark:to-green-900/30',
      border: 'border-lime-200 dark:border-lime-800',
      preview: ['bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500'],
    },
    danger: {
      bg: 'from-red-50 via-rose-50 to-pink-50',
      bgDark: 'dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20',
      text: 'text-red-600 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
      border: 'border-red-200 dark:border-red-800',
      preview: ['bg-red-500', 'bg-rose-500', 'bg-pink-500', 'bg-orange-500'],
    },
    info: {
      bg: 'from-teal-50 via-cyan-50 to-blue-50',
      bgDark: 'dark:from-teal-950/20 dark:via-cyan-950/20 dark:to-blue-950/20',
      text: 'text-teal-600 dark:text-teal-300',
      icon: 'text-teal-600 dark:text-teal-400',
      iconBg: 'from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30',
      border: 'border-teal-200 dark:border-teal-800',
      preview: ['bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-emerald-500'],
    },
    secondary: {
      bg: 'from-green-50 via-emerald-50 to-teal-50',
      bgDark: 'dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20',
      text: 'text-green-600 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      border: 'border-green-200 dark:border-green-800',
      preview: ['bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-lime-500'],
    },
    accent: {
      bg: 'from-emerald-50 via-teal-50 to-cyan-50',
      bgDark: 'dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20',
      text: 'text-emerald-600 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      preview: ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'],
    },
    muted: {
      bg: 'from-lime-50 via-green-50 to-emerald-50',
      bgDark: 'dark:from-lime-950/20 dark:via-green-950/20 dark:to-emerald-950/20',
      text: 'text-lime-600 dark:text-lime-300',
      icon: 'text-lime-600 dark:text-lime-400',
      iconBg: 'from-lime-100 to-green-100 dark:from-lime-900/30 dark:to-green-900/30',
      border: 'border-lime-200 dark:border-lime-800',
      preview: ['bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500'],
    },
  },
}

/**
 * All available themes
 */
export const summaryCardsThemes: Theme[] = [
  defaultTheme,
  oceanTheme,
  sunsetTheme,
  forestTheme,
]

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme {
  return summaryCardsThemes.find((theme) => theme.id === id) || defaultTheme
}

