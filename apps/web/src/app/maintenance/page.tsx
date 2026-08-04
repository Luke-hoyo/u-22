import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Home, Wrench } from "lucide-react";
import { StatusScreen, statusStyles } from "@/components/system/StatusScreen";

export const metadata: Metadata = {
  title: "メンテナンス中 | はたるくん",
  description: "はたるくんは現在メンテナンス中です。"
};

export default function MaintenancePage() {
  return (
    <StatusScreen
      code="メンテナンス中"
      title="ただいま、整備中です。"
      description="より安心して使えるよう、サービスを一時的に整備しています。作業が終わり次第、同じURLから利用できます。"
      icon={Wrench}
      status="しばらく時間をおいて、もう一度お試しください"
      actions={
        <>
          <Link className={statusStyles.primaryAction} href="/">
            <Home aria-hidden="true" size={17} />
            ホームへ戻る
          </Link>
          <span className={statusStyles.secondaryAction}>
            <Clock3 aria-hidden="true" size={17} />
            復旧までお待ちください
          </span>
        </>
      }
    />
  );
}
