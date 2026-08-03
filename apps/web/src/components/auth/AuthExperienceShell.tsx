import Image from "next/image";
import type { ReactNode } from "react";

type AuthExperienceShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  actions: ReactNode;
};

export function AuthExperienceShell({
  title,
  description,
  children,
  actions
}: AuthExperienceShellProps) {
  return (
    <section className="auth-experience">
      <div className="auth-visual">
        <Image
          className="auth-visual-image"
          src="/higashihiroshima.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 760px) 100vw, 48vw"
        />
        <div className="auth-visual-shade" />
        <div className="auth-visual-copy">
          <Image
            className="auth-visual-mark"
            src="/hatarukun-mark-v2.png"
            alt=""
            width={54}
            height={54}
            priority
          />
          <p>地域で働くことを、返済の力に。</p>
          <span>仕事、返済支援、地域ポイントをひとつのアカウントで管理します。</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-heading">
          <span>はたるくんアカウント</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <div className="auth-actions">{actions}</div>
      </div>
    </section>
  );
}
