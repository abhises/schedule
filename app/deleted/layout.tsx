import { checkUserAccess } from "@/lib/auth/checkUserAccess";
import { redirect } from "next/navigation";

export default async function DeletedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await checkUserAccess();

  // ❌ Allowed users cannot visit deleted page
  if (status === "ALLOWED") {
    redirect("/dashboard");
  }

  // ❌ Waitlist users also cannot see deleted
  if (status === "WAITLIST") {
    redirect("/waitlist");
  }

  return children;
}
