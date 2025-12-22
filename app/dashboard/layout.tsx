import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { checkUserAccess } from "@/lib/auth/checkUserAccess";
import { redirect } from "next/navigation";
import { UsersProvider } from "@/context/UsersContext";


export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await checkUserAccess();

  if (status === "WAITLIST") {
    redirect("/waitlist");
  }

  if (status === "DELETED") {
    redirect("/deleted");
  }

  // ✅ Do NOT conditionally return JSX in a layout
  const user = await currentUser();

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1">
        <div className="flex items-center justify-between p-2">
          <SidebarTrigger className="cursor-pointer" />

          {user && (
            <div className="flex items-center gap-4 text-2xl text-red-200">
              <span>
                {user.firstName} {user.lastName}
              </span>
              <UserButton />
            </div>
          )}
        </div>
        <UsersProvider>{children}</UsersProvider>
      </main>
    </SidebarProvider>
  );
}
