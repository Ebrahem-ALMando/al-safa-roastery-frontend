/** Official Al Safa Roastery branding — single source of truth */

export const BRAND_LOGO_PATH = "/logo.png" as const
export const BRAND_LOGO_ALT = "شعار محمصة الصفا" as const
export const BRAND_NAME_AR = "محمصة الصفا" as const
export const BRAND_NAME_EN = "Al Safa Roastery" as const
export const BRAND_SYSTEM_TITLE_AR = "نظام إدارة محمصة الصفا" as const
export const BRAND_TAGLINE_AR = "نظام إدارة محمصة" as const

export const BRAND_METADATA = {
  title: BRAND_SYSTEM_TITLE_AR,
  titleTemplate: `%s | ${BRAND_NAME_AR}`,
  description: `${BRAND_SYSTEM_TITLE_AR} — ${BRAND_NAME_EN}`,
  openGraph: {
    title: BRAND_SYSTEM_TITLE_AR,
    description: `${BRAND_TAGLINE_AR} — ${BRAND_NAME_EN}`,
    siteName: BRAND_NAME_AR,
    locale: "ar_SA",
  },
} as const

/** Absolute site origin for Open Graph, canonical URLs, and share previews. */
export function getMetadataBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return fromEnv
}

/** Full HTTPS URL to the logo for og:image / Twitter cards. */
export function getBrandOgImageUrl(): string {
  return `${getMetadataBaseUrl()}${BRAND_LOGO_PATH}`
}
