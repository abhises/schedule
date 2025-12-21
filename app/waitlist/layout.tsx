import { checkUserAccess } from "@/lib/auth/checkUserAccess";
import { redirect } from "next/navigation";

export default async function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await checkUserAccess();

  // ❌ Allowed users should never see waitlist
  if (status === "ALLOWED") {
    redirect("/dashboard"); // or home
  }

  // ❌ Deleted users also shouldn't see waitlist
  if (status === "DELETED") {
    redirect("/deleted");
  }

  return children;
}
