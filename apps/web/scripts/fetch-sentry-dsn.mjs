import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const useProduction = args.has("--production");
const envFileName = useProduction ? ".env.production" : ".env.local";
const envPath = resolve(process.cwd(), envFileName);

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((values, line) => {
      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        return values;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      values[key] = value;
      return values;
    }, {});
}

const fileValues = readEnvFile(envPath);
const authToken =
  process.env.SENTRY_AUTH_TOKEN?.trim() || fileValues.SENTRY_AUTH_TOKEN?.trim();
const org = process.env.SENTRY_ORG?.trim() || fileValues.SENTRY_ORG?.trim();
const project =
  process.env.SENTRY_PROJECT?.trim() || fileValues.SENTRY_PROJECT?.trim();
const host =
  process.env.SENTRY_URL?.trim() ||
  fileValues.SENTRY_URL?.trim() ||
  "https://sentry.io";

if (!authToken) {
  console.error("SENTRY_AUTH_TOKEN が見つかりません。");
  console.error(`${envFileName} に設定するか、環境変数で渡してください。`);
  process.exit(1);
}

if (!org || !project) {
  console.error("SENTRY_ORG と SENTRY_PROJECT が必要です。");
  console.error("Sentry の URL 例: https://sentry.io/settings/ORG/projects/PROJECT/keys/");
  process.exit(1);
}

const response = await fetch(
  `${host.replace(/\/$/, "")}/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/keys/`,
  {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  }
);

const body = await response.json().catch(() => null);

if (!response.ok) {
  console.error("Sentry API から DSN を取得できませんでした。");
  console.error(`status: ${response.status}`);
  if (body && typeof body === "object" && "detail" in body) {
    console.error(`detail: ${body.detail}`);
  }
  console.error("");
  console.error("確認すること:");
  console.error("- トークンに project:read 権限があるか");
  console.error("- SENTRY_ORG / SENTRY_PROJECT の slug が正しいか");
  process.exit(1);
}

const keys = Array.isArray(body) ? body : [];

if (keys.length === 0) {
  console.error("Client Key が 0 件です。Sentry で Client Key を作成してください。");
  process.exit(1);
}

const activeKey = keys.find((key) => key?.isActive !== false) ?? keys[0];
const dsn = typeof activeKey?.dsn?.public === "string" ? activeKey.dsn.public : "";

if (!dsn) {
  console.error("DSN を API レスポンスから読み取れませんでした。");
  process.exit(1);
}

console.log("DSN を取得しました。次を .env.production に追加してください:\n");
console.log(`SENTRY_DSN=${dsn}`);
console.log(`NEXT_PUBLIC_SENTRY_DSN=${dsn}`);
console.log(`SENTRY_ORG=${org}`);
console.log(`SENTRY_PROJECT=${project}`);
console.log("SENTRY_ENVIRONMENT=production");
console.log("NEXT_PUBLIC_SENTRY_ENVIRONMENT=production");
console.log(`SENTRY_AUTH_TOKEN=${authToken}`);
console.log("");
console.log("その後: npm run deploy:server");
