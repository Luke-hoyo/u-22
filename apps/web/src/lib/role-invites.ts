import { createHash, createHmac, timingSafeEqual } from "crypto";
import { type UserRole } from "./access-control";

type RoleInvite = {
  role: UserRole;
  label: string;
  publicMetadata: Record<string, string>;
};

export type FarmerInviteInput = {
  applicationId: string;
  farmName: string;
  email: string;
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

export function resolveRoleInvite(inviteCode: string, userEmail?: string | null): RoleInvite | null {
  const normalizedCode = inviteCode.trim();

  if (!normalizedCode) {
    return null;
  }

  const signedFarmerInvite = resolveSignedFarmerInvite(normalizedCode, userEmail);

  if (signedFarmerInvite) {
    return signedFarmerInvite;
  }

  const match = roleInvites.find(({ envKey }) => process.env[envKey] === normalizedCode);

  return match?.invite ?? null;
}

function getInviteSigningSecret() {
  return process.env.HATARAKUN_INVITE_SIGNING_SECRET;
}

function normalizeInvitePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}

function getEmailHash(email: string) {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 12);
}

function getOrganizationId(applicationId: string) {
  return `farm_${normalizeInvitePart(applicationId).replaceAll("-", "_")}`;
}

function signInvitePayload(payload: string) {
  const secret = getInviteSigningSecret();

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret).update(payload).digest("base64url").slice(0, 18);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function canUseSignedInvites() {
  return Boolean(getInviteSigningSecret());
}

export function createFarmerInviteCode(input: FarmerInviteInput) {
  const applicationId = normalizeInvitePart(input.applicationId);
  const emailHash = getEmailHash(input.email);
  const payload = `${applicationId}.${emailHash}`;
  const signature = signInvitePayload(payload);

  if (!signature) {
    return null;
  }

  return `farmer-${payload}.${signature}`;
}

function resolveSignedFarmerInvite(inviteCode: string, userEmail?: string | null): RoleInvite | null {
  const match = inviteCode.match(/^farmer-([a-z0-9-]+)\.([a-f0-9]{12})\.([A-Za-z0-9_-]{18})$/);

  if (!match || !userEmail) {
    return null;
  }

  const [, applicationId, emailHash, signature] = match;
  const payload = `${applicationId}.${emailHash}`;
  const expectedSignature = signInvitePayload(payload);

  if (!expectedSignature || !safeEqual(signature, expectedSignature)) {
    return null;
  }

  if (!safeEqual(emailHash, getEmailHash(userEmail))) {
    return null;
  }

  return {
    role: "farmer",
    label: "農家・事業者アカウント",
    publicMetadata: {
      organizationId: getOrganizationId(applicationId),
      farmerApplicationId: applicationId
    }
  };
}
