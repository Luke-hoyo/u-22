"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSavedApplication, saveJobApplication } from "@/lib/demo-user-state";
import styles from "./ProductUI.module.css";

export function ApplyButton({
  expectedSupport,
  jobId
}: {
  expectedSupport: number;
  jobId: string;
}) {
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setApplied(hasSavedApplication(jobId));
  }, [jobId]);

  function apply() {
    saveJobApplication(jobId, expectedSupport);
    setApplied(true);
  }

  return (
    <>
      <button
        className={`${styles.primaryButton} ${styles.fullButton}`}
        type="button"
        disabled={applied}
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
            この仕事に応募する
          </>
        )}
      </button>
      {applied && (
        <div className={styles.feedback} role="status">
          地域担当者へ応募内容を送りました。
          <Link className={styles.feedbackLink} href="/matching">
            マッチング画面で確認
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
