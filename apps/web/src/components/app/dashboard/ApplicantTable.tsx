"use client";

import {
  type AdminApplicant,
  type AdminApplicantStatus
} from "@/lib/app-data";
import styles from "../ProductUI.module.css";

const applicantStatusLabels: Record<AdminApplicantStatus, string> = {
  new: "新着",
  screening: "確認中",
  interview: "面談予定",
  accepted: "受け入れ確定"
};

export function ApplicantTable({
  applicants,
  onMoveApplicant,
  compact = false
}: {
  applicants: AdminApplicant[];
  onMoveApplicant: (applicantId: string, status: AdminApplicantStatus) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={styles.applicantCardList}>
        {applicants.map((applicant) => (
          <article className={styles.applicantCard} key={applicant.id}>
            <div>
              <span className={styles.adminStatus} data-status={applicant.status}>
                {applicantStatusLabels[applicant.status]}
              </span>
              <h4>{applicant.name}</h4>
              <p>{applicant.jobTitle}</p>
              <small>
                {applicant.ageGroup} / {applicant.region} / マッチ {applicant.matchRate}%
              </small>
            </div>
            <div className={styles.tableActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => onMoveApplicant(applicant.id, "interview")}
                disabled={applicant.status === "accepted"}
              >
                面談へ
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => onMoveApplicant(applicant.id, "accepted")}
                disabled={applicant.status === "accepted"}
              >
                確定
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.applicantTableWrap}>
      <table className={styles.applicantTable}>
        <thead>
          <tr>
            <th>応募者</th>
            <th>求人</th>
            <th>状態</th>
            <th>マッチ</th>
            <th>次の対応</th>
            <th aria-label="操作" />
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td>
                <strong>{applicant.name}</strong>
                <span>
                  {applicant.ageGroup} / {applicant.region}
                </span>
              </td>
              <td>{applicant.jobTitle}</td>
              <td>
                <span className={styles.adminStatus} data-status={applicant.status}>
                  {applicantStatusLabels[applicant.status]}
                </span>
              </td>
              <td>
                <b className={styles.matchScore}>{applicant.matchRate}%</b>
                <span>{applicant.supportMonths}か月支援</span>
              </td>
              <td>{applicant.nextAction}</td>
              <td>
                <div className={styles.tableActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => onMoveApplicant(applicant.id, "interview")}
                    disabled={applicant.status === "accepted"}
                  >
                    面談へ
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => onMoveApplicant(applicant.id, "accepted")}
                    disabled={applicant.status === "accepted"}
                  >
                    確定
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
