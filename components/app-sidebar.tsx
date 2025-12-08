import { Home, Clock, User } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: User,
  },
  {
    title: "Schedule",
    url: "/dashboard/schedule",
    icon: Clock,
  },
];

export function AppSidebar() {
  return (
    <Sidebar
      className="
    [&_[data-sidebar=sidebar]]:!bg-gradient-to-b 
    [&_[data-sidebar=sidebar]]:from-red-500 
    [&_[data-sidebar=sidebar]]:to-blue-500 
  "
    >
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Create a schedule</SidebarGroupLabel> */}
          <br />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarSeparator />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="flex items-end justify-items-end p-4">
        <UserButton />
      </div>
    </Sidebar>
  );
}
