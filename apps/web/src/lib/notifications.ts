import type { UserRole } from "@/lib/access-control";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  tone?: "default" | "action" | "success";
};

export function getNotificationTitleForRole(role: UserRole) {
  switch (role) {
    case "farmer":
      return "農家向けのお知らせ";
    case "municipality":
      return "自治体向けのお知らせ";
    case "operator":
      return "運営向けのお知らせ";
    default:
      return "あなたへのお知らせ";
  }
}

export function getNotificationsForRole(role: UserRole): AppNotification[] {
  switch (role) {
    case "farmer":
      return [
        {
          id: "farmer-interview",
          title: "本日18:00にオンライン面談があります",
          body: "佐藤 みなみさん／ぶどう畑の栽培・収穫サポート",
          href: "/farmer/dashboard",
          tone: "action"
        },
        {
          id: "farmer-new-applicant",
          title: "新着応募が1件あります",
          body: "マッチ度89%の応募者が確認待ちです。",
          href: "/farmer/applicants",
          tone: "default"
        }
      ];
    case "municipality":
      return [
        {
          id: "municipality-farmer-pending",
          title: "承認待ちの農家申請があります",
          body: "西条みのりファームの受け入れ申請を確認してください。",
          href: "/municipality/review",
          tone: "action"
        },
        {
          id: "municipality-points",
          title: "地域ポイントの承認待ちが3件あります",
          body: "夏の棚田メンテナンス参加の付与申請を確認できます。",
          href: "/municipality/dashboard",
          tone: "default"
        },
        {
          id: "municipality-placement",
          title: "今月の受け入れ枠が残りわずかです",
          body: "地域全体で5／7人の受け入れが確定しています。",
          href: "/municipality/dashboard",
          tone: "success"
        }
      ];
    case "operator":
      return [
        {
          id: "operator-farmer-pending",
          title: "承認待ちの農家申請が2件あります",
          body: "承認後に招待コードを発行し、農家ダッシュボードへ案内してください。",
          href: "/operator/invites",
          tone: "action"
        },
        {
          id: "operator-invite",
          title: "招待コードの発行が必要です",
          body: "承認済みの東広島みのりファームに案内を送れます。",
          href: "/operator/invites",
          tone: "default"
        },
        {
          id: "operator-points",
          title: "ポイント申請が4件あります",
          body: "重複参加の有無を確認しながら、付与申請を処理できます。",
          href: "/operator/dashboard",
          tone: "default"
        }
      ];
    case "young_user":
    default:
      return [
        {
          id: "young-interview",
          title: "面談予定が決まりました",
          body: "7月31日18:00からオンライン面談です。",
          href: "/matching",
          tone: "action"
        },
        {
          id: "young-event",
          title: "地域イベントが追加されました",
          body: "棚田メンテナンスへの参加で600 pt獲得できます。",
          href: "/points",
          tone: "default"
        },
        {
          id: "young-support",
          title: "返済支援見込みを更新しました",
          body: "進行中の応募をもとに、年間支援額を再計算しました。",
          href: "/dashboard",
          tone: "success"
        }
      ];
  }
}

export function getShellLabelForRole(role: UserRole) {
  switch (role) {
    case "farmer":
      return {
        brand: "農家ダッシュボード",
        supportTitle: "受け入れ準備",
        supportBody: "自分の募集・応募者・面談予定を確認できます。"
      };
    case "municipality":
      return {
        brand: "自治体ダッシュボード",
        supportTitle: "地域審査権限",
        supportBody: "農家申請の承認と地域ポイントの確認ができます。"
      };
    case "operator":
      return {
        brand: "運営ダッシュボード",
        supportTitle: "運営権限",
        supportBody: "農家への招待、応募状況の確認、ポイント承認ができます。"
      };
    default:
      return {
        brand: "利用者ダッシュボード",
        supportTitle: "本人確認",
        supportBody: "応募と返済支援の準備ができています。"
      };
  }
}
