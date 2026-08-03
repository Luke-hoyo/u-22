"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";
import styles from "./ProductUI.module.css";

type InviteResponse = {
  label?: string;
  message?: string;
  redirectTo?: string;
};

export function RoleInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSubmittedRef = useRef(false);
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") ?? "");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function applyInviteCode(nextInviteCode = inviteCode) {
    const trimmedCode = nextInviteCode.trim();

    setMessage("");
    setErrorMessage("");

    if (!trimmedCode) {
      setErrorMessage("招待コードを入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inviteCode: trimmedCode })
      });
      const result = (await response.json().catch(() => ({}))) as InviteResponse;

      if (response.status === 401) {
        const redirectUrl = `/join?code=${encodeURIComponent(trimmedCode)}`;
        router.push(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.message ?? "招待コードを確認できませんでした。");
        return;
      }

      setMessage(`${result.label ?? "アカウント種別"}を設定しました。`);
      router.replace(result.redirectTo ?? "/role-router");
      router.refresh();
    } catch {
      setErrorMessage("通信に失敗しました。接続を確認して、もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void applyInviteCode();
  }

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code || autoSubmittedRef.current) {
      return;
    }

    autoSubmittedRef.current = true;
    void applyInviteCode(code);
  }, [searchParams]);

  return (
    <section className={`${styles.panel} ${styles.invitePanel}`}>
      <KeyRound aria-hidden="true" size={34} />
      <div>
        <h3>招待コードでアカウント種別を設定</h3>
        <p>
          運営から渡されたコードを入力します。ログイン前の場合は、コードを保持したまま
          アカウント作成へ進みます。
        </p>
        <form className={styles.inviteForm} onSubmit={handleSubmit}>
          <label htmlFor="invite-code">招待コード</label>
          <div>
            <input
              id="invite-code"
              className={styles.inviteInput}
              type="password"
              autoComplete="one-time-code"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="招待コードを入力"
            />
            <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" size={17} />
                  確認中
                </>
              ) : (
                "設定する"
              )}
            </button>
          </div>
        </form>
        <p className={errorMessage ? styles.avatarError : styles.avatarStatus} aria-live="polite">
          {errorMessage || message || "招待リンクの場合は、この画面で自動的に設定されます。"}
        </p>
      </div>
    </section>
  );
}
