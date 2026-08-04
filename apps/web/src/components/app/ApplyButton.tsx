"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSavedApplication } from "@/lib/demo-user-state";
import { applyToJob } from "@/hooks/useApplications";
import styles from "./ProductUI.module.css";

export function ApplyButton({
  expectedSupport,
  jobId
}: {
  expectedSupport: number;
  jobId: string;
}) {
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkApplied() {
      try {
        const response = await fetch("/api/applications", { cache: "no-store" });

        if (!active) {
          return;
        }

        if (response.ok) {
          const data = (await response.json()) as {
            applications?: Array<{ jobId?: string }>;
          };
          const applications = Array.isArray(data.applications) ? data.applications : [];
          setApplied(applications.some((application) => application.jobId === jobId));
          return;
        }

        if (response.status === 503) {
          setApplied(hasSavedApplication(jobId));
        }
      } catch {
        if (active) {
          setApplied(hasSavedApplication(jobId));
        }
      }
    }

    void checkApplied();

    return () => {
      active = false;
    };
  }, [jobId]);

  async function apply() {
    setIsSubmitting(true);
    setErrorMessage("");

    const result = await applyToJob(jobId, expectedSupport);

    if (result.ok) {
      setApplied(true);
      setIsSubmitting(false);
      return;
    }

    setErrorMessage(result.message);
    setIsSubmitting(false);

    if (hasSavedApplication(jobId)) {
      setApplied(true);
    }
  }

  return (
    <>
      <button
        className={`${styles.primaryButton} ${styles.fullButton}`}
        type="button"
        disabled={applied || isSubmitting}
        onClick={apply}
      >
        {applied ? (
          <>
            <CheckCircle2 aria-hidden="true" size={18} />
            応募を受け付けました
          </>
        ) : (
          <>
            <Send aria-hidden="true" size={18} />
            {isSubmitting ? "送信中..." : "この仕事に応募する"}
          </>
        )}
      </button>
      {applied && (
        <div className={styles.feedback} role="status">
          応募内容を送信しました。
          <Link className={styles.feedbackLink} href="/matching">
            応募状況を確認
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      )}
      {errorMessage ? (
        <div className={styles.feedback} role="alert">
          {errorMessage}
        </div>
      ) : null}
    </>
  );
}
