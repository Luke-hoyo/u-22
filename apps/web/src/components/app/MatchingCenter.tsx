"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Search } from "lucide-react";
import {
  formatCurrency,
  getJobById,
  type ApplicationStatus
} from "@/lib/app-data";
import { useApplications } from "@/hooks/useApplications";
import styles from "./ProductUI.module.css";

const steps: { key: ApplicationStatus; label: string }[] = [
  { key: "applied", label: "応募" },
  { key: "interview", label: "面談" },
  { key: "matched", label: "成立" },
  { key: "working", label: "就業" }
];

const statusLabels: Record<ApplicationStatus, string> = {
  applied: "確認中",
  interview: "面談予定",
  matched: "マッチ成立",
  working: "就業中"
};

export function MatchingCenter() {
  const { applications, isLoading } = useApplications();
  const visibleApplications = applications.filter((application) => getJobById(application.jobId));

  return (
    <>
      {isLoading ? (
        <div className={styles.emptyState}>応募状況を読み込み中です。</div>
      ) : visibleApplications.length === 0 ? (
        <div className={styles.emptyStatePanel}>
          <BriefcaseBusiness aria-hidden="true" size={34} />
          <h3>まだ応募中の仕事はありません</h3>
          <p>気になる地域の仕事を見つけて、返済支援の見込みを確認しながら応募できます。</p>
          <Link className={styles.primaryLink} href="/jobs">
            <Search aria-hidden="true" size={18} />
            求人を探す
          </Link>
        </div>
      ) : (
        <div className={styles.applicationList}>
          {visibleApplications.map((application) => {
            const job = getJobById(application.jobId);
            const currentStep = steps.findIndex((step) => step.key === application.status);

            if (!job) {
              return null;
            }

            return (
              <article className={styles.applicationCard} key={application.id}>
                <div>
                  <span className={styles.statusChip}>{statusLabels[application.status]}</span>
                  <h3>{job.title}</h3>
                  <p>
                    {job.organization} / 応募日 {application.appliedAt}
                  </p>
                  <p>
                    <strong>次の予定：</strong>
                    {application.nextAction}
                  </p>

                  <div className={styles.timeline} aria-label="応募の進み具合">
                    {steps.map((step, index) => {
                      const stateClass =
                        index < currentStep
                          ? styles.completedStep
                          : index === currentStep
                            ? styles.currentStep
                            : undefined;

                      return (
                        <span
                          className={`${styles.timelineStep} ${stateClass ?? ""}`}
                          key={step.key}
                        >
                          {step.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.applicationAmount}>
                  <span>返済支援見込み</span>
                  <strong>{formatCurrency(application.expectedSupport)}</strong>
                  <Link className={styles.textLink} href={`/jobs/${job.id}`}>
                    求人詳細
                    <ArrowRight aria-hidden="true" size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className={styles.notice}>
        応募から面談、受け入れ成立、就業開始までの流れをこの画面で確認できます。
      </div>
    </>
  );
}
