import { z } from "zod"
// Calendar dates stay strings; do not round-trip through local/UTC timestamp conversions.
export const dateOnlySchema = z.iso.date()
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
