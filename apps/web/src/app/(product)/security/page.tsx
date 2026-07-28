import { PageHeader } from "@/components/app/PageHeader";
import { SecurityCenter } from "@/components/app/SecurityCenter";
import styles from "@/components/app/ProductUI.module.css";

export default function SecurityPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="セキュリティ"
        title="守る仕組みも、プロトタイプで見せる"
        description="実データを扱わない安全なデモ環境で、認証、権限分離、ポイント不正検知、操作ログを確認できます。"
      />
      <SecurityCenter />
    </div>
  );
}
