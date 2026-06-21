import { Skeleton } from '@/components/ui/skeleton'
import { VerifyHeader } from '@/components/verify/verify-header'

export default function VerifyLoading() {
  return (
    <div className="min-h-screen bg-background">
      <VerifyHeader />
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Skeleton className="h-1 w-full rounded-none bg-primary/40" />
          <div className="border-b border-border p-4">
            <div className="flex gap-3">
              <Skeleton className="size-11 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="ms-auto h-2.5 w-32" />
                <Skeleton className="ms-auto h-5 w-full max-w-md" />
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <Skeleton className="h-16 w-full rounded-md" />
            <div className="grid gap-3 md:grid-cols-[1fr_11rem]">
              <Skeleton className="h-28 rounded-md" />
              <Skeleton className="h-28 rounded-md" />
            </div>
            <Skeleton className="h-40 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
