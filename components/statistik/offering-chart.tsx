"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ServiceReport } from "@/types";

interface OfferingChartProps {
  reports: ServiceReport[];
}

function formatRpShort(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return String(v);
}

export function OfferingChart({ reports }: OfferingChartProps) {
  const data = reports.map((r) => ({
    tanggal: new Date(r.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    "Total Persembahan": r.persembahan.jumlah,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatRpShort} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(v) => {
            const n = typeof v === "number" ? v : Number(v);
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(n);
          }}
        />
        <Line
          type="monotone"
          dataKey="Total Persembahan"
          stroke="#3f3f46"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
