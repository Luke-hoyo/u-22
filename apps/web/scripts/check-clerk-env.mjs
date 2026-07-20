import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const requiredKeys = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];

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

const localEnv = readEnvFile(envPath);
const missingKeys = requiredKeys.filter((key) => !(process.env[key] || localEnv[key]));

if (missingKeys.length > 0) {
  console.error("Clerkの初期キーが未設定です。");
  console.error("apps/web/.env.example を参考に apps/web/.env.local を作成してください。");
  console.error(`不足しているキー: ${missingKeys.join(", ")}`);
  process.exit(1);
}
