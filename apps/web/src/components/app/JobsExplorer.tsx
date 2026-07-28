"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  industryLabels,
  jobs as mockJobs,
  type Industry,
  type Job
} from "@/lib/app-data";
import { JobCard } from "./JobCard";
import styles from "./ProductUI.module.css";

type IndustryFilter = "all" | Industry;

const industries: { value: IndustryFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "agriculture", label: industryLabels.agriculture },
  { value: "forestry", label: industryLabels.forestry },
  { value: "fishery", label: industryLabels.fishery }
];

export function JobsExplorer() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [region, setRegion] = useState("all");
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [dataSource, setDataSource] = useState<"appwrite" | "mock">("mock");
  const [sourceMessage, setSourceMessage] = useState("モック求人を表示しています。");

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const response = await fetch("/api/appwrite/jobs", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("求人APIを読み込めませんでした。");
        }

        const result = (await response.json()) as {
          source: "appwrite" | "mock";
          reason?: string;
          jobs: Job[];
        };

        if (!active) {
          return;
        }

        setJobs(result.jobs);
        setDataSource(result.source);
        setSourceMessage(
          result.source === "appwrite"
            ? "Appwrite TablesDBから求人を取得しています。"
            : result.reason ?? "モック求人を表示しています。"
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setJobs(mockJobs);
        setDataSource("mock");
        setSourceMessage(
          error instanceof Error
            ? `Appwrite接続確認に失敗したため、モック求人を表示しています: ${error.message}`
            : "Appwrite接続確認に失敗したため、モック求人を表示しています。"
        );
      }
    }

    void loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const regions = Array.from(new Set(jobs.map((job) => job.region)));
  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesIndustry = industry === "all" || job.industry === industry;
      const matchesRegion = region === "all" || job.region === region;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [job.title, job.organization, job.region, job.area, ...job.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesIndustry && matchesRegion && matchesQuery;
    });
  }, [industry, jobs, query, region]);

  return (
    <>
      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <Search aria-hidden="true" size={18} />
          <input
            type="search"
            aria-label="求人を検索"
            placeholder="仕事、地域、キーワードで検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className={styles.segment} aria-label="職種で絞り込む">
          {industries.map((item) => (
            <button
              className={industry === item.value ? styles.selectedSegment : undefined}
              type="button"
              aria-pressed={industry === item.value}
              onClick={() => setIndustry(item.value)}
              key={item.value}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          className={styles.select}
          aria-label="地域で絞り込む"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
        >
          <option value="all">全国</option>
          {regions.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.resultMeta}>
        <strong>{filteredJobs.length}件の仕事</strong>
        <span>
          {dataSource === "appwrite" ? "Appwrite接続中" : "モック表示"} /{" "}
          {sourceMessage}
        </span>
      </div>

      <div className={styles.jobsGrid}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => <JobCard job={job} key={job.id} />)
        ) : (
          <div className={styles.emptyState}>
            条件に合う仕事が見つかりませんでした。地域や職種を変えてみてください。
          </div>
        )}
      </div>
    </>
  );
}
