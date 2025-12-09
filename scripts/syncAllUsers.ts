import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";
import prisma from "../lib/prisma";

config(); // loads .env

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function getAllClerkUsers() {
  let users: any[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await clerk.users.getUserList({
      limit,
      offset,
      orderBy: "-created_at",
    });

    users = [...users, ...res.data];
    if (res.data.length < limit) break;
    offset += limit;
  }
  console.log("Total users fetched from Clerk:", users.length);
  return users;
}



async function syncUsers() {
  const users = await getAllClerkUsers();

  console.log("Syncing", users.length, "users...");

  for (const u of users) {
    const email = u.emailAddresses?.[0]?.emailAddress ?? null;

    await prisma.user.upsert({
      where: { clerkId: u.id },
      create: {
        clerkId: u.id,
        email,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
      },
      update: {
        email,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
      },
    });

    console.log("Synced:", u.id);
  }

  console.log("Done syncing users!");
}

syncUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
