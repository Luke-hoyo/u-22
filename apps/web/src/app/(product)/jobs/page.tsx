import { JobsExplorer } from "@/components/app/JobsExplorer";
import { PageHeader } from "@/components/app/PageHeader";
import styles from "@/components/app/ProductUI.module.css";

export default function JobsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="地域のしごと"
        title="自分に合う働き方を探す"
        description="職種、地域、働く期間から検索できます。返済支援の見込みも求人ごとに確認できます。"
      />
      <JobsExplorer />
    </div>
  );
}
