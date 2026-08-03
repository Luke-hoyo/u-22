import { renderAdminDashboardPage } from "@/lib/admin-dashboard-page";

export default function MunicipalityDashboardPage() {
  return renderAdminDashboardPage({ allowedRoles: ["municipality"], view: "home" });
}
