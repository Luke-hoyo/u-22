import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MatchingCenter } from "@/components/app/MatchingCenter";
import { PageHeader } from "@/components/app/PageHeader";
import styles from "@/components/app/ProductUI.module.css";

export default function MatchingPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="募集中の事業"
        title="応募中の事業を確認"
        description="応募、面談、就業開始までの状況と、次に必要な行動を確認できます。"
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
