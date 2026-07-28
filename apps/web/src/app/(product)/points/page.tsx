import { PageHeader } from "@/components/app/PageHeader";
import { PointsCenter } from "@/components/app/PointsCenter";
import styles from "@/components/app/ProductUI.module.css";

export default function PointsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="地域とのつながり"
        title="参加が、地域ポイントになる"
        description="地域イベントや活動に参加してポイントを貯め、地域の商品券や体験に交換できます。"
      />
      <PointsCenter />
    </div>
  );
}
