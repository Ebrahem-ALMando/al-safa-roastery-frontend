import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "طباعة التقرير",
}

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
