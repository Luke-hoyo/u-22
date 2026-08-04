"use client";

import { useCallback, useEffect, useState } from "react";
import { communityEvents } from "@/lib/app-data";

type CommunityEvent = (typeof communityEvents)[number];
type EventsSource = "appwrite" | "seed" | "loading";

export function useCommunityEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>(communityEvents);
  const [source, setSource] = useState<EventsSource>("loading");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/events", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as {
          events?: CommunityEvent[];
          source?: "appwrite" | "seed";
        };

        setEvents(Array.isArray(data.events) && data.events.length > 0 ? data.events : communityEvents);
        setSource(data.source === "appwrite" ? "appwrite" : "seed");
        return;
      }
    } catch {
      // fall through
    } finally {
      setIsLoading(false);
    }

    setEvents(communityEvents);
    setSource("seed");
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    events,
    source,
    isLoading,
    reload
  };
}
