import { PageHeader } from "@/components/app/PageHeader";
import { Simulator } from "@/components/app/Simulator";
import styles from "@/components/app/ProductUI.module.css";

export default function SimulationPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="返済支援シミュレーション"
        title="働く期間から、未来を見通す"
        description="奨学金残高、希望する仕事、働く期間を選ぶと、返済支援の見込み額をすぐに試算できます。"
      />
      <Simulator />
    </div>
  );
}
