export const userRoles = ["young_user", "farmer", "municipality", "operator"] as const;

export type UserRole = (typeof userRoles)[number];

export const roleLabels: Record<UserRole, string> = {
  young_user: "若者ユーザー",
  farmer: "農家・事業者",
  municipality: "自治体",
  operator: "運営"
};

export const adminRoles: readonly UserRole[] = ["farmer", "municipality", "operator"];

type Metadata = Record<string, unknown> | null | undefined;

export function getUserRole(metadata: Metadata): UserRole {
  const role = metadata?.role;

  if (typeof role === "string" && userRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return "young_user";
}

export function canAccessAdmin(role: UserRole) {
  return adminRoles.includes(role);
}
