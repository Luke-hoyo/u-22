import { userRoles, type UserRole } from "@/lib/access-control";

function readBooleanEnv(value: string | undefined) {
  return value === "true" || value === "1";
}

export function isDemoAuthEnabled() {
  return (
    readBooleanEnv(process.env.HATARAKUN_DEMO_AUTH) ||
    readBooleanEnv(process.env.NEXT_PUBLIC_HATARAKUN_DEMO_AUTH)
  );
}

export function getDemoUserRole(): UserRole {
  const role = process.env.HATARAKUN_DEMO_ROLE ?? process.env.NEXT_PUBLIC_HATARAKUN_DEMO_ROLE;

  if (typeof role === "string" && userRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return "operator";
}

export function getDemoDisplayName() {
  return process.env.HATARAKUN_DEMO_DISPLAY_NAME ?? "デモ運営";
}
