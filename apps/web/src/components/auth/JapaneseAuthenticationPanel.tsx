"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  LogIn,
  LoaderCircle,
  Lock,
  ShieldCheck,
  UserRound,
  UserRoundPlus
} from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getClerkAuthErrorMessage } from "@/lib/clerk-auth-errors";
import {
  getAuthCodeDeliveryMessage,
  isEmailAddress,
  validateAuthIdentifier
} from "@/lib/auth-identifier";

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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const isSignUp = mode === "signUp";
  const busy = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const fieldError =
    signInErrors.fields.identifier?.message ??
    signInErrors.fields.password?.message ??
    signUpErrors.fields.emailAddress?.message ??
    signUpErrors.fields.password?.message ??
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
    setPassword("");
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

  async function submitWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    const trimmedIdentifier = identifier.trim();
    const validationError = validateAuthIdentifier(trimmedIdentifier, mode);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!password) {
      setErrorMessage("パスワードを入力してください。");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("パスワードは8文字以上で入力してください。");
      return;
    }

    if (isSignUp && !acceptTerms) {
      setErrorMessage("利用規約とプライバシーポリシーへの同意が必要です。");
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp.password({
          emailAddress: trimmedIdentifier,
          password,
          legalAccepted: acceptTerms
        });

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

        const sendResult = await signUp.verifications.sendEmailCode();
        if (sendResult.error) {
          setErrorMessage(getClerkAuthErrorMessage(sendResult.error, mode));
          return;
        }

        setStep("code");
        setStatusMessage(`${trimmedIdentifier} に認証コードを送信しました。メール確認後に登録が完了します。`);
        return;
      }

      const { error } = await signIn.password({
        identifier: trimmedIdentifier,
        password
      });

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

      setErrorMessage("ログインを完了できませんでした。メール認証コードでのログインをお試しください。");
    } catch (error) {
      setErrorMessage(getClerkAuthErrorMessage(error, mode));
    }
  }

  async function sendCode() {
    setErrorMessage("");
    setStatusMessage("");

    const trimmedIdentifier = identifier.trim();
    const validationError = validateAuthIdentifier(trimmedIdentifier, "signIn");

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      const { error } = await signIn.create({ identifier: trimmedIdentifier });
      if (error) {
        setErrorMessage(getClerkAuthErrorMessage(error, "signIn"));
        return;
      }

      const sendResult = await signIn.emailCode.sendCode();
      if (sendResult.error) {
        setErrorMessage(getClerkAuthErrorMessage(sendResult.error, "signIn"));
        return;
      }

      setStep("code");
      setStatusMessage(getAuthCodeDeliveryMessage(trimmedIdentifier));
    } catch (error) {
      setErrorMessage(getClerkAuthErrorMessage(error, "signIn"));
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
            ? getAuthCodeDeliveryMessage(identifier)
            : "Googleアカウント、またはメール／ユーザーIDとパスワードで安全に利用を始められます。"}
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

          <form className="auth-mobile-form" onSubmit={submitWithPassword}>
            <label className="auth-field" htmlFor="auth-identifier">
              <span>{isSignUp ? "メールアドレス" : "メールアドレスまたはユーザーID"}</span>
              <div className="auth-input-wrap">
                <UserRound aria-hidden="true" size={18} />
                <input
                  autoComplete={isSignUp ? "email" : "username email"}
                  disabled={busy}
                  id="auth-identifier"
                  inputMode={isSignUp || isEmailAddress(identifier) ? "email" : "text"}
                  name="identifier"
                  placeholder={isSignUp ? "name@example.com" : "メールまたはユーザーID"}
                  type={isSignUp ? "email" : "text"}
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-field" htmlFor="auth-password">
              <span>パスワード</span>
              <div className="auth-input-wrap">
                <Lock aria-hidden="true" size={18} />
                <input
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  disabled={busy}
                  id="auth-password"
                  minLength={8}
                  name="password"
                  placeholder="8文字以上"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
              {isSignUp ? "パスワードで登録" : "パスワードでログイン"}
            </button>
          </form>

          {!isSignUp ? (
            <div className="auth-inline-actions">
              <button disabled={busy} type="button" onClick={() => void sendCode()}>
                メール認証コードでログイン
              </button>
            </div>
          ) : null}

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
              入力内容を変更
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
        パスワードは認証基盤(Clerk)で安全に管理され、アプリ側には保存しません。
      </p>

      <div className="auth-mobile-footer">
        <Link href="/">ホームへ戻る</Link>
      </div>
    </div>
  );
}
