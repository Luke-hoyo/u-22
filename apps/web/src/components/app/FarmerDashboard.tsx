"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FilePlus2,
  Handshake,
  PauseCircle,
  Send,
  UserRoundPlus,
  UsersRound
} from "lucide-react";
import {
  adminApplicants,
  adminManagedJobs,
  adminPointRequests,
  farmerApplications,
  formatCurrency,
  industryLabels,
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
import { ManagedJobEditor } from "./ManagedJobEditor";
import styles from "./ProductUI.module.css";

const managedJobsStorageKey = "hatarukun:managed-jobs";

const jobStatusLabels: Record<AdminJobStatus, string> = {
  draft: "下書き",
  review: "審査中",
  published: "公開中",
  paused: "停止中"
};

const applicantStatusLabels: Record<AdminApplicantStatus, string> = {
  new: "新着",
  screening: "確認中",
  interview: "面談予定",
  accepted: "受け入れ確定"
};

const pointStatusLabels: Record<AdminPointRequestStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  hold: "保留"
};

const farmerApplicationStatusLabels: Record<FarmerApplicationStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "差し戻し"
};

const todaySchedule = [
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
];

export function FarmerDashboard({ userRole }: { userRole: UserRole }) {
  const [managedJobs, setManagedJobs] = useState(adminManagedJobs);
  const [applicants, setApplicants] = useState(adminApplicants);
  const [pointRequests, setPointRequests] = useState(adminPointRequests);
  const [farmerApplicationList, setFarmerApplicationList] = useState(farmerApplications);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<(typeof adminManagedJobs)[number] | undefined>();
  const [jobMessage, setJobMessage] = useState("");
  const canReviewFarmerApplications = userRole === "municipality" || userRole === "operator";

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
    setFarmerApplicationList(readDemoFarmerApplications());
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
  }

  return (
    <>
      <section className={styles.adminHero}>
        <div>
          <span className={styles.sectionEyebrow}>農家向けダッシュボード</span>
          <h3>今日確認する応募者と予定</h3>
          <p>面談、受け入れ枠、ポイント承認をこの画面で処理します。</p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={openNewJob}>
          <FilePlus2 aria-hidden="true" size={18} />
          新しい募集を作成
        </button>
      </section>

      {editorOpen ? (
        <ManagedJobEditor
          job={editingJob}
          onClose={() => setEditorOpen(false)}
          onSave={saveManagedJob}
        />
      ) : null}

      {jobMessage ? (
        <div className={styles.feedback} role="status">
          {jobMessage}
        </div>
      ) : null}

      <section className={styles.adminCommandGrid} aria-label="本日の運用">
        <article className={`${styles.panel} ${styles.todayPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>今日の予定</h3>
              <p className={styles.panelLead}>面談と受け入れ準備の時間順リストです。</p>
            </div>
            <CalendarDays aria-hidden="true" size={22} />
          </div>
          <div className={styles.scheduleList}>
            {todaySchedule.map((item) => (
              <div className={styles.scheduleItem} key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.target}</span>
                </div>
                <b>{item.status}</b>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.panel} ${styles.operatorNote}`}>
          <span>次の操作</span>
          <strong>面談予定の応募者を確認</strong>
          <p>
            マッチ度が高く、受け入れ枠に近い応募者から面談へ進めます。
          </p>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => moveApplicant("USR-1042", "interview")}
          >
            面談リストを更新
          </button>
        </article>
      </section>

      <section className={styles.metricsGrid} aria-label="管理状況">
        <article className={styles.metricCard}>
          <div>
            <span>公開中募集</span>
            <ClipboardList aria-hidden="true" size={20} />
          </div>
          <strong>{publishedJobs}件</strong>
          <small>農家が募集状況をすぐ確認できます</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>確認中の応募者</span>
            <UsersRound aria-hidden="true" size={20} />
          </div>
          <strong>{activeApplicants}人</strong>
          <small>面談、受け入れ、保留を管理</small>
        </article>
        <article className={`${styles.metricCard} ${styles.metricAccent}`}>
          <div>
            <span>支援予定額</span>
            <Handshake aria-hidden="true" size={20} />
          </div>
          <strong>{formatCurrency(expectedSupport)}</strong>
          <small>就業月数から見込額を試算</small>
        </article>
        {canReviewFarmerApplications ? (
          <article className={styles.metricCard}>
            <div>
              <span>農家申請待ち</span>
              <UserRoundPlus aria-hidden="true" size={20} />
            </div>
            <strong>{pendingFarmerApplications}件</strong>
            <small>承認後に農家アカウント招待へ進みます</small>
          </article>
        ) : null}
        <article className={styles.metricCard}>
          <div>
            <span>ポイント承認待ち</span>
            <Clock3 aria-hidden="true" size={20} />
          </div>
          <strong>{pendingPoints}件</strong>
          <small>地域イベント参加の付与申請</small>
        </article>
      </section>

      {canReviewFarmerApplications ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>受け入れ先申請レビュー</h3>
              <p className={styles.panelLead}>
                農家・事業者の参加申請を確認し、承認後に農家向けダッシュボードへ招待します。
              </p>
            </div>
            <Link className={styles.secondaryLink} href="/farmer/apply">
              申請フォーム
            </Link>
          </div>
          <div className={styles.farmerApplicationList}>
            {farmerApplicationList.map((application) => (
              <article className={styles.farmerApplicationCard} key={application.id}>
                <div>
                  <span className={styles.adminStatus} data-status={application.status}>
                    {farmerApplicationStatusLabels[application.status]}
                  </span>
                  <h4>{application.farmName}</h4>
                  <p>
                    {application.representativeName} / {application.region} {application.area} /{" "}
                    {industryLabels[application.industry]}
                  </p>
                  <small>{application.note}</small>
                  {application.status === "approved" ? (
                    <b className={styles.inviteHint}>農家アカウント招待へ進めます</b>
                  ) : null}
                </div>
                <div className={styles.farmerApplicationFacts}>
                  <span>
                    受け入れ
                    <b>{application.capacity}人</b>
                  </span>
                  <span>
                    開始希望
                    <b>{application.desiredStartMonth}</b>
                  </span>
                  <span>
                    住まい支援
                    <b>{application.housingSupport ? "あり" : "未定"}</b>
                  </span>
                  <span>
                    申請
                    <b>{application.submittedAt}</b>
                  </span>
                </div>
                <div className={styles.adminActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => decideFarmerApplication(application.id, "rejected")}
                    disabled={application.status === "rejected"}
                  >
                    差し戻し
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => decideFarmerApplication(application.id, "approved")}
                    disabled={application.status === "approved"}
                  >
                    承認
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.adminGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>募集管理</h3>
            <span className={styles.industryChip}>農家向け</span>
          </div>
          <div className={styles.adminJobList}>
            {managedJobs.map((job) => (
              <article className={styles.adminJobRow} key={job.id}>
                <div>
                  <span className={styles.adminStatus} data-status={job.status}>
                    {jobStatusLabels[job.status]}
                  </span>
                  <h4>{job.title}</h4>
                  <p>
                    {job.organization} / {job.area} / {industryLabels[job.industry]}
                  </p>
                </div>
                <div className={styles.adminJobFacts}>
                  <span>
                    応募
                    <b>{job.applicants}件</b>
                  </span>
                  <span>
                    募集枠
                    <b>{job.capacity}人</b>
                  </span>
                  <span>
                    更新
                    <b>{job.updatedAt}</b>
                  </span>
                </div>
                <div className={styles.adminActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => toggleJobStatus(job.id)}
                  >
                    {job.status === "published" ? (
                      <PauseCircle aria-hidden="true" size={16} />
                    ) : (
                      <Send aria-hidden="true" size={16} />
                    )}
                    {job.status === "published" ? "停止" : "公開"}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => openJobEditor(job)}
                  >
                    編集
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>受け入れ状況</h3>
            <span className={styles.matchChip}>{acceptedApplicants}人確定</span>
          </div>
          <div className={styles.adminCapacity}>
            <div>
              <span>今月の受け入れ枠</span>
              <strong>{acceptedApplicants} / 7人</strong>
            </div>
            <div className={styles.progressTrack}>
              <span style={{ width: `${Math.max(14, (acceptedApplicants / 7) * 100)}%` }} />
            </div>
          </div>
          <div className={styles.adminTaskList}>
            <div>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>求人公開前の内容確認</span>
              <b>完了</b>
            </div>
            <div>
              <Clock3 aria-hidden="true" size={17} />
              <span>面談日程の調整</span>
              <b>本日</b>
            </div>
            <div>
              <Clock3 aria-hidden="true" size={17} />
              <span>住まい支援の確認</span>
              <b>未対応</b>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.adminGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>応募者テーブル</h3>
              <p className={styles.panelLead}>
                応募者の状態、マッチ度、次の対応だけを一覧で確認します。
              </p>
            </div>
            <span className={styles.industryChip}>個人情報は最小限</span>
          </div>
          <div className={styles.applicantTableWrap}>
            <table className={styles.applicantTable}>
              <thead>
                <tr>
                  <th>応募者</th>
                  <th>求人</th>
                  <th>状態</th>
                  <th>マッチ</th>
                  <th>次の対応</th>
                  <th aria-label="操作" />
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td>
                      <strong>{applicant.name}</strong>
                      <span>
                        {applicant.ageGroup} / {applicant.region}
                      </span>
                    </td>
                    <td>{applicant.jobTitle}</td>
                    <td>
                      <span className={styles.adminStatus} data-status={applicant.status}>
                        {applicantStatusLabels[applicant.status]}
                      </span>
                    </td>
                    <td>
                      <b className={styles.matchScore}>{applicant.matchRate}%</b>
                      <span>{applicant.supportMonths}か月支援</span>
                    </td>
                    <td>{applicant.nextAction}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          onClick={() => moveApplicant(applicant.id, "interview")}
                          disabled={applicant.status === "accepted"}
                        >
                          面談へ
                        </button>
                        <button
                          className={styles.primaryButton}
                          type="button"
                          onClick={() => moveApplicant(applicant.id, "accepted")}
                          disabled={applicant.status === "accepted"}
                        >
                          確定
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>ポイント申請</h3>
            <span className={styles.statusChip}>重複確認つき</span>
          </div>
          <div className={styles.adminPointList}>
            {pointRequests.map((request) => (
              <article className={styles.adminPointRequest} key={request.id}>
                <div>
                  <span className={styles.adminStatus} data-status={request.status}>
                    {pointStatusLabels[request.status]}
                  </span>
                  <h4>{request.eventTitle}</h4>
                  <p>
                    {request.applicantName} / {request.submittedAt}
                  </p>
                </div>
                <strong>+{request.points.toLocaleString("ja-JP")} pt</strong>
                <div className={styles.adminActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => decidePointRequest(request.id, "hold")}
                  >
                    保留
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => decidePointRequest(request.id, "approved")}
                  >
                    承認
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
