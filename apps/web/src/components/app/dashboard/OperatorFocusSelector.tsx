"use client";

import { operatorFocusOptions } from "@/lib/operator-focus";
import type { DashboardSharedState } from "./types";
import styles from "../ProductUI.module.css";

export function OperatorFocusSelector({ state }: { state: DashboardSharedState }) {
  return (
    <section className={styles.focusSelector} aria-label="管理分野の選択">
      {operatorFocusOptions.map((option) => (
        <button
          key={option.value}
          className={
            state.operatorFocus === option.value ? styles.focusOptionActive : styles.focusOption
          }
          type="button"
          aria-pressed={state.operatorFocus === option.value}
          onClick={() => state.onSetOperatorFocus(option.value)}
        >
          <strong>{option.label}</strong>
          <span>{option.description}</span>
        </button>
      ))}
    </section>
  );
}
