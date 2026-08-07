import type { Metadata } from "next";
import Link from "next/link";
import { FarmerApplicationForm } from "@/components/app/FarmerApplicationForm";
import { PageHeader } from "@/components/app/PageHeader";
import styles from "@/components/app/ProductUI.module.css";

export const metadata: Metadata = {
  title: "事業者申請 | はたるくん",
  description: "はたるくんに受け入れ先として参加する事業者向けの申請フォームです。"
};

export default function FarmerApplyPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="受け入れ先申請"
        title="事業者の参加申請"
        description="若者を受け入れたい農業・林業・水産業の事業者が、運営へ申請するためのフォームです。"
        action={
          <Link className={styles.secondaryLink} href="/">
            PRサイトへ戻る
          </Link>
        }
      />
      <FarmerApplicationForm />
    </div>
  );
}
