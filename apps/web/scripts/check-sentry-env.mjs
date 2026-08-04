import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const useProduction = args.has("--production");
const envFileName = useProduction ? ".env.production" : ".env.local";
const envPath = resolve(process.cwd(), envFileName);

function readEnvFile(path) {
  if (!existsSync(path)) {
    return null;
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

function hasValue(values, key) {
  return Boolean(values?.[key]?.trim());
}

const fileValues = readEnvFile(envPath) ?? {};
const values = {
  ...fileValues,
  SENTRY_DSN: process.env.SENTRY_DSN ?? fileValues.SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN:
    process.env.NEXT_PUBLIC_SENTRY_DSN ?? fileValues.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ORG: process.env.SENTRY_ORG ?? fileValues.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT ?? fileValues.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN ?? fileValues.SENTRY_AUTH_TOKEN,
  SENTRY_ENVIRONMENT:
    process.env.SENTRY_ENVIRONMENT ?? fileValues.SENTRY_ENVIRONMENT,
  NEXT_PUBLIC_SENTRY_ENVIRONMENT:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    fileValues.NEXT_PUBLIC_SENTRY_ENVIRONMENT
};

const enabled = hasValue(values, "SENTRY_DSN") || hasValue(values, "NEXT_PUBLIC_SENTRY_DSN");

if (!enabled) {
  console.log(`Sentry: disabled (${envFileName} に DSN がありません)`);
  process.exit(0);
}

const requiredWhenEnabled = ["NEXT_PUBLIC_SENTRY_DSN", "SENTRY_DSN", "SENTRY_ORG", "SENTRY_PROJECT"];
const missing = requiredWhenEnabled.filter((key) => !hasValue(values, key));

console.log(`Sentry: enabled (${envFileName})`);
console.log(`- environment: ${values.SENTRY_ENVIRONMENT || values.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "production"}`);
console.log(`- org/project: ${values.SENTRY_ORG || "?"} / ${values.SENTRY_PROJECT || "?"}`);
console.log(
  `- source maps upload: ${hasValue(values, "SENTRY_AUTH_TOKEN") ? "configured" : "skipped (SENTRY_AUTH_TOKEN なし)"}`
);

if (missing.length > 0) {
  console.error("");
  console.error("不足しているキー:");
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error("");
  console.error("NEXT_PUBLIC_SENTRY_DSN はビルド前に必須です（クライアントエラー送信用）。");
  process.exit(1);
}

console.log("");
console.log("設定は問題なさそうです。デプロイ後に次を確認してください:");
console.log("  curl https://hatarukun.jp/api/health/sentry");
console.log("  運営ダッシュボード > エラー監視（Sentry）> 接続テストを送る");
