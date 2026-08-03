import { renderAdminDashboardPage } from "@/lib/admin-dashboard-page";

export default function OperatorInvitesPage() {
  return renderAdminDashboardPage({ allowedRoles: ["operator"], view: "invites" });
}
