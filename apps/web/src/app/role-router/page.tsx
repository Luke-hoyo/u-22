import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canAccessAdmin, getAdminHomePath, getUserRole } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";

export default async function RoleRouterPage() {
  if (isDemoAuthEnabled()) {
    const role = getDemoUserRole();

    redirect(canAccessAdmin(role) ? getAdminHomePath(role) : "/dashboard");
  }

  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  const role = getUserRole(user?.publicMetadata);

  redirect(canAccessAdmin(role) ? getAdminHomePath(role) : "/dashboard");
}
