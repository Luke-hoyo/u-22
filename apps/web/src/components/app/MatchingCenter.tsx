"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applications as defaultApplications,
  formatCurrency,
  getJobById,
  type Application,
  type ApplicationStatus
} from "@/lib/app-data";
import { readSavedApplications } from "@/lib/demo-user-state";
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
  const [applications, setApplications] = useState<Application[]>(defaultApplications);

  useEffect(() => {
    const merged = new Map(defaultApplications.map((application) => [application.id, application]));

    for (const application of readSavedApplications()) {
      merged.set(application.id, application);
    }

    setApplications(Array.from(merged.values()));
  }, []);

  return (
    <>
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
        応募内容はこの端末に保存され、応募から面談、就業開始までの流れを確認できます。
      </div>
    </>
  );
}
