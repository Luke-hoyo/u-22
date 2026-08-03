"use client";

import { useCallback, useEffect, useState } from "react";
import { applications as seedApplications, type Application } from "@/lib/app-data";
import { readSavedApplications } from "@/lib/demo-user-state";

type ApplicationsSource = "appwrite" | "local" | "seed" | "loading";

function mergeApplications(primary: Application[], secondary: Application[]) {
  const merged = new Map<string, Application>();

  for (const application of secondary) {
    merged.set(application.id, application);
  }

  for (const application of primary) {
    merged.set(application.id, application);
  }

  return Array.from(merged.values()).sort((left, right) => {
    const leftTime = Date.parse(left.appliedAt);
    const rightTime = Date.parse(right.appliedAt);

    if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
      return rightTime - leftTime;
    }

    return 0;
  });
}

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
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [source, setSource] = useState<ApplicationsSource>("loading");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/applications", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as { applications?: Application[] };
        const serverApplications = Array.isArray(data.applications) ? data.applications : [];
        const localApplications = readSavedApplications();
        const nextApplications =
          serverApplications.length > 0
            ? mergeApplications(serverApplications, localApplications)
            : localApplications.length > 0
              ? localApplications
              : seedApplications;

        setApplications(nextApplications);
        setSource(serverApplications.length > 0 ? "appwrite" : localApplications.length > 0 ? "local" : "seed");
        return;
      }
    } catch {
      // fall through to local/seed
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
