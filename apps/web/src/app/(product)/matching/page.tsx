import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import {
  applications,
  formatCurrency,
  getJobById,
  type ApplicationStatus
} from "@/lib/app-data";
import styles from "@/components/app/ProductUI.module.css";

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

export default function MatchingPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="応募・マッチング"
        title="地域との出会いを進める"
        description="応募から面談、就業開始までの状況と、次に必要な行動を確認できます。"
        action={
          <Link className={styles.secondaryLink} href="/jobs">
            新しい求人を探す
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        }
      />

      <div className={styles.applicationList}>
        {applications.map((application) => {
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

                <div className={styles.timeline} aria-label="マッチングの進み具合">
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

      <div className={styles.notice}>
        表示されている応募状況と面談予定は、コンテスト用のデモデータです。地域側の確認画面との連携を想定しています。
      </div>
    </div>
  );
}
