/**
 * حفظ PDF عبر واجهة المتصفح الأصلية (Chrome/Edge: «حفظ باسم»).
 * لا يمرّ الطلب كتنزيل HTTP في شريط التنزيلات، فيتجاوز غالباً اعتراض Internet Download Manager.
 *
 * @returns `saved` تم الحفظ | `cancelled` ألغى المستخدم النافذة | `use_fallback` استخدم الرابط البرمجي
 */
export async function savePdfBlobWithBrowserPicker(
  blob: Blob,
  suggestedName: string
): Promise<"saved" | "cancelled" | "use_fallback"> {
  if (typeof window === "undefined") return "use_fallback"

  const picker = (
    window as Window & {
      showSaveFilePicker?: (options: {
        suggestedName?: string
        types?: Array<{
          description: string
          accept: Record<string, string[]>
        }>
      }) => Promise<FileSystemFileHandle>
    }
  ).showSaveFilePicker

  if (typeof picker !== "function") {
    return "use_fallback"
  }

  try {
    const handle = await picker.call(window, {
      suggestedName,
      types: [
        {
          description: "PDF",
          accept: { "application/pdf": [".pdf"] },
        },
      ],
    })
    const writable = await handle.createWritable()
    await writable.write(await blob.arrayBuffer())
    await writable.close()
    return "saved"
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return "cancelled"
    }
    return "use_fallback"
  }
}
