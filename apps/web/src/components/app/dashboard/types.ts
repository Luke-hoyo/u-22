import type {
  AdminApplicant,
  AdminApplicantStatus,
  AdminJobStatus,
  AdminManagedJob,
  AdminPointRequest,
  AdminPointRequestStatus,
  FarmerApplication,
  FarmerApplicationStatus
} from "@/lib/app-data";

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
  expectedSupport: number;
  onOpenNewJob: () => void;
  onOpenJobEditor: (job: AdminManagedJob) => void;
  onCloseEditor: () => void;
  onSaveManagedJob: (job: AdminManagedJob) => void;
  onToggleJobStatus: (jobId: string) => void;
  onMoveApplicant: (applicantId: string, status: AdminApplicantStatus) => void;
  onDecidePointRequest: (requestId: string, status: AdminPointRequestStatus) => void;
  onDecideFarmerApplication: (applicationId: string, status: FarmerApplicationStatus) => void;
  onIssueFarmerInvite: (application: FarmerApplication) => void;
  onCopyInviteCode: (inviteCode: string) => void;
};

export const jobStatusLabels: Record<AdminJobStatus, string> = {
  draft: "下書き",
  review: "審査中",
  published: "公開中",
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

export const todaySchedule = [
  {
    time: "09:00",
    title: "受け入れ枠の確認",
    target: "ぶどう畑の栽培・収穫サポート",
    status: "準備"
  },
  {
    time: "13:30",
    title: "住まい支援の確認",
    target: "東広島みのりファーム",
    status: "確認"
  },
  {
    time: "18:00",
    title: "オンライン面談",
    target: "佐藤 みなみ",
    status: "面談"
  }
] as const;
