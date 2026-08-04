"use client";

import { useCallback, useEffect, useState } from "react";
import { readFavoriteJobIds, toggleFavoriteJob } from "@/lib/demo-user-state";

type FavoriteSource = "appwrite" | "local" | "loading";

export function useFavoriteJobs() {
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [source, setSource] = useState<FavoriteSource>("loading");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/favorites", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as { jobIds?: string[] };
        setJobIds(Array.isArray(data.jobIds) ? data.jobIds : []);
        setSource("appwrite");
        return;
      }

      if (response.status === 503) {
        setJobIds(readFavoriteJobIds());
        setSource("local");
        return;
      }
    } catch {
      // fall through
    } finally {
      setIsLoading(false);
    }

    setJobIds(readFavoriteJobIds());
    setSource("local");
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggle = useCallback(async (jobId: string) => {
    try {
      const response = await fetch("/api/profile/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      if (response.ok) {
        const data = (await response.json()) as { jobIds?: string[] };
        const nextJobIds = Array.isArray(data.jobIds) ? data.jobIds : [];
        setJobIds(nextJobIds);
        setSource("appwrite");
        return nextJobIds.includes(jobId);
      }

      if (response.status === 503) {
        const nextJobIds = toggleFavoriteJob(jobId);
        setJobIds(nextJobIds);
        setSource("local");
        return nextJobIds.includes(jobId);
      }
    } catch {
      const nextJobIds = toggleFavoriteJob(jobId);
      setJobIds(nextJobIds);
      setSource("local");
      return nextJobIds.includes(jobId);
    }

    return jobIds.includes(jobId);
  }, [jobIds]);

  return {
    jobIds,
    source,
    isLoading,
    isFavorite: (jobId: string) => jobIds.includes(jobId),
    toggle,
    reload
  };
}
