"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  readDemoFarmerApplications,
  writeDemoFarmerApplications
} from "@/lib/farmer-application-demo";
import type { UserRole } from "@/lib/access-control";
import { FarmerHomeDashboard } from "./dashboard/FarmerHomeDashboard";
import { MunicipalityDashboard } from "./dashboard/MunicipalityDashboard";
import { OperatorDashboard } from "./dashboard/OperatorDashboard";
import type { DashboardSharedState } from "./dashboard/types";

const managedJobsStorageKey = "hatarukun:managed-jobs";

export function FarmerDashboard({ userRole }: { userRole: UserRole }) {
  const [managedJobs, setManagedJobs] = useState(adminManagedJobs);
  const [applicants, setApplicants] = useState(adminApplicants);
  const [pointRequests, setPointRequests] = useState(adminPointRequests);
  const [farmerApplicationList, setFarmerApplicationList] = useState(farmerApplications);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<(typeof adminManagedJobs)[number] | undefined>();
  const [jobMessage, setJobMessage] = useState("");
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({});
  const [inviteMessage, setInviteMessage] = useState("");

  const publishedJobs = managedJobs.filter((job) => job.status === "published").length;
  const activeApplicants = applicants.filter((applicant) => applicant.status !== "accepted").length;
  const acceptedApplicants = applicants.filter((applicant) => applicant.status === "accepted").length;
  const pendingPoints = pointRequests.filter((request) => request.status === "pending").length;
  const pendingFarmerApplications = farmerApplicationList.filter(
    (application) => application.status === "pending"
  ).length;
  const expectedSupport = useMemo(
    () => applicants.reduce((total, applicant) => total + applicant.supportMonths * 15000, 0),
    [applicants]
  );

  useEffect(() => {
    async function loadFarmerApplications() {
      try {
        const response = await fetch("/api/farmer/applications", { cache: "no-store" });

        if (response.ok) {
          const data = (await response.json()) as { applications?: typeof farmerApplications };
          if (Array.isArray(data.applications)) {
            setFarmerApplicationList(data.applications);
            writeDemoFarmerApplications(data.applications);
            return;
          }
        }
      } catch {
        // fall through to local cache
      }

      setFarmerApplicationList(readDemoFarmerApplications());
    }

    void loadFarmerApplications();

    try {
      const storedJobs = window.localStorage.getItem(managedJobsStorageKey);

      if (storedJobs) {
        setManagedJobs(JSON.parse(storedJobs) as typeof adminManagedJobs);
      }
    } catch {
      setManagedJobs(adminManagedJobs);
    }
  }, []);

  function persistManagedJobs(nextJobs: typeof adminManagedJobs) {
    setManagedJobs(nextJobs);
    window.localStorage.setItem(managedJobsStorageKey, JSON.stringify(nextJobs));
  }

  function toggleJobStatus(jobId: string) {
    const nextJobs = managedJobs.map((job) => {
      if (job.id !== jobId) {
        return job;
      }

      const status: AdminJobStatus = job.status === "published" ? "paused" : "published";
      return { ...job, status };
    });
    persistManagedJobs(nextJobs);
    setJobMessage("募集の公開状態を更新しました。");
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
    const nextJobs = exists
      ? managedJobs.map((currentJob) => (currentJob.id === job.id ? job : currentJob))
      : [job, ...managedJobs];

    persistManagedJobs(nextJobs);
    setEditorOpen(false);
    setEditingJob(undefined);
    setJobMessage(exists ? "募集内容を更新しました。" : "新しい募集を作成しました。");
  }

  function moveApplicant(applicantId: string, status: AdminApplicantStatus) {
    setApplicants((currentApplicants) =>
      currentApplicants.map((applicant) =>
        applicant.id === applicantId ? { ...applicant, status } : applicant
      )
    );
  }

  function decidePointRequest(requestId: string, status: AdminPointRequestStatus) {
    setPointRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    );
  }

  function decideFarmerApplication(applicationId: string, status: FarmerApplicationStatus) {
    setFarmerApplicationList((currentApplications) => {
      const nextApplications = currentApplications.map((application) =>
        application.id === applicationId ? { ...application, status } : application
      );

      writeDemoFarmerApplications(nextApplications);
      return nextApplications;
    });

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
    expectedSupport,
    onOpenNewJob: openNewJob,
    onOpenJobEditor: openJobEditor,
    onCloseEditor: () => setEditorOpen(false),
    onSaveManagedJob: saveManagedJob,
    onToggleJobStatus: toggleJobStatus,
    onMoveApplicant: moveApplicant,
    onDecidePointRequest: decidePointRequest,
    onDecideFarmerApplication: decideFarmerApplication,
    onIssueFarmerInvite: issueFarmerInvite,
    onCopyInviteCode: copyInviteCode
  };

  if (userRole === "farmer") {
    return <FarmerHomeDashboard state={sharedState} />;
  }

  if (userRole === "municipality") {
    return <MunicipalityDashboard state={sharedState} />;
  }

  return <OperatorDashboard state={sharedState} />;
}
