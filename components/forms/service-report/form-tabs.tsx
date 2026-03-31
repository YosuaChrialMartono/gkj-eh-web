"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TabInfo } from "./tab-info";
import { TabPersembahan } from "./tab-persembahan";
import { TabKehadiran } from "./tab-kehadiran";
import { TabPetugas } from "./tab-petugas";
import { TabEvaluasi } from "./tab-evaluasi";
import { serviceReportSchema, type ServiceReportFormValues } from "@/lib/schemas/service-report";
import { defaultFormValues, reportToFormValues } from "@/lib/form-defaults";
import { createReport, updateReport } from "@/lib/api/client";
import type { ServiceReport } from "@/types";

const TABS = [
  { id: "info", label: "Info Kebaktian" },
  { id: "persembahan", label: "Persembahan" },
  { id: "kehadiran", label: "Kehadiran" },
  { id: "petugas", label: "Petugas" },
  { id: "evaluasi", label: "Evaluasi & TTD" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ServiceReportFormProps {
  /** Existing report for edit mode; omit for create mode */
  report?: ServiceReport;
  members: string[];
}

export function ServiceReportForm({ report, members }: ServiceReportFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ServiceReportFormValues>({
    resolver: zodResolver(serviceReportSchema),
    defaultValues: report
      ? reportToFormValues(report as unknown as Record<string, unknown>)
      : defaultFormValues(),
    mode: "onBlur",
  });

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);

  function goNext() {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
    }
  }

  function goPrev() {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id);
    }
  }

  async function onSubmit(data: ServiceReportFormValues) {
    setSaving(true);
    setError(null);
    try {
      if (report) {
        await updateReport(report.id, data);
      } else {
        await createReport(data);
      }
      router.push("/laporan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          <TabsList className="mb-6">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="info">
            <TabInfo />
          </TabsContent>
          <TabsContent value="persembahan">
            <TabPersembahan />
          </TabsContent>
          <TabsContent value="kehadiran">
            <TabKehadiran />
          </TabsContent>
          <TabsContent value="petugas">
            <TabPetugas members={members} />
          </TabsContent>
          <TabsContent value="evaluasi">
            <TabEvaluasi />
          </TabsContent>
        </Tabs>

        {/* Navigation + submit */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <Button
            type="button"
            variant="secondary"
            onClick={goPrev}
            disabled={currentTabIndex === 0}
          >
            ← Sebelumnya
          </Button>

          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-500">{error}</p>}

            {currentTabIndex < TABS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Berikutnya →
              </Button>
            ) : (
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : report ? "Simpan Perubahan" : "Simpan Laporan"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
