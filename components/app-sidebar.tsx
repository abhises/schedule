"use client";

import { Home, Clock, User, LogOut, SidebarIcon, DollarSign } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";

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
  { title: "Pricing", url: "/dashboard/price", icon: DollarSign  },

];

export function AppSidebar() {
  const { signOut } = useClerk();

  return (
    <Sidebar
      className="
        [&_[data-sidebar=sidebar]]:!bg-gradient-to-b
        [&_[data-sidebar=sidebar]]:from-red-200
        [&_[data-sidebar=sidebar]]:to-blue-500
      "
    >
      <SidebarContent>
        <div className="flex items-center justify-center py-6">
          <Link href="/dashboard">
            <Image
              src="/teamplanlogo.png"
              alt="TeamPlan Logo"
              width={600}
              height={600}
              priority
              className="p-2 rounded-full hover:scale-120 "
            />
          </Link>
        </div>

        <SidebarGroup>
          <br />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="ml-1" />
                      <span
                        className="
        transition-opacity duration-200
        group-data-[collapsible=icon]:opacity-0
        group-data-[collapsible=icon]:w-0
        group-data-[collapsible=icon]:overflow-hidden
        group-data-[collapsible=icon]:pointer-events-none
      "
                      >
                        {item.title}
                      </span>{" "}
                    </Link>
                  </SidebarMenuButton>
                  <SidebarSeparator />
                </SidebarMenuItem>
              ))}

              {/* LOGOUT BUTTON */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="cursor-pointer"
                >
                  <LogOut  className="ml-1"/>
                  <span
                    className="
        transition-opacity duration-200
        group-data-[collapsible=icon]:opacity-0
        group-data-[collapsible=icon]:w-0
        group-data-[collapsible=icon]:overflow-hidden
        group-data-[collapsible=icon]:pointer-events-none
      "
                  >
                    Logout
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
