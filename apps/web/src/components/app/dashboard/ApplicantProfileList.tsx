"use client";

import type { AdminApplicant } from "@/lib/app-data";
import styles from "../ProductUI.module.css";

const statusLabels = {
  new: "新着",
  screening: "確認中",
  interview: "面談予定",
  accepted: "受け入れ確定"
} as const;

export function ApplicantProfileList({ applicants }: { applicants: AdminApplicant[] }) {
  return (
    <div className={styles.applicantProfileList}>
      {applicants.map((applicant) => (
        <article className={styles.applicantProfileCard} key={applicant.id}>
          <div className={styles.applicantProfileHeader}>
            <div>
              <h4>{applicant.name}</h4>
              <p>{applicant.jobTitle}</p>
            </div>
            <span className={styles.adminStatus} data-status={applicant.status}>
              {statusLabels[applicant.status]}
            </span>
          </div>
          <dl className={styles.applicantProfileFacts}>
            <div>
              <dt>生年月日</dt>
              <dd>{applicant.birthDate}</dd>
            </div>
            <div>
              <dt>住所</dt>
              <dd>{applicant.address}</dd>
            </div>
            <div>
              <dt>マイナンバー</dt>
              <dd>{applicant.myNumberStatus}</dd>
            </div>
            <div>
              <dt>希望地域</dt>
              <dd>{applicant.region}</dd>
            </div>
            <div>
              <dt>応募状況</dt>
              <dd>{applicant.nextAction}</dd>
            </div>
          </dl>
          <p className={styles.applicantProfileNote}>
            個人情報は閲覧のみです。面談調整や受け入れ確定は農家側で行います。
          </p>
        </article>
      ))}
    </div>
  );
}
