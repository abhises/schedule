"use client";

import { ReactNode } from "react";
import { useUsers } from "@/context/useUsers";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function CreateScheduleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAdmin } = useUsers();
  const { has } = useAuth();
  const isPaidUser = has && has({ plan: "basic" });

  if (!isAdmin) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        Access Denied. Admins Only.
      </div>
    );
  }
  if (!isPaidUser) {
    redirect("/dashboard/price");
  }

  return <section>{children}</section>;
}
