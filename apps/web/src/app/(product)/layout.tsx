import { auth, currentUser } from "@clerk/nextjs/server";
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

  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
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
