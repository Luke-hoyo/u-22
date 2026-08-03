import { renderAdminDashboardPage } from "@/lib/admin-dashboard-page";

export default function OperatorDashboardPage() {
  return renderAdminDashboardPage({ allowedRoles: ["operator"], view: "home" });
}
