type SessionClaims = Record<string, unknown> | null | undefined;

const emailClaimKeys = [
  "email",
  "email_address",
  "emailAddress",
  "primary_email",
  "primaryEmailAddress",
  "primary_email_address"
];

function splitEnvList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isDeveloperLockEnabled() {
  return process.env.HATARAKUN_DEVELOPER_LOCK === "true";
}

export function getAllowedDeveloperUserIds() {
  return splitEnvList(process.env.HATARAKUN_DEVELOPER_USER_IDS);
}

export function getAllowedDeveloperEmails() {
  return splitEnvList(process.env.HATARAKUN_DEVELOPER_EMAILS).map(normalizeEmail);
}

function getEmailClaims(sessionClaims: SessionClaims) {
  if (!sessionClaims) {
    return [];
  }

  return emailClaimKeys
    .map((key) => sessionClaims[key])
    .filter((value): value is string => typeof value === "string")
    .map(normalizeEmail);
}

export function hasDeveloperAccess({
  sessionClaims,
  userId
}: {
  sessionClaims: SessionClaims;
  userId: string | null | undefined;
}) {
  if (!isDeveloperLockEnabled()) {
    return true;
  }

  const allowedUserIds = getAllowedDeveloperUserIds();
  const allowedEmails = getAllowedDeveloperEmails();

  if (userId && allowedUserIds.includes(userId)) {
    return true;
  }

  const sessionEmails = getEmailClaims(sessionClaims);
  return sessionEmails.some((email) => allowedEmails.includes(email));
}
