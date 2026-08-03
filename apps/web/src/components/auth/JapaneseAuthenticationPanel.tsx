"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserRoundPlus
} from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getClerkAuthErrorMessage } from "@/lib/clerk-auth-errors";

type AuthMode = "signIn" | "signUp";
type AuthStep = "identifier" | "code";

export function JapaneseAuthenticationPanel({
  redirectTo = "/dashboard",
  defaultMode = "signIn"
}: {
  redirectTo?: string;
  defaultMode?: AuthMode;
}) {
  const router = useRouter();
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();

  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [step, setStep] = useState<AuthStep>("identifier");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const isSignUp = mode === "signUp";
  const busy = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const fieldError =
    signInErrors.fields.identifier?.message ??
    signUpErrors.fields.emailAddress?.message ??
    signInErrors.fields.code?.message ??
    signUpErrors.fields.code?.message;

  function finalizeNavigation(decorateUrl: (url: string) => string) {
    const url = decorateUrl(redirectTo);
    if (url.startsWith("http")) {
      window.location.href = url;
      return;
    }

    router.replace(url);
    router.refresh();
  }

  async function switchMode(nextMode: AuthMode) {
    if (nextMode === mode || busy) {
      return;
    }

    await signIn.reset();
    await signUp.reset();
    setMode(nextMode);
    setStep("identifier");
    setCode("");
    setErrorMessage("");
    setStatusMessage("");
  }

  async function continueWithGoogle() {
    setErrorMessage("");
    setStatusMessage("");

    try {
      if (isSignUp) {
        const { error } = await signUp.sso({
          strategy: "oauth_google",
          redirectCallbackUrl: "/sign-in/sso-callback",
          redirectUrl: redirectTo
        });

        if (error) {
          setErrorMessage(getClerkAuthErrorMessage(error, mode));
        }

        return;
      }

      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sign-in/sso-callback",
        redirectUrl: redirectTo
      });

      if (error) {
        setErrorMessage(getClerkAuthErrorMessage(error, mode));
      }
    } catch (error) {
      setErrorMessage(getClerkAuthErrorMessage(error, mode));
    }
  }

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("メールアドレスを入力してください。");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("正しいメールアドレスを入力してください。");
      return;
    }

    if (isSignUp && !acceptTerms) {
      setErrorMessage("利用規約とプライバシーポリシーへの同意が必要です。");
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp.create({
          emailAddress: trimmedEmail,
          legalAccepted: acceptTerms
        });

        if (error) {
          setErrorMessage(getClerkAuthErrorMessage(error, mode));
          return;
        }

        const sendResult = await signUp.verifications.sendEmailCode();
        if (sendResult.error) {
          setErrorMessage(getClerkAuthErrorMessage(sendResult.error, mode));
          return;
        }

        setStep("code");
        setStatusMessage(`${trimmedEmail} に認証コードを送信しました。`);
        return;
      }

      const { error } = await signIn.create({ identifier: trimmedEmail });
      if (error) {
        setErrorMessage(getClerkAuthErrorMessage(error, mode));
        return;
      }

      const sendResult = await signIn.emailCode.sendCode();
      if (sendResult.error) {
        setErrorMessage(getClerkAuthErrorMessage(sendResult.error, mode));
        return;
      }

      setStep("code");
      setStatusMessage(`${trimmedEmail} に認証コードを送信しました。`);
    } catch (error) {
      setErrorMessage(getClerkAuthErrorMessage(error, mode));
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setErrorMessage("6桁の認証コードを入力してください。");
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp.verifications.verifyEmailCode({ code: trimmedCode });
        if (error) {
          setErrorMessage(getClerkAuthErrorMessage(error, mode));
          return;
        }

        if (signUp.status === "complete") {
          await signUp.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) {
                return;
              }

              finalizeNavigation(decorateUrl);
            }
          });
          return;
        }

        setErrorMessage("認証を完了できませんでした。コードを再送してお試しください。");
        return;
      }

      const { error } = await signIn.emailCode.verifyCode({ code: trimmedCode });
      if (error) {
        setErrorMessage(getClerkAuthErrorMessage(error, mode));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              return;
            }

            finalizeNavigation(decorateUrl);
          }
        });
        return;
      }

      setErrorMessage("認証を完了できませんでした。コードを再送してお試しください。");
    } catch (error) {
      setErrorMessage(getClerkAuthErrorMessage(error, mode));
    }
  }

  async function resendCode() {
    setErrorMessage("");
    setStatusMessage("");

    try {
      if (isSignUp) {
        const { error } = await signUp.verifications.sendEmailCode();
        if (error) {
          setErrorMessage(getClerkAuthErrorMessage(error, mode));
          return;
        }
      } else {
        const { error } = await signIn.emailCode.sendCode();
        if (error) {
          setErrorMessage(getClerkAuthErrorMessage(error, mode));
          return;
        }
      }

      setStatusMessage("認証コードを再送しました。");
    } catch (error) {
      setErrorMessage(getClerkAuthErrorMessage(error, mode));
    }
  }

  async function changeEmail() {
    await signIn.reset();
    await signUp.reset();
    setStep("identifier");
    setCode("");
    setErrorMessage("");
    setStatusMessage("");
  }

  return (
    <div className="auth-mobile-panel">
      <div className="auth-mobile-heading">
        <div className="auth-mobile-logo">
          <Image src="/hatarukun-mark-v2.png" alt="" width={60} height={60} priority />
        </div>
        <h1>{step === "code" ? "認証コードを入力" : "アカウントで続ける"}</h1>
        <p>
          {step === "code"
            ? `${email.trim()} に届いた6桁のコードを入力してください。`
            : "Googleアカウントまたはメールアドレスで、安全に利用を始められます。"}
        </p>
      </div>

      {step === "identifier" ? (
        <>
          <div className="auth-mode-selector" role="tablist" aria-label="認証モード">
            <button
              className={mode === "signIn" ? "auth-mode-active" : undefined}
              type="button"
              role="tab"
              aria-selected={mode === "signIn"}
              disabled={busy}
              onClick={() => void switchMode("signIn")}
            >
              <LogIn aria-hidden="true" size={16} />
              ログイン
            </button>
            <button
              className={mode === "signUp" ? "auth-mode-active" : undefined}
              type="button"
              role="tab"
              aria-selected={mode === "signUp"}
              disabled={busy}
              onClick={() => void switchMode("signUp")}
            >
              <UserRoundPlus aria-hidden="true" size={16} />
              新規登録
            </button>
          </div>

          <button
            className="auth-google-button"
            type="button"
            disabled={busy}
            onClick={() => void continueWithGoogle()}
          >
            {busy ? <LoaderCircle aria-hidden="true" className="auth-spin" size={18} /> : null}
            {isSignUp ? "Googleで新規登録" : "Googleでログイン"}
          </button>

          <div className="auth-or-divider" aria-hidden="true">
            <span>または</span>
          </div>

          <form className="auth-mobile-form" onSubmit={sendCode}>
            <label className="auth-field" htmlFor="auth-email">
              <span>メールアドレス</span>
              <div className="auth-input-wrap">
                <Mail aria-hidden="true" size={18} />
                <input
                  autoComplete="email"
                  disabled={busy}
                  id="auth-email"
                  inputMode="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            {isSignUp ? (
              <label className="auth-checkbox">
                <input
                  checked={acceptTerms}
                  disabled={busy}
                  type="checkbox"
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                />
                <span>利用規約とプライバシーポリシーに同意する</span>
              </label>
            ) : null}

            <button className="auth-primary-button" disabled={busy} type="submit">
              {busy ? <LoaderCircle aria-hidden="true" className="auth-spin" size={18} /> : null}
              {isSignUp ? "認証コードを受け取る" : "メールでログイン"}
            </button>
          </form>

          <div id="clerk-captcha" />
        </>
      ) : (
        <form className="auth-mobile-form" onSubmit={verifyCode}>
          <label className="auth-field" htmlFor="auth-code">
            <span>6桁の認証コード</span>
            <div className="auth-input-wrap">
              <ShieldCheck aria-hidden="true" size={18} />
              <input
                autoComplete="one-time-code"
                autoFocus
                disabled={busy}
                id="auth-code"
                inputMode="numeric"
                maxLength={6}
                name="code"
                pattern="[0-9]{6}"
                placeholder="123456"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
          </label>

          <button className="auth-primary-button" disabled={busy} type="submit">
            {busy ? <LoaderCircle aria-hidden="true" className="auth-spin" size={18} /> : null}
            認証して続ける
          </button>

          <div className="auth-inline-actions">
            <button disabled={busy} type="button" onClick={() => void resendCode()}>
              コードを再送
            </button>
            <button disabled={busy} type="button" onClick={() => void changeEmail()}>
              メールを変更
            </button>
          </div>
        </form>
      )}

      {fieldError ? <p className="auth-error">{fieldError}</p> : null}
      {errorMessage ? (
        <p className="auth-error" role="alert">
          <AlertCircle aria-hidden="true" size={16} />
          {errorMessage}
        </p>
      ) : null}
      {statusMessage ? (
        <p className="auth-status" role="status">
          {statusMessage}
        </p>
      ) : null}

      <p className="auth-security-note">
        <Lock aria-hidden="true" size={17} />
        認証情報は認証基盤で安全に管理され、アプリ側にパスワードを保存しません。
      </p>

      <div className="auth-mobile-footer">
        <Link href="/">ホームへ戻る</Link>
      </div>
    </div>
  );
}
