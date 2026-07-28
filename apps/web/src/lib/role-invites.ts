import { type UserRole } from "./access-control";

type RoleInvite = {
  role: UserRole;
  label: string;
  publicMetadata: Record<string, string>;
};

const roleInvites: { envKey: string; invite: RoleInvite }[] = [
  {
    envKey: "HATARAKUN_FARMER_INVITE_CODE",
    invite: {
      role: "farmer",
      label: "農家・事業者アカウント",
      publicMetadata: {
        organizationId: "farm_minori"
      }
    }
  },
  {
    envKey: "HATARAKUN_MUNICIPALITY_INVITE_CODE",
    invite: {
      role: "municipality",
      label: "自治体アカウント",
      publicMetadata: {
        regionCode: "34212"
      }
    }
  },
  {
    envKey: "HATARAKUN_OPERATOR_INVITE_CODE",
    invite: {
      role: "operator",
      label: "運営アカウント",
      publicMetadata: {}
    }
  }
];

export function resolveRoleInvite(inviteCode: string): RoleInvite | null {
  const normalizedCode = inviteCode.trim();

  if (!normalizedCode) {
    return null;
  }

  const match = roleInvites.find(({ envKey }) => process.env[envKey] === normalizedCode);

  return match?.invite ?? null;
}
