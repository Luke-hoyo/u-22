import { renderAdminDashboardPage } from "@/lib/admin-dashboard-page";

export default function MunicipalityReviewPage() {
  return renderAdminDashboardPage({ allowedRoles: ["municipality"], view: "review" });
}
