// import { auth, currentUser } from "@clerk/nextjs/server";
// import { prisma } from "./prisma";

// export async function syncUser() {
//   try {
//     const session = await auth(); // session is of type SessionAuthWithRedirect
//   const userId = session.userId; // now TypeScript knows it exists

//   if (!userId) return null;

//     // Fetch Clerk user details
//     const clerkUser = await currentUser();
//     if (!clerkUser) return null;

//     const email = clerkUser.emailAddresses[0]?.emailAddress || "";

//     // Sync into DB
//     const user = await prisma.user.upsert({
//       where: { clerkId: clerkUser.id },
//       update: {
//         name: clerkUser.username ?? `${clerkUser.firstName} ${clerkUser.lastName}`,
//         email,
//         firstName: clerkUser.firstName,
//         lastName: clerkUser.lastName,
//         imageUrl: clerkUser.imageUrl,
//       },
//       create: {
//         clerkId: clerkUser.id,
//         name: clerkUser.username ?? `${clerkUser.firstName} ${clerkUser.lastName}`,
//         email,
//         firstName: clerkUser.firstName,
//         lastName: clerkUser.lastName,
//         imageUrl: clerkUser.imageUrl,
//       },
//     });

//     return user;
//   } catch (error) {
//     console.error("Error syncing user:", error);
//     return null;
//   }
// }
