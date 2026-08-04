"use client";

import * as Sentry from "@sentry/nextjs";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { StatusScreen, statusStyles } from "@/components/system/StatusScreen";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <StatusScreen
          code="CRITICAL ERROR"
          title="サービスを開始できませんでした。"
          description="安全のため処理を停止しました。時間をおいても直らない場合は、運営担当者へお知らせください。"
          icon={ShieldAlert}
          actions={
            <button className={statusStyles.primaryAction} type="button" onClick={reset}>
              <RefreshCw aria-hidden="true" size={17} />
              再読み込み
            </button>
          }
        />
      </body>
    </html>
  );
}
