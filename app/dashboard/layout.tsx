

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { syncUser } from "@/lib/syncUser";

export default async  function Layout({ children }: { children: React.ReactNode }) {
await syncUser();
  return (
    <>
    <SidebarProvider >
      <AppSidebar />
      <main>
        <SidebarTrigger  />

        {children}
      </main>
     
    </SidebarProvider>
    </>
  )
}

// app/dashboard/layout.tsx
