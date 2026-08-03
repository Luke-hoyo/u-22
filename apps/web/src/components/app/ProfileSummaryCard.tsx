"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Camera, CheckCircle2, LoaderCircle, UserRound } from "lucide-react";
import { getDemoDisplayName, isDemoAuthEnabled } from "@/lib/demo-auth";
import {
  clearDemoAvatar,
  formatAgeGroupFromBirthDate,
  readDemoAvatar,
  readDemoPreferences,
  writeDemoAvatar
} from "@/lib/demo-user-state";
import styles from "./ProductUI.module.css";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function getDisplayName(user: ReturnType<typeof useUser>["user"]) {
  return (
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "利用者"
  );
}

function getRegionLabel(user: ReturnType<typeof useUser>["user"]) {
  const region = typeof user?.unsafeMetadata.region === "string" ? user.unsafeMetadata.region : "未設定";
  const birthDate =
    typeof user?.unsafeMetadata.birthDate === "string" ? user.unsafeMetadata.birthDate : "";
  const ageGroup =
    typeof user?.unsafeMetadata.ageGroup === "string"
      ? user.unsafeMetadata.ageGroup
      : formatAgeGroupFromBirthDate(birthDate);

  return `${region} / ${ageGroup}`;
}

function DemoProfileSummaryCard({ variant = "young" }: { variant?: "young" | "admin" }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(readDemoAvatar);
  const [statusMessage, setStatusMessage] = useState("PNG / JPG / WebP / GIF、5MBまで");
  const [errorMessage, setErrorMessage] = useState("");
  const preferences = readDemoPreferences();
  const profileSubtitle =
    variant === "admin"
      ? "受け入れ管理"
      : `${preferences.regions.split("、")[0] ?? "未設定"} / ${formatAgeGroupFromBirthDate(preferences.birthDate)}`;

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    setErrorMessage("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選んでください。");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setErrorMessage("5MB以下の画像を選んでください。");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarUrl(result);
      writeDemoAvatar(result);
      setStatusMessage("アイコンを更新しました。");
    });
    reader.addEventListener("error", () => {
      setErrorMessage("画像を読み込めませんでした。別の画像で試してください。");
    });
    reader.readAsDataURL(file);
  }

  function handleAvatarReset() {
    clearDemoAvatar();
    setAvatarUrl("");
    setStatusMessage("アイコンを初期状態に戻しました。");
    setErrorMessage("");
  }

  return (
    <section className={`${styles.panel} ${styles.profileSummary}`}>
      <div className={styles.avatar}>
        {avatarUrl ? (
          <img className={styles.avatarImage} src={avatarUrl} alt="ユーザーアイコン" />
        ) : (
          <UserRound aria-hidden="true" size={42} />
        )}
      </div>

      <h3>{getDemoDisplayName()}</h3>
      <p>{profileSubtitle}</p>

      <div className={styles.avatarControls}>
        <button
          className={`${styles.secondaryButton} ${styles.avatarActionButton}`}
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera aria-hidden="true" size={17} />
          画像を変更
        </button>
        {avatarUrl ? (
          <button
            className={`${styles.secondaryButton} ${styles.avatarActionButton}`}
            type="button"
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
        {errorMessage || statusMessage}
      </p>

      <div className={styles.verificationList}>
        <div className={styles.verificationItem}>
          <span>メールアドレス</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>{variant === "admin" ? "アカウント権限" : "本人確認"}</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>{variant === "admin" ? "招待コード" : "奨学金情報"}</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> {variant === "admin" ? "利用可" : "登録済み"}
          </b>
        </div>
      </div>
    </section>
  );
}

function ClerkProfileSummaryCard({ variant = "young" }: { variant?: "young" | "admin" }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const imageUrl = user?.imageUrl;
  const displayName = getDisplayName(user);
  const regionLabel = variant === "admin" ? "受け入れ管理" : getRegionLabel(user);

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
          <span>{variant === "admin" ? "アカウント権限" : "本人確認"}</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> 確認済み
          </b>
        </div>
        <div className={styles.verificationItem}>
          <span>{variant === "admin" ? "招待コード" : "奨学金情報"}</span>
          <b>
            <CheckCircle2 aria-hidden="true" size={15} /> {variant === "admin" ? "利用可" : "登録済み"}
          </b>
        </div>
      </div>
    </section>
  );
}

export function ProfileSummaryCard({ variant = "young" }: { variant?: "young" | "admin" }) {
  if (isDemoAuthEnabled()) {
    return <DemoProfileSummaryCard variant={variant} />;
  }

  return <ClerkProfileSummaryCard variant={variant} />;
}
