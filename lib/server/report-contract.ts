import "server-only"
import { serviceReportSchema } from "@/lib/schemas/service-report"
// Both create/update receive the complete form. Unknown fields (including id,
// createdAt, updatedAt) are stripped by Zod; never spread raw input into a row.
export function parseReportReplacement(input: unknown) {
  const { tanggal, jenisKebaktian, ...data } = serviceReportSchema.parse(input)
  return { tanggal, jenisKebaktian, data }
}
