import type {
  AdminApplicant,
  AdminApplicantStatus,
  AdminJobStatus,
  AdminManagedJob,
  AdminPointRequest,
  AdminPointRequestStatus,
  FarmerApplication,
  FarmerApplicationStatus,
  Industry
} from "@/lib/app-data";
import type { OperatorFocus } from "@/lib/operator-focus";

export type DashboardSharedState = {
  managedJobs: AdminManagedJob[];
  applicants: AdminApplicant[];
  pointRequests: AdminPointRequest[];
  farmerApplicationList: FarmerApplication[];
  inviteCodes: Record<string, string>;
  inviteMessage: string;
  jobMessage: string;
  editorOpen: boolean;
  editingJob?: AdminManagedJob;
  publishedJobs: number;
  activeApplicants: number;
  acceptedApplicants: number;
  pendingPoints: number;
  pendingFarmerApplications: number;
  operatorFocus: OperatorFocus;
  onOpenNewJob: () => void;
  onOpenJobEditor: (job: AdminManagedJob) => void;
  onCloseEditor: () => void;
  onSaveManagedJob: (job: AdminManagedJob) => void;
  onToggleJobStatus: (jobId: string) => void;
  onSetJobReviewStatus: (jobId: string, status: AdminJobStatus) => void;
  onSetOperatorFocus: (focus: OperatorFocus) => void;
  onMoveApplicant: (applicantId: string, status: AdminApplicantStatus) => void;
  onDecidePointRequest: (requestId: string, status: AdminPointRequestStatus) => void;
  onDecideFarmerApplication: (applicationId: string, status: FarmerApplicationStatus) => void;
  onIssueFarmerInvite: (application: FarmerApplication) => void;
  onCopyInviteCode: (inviteCode: string) => void;
};

export const jobStatusLabels: Record<AdminJobStatus, string> = {
  draft: "下書き",
  review: "審査中",
  approved: "審査完了",
  published: "公開中",
  rejected: "差し戻し",
  paused: "停止中"
};

export const farmerApplicationStatusLabels: Record<FarmerApplicationStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "差し戻し"
};

export const pointStatusLabels: Record<AdminPointRequestStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  hold: "保留"
};

export function buildFarmerSchedule(applicants: AdminApplicant[]) {
  const scheduleItems = applicants
    .filter((applicant) => applicant.status === "interview" || applicant.status === "new")
    .slice(0, 4)
    .map((applicant) => {
      const timeMatch = applicant.nextAction.match(/\d{1,2}:\d{2}/);

      return {
        time: timeMatch?.[0] ?? "未定",
        title: applicant.status === "interview" ? "オンライン面談" : "応募内容の確認",
        target: applicant.status === "interview" ? applicant.name : applicant.jobTitle,
        status: applicant.status === "interview" ? "面談" : "確認"
      };
    });

  if (scheduleItems.length === 0) {
    return [
      {
        time: "—",
        title: "今日の予定はありません",
        target: "新しい応募を待っています",
        status: "待機"
      }
    ];
  }

  return scheduleItems;
}

export const farmerTodaySchedule = [
  {
    time: "09:00",
    title: "受け入れ枠の確認",
    target: "ぶどう畑の栽培・収穫サポート",
    status: "準備"
  },
  {
    time: "18:00",
    title: "オンライン面談",
    target: "佐藤 みなみ",
    status: "面談"
  }
] as const;

export function jobMatchesFocus(job: AdminManagedJob, focus: OperatorFocus) {
  if (focus === "community") {
    return false;
  }

  return job.industry === focus;
}

export function applicantMatchesFocus(applicant: AdminApplicant, jobs: AdminManagedJob[], focus: OperatorFocus) {
  if (focus === "community") {
    return false;
  }

  const job = jobs.find((item) => item.title === applicant.jobTitle);
  return job?.industry === focus;
}

export function farmerApplicationMatchesFocus(
  application: FarmerApplication,
  focus: OperatorFocus
) {
  if (focus === "community") {
    return false;
  }

  return application.industry === focus;
}

export function pointRequestMatchesFocus(focus: OperatorFocus) {
  return focus === "community";
}
