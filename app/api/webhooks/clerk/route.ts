import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // 1️⃣ Read raw body (VERY IMPORTANT)
  const payload = await req.text();

  // 2️⃣ Await headers() (App Router requirement)
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // 3️⃣ Validate required headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  // 4️⃣ Verify webhook signature
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: any;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = event;

  // ─────────────────────────────
  // 👤 USER CREATED
  // ─────────────────────────────
  if (type === "user.created") {
    await prisma.user.upsert({
      where: { clerkId: data.id },
      update: {
        email: data.email_addresses?.[0]?.email_address ?? null,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        imageUrl: data.image_url ?? null,
        publicMetadata: data.public_metadata ?? {},
        privateMetadata: data.private_metadata ?? {},
        lastSyncedAt: new Date(),
        isDeleted: false,
      },
      create: {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address ?? null,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        imageUrl: data.image_url ?? null,
        role: "USER",
        publicMetadata: data.public_metadata ?? {},
        privateMetadata: data.private_metadata ?? {},
        isDeleted: false,
      },
    });
  }

  // ─────────────────────────────
  // ✏️ USER UPDATED
  // ─────────────────────────────
  if (type === "user.updated") {
    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: {
        email: data.email_addresses?.[0]?.email_address ?? null,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        imageUrl: data.image_url ?? null,
        publicMetadata: data.public_metadata ?? {},
        privateMetadata: data.private_metadata ?? {},
        lastSyncedAt: new Date(),
      },
    });
  }

  // ─────────────────────────────
  // 🗑️ USER DELETED (SOFT DELETE)
  // ─────────────────────────────
  if (type === "user.deleted") {
    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: {
        isDeleted: true,
        lastSyncedAt: new Date(),
      },
    });
  }

  return new Response("OK", { status: 200 });
}
