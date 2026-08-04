"use client";

import { useCallback, useEffect, useState } from "react";
import { applications as seedApplications, type Application } from "@/lib/app-data";
import { hasSavedApplication, readSavedApplications, saveJobApplication } from "@/lib/demo-user-state";

type ApplicationsSource = "appwrite" | "local" | "seed" | "loading";

function sortByStatusPriority(items: Application[]) {
  const priority: Record<Application["status"], number> = {
    interview: 0,
    matched: 1,
    working: 2,
    applied: 3
  };

  return [...items].sort((left, right) => priority[left.status] - priority[right.status]);
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [source, setSource] = useState<ApplicationsSource>("loading");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/applications", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as { applications?: Application[] };
        const serverApplications = Array.isArray(data.applications) ? data.applications : [];
        setApplications(serverApplications);
        setSource("appwrite");
        return;
      }

      if (response.status === 503) {
        const localApplications = readSavedApplications();
        setApplications(localApplications.length > 0 ? localApplications : seedApplications);
        setSource(localApplications.length > 0 ? "local" : "seed");
        return;
      }
    } catch {
      // fall through
    } finally {
      setIsLoading(false);
    }

    const localApplications = readSavedApplications();
    setApplications(localApplications.length > 0 ? localApplications : seedApplications);
    setSource(localApplications.length > 0 ? "local" : "seed");
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    applications,
    primaryApplication: sortByStatusPriority(applications)[0] ?? null,
    source,
    isLoading,
    reload
  };
}

export async function applyToJob(jobId: string, expectedSupport: number) {
  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, expectedSupport })
    });

    if (response.ok) {
      const data = (await response.json()) as { application?: Application };
      return {
        ok: true as const,
        application: data.application ?? null,
        source: "appwrite" as const
      };
    }

    if (response.status === 503) {
      const application = saveJobApplication(jobId, expectedSupport);
      return { ok: true as const, application, source: "local" as const };
    }

    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    return {
      ok: false as const,
      message: data?.message ?? "応募内容を保存できませんでした。"
    };
  } catch {
    if (hasSavedApplication(jobId)) {
      return { ok: true as const, application: null, source: "local" as const };
    }

    const application = saveJobApplication(jobId, expectedSupport);
    return { ok: true as const, application, source: "local" as const };
  }
}
