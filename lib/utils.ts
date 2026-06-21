import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normalize Arabic/Latin text for tolerant search (diacritics, hamza variants, ta marbuta, etc.). */
export function normalizeArabicSearch(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0640\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
}

/** True if every whitespace-separated token appears in haystack (after normalization). */
export function matchesAllSearchTokens(haystack: string, query: string): boolean {
  const nq = normalizeArabicSearch(query)
  if (!nq) return true
  const nh = normalizeArabicSearch(haystack)
  const tokens = nq.split(/\s+/).filter(Boolean)
  return tokens.every((t) => nh.includes(t))
}
