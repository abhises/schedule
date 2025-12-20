import { currentUser } from "@clerk/nextjs/server";
import prisma  from "@/lib/prisma"; // or your Neon client

export type UserAccessStatus =
  | "ALLOWED"
  | "WAITLIST"
  | "DELETED"

export async function checkUserAccess(): Promise<UserAccessStatus> {
  const clerkUser = await currentUser();

  if (!clerkUser) return "WAITLIST";

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return "WAITLIST";

  const dbUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!dbUser) return "WAITLIST";

  if (dbUser.isDeleted) return "DELETED";

  return "ALLOWED";
}
