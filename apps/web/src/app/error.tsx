"use client";

import Link from "next/link";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { StatusScreen, statusStyles } from "@/components/system/StatusScreen";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="SOMETHING WENT WRONG"
      title="うまく読み込めませんでした。"
      description="一時的な問題が発生しました。入力内容はそのままに、もう一度読み込みをお試しください。"
      icon={TriangleAlert}
      actions={
        <>
          <button className={statusStyles.primaryAction} type="button" onClick={reset}>
            <RefreshCw aria-hidden="true" size={17} />
            もう一度試す
          </button>
          <Link className={statusStyles.secondaryAction} href="/">
            <Home aria-hidden="true" size={17} />
            ホームへ戻る
          </Link>
        </>
      }
    />
  );
}
