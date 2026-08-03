import { renderAdminDashboardPage } from "@/lib/admin-dashboard-page";

export default function FarmerApplicantsPage() {
  return renderAdminDashboardPage({ allowedRoles: ["farmer"], view: "applicants" });
}
