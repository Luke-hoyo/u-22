import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client, TablesDB } from "node-appwrite";

const envPath = resolve(process.cwd(), ".env.local");
const requiredKeys = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_TABLE_ID_JOBS"
];

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
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      values[key] = value;
      return values;
    }, {});
}

function readConfig() {
  const localEnv = readEnvFile(envPath);
  const getValue = (key) => process.env[key] || localEnv[key] || "";
  const missingKeys = requiredKeys.filter((key) => !getValue(key));

  if (missingKeys.length > 0) {
    throw new Error(`Appwriteの設定が不足しています: ${missingKeys.join(", ")}`);
  }

  return {
    endpoint: getValue("NEXT_PUBLIC_APPWRITE_ENDPOINT"),
    projectId: getValue("NEXT_PUBLIC_APPWRITE_PROJECT_ID"),
    apiKey: getValue("APPWRITE_API_KEY"),
    databaseId: getValue("APPWRITE_DATABASE_ID"),
    jobsTableId: getValue("APPWRITE_TABLE_ID_JOBS")
  };
}

function toRowData(job) {
  return {
    title: job.title,
    organization: job.organization,
    industry: job.industry,
    region: job.region,
    area: job.area,
    monthlySalary: job.monthlySalary,
    monthlySupport: job.monthlySupport,
    matchRate: job.matchRate,
    periodMonths: job.periodMonths.join(","),
    housingSupport: job.housingSupport,
    training: job.training,
    tags: job.tags.join(","),
    summary: job.summary,
    description: job.description,
    duties: job.duties.join(","),
    schedule: job.schedule,
    image: job.image ?? "",
    status: "published",
    capacity: 3
  };
}

async function main() {
  const config = readConfig();
  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);
  const tablesDB = new TablesDB(client);
  const { jobs } = await import("../src/lib/app-data.ts");

  for (const job of jobs) {
    await tablesDB.upsertRow({
      databaseId: config.databaseId,
      tableId: config.jobsTableId,
      rowId: job.id,
      data: toRowData(job)
    });
    console.log(`seeded: ${job.id}`);
  }

  console.log(`Appwrite jobs seed complete: ${jobs.length} rows`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Appwrite seed failed.");
  process.exit(1);
});
