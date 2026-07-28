export type SecuritySeverity = "safe" | "watch" | "blocked";

export type SecurityCheck = {
  id: string;
  label: string;
  status: string;
  detail: string;
  severity: SecuritySeverity;
};

export type PointCheckInAttempt = {
  eventId: string;
  eventTitle: string;
  userId: string;
  deviceHash: string;
  checkedInAt: string;
  points: number;
};

export type PointAuditResult = {
  attempt: PointCheckInAttempt;
  severity: SecuritySeverity;
  verdict: string;
  reason: string;
};

export type OperationLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  severity: SecuritySeverity;
};

export const securityChecks: SecurityCheck[] = [
  {
    id: "auth-session",
    label: "ログイン管理",
    status: "Clerkで保護中",
    detail: "アプリ画面はログイン済みユーザーだけが閲覧できるようにしています。",
    severity: "safe"
  },
  {
    id: "sensitive-mock",
    label: "重要情報",
    status: "実データ未使用",
    detail: "マイナンバー、JASSO、行政APIはコンテスト段階ではモックで再現します。",
    severity: "safe"
  },
  {
    id: "api-secret",
    label: "APIキー",
    status: "フロント非公開",
    detail: "kintoneやAppwriteの秘密情報はサーバー側で扱う想定に分けています。",
    severity: "safe"
  },
  {
    id: "point-audit",
    label: "ポイント",
    status: "重複付与を検知",
    detail: "同じイベント・同じ利用者・同じ端末からの再チェックインを止めます。",
    severity: "watch"
  }
];

export const pointCheckInAttempts: PointCheckInAttempt[] = [
  {
    eventId: "EVT-001",
    eventTitle: "夏の棚田メンテナンス",
    userId: "USER-DEMO-001",
    deviceHash: "device-a91f",
    checkedInAt: "2026-08-03 09:08",
    points: 600
  },
  {
    eventId: "EVT-001",
    eventTitle: "夏の棚田メンテナンス",
    userId: "USER-DEMO-001",
    deviceHash: "device-a91f",
    checkedInAt: "2026-08-03 09:12",
    points: 600
  },
  {
    eventId: "EVT-002",
    eventTitle: "港の朝市サポーター",
    userId: "USER-DEMO-001",
    deviceHash: "device-a91f",
    checkedInAt: "2026-08-09 06:35",
    points: 800
  }
];

export const operationLogs: OperationLog[] = [
  {
    id: "LOG-001",
    actor: "デモユーザー",
    action: "本人確認ステータスを確認",
    target: "プロフィール",
    time: "2026-07-27 09:42",
    severity: "safe"
  },
  {
    id: "LOG-002",
    actor: "地域担当者",
    action: "応募内容を閲覧",
    target: "APP-001",
    time: "2026-07-27 10:05",
    severity: "safe"
  },
  {
    id: "LOG-003",
    actor: "ポイント監査",
    action: "重複チェックインを保留",
    target: "EVT-001",
    time: "2026-08-03 09:12",
    severity: "watch"
  }
];

export function auditPointAttempts(attempts: PointCheckInAttempt[]): PointAuditResult[] {
  const seen = new Set<string>();

  return attempts.map((attempt) => {
    const auditKey = `${attempt.eventId}:${attempt.userId}:${attempt.deviceHash}`;
    const isDuplicate = seen.has(auditKey);

    if (!isDuplicate) {
      seen.add(auditKey);
    }

    return {
      attempt,
      severity: isDuplicate ? "blocked" : "safe",
      verdict: isDuplicate ? "付与を保留" : "付与OK",
      reason: isDuplicate
        ? "同じイベントで同じ利用者・端末のチェックインが既にあります。"
        : "重複がないため、ポイント付与できます。"
    };
  });
}

export function summarizeAudit(results: PointAuditResult[]) {
  return results.reduce(
    (summary, result) => {
      if (result.severity === "blocked") {
        summary.blocked += 1;
        return summary;
      }

      summary.approved += 1;
      summary.points += result.attempt.points;
      return summary;
    },
    { approved: 0, blocked: 0, points: 0 }
  );
}
