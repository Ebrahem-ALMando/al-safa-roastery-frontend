/**
 * Reference Range Status Resolver
 * Handles advanced logic for laboratory test reference ranges.
 */

export type ResultStatus = "normal" | "low" | "high" | "critical" | "abnormal" | "pending" | "invalid";

export interface ReferenceRangeAnalysis {
  status: ResultStatus;
  message?: string;
}

/**
 * Parses a reference range string and compares it with the result value.
 * Supports:
 * - Numeric ranges: "70-100", "70 - 100", "70 to 100"
 * - Comparison: "> 50", "< 10", ">= 20", "<= 5"
 * - Qualitative: "سلبي", "إيجابي", "negative", "positive"
 * - Multiple (Basic): "M: 13-17, F: 12-15" (Simple split for now)
 */
export function resolveReferenceRange(
  value: string | number,
  referenceRange: string,
  resultType: "number" | "select" | "text" = "number"
): ReferenceRangeAnalysis {
  if (!value || String(value).trim() === "") {
    return { status: "pending" };
  }

  const cleanRef = referenceRange.trim();
  const stringValue = String(value).trim();

  // 1. Qualitative / Text / Select Match
  if (resultType === "select" || resultType === "text") {
    const isNegative = /سلبي|negative|non-reactive|غير تفاعلي/i.test(stringValue);
    const refIsNegative = /سلبي|negative|non-reactive|غير تفاعلي/i.test(cleanRef);

    if (refIsNegative) {
      return isNegative ? { status: "normal" } : { status: "abnormal", message: "النتيجة خارج المعدل الطبيعي (إيجابية)" };
    }
    
    // Exact match fallback
    if (stringValue.toLowerCase() === cleanRef.toLowerCase()) {
      return { status: "normal" };
    }
    
    return { status: "abnormal" };
  }

  // 2. Numeric Analysis
  const numValue = parseFloat(stringValue);
  if (isNaN(numValue)) {
    return { status: "invalid", message: "قيمة غير رقمية" };
  }

  // Case: Greater than (e.g., "> 50")
  const gtMatch = cleanRef.match(/^>\s*(\d*\.?\d+)$/);
  if (gtMatch) {
    const threshold = parseFloat(gtMatch[1]);
    return numValue > threshold ? { status: "normal" } : { status: "low", message: `أقل من الحد الأدنى (${threshold})` };
  }

  // Case: Greater than or equal (e.g., ">= 50")
  const gteMatch = cleanRef.match(/^>=\s*(\d*\.?\d+)$/);
  if (gteMatch) {
    const threshold = parseFloat(gteMatch[1]);
    return numValue >= threshold ? { status: "normal" } : { status: "low", message: `أقل من الحد الأدنى (${threshold})` };
  }

  // Case: Less than (e.g., "< 10")
  const ltMatch = cleanRef.match(/^<\s*(\d*\.?\d+)$/);
  if (ltMatch) {
    const threshold = parseFloat(ltMatch[1]);
    return numValue < threshold ? { status: "normal" } : { status: "high", message: `أعلى من الحد الأقصى (${threshold})` };
  }

  // Case: Less than or equal (e.g., "<= 10")
  const lteMatch = cleanRef.match(/^<=\s*(\d*\.?\d+)$/);
  if (lteMatch) {
    const threshold = parseFloat(lteMatch[1]);
    return numValue <= threshold ? { status: "normal" } : { status: "high", message: `أعلى من الحد الأقصى (${threshold})` };
  }

  // Case: Range (e.g., "70-100", "70 - 100", "70 to 100")
  const rangeMatch = cleanRef.match(/^(\d*\.?\d+)\s*(-|–|—|to|إلى)\s*(\d*\.?\d+)$/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[3]);
    if (numValue < min) return { status: "low", message: `أقل من الطبيعي (${min})` };
    if (numValue > max) return { status: "high", message: `أعلى من الطبيعي (${max})` };
    return { status: "normal" };
  }

  // 3. Fallback for mixed/complex strings (best effort)
  if (cleanRef.toLowerCase().includes(stringValue.toLowerCase())) {
    return { status: "normal" };
  }

  return { status: "abnormal", message: "خارج النطاق المرجعي" };
}
