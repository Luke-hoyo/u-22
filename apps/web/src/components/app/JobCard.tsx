"use client";

import Image from "next/image";
import Link from "next/link";
import { Fish, Heart, MapPin, Sprout, Trees } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency, industryLabels, type Job } from "@/lib/app-data";
import { readFavoriteJobIds, toggleFavoriteJob } from "@/lib/demo-user-state";
import styles from "./ProductUI.module.css";

const industryIcons = {
  agriculture: Sprout,
  forestry: Trees,
  fishery: Fish
};

export function JobCard({ job }: { job: Job }) {
  const [favorite, setFavorite] = useState(false);
  const IndustryIcon = industryIcons[job.industry];

  useEffect(() => {
    setFavorite(readFavoriteJobIds().includes(job.id));
  }, [job.id]);

  function toggleFavorite() {
    setFavorite(toggleFavoriteJob(job.id).includes(job.id));
  }

  return (
    <article className={styles.jobCard}>
      <div className={styles.jobVisual}>
        <Link href={`/jobs/${job.id}`} aria-label={`${job.title}の詳細を見る`}>
          {job.image ? (
            <Image
              src={job.image}
              alt={`${job.area}の仕事風景`}
              width={720}
              height={360}
            />
          ) : (
            <span className={styles.jobVisualPlaceholder}>
              <IndustryIcon aria-hidden="true" />
            </span>
          )}
        </Link>
        <button
          className={styles.favoriteButton}
          data-active={favorite}
          type="button"
          aria-label={favorite ? "お気に入りから外す" : "お気に入りに追加"}
          aria-pressed={favorite}
          onClick={toggleFavorite}
        >
          <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} size={19} />
        </button>
      </div>

      <div className={styles.jobBody}>
        <div className={styles.jobMeta}>
          <span className={styles.industryChip}>{industryLabels[job.industry]}</span>
          <span className={styles.matchChip}>マッチ度 {job.matchRate}%</span>
        </div>
        <Link href={`/jobs/${job.id}`}>
          <h3>{job.title}</h3>
        </Link>
        <p className={styles.organization}>{job.organization}</p>
        <div className={styles.jobLocation}>
          <MapPin aria-hidden="true" size={15} />
          {job.region} {job.area}
        </div>
        <div className={styles.chipRow}>
          {job.tags.slice(0, 3).map((tag) => (
            <span className={styles.softChip} key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.jobFacts}>
          <span>
            月給
            <b>{formatCurrency(job.monthlySalary)}</b>
          </span>
          <span>
            返済支援見込み
            <b>月 {formatCurrency(job.monthlySupport)}</b>
          </span>
          <span>
            就業期間
            <b>{job.periodMonths.join("・")}か月</b>
          </span>
        </div>
      </div>
    </article>
  );
}
