import type { Metadata, Viewport } from 'next'
import { Tajawal, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AppStatusProviders } from '@/src/components/status'
import {
  BRAND_LOGO_ALT,
  BRAND_LOGO_PATH,
  BRAND_METADATA,
  BRAND_OG_IMAGE_HEIGHT,
  BRAND_OG_IMAGE_PATH,
  BRAND_OG_IMAGE_WIDTH,
  getMetadataBaseUrl,
} from '@/lib/brand'
import './globals.css'

const metadataBase = new URL(getMetadataBaseUrl())

const tajawal = Tajawal({ 
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: BRAND_METADATA.title,
    template: BRAND_METADATA.titleTemplate,
  },
  description: BRAND_METADATA.description,
  applicationName: BRAND_METADATA.openGraph.siteName,
  icons: {
    icon: [{ url: BRAND_LOGO_PATH, type: 'image/png', sizes: 'any' }],
    shortcut: BRAND_LOGO_PATH,
    apple: BRAND_LOGO_PATH,
  },
  openGraph: {
    title: BRAND_METADATA.openGraph.title,
    description: BRAND_METADATA.openGraph.description,
    siteName: BRAND_METADATA.openGraph.siteName,
    locale: BRAND_METADATA.openGraph.locale,
    type: 'website',
    url: metadataBase,
    images: [
      {
        url: BRAND_OG_IMAGE_PATH,
        width: BRAND_OG_IMAGE_WIDTH,
        height: BRAND_OG_IMAGE_HEIGHT,
        alt: BRAND_LOGO_ALT,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_METADATA.openGraph.title,
    description: BRAND_METADATA.openGraph.description,
    images: [BRAND_OG_IMAGE_PATH],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f7ff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2332' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${tajawal.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AppStatusProviders>{children}</AppStatusProviders>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
