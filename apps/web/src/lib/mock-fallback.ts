import { isDemoAuthEnabled } from "@/lib/demo-auth";

export function shouldUseMockFallback() {
  return isDemoAuthEnabled() || process.env.NODE_ENV !== "production";
}
