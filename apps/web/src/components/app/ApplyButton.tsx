"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import styles from "./ProductUI.module.css";

export function ApplyButton() {
  const [applied, setApplied] = useState(false);

  return (
    <>
      <button
        className={`${styles.primaryButton} ${styles.fullButton}`}
        type="button"
        disabled={applied}
        onClick={() => setApplied(true)}
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
          地域担当者へ応募内容を送りました。マッチング画面で進み具合を確認できます。
        </div>
      )}
    </>
  );
}
