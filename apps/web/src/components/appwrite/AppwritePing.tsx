"use client";

import { useEffect } from "react";
import { client } from "@/lib/appwrite/client";

export function AppwritePing() {
  useEffect(() => {
    let active = true;

    async function pingAppwrite() {
      try {
        await client.ping();

        if (active) {
          window.dispatchEvent(
            new CustomEvent("hatarukun:appwrite-ping", {
              detail: { ok: true, checkedAt: new Date().toISOString() }
            })
          );
        }
      } catch (error) {
        if (active) {
          window.dispatchEvent(
            new CustomEvent("hatarukun:appwrite-ping", {
              detail: {
                ok: false,
                checkedAt: new Date().toISOString(),
                message: error instanceof Error ? error.message : "Appwrite ping failed"
              }
            })
          );
        }
      }
    }

    void pingAppwrite();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
