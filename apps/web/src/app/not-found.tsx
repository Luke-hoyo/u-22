import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { StatusScreen, statusStyles } from "@/components/system/StatusScreen";

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="このページは、見つかりませんでした。"
      description="URLが変わったか、ページが移動した可能性があります。ホームまたは求人検索から、目的の情報を探せます。"
      icon={SearchX}
      actions={
        <>
          <Link className={statusStyles.primaryAction} href="/">
            <Home aria-hidden="true" size={17} />
            ホームへ戻る
          </Link>
          <Link className={statusStyles.secondaryAction} href="/jobs">
            <ArrowLeft aria-hidden="true" size={17} />
            求人を探す
          </Link>
        </>
      }
    />
  );
}
