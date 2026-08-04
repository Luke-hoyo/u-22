"use client";

import { useEffect, useState } from "react";
import {
  adminApplicants,
  adminManagedJobs,
  adminPointRequests,
  farmerApplications,
  type AdminApplicantStatus,
  type AdminJobStatus,
  type AdminPointRequestStatus,
  type FarmerApplicationStatus
} from "@/lib/app-data";
import type { UserRole } from "@/lib/access-control";
import { readOperatorFocus, type OperatorFocus } from "@/lib/operator-focus";
import { FarmerHomeDashboard } from "./dashboard/FarmerHomeDashboard";
import { MunicipalityDashboard } from "./dashboard/MunicipalityDashboard";
import { OperatorDashboard } from "./dashboard/OperatorDashboard";
import { OperatorInvitesPanel } from "./dashboard/OperatorInvitesPanel";
import type { DashboardSharedState } from "./dashboard/types";

export function FarmerDashboard({
  userRole,
  view = "home"
}: {
  userRole: UserRole;
  view?: "home" | "invites" | "review" | "applicants";
}) {
  const [managedJobs, setManagedJobs] = useState(adminManagedJobs);
  const [applicants, setApplicants] = useState(adminApplicants);
  const [pointRequests, setPointRequests] = useState(adminPointRequests);
  const [farmerApplicationList, setFarmerApplicationList] = useState(farmerApplications);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<(typeof adminManagedJobs)[number] | undefined>();
  const [jobMessage, setJobMessage] = useState("");
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({});
  const [inviteMessage, setInviteMessage] = useState("");
  const [operatorFocus, setOperatorFocus] = useState<OperatorFocus>("agriculture");

  const publishedJobs = managedJobs.filter((job) => job.status === "published").length;
  const activeApplicants = applicants.filter((applicant) => applicant.status !== "accepted").length;
  const acceptedApplicants = applicants.filter((applicant) => applicant.status === "accepted").length;
  const pendingPoints = pointRequests.filter((request) => request.status === "pending").length;
  const pendingFarmerApplications = farmerApplicationList.filter(
    (application) => application.status === "pending"
  ).length;

  useEffect(() => {
    async function loadOperatorFocus() {
      try {
        const response = await fetch("/api/profile/operator-focus", { cache: "no-store" });

        if (response.ok) {
          const data = (await response.json()) as { focus?: OperatorFocus };
          if (data.focus) {
            setOperatorFocus(data.focus);
            return;
          }
        }
      } catch {
        // fall through
      }

      setOperatorFocus(readOperatorFocus());
    }

    async function loadManagedJobs() {
      try {
        const response = await fetch("/api/admin/jobs", { cache: "no-store" });

        if (response.ok) {
          const data = (await response.json()) as {
            jobs?: typeof adminManagedJobs;
            source?: "appwrite" | "mock";
          };
          if (Array.isArray(data.jobs) && data.source === "appwrite") {
            setManagedJobs(data.jobs);
            return;
          }
          if (Array.isArray(data.jobs) && data.jobs.length > 0) {
            setManagedJobs(data.jobs);
          }
        }
      } catch {
        // fall through
      }
    }

    async function loadFarmerApplications() {
      try {
        const response = await fetch("/api/farmer/applications", { cache: "no-store" });

        if (response.ok) {
          const data = (await response.json()) as { applications?: typeof farmerApplications };
          if (Array.isArray(data.applications)) {
            setFarmerApplicationList(data.applications);
          }
        }
      } catch {
        // keep seed data
      }
    }

    void loadOperatorFocus();
    void loadManagedJobs();
    void loadFarmerApplications();
    void loadApplicants();
    void loadPointRequests();
  }, []);

  async function loadApplicants() {
    try {
      const response = await fetch("/api/admin/applicants", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as {
          applicants?: typeof adminApplicants;
          source?: "appwrite" | "mock";
        };
        if (Array.isArray(data.applicants) && data.source === "appwrite") {
          setApplicants(data.applicants);
          return;
        }
        if (Array.isArray(data.applicants) && data.applicants.length > 0) {
          setApplicants(data.applicants);
        }
      }
    } catch {
      // keep seed data
    }
  }

  async function loadPointRequests() {
    try {
      const response = await fetch("/api/admin/point-requests", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as {
          pointRequests?: typeof adminPointRequests;
          source?: "appwrite" | "mock";
        };
        if (Array.isArray(data.pointRequests) && data.source === "appwrite") {
          setPointRequests(data.pointRequests);
          return;
        }
        if (Array.isArray(data.pointRequests) && data.pointRequests.length > 0) {
          setPointRequests(data.pointRequests);
        }
      }
    } catch {
      // keep seed data
    }
  }

  async function persistManagedJob(job: (typeof adminManagedJobs)[number]) {
    const response = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job)
    });

    if (!response.ok) {
      throw new Error("募集を保存できませんでした。");
    }

    const reloadResponse = await fetch("/api/admin/jobs", { cache: "no-store" });

    if (reloadResponse.ok) {
      const data = (await reloadResponse.json()) as { jobs?: typeof adminManagedJobs };
      if (Array.isArray(data.jobs)) {
        setManagedJobs(data.jobs);
      }
    }
  }

  async function persistJobStatus(jobId: string, status: AdminJobStatus) {
    const response = await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, status })
    });

    if (!response.ok) {
      throw new Error("募集状態を更新できませんでした。");
    }

    setManagedJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, status } : job))
    );
  }

  function toggleJobStatus(jobId: string) {
    const currentJob = managedJobs.find((job) => job.id === jobId);

    if (!currentJob) {
      return;
    }

    const status: AdminJobStatus = currentJob.status === "published" ? "paused" : "published";

    void persistJobStatus(jobId, status)
      .then(() => {
        setJobMessage("募集の公開状態を更新しました。");
      })
      .catch(() => {
        setJobMessage("募集の公開状態を更新できませんでした。");
      });
  }

  function openNewJob() {
    setEditingJob(undefined);
    setEditorOpen(true);
    setJobMessage("");
  }

  function openJobEditor(job: (typeof adminManagedJobs)[number]) {
    setEditingJob(job);
    setEditorOpen(true);
    setJobMessage("");
  }

  function saveManagedJob(job: (typeof adminManagedJobs)[number]) {
    const exists = managedJobs.some((currentJob) => currentJob.id === job.id);

    void persistManagedJob(job)
      .then(() => {
        setEditorOpen(false);
        setEditingJob(undefined);
        setJobMessage(exists ? "募集内容を更新しました。" : "新しい募集を作成しました。");
      })
      .catch(() => {
        setJobMessage("募集を保存できませんでした。");
      });
  }

  function setJobReviewStatus(jobId: string, status: AdminJobStatus) {
    void persistJobStatus(jobId, status)
      .then(() => {
        setJobMessage("募集の審査状態を更新しました。");
      })
      .catch(() => {
        setJobMessage("募集の審査状態を更新できませんでした。");
      });
  }

  function handleSetOperatorFocus(focus: OperatorFocus) {
    setOperatorFocus(focus);
    setJobMessage("");

    void fetch("/api/profile/operator-focus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus })
    });
  }

  function moveApplicant(applicantId: string, status: AdminApplicantStatus) {
    setApplicants((currentApplicants) =>
      currentApplicants.map((applicant) =>
        applicant.id === applicantId ? { ...applicant, status } : applicant
      )
    );

    void fetch("/api/admin/applicants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: applicantId, status })
    });
  }

  function decidePointRequest(requestId: string, status: AdminPointRequestStatus) {
    setPointRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    );

    void fetch("/api/admin/point-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status })
    });
  }

  function decideFarmerApplication(applicationId: string, status: FarmerApplicationStatus) {
    setFarmerApplicationList((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId ? { ...application, status } : application
      )
    );

    void fetch("/api/farmer/applications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ applicationId, status })
    });
  }

  async function issueFarmerInvite(application: (typeof farmerApplicationList)[number]) {
    setInviteMessage("");

    if (application.status !== "approved") {
      setInviteMessage("承認済みの申請だけ招待コードを発行できます。");
      return;
    }

    try {
      const response = await fetch("/api/account/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          applicationId: application.id,
          farmName: application.farmName,
          email: application.email
        })
      });
      const result = (await response.json().catch(() => ({}))) as {
        inviteCode?: string;
        message?: string;
      };

      if (!response.ok || !result.inviteCode) {
        setInviteMessage(result.message ?? "招待コードを発行できませんでした。");
        return;
      }

      setInviteCodes((currentCodes) => ({
        ...currentCodes,
        [application.id]: result.inviteCode ?? ""
      }));
      setInviteMessage(`${application.farmName} の招待コードを発行しました。`);
    } catch {
      setInviteMessage("通信に失敗しました。接続を確認して、もう一度お試しください。");
    }
  }

  async function copyInviteCode(inviteCode: string) {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setInviteMessage("招待コードをコピーしました。");
    } catch {
      setInviteMessage("コピーできませんでした。コードを選択してコピーしてください。");
    }
  }

  const sharedState: DashboardSharedState = {
    managedJobs,
    applicants,
    pointRequests,
    farmerApplicationList,
    inviteCodes,
    inviteMessage,
    jobMessage,
    editorOpen,
    editingJob,
    publishedJobs,
    activeApplicants,
    acceptedApplicants,
    pendingPoints,
    pendingFarmerApplications,
    operatorFocus,
    onOpenNewJob: openNewJob,
    onOpenJobEditor: openJobEditor,
    onCloseEditor: () => setEditorOpen(false),
    onSaveManagedJob: saveManagedJob,
    onToggleJobStatus: toggleJobStatus,
    onSetJobReviewStatus: setJobReviewStatus,
    onSetOperatorFocus: handleSetOperatorFocus,
    onMoveApplicant: moveApplicant,
    onDecidePointRequest: decidePointRequest,
    onDecideFarmerApplication: decideFarmerApplication,
    onIssueFarmerInvite: issueFarmerInvite,
    onCopyInviteCode: copyInviteCode
  };

  if (userRole === "farmer") {
    if (view === "applicants") {
      return <FarmerHomeDashboard state={sharedState} section="applicants" />;
    }

    return <FarmerHomeDashboard state={sharedState} />;
  }

  if (userRole === "municipality") {
    if (view === "review") {
      return <MunicipalityDashboard state={sharedState} section="review" />;
    }

    return <MunicipalityDashboard state={sharedState} />;
  }

  if (userRole === "operator") {
    if (view === "invites") {
      return <OperatorInvitesPanel state={sharedState} />;
    }

    return <OperatorDashboard state={sharedState} />;
  }

  return null;
}
