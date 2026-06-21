import type { Metadata } from 'next'
import { VerifyView } from '@/components/verify/verify-view'
import { getLabApiBase } from '@/lib/lab-api'
import type { VerifyOrderPayload } from '@/lib/verify-types'

type PageProps = {
  params: Promise<{ order_number: string }>
}

function isVerifyPayload(x: unknown): x is VerifyOrderPayload {
  if (!x || typeof x !== 'object') {
    return false
  }
  const o = x as Record<string, unknown>
  return typeof o.order_number === 'string' && Array.isArray(o.items)
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { order_number } = await params
  return {
    title: `التحقق من الطلب ${decodeURIComponent(order_number)} | مختبر التحاليل`,
    description: 'التحقق من صحة تقرير التحاليل الطبية',
  }
}

export default async function VerifyOrderPage({ params }: PageProps) {
  const { order_number: raw } = await params
  const order_number = decodeURIComponent(raw)
  const base = getLabApiBase()
  const url = `${base}/api/v1/verify/${encodeURIComponent(order_number)}`

  let res: Response
  try {
    res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch {
    return (
      <VerifyView
        mode="error"
        orderNumber={order_number}
        message="لا يمكن الاتصال بالخادم. تأكد من تشغيل واجهة الـ API وعنوان LAB_API_BASE_URL."
      />
    )
  }

  let json: unknown
  try {
    json = await res.json()
  } catch {
    return (
      <VerifyView
        mode="error"
        orderNumber={order_number}
        message="استجابة غير صالحة من الخادم."
      />
    )
  }

  if (res.status === 404) {
    return <VerifyView mode="not_found" orderNumber={order_number} />
  }

  if (!res.ok) {
    const msg =
      typeof json === 'object' &&
      json !== null &&
      'message' in json &&
      typeof (json as { message: unknown }).message === 'string'
        ? (json as { message: string }).message
        : `خطأ ${res.status}`
    return (
      <VerifyView mode="error" orderNumber={order_number} message={msg} />
    )
  }

  const data = (json as { data?: unknown }).data
  if (!isVerifyPayload(data)) {
    return (
      <VerifyView
        mode="error"
        orderNumber={order_number}
        message="بيانات التحقق غير كاملة."
      />
    )
  }

  return <VerifyView mode="ok" orderNumber={order_number} data={data} />
}
