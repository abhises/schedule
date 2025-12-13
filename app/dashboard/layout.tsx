import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// import { syncUser } from "@/lib/syncUser";
import { currentUser } from "@clerk/nextjs/server";
import { capitalize } from "@/utils/string";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await syncUser();
  const user = await currentUser();
  if (!user) {
    return <p>User not logged in</p>; // handle null
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <div className="flex items-center justify-between p-2">
            {/* Sidebar Trigger on the left */}
            <SidebarTrigger className="cursor-pointer" />

            {/* Welcome message on the right */}
            {user && (
              <p className=" text-2xl text-red-200">
                 {user.firstName} {user.lastName}!
              </p>
            )}
          </div>

          {children}
        </main>
      </SidebarProvider>
    </>
  );
}

// app/dashboard/layout.tsx
