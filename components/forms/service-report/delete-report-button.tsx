"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReport } from "@/lib/server/reports/actions";

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm("Hapus laporan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setBusy(true);
    try {
      const result = await deleteReport(id);
      if (!result.ok) throw new Error(result.error.message);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal menghapus laporan.");
    } finally { setBusy(false); }
  }
  return <button type="button" onClick={remove} disabled={busy} className="text-red-600 hover:text-red-800 disabled:opacity-50">{busy ? "Menghapus…" : "Hapus"}</button>;
}
