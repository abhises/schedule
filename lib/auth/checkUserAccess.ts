import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export type UserAccessStatus =
  | "ALLOWED"
  | "WAITLIST"
  | "DELETED";

export async function checkUserAccess(): Promise<UserAccessStatus> {
  const clerkUser = await currentUser();

  // 🔐 Not logged in → waitlist
  if (!clerkUser) return "WAITLIST";

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return "WAITLIST";

  const dbUser = await prisma.user.findUnique({
    where: { email },
  });

  // 👤 Not in DB yet → waitlist
  if (!dbUser) return "WAITLIST";

  // 🗑️ Soft deleted
  if (dbUser.isDeleted) return "DELETED";

  // ⏳ Pending users behave like waitlist
  if (dbUser.role === "PENDING") return "WAITLIST";

  // ✅ Allowed users
  return "ALLOWED";
}
