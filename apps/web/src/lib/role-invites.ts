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

export type RoleInviteResolution =
  | { ok: true; invite: RoleInvite }
  | {
      ok: false;
      reason: "empty" | "invalid" | "email_mismatch" | "email_required";
    };

/**
 * Shared env codes are only for staff roles (municipality / operator).
 * Business-operator (farmer) access must use email-bound signed invites —
 * a leaked shared farmer code would otherwise let anyone in.
 */
const staffRoleInvites: { envKey: string; invite: RoleInvite }[] = [
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
  const result = resolveRoleInviteDetailed(inviteCode, userEmail);
  return result.ok ? result.invite : null;
}

export function resolveRoleInviteDetailed(
  inviteCode: string,
  userEmail?: string | null
): RoleInviteResolution {
  const normalizedCode = inviteCode.trim();

  if (!normalizedCode) {
    return { ok: false, reason: "empty" };
  }

  const signedFarmerInvite = resolveSignedFarmerInvite(normalizedCode, userEmail);

  if (signedFarmerInvite.ok || signedFarmerInvite.reason !== "invalid") {
    return signedFarmerInvite;
  }

  const match = staffRoleInvites.find(({ envKey }) => process.env[envKey] === normalizedCode);

  if (match) {
    return { ok: true, invite: match.invite };
  }

  return { ok: false, reason: "invalid" };
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

function resolveSignedFarmerInvite(
  inviteCode: string,
  userEmail?: string | null
): RoleInviteResolution {
  const match = inviteCode.match(/^farmer-([a-z0-9-]+)\.([a-f0-9]{12})\.([A-Za-z0-9_-]{18})$/);

  if (!match) {
    return { ok: false, reason: "invalid" };
  }

  if (!userEmail) {
    return { ok: false, reason: "email_required" };
  }

  const [, applicationId, emailHash, signature] = match;
  const payload = `${applicationId}.${emailHash}`;
  const expectedSignature = signInvitePayload(payload);

  if (!expectedSignature || !safeEqual(signature, expectedSignature)) {
    return { ok: false, reason: "invalid" };
  }

  if (!safeEqual(emailHash, getEmailHash(userEmail))) {
    return { ok: false, reason: "email_mismatch" };
  }

  return {
    ok: true,
    invite: {
      role: "farmer",
      label: "事業者アカウント",
      publicMetadata: {
        organizationId: getOrganizationId(applicationId),
        farmerApplicationId: applicationId
      }
    }
  };
}

export function getRoleInviteErrorMessage(
  reason: "empty" | "invalid" | "email_mismatch" | "email_required"
) {
  switch (reason) {
    case "empty":
      return "招待コードを入力してください。";
    case "email_required":
      return "事業者向け招待コードを使うには、メールアドレス付きのアカウントでログインしてください。";
    case "email_mismatch":
      return "この招待コードは、申請時のメールアドレスでログインしたアカウントでのみ使えます。";
    case "invalid":
    default:
      return "招待コードが正しくありません。";
  }
}
