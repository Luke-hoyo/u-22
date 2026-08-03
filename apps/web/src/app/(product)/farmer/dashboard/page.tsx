import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getAdminHomePath, getUserRole } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import { renderAdminDashboardPage } from "@/lib/admin-dashboard-page";

export default async function FarmerDashboardPage() {
  const user = isDemoAuthEnabled() ? null : await currentUser();
  const role = isDemoAuthEnabled() ? getDemoUserRole() : getUserRole(user?.publicMetadata);

  if (role !== "farmer") {
    redirect(getAdminHomePath(role));
  }

  return renderAdminDashboardPage({ allowedRoles: ["farmer"], view: "home" });
}
