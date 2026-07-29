import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MatchingCenter } from "@/components/app/MatchingCenter";
import { PageHeader } from "@/components/app/PageHeader";
import styles from "@/components/app/ProductUI.module.css";

export default function MatchingPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="応募・マッチング"
        title="地域との出会いを進める"
        description="応募から面談、就業開始までの状況と、次に必要な行動を確認できます。"
        action={
          <Link className={styles.secondaryLink} href="/jobs">
            新しい求人を探す
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        }
      />
      <MatchingCenter />
    </div>
  );
}
