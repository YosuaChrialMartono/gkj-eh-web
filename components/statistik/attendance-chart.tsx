"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { ServiceReport } from "@/types";

interface AttendanceChartProps {
  reports: ServiceReport[];
}

export function AttendanceChart({ reports }: AttendanceChartProps) {
  const data = reports.map((r) => ({
    tanggal: new Date(r.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    Umum: r.kehadiranJemaat.umum.pria + r.kehadiranJemaat.umum.wanita,
    Pemuda: r.kehadiranJemaat.pemuda.pria + r.kehadiranJemaat.pemuda.wanita,
    Remaja: r.kehadiranJemaat.remaja.pria + r.kehadiranJemaat.remaja.wanita,
    Anak: r.kehadiranJemaat.anak.pria + r.kehadiranJemaat.anak.wanita,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Umum" stackId="a" fill="#3f3f46" />
        <Bar dataKey="Pemuda" stackId="a" fill="#71717a" />
        <Bar dataKey="Remaja" stackId="a" fill="#a1a1aa" />
        <Bar dataKey="Anak" stackId="a" fill="#d4d4d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
