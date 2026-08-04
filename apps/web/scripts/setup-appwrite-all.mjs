import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const scripts = [
  "setup-appwrite-users.mjs",
  "migrate-appwrite-users-profile.mjs",
  "migrate-appwrite-users-extras.mjs",
  "migrate-appwrite-jobs-admin.mjs",
  "migrate-appwrite-applications-admin.mjs",
  "migrate-appwrite-point-transactions-admin.mjs",
  "setup-appwrite-applications.mjs",
  "setup-appwrite-point-transactions.mjs",
  "setup-appwrite-farmer-applications.mjs",
  "setup-appwrite-events.mjs"
];

for (const script of scripts) {
  const scriptPath = path.join(scriptsDir, script);
  console.log(`\n==> ${script}`);

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: path.join(scriptsDir, ".."),
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${script} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

console.log("\nAppwrite table setup completed.");
