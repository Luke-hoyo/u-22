"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Camera, CheckCircle2, LoaderCircle, UserRound } from "lucide-react";
import { getDemoDisplayName, isDemoAuthEnabled } from "@/lib/demo-auth";
import styles from "./ProductUI.module.css";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function getDisplayName(user: ReturnType<typeof useUser>["user"]) {
  return (
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "デモユーザー"
  );
}

function getRegionLabel(user: ReturnType<typeof useUser>["user"]) {
  const region = typeof user?.unsafeMetadata.region === "string" ? user.unsafeMetadata.region : "広島県";
  const ageGroup =
    typeof user?.unsafeMetadata.ageGroup === "string" ? user.unsafeMetadata.ageGroup : "20代";

  return `${region} / ${ageGroup}`;
}

function DemoProfileSummaryCard() {
  return (
    <section className={`${styles.panel} ${styles.profileSummary}`}>
      <div className={styles.avatar}>
        <UserRound aria-hidden="true" size={42} />
      </div>

      <h3>{getDemoDisplayName()}</h3>
      <p>広島県 / デモ公開</p>

      <p className={styles.avatarStatus} aria-live="polite">
        デモ公開モードでは画像変更は省略しています
      </p>

      <div className={styles.verificationList}>
        <div className={styles.verificationItem}>
          <span>メールアドレス</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> デモ確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>本人確認</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> デモ確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>奨学金情報</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 登録済み
          </b>
        </div>
      </div>
    </section>
  );
}

function ClerkProfileSummaryCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const imageUrl = user?.imageUrl;
  const displayName = getDisplayName(user);
  const regionLabel = getRegionLabel(user);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user) {
      return;
    }

    setStatusMessage("");
    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選んでください。");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setErrorMessage("5MB以下の画像を選んでください。");
      return;
    }

    setIsUploading(true);

    try {
      await user.setProfileImage({ file });
      await user.reload();
      setStatusMessage("アイコンを更新しました。");
    } catch {
      setErrorMessage("アイコンを更新できませんでした。時間をおいてもう一度試してください。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAvatarReset() {
    if (!user) {
      return;
    }

    setStatusMessage("");
    setErrorMessage("");
    setIsUploading(true);

    try {
      await user.setProfileImage({ file: null });
      await user.reload();
      setStatusMessage("アイコンを初期状態に戻しました。");
    } catch {
      setErrorMessage("アイコンを戻せませんでした。時間をおいてもう一度試してください。");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.profileSummary}`}>
      <div className={styles.avatar}>
        {imageUrl ? (
          <img className={styles.avatarImage} src={imageUrl} alt={`${displayName}さんのアイコン`} />
        ) : (
          <UserRound aria-hidden="true" size={42} />
        )}
        {isUploading ? (
          <span className={styles.avatarOverlay} aria-label="保存中">
            <LoaderCircle aria-hidden="true" size={22} />
          </span>
        ) : null}
      </div>

      <h3>{displayName}</h3>
      <p>{regionLabel}</p>

      <div className={styles.avatarControls}>
        <button
          className={`${styles.secondaryButton} ${styles.avatarActionButton}`}
          type="button"
          disabled={!isLoaded || !user || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera aria-hidden="true" size={17} />
          {isUploading ? "保存中" : "画像を変更"}
        </button>
        {user?.hasImage ? (
          <button
            className={`${styles.secondaryButton} ${styles.avatarActionButton}`}
            type="button"
            disabled={isUploading}
            onClick={handleAvatarReset}
          >
            初期化
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        className={styles.avatarInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleAvatarChange}
      />

      <p className={errorMessage ? styles.avatarError : styles.avatarStatus} aria-live="polite">
        {errorMessage || statusMessage || "PNG / JPG / WebP / GIF、5MBまで"}
      </p>

      <div className={styles.verificationList}>
        <div className={styles.verificationItem}>
          <span>メールアドレス</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>本人確認</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>奨学金情報</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 登録済み
          </b>
        </div>
        {user?.id ? (
          <div className={styles.verificationItem}>
            <span>開発者ID</span>
            <b className={styles.developerIdValue}>{user.id}</b>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ProfileSummaryCard() {
  if (isDemoAuthEnabled()) {
    return <DemoProfileSummaryCard />;
  }

  return <ClerkProfileSummaryCard />;
}
