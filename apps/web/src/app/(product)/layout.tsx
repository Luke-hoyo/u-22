import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { getUserRole } from "@/lib/access-control";
import { getDemoDisplayName, getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";

export default async function ProductLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isDemoAuthEnabled()) {
    return (
      <AppShell displayName={getDemoDisplayName()} userRole={getDemoUserRole()}>
        {children}
      </AppShell>
    );
  }

  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  const userRole = getUserRole(user?.publicMetadata);
  const displayName =
    user?.firstName ?? user?.emailAddresses[0]?.emailAddress.split("@")[0] ?? "デモユーザー";

  return (
    <AppShell displayName={displayName} userRole={userRole}>
      {children}
    </AppShell>
  );
}
