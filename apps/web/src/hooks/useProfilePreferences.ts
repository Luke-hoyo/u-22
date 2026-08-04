"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultDemoPreferences,
  readDemoPreferences,
  writeDemoPreferences,
  type DemoPreferences
} from "@/lib/demo-user-state";

type ProfileSource = "appwrite" | "local" | "loading";

export function useProfilePreferences() {
  const [preferences, setPreferences] = useState<DemoPreferences>(defaultDemoPreferences);
  const [source, setSource] = useState<ProfileSource>("loading");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/profile", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as {
          preferences?: DemoPreferences | null;
        };

        if (data.preferences) {
          setPreferences(data.preferences);
          setSource("appwrite");
          return;
        }

        const localPreferences = readDemoPreferences();
        const hasLocalData =
          localPreferences.birthDate ||
          localPreferences.address ||
          localPreferences.workStyle;

        if (hasLocalData) {
          const migrateResponse = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localPreferences)
          });

          if (migrateResponse.ok) {
            const migrated = (await migrateResponse.json()) as {
              preferences?: DemoPreferences;
            };
            setPreferences(migrated.preferences ?? localPreferences);
            setSource("appwrite");
            return;
          }
        }

        setPreferences(defaultDemoPreferences);
        setSource("appwrite");
        return;
      }

      if (response.status === 503) {
        setPreferences(readDemoPreferences());
        setSource("local");
        return;
      }
    } catch {
      // fall through
    } finally {
      setIsLoading(false);
    }

    setPreferences(readDemoPreferences());
    setSource("local");
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (nextPreferences: DemoPreferences) => {
    setErrorMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextPreferences)
      });

      if (response.ok) {
        const data = (await response.json()) as { preferences?: DemoPreferences };
        const saved = data.preferences ?? nextPreferences;
        setPreferences(saved);
        setSource("appwrite");
        return { ok: true as const, preferences: saved };
      }

      if (response.status === 503) {
        writeDemoPreferences(nextPreferences);
        setPreferences(nextPreferences);
        setSource("local");
        return { ok: true as const, preferences: nextPreferences, offline: true as const };
      }

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      const message = data?.message ?? "プロフィールを保存できませんでした。";
      setErrorMessage(message);
      return { ok: false as const, message };
    } catch {
      setErrorMessage("プロフィールを保存できませんでした。");
      return { ok: false as const, message: "プロフィールを保存できませんでした。" };
    }
  }, []);

  return {
    preferences,
    source,
    isLoading,
    errorMessage,
    setErrorMessage,
    reload,
    save
  };
}
