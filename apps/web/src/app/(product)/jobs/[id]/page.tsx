import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Fish, MapPin, Sprout, Trees } from "lucide-react";
import { notFound } from "next/navigation";
import { ApplyButton } from "@/components/app/ApplyButton";
import { getJobsData } from "@/lib/appwrite/jobs";
import {
  formatCurrency,
  getJobById,
  industryLabels,
  jobs
} from "@/lib/app-data";
import styles from "@/components/app/ProductUI.module.css";

const industryIcons = {
  agriculture: Sprout,
  forestry: Trees,
  fishery: Fish
};

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mockJob = getJobById(id);
  const job = mockJob ?? (await getJobsData()).jobs.find((candidate) => candidate.id === id);

  if (!job) {
    notFound();
  }

  const IndustryIcon = industryIcons[job.industry];
  const supportForSixMonths = job.monthlySupport * 6;

  return (
    <div className={styles.page}>
      <Link className={styles.textLink} href="/jobs">
        <ArrowLeft aria-hidden="true" size={16} />
        求人一覧へ戻る
      </Link>

      <div className={styles.detailGrid}>
        <article className={styles.detailHero}>
          <div className={styles.detailVisual}>
            {job.image ? (
              <Image
                src={job.image}
                alt={`${job.area}の仕事風景`}
                width={1100}
                height={520}
                priority
              />
            ) : (
              <span className={styles.jobVisualPlaceholder}>
                <IndustryIcon aria-hidden="true" />
              </span>
            )}
          </div>

          <div className={styles.detailContent}>
            <div className={styles.jobMeta}>
              <div className={styles.chipRow}>
                <span className={styles.industryChip}>{industryLabels[job.industry]}</span>
                <span className={styles.matchChip}>マッチ度 {job.matchRate}%</span>
              </div>
              <span className={styles.jobLocation}>
                <MapPin aria-hidden="true" size={15} />
                {job.region} {job.area}
              </span>
            </div>
            <h2>{job.title}</h2>
            <p className={styles.organization}>{job.organization}</p>
            <p>{job.description}</p>
            <div className={styles.chipRow}>
              {job.tags.map((tag) => (
                <span className={styles.softChip} key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <section className={styles.detailSection}>
              <h3>主な仕事内容</h3>
              <ul>
                {job.duties.map((duty) => (
                  <li key={duty}>{duty}</li>
                ))}
              </ul>
            </section>

            <section className={styles.detailSection}>
              <h3>この地域で働くこと</h3>
              <p>
                仕事だけでなく、地域イベントや暮らしの相談窓口にも参加できます。働く期間中は地域担当者が定期的にサポートします。
              </p>
            </section>
          </div>
        </article>

        <aside className={`${styles.panel} ${styles.applyPanel}`}>
          <div className={styles.panelHeader}>
            <h3>募集条件</h3>
          </div>
          <dl>
            <div>
              <dt>月給</dt>
              <dd>{formatCurrency(job.monthlySalary)}</dd>
            </div>
            <div>
              <dt>就業期間</dt>
              <dd>{job.periodMonths.join("・")}か月</dd>
            </div>
            <div>
              <dt>勤務時間</dt>
              <dd>{job.schedule}</dd>
            </div>
            <div>
              <dt>住まい支援</dt>
              <dd>{job.housingSupport ? "あり" : "相談可能"}</dd>
            </div>
            <div>
              <dt>研修</dt>
              <dd>{job.training ? "あり" : "現場で案内"}</dd>
            </div>
          </dl>
          <div className={styles.supportHighlight}>
            <span>6か月働いた場合</span>
            <strong>{formatCurrency(supportForSixMonths)}</strong>
            <span>返済支援の見込み</span>
          </div>
          <ApplyButton />
        </aside>
      </div>
    </div>
  );
}
