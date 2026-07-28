import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canAccessAdmin, getUserRole } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";

export default async function RoleRouterPage() {
  if (isDemoAuthEnabled()) {
    const role = getDemoUserRole();

    redirect(canAccessAdmin(role) ? "/farmer/dashboard" : "/dashboard");
  }

  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  const user = await currentUser();
  const role = getUserRole(user?.publicMetadata);

  redirect(canAccessAdmin(role) ? "/farmer/dashboard" : "/dashboard");
}
