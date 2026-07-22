import Image from "next/image"
import { cn } from "@/lib/utils"
import { BRAND_LOGO_ALT, BRAND_LOGO_PATH } from "@/lib/brand"

export type BrandLogoVariant = "sidebar" | "header" | "login" | "loading" | "hero"

const variantStyles: Record<
  BrandLogoVariant,
  {
    width: number
    height: number
    imageClassName: string
    containerClassName: string
  }
> = {
  sidebar: {
    width: 40,
    height: 40,
    imageClassName: "object-contain p-0.5",
    containerClassName:
      "size-10 rounded-xl border border-sidebar-border bg-white shadow-sm dark:bg-white",
  },
  header: {
    width: 64,
    height: 64,
    imageClassName: "object-contain p-1",
    containerClassName: cn(
      "size-10 rounded-full border border-border bg-white shadow-sm sm:size-12 md:size-14 lg:size-16",
      "dark:bg-white"
    ),
  },
  login: {
    width: 80,
    height: 80,
    imageClassName: "object-contain",
    containerClassName:
      "size-20 rounded-2xl border border-primary/20 bg-white p-2 shadow-md ring-1 ring-primary/5 dark:bg-white",
  },
  loading: {
    width: 56,
    height: 56,
    imageClassName: "object-contain animate-pulse",
    containerClassName: "size-14",
  },
  hero: {
    width: 160,
    height: 160,
    imageClassName: "size-[88%] object-contain",
    containerClassName: cn(
      "size-28 rounded-full border border-primary/15 bg-white shadow-md sm:size-32 md:size-36 lg:size-40",
      "ring-4 ring-primary/10 dark:bg-white"
    ),
  },
}

interface BrandLogoProps {
  variant?: BrandLogoVariant
  className?: string
  priority?: boolean
}

export function BrandLogo({ variant = "header", className, priority = false }: BrandLogoProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        styles.containerClassName,
        className
      )}
    >
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_LOGO_ALT}
        width={styles.width}
        height={styles.height}
        className={styles.imageClassName}
        priority={priority}
      />
    </div>
  )
}
