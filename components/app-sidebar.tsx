"use client";

import { Home, Clock, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Users", url: "/dashboard/users", icon: User },
  { title: "Schedule", url: "/dashboard/schedule", icon: Clock },
];

export function AppSidebar() {
  const { signOut } = useClerk();

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

              {/* LOGOUT BUTTON */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="hover:bg-red-600 focus:bg-red-600 cursor-pointer" 
                >
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
