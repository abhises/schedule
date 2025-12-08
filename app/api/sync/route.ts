import { syncUser } from "@/lib/syncUser";

export async function POST(req: Request) {
  const user = await syncUser(); // auto-sync here

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Now `user.id` is your Prisma DB userId
  const body = await req.json();

  return Response.json({ message: "Schedule created", user });
}
