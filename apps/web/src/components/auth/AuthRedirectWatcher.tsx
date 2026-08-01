"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthRedirectWatcher({ to = "/dashboard" }: { to?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    router.replace(to);
    router.refresh();
  }, [isLoaded, isSignedIn, router, to]);

  return null;
}
