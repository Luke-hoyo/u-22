"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  industryLabels,
  jobs as mockJobs,
  type Industry,
  type Job
} from "@/lib/app-data";
import { useFavoriteJobs } from "@/hooks/useFavoriteJobs";
import { JobCard } from "./JobCard";
import { JobCardSkeleton } from "./JobCardSkeleton";
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sourceMessage, setSourceMessage] = useState("公開中の仕事を読み込んでいます。");
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggle } = useFavoriteJobs();

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
        setSourceMessage(
          result.source === "appwrite"
            ? result.jobs.length > 0
              ? "地域事業者が登録した仕事を表示しています。"
              : result.reason ?? "登録済みの求人はまだありません。"
            : "公開サンプルの仕事を表示しています。"
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setJobs([]);
        setSourceMessage("求人を読み込めませんでした。時間をおいて再度お試しください。");
      } finally {
        if (active) {
          setIsLoading(false);
        }
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
        <span>{sourceMessage}</span>
      </div>

      <div className={styles.jobsGrid}>
        {isLoading ? (
          Array.from({ length: 6 }, (_, index) => <JobCardSkeleton key={`skeleton-${index}`} />)
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              favorite={isFavorite(job.id)}
              job={job}
              key={job.id}
              onToggleFavorite={toggle}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            条件に合う仕事が見つかりませんでした。地域や職種を変えてみてください。
          </div>
        )}
      </div>
    </>
  );
}
