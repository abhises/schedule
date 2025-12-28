// app/api/schedules/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/mailer";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET single batch by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const batchId = parseInt(id, 10);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
    }

    const batch = await prisma.scheduleBatch.findUnique({
      where: { id: batchId },
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch" },
      { status: 500 }
    );
  }
}

// PATCH - Update batch status (publish/draft)

// PATCH - Update batch status (publish/draft)
type EntryPayload = {
  id?: number; // optional for new entries
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
};

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params; // ✅ await params
    const batchId = parseInt(id, 10);

    if (isNaN(batchId)) return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });

    const { status, entries }: { status?: "DRAFTED" | "PUBLISHED"; entries?: EntryPayload[] } = await req.json();

    const batch = await prisma.scheduleBatch.update({
      where: { id: batchId },
      data: {
        status,
        entries: {
          // Update only existing entries with real IDs
          updateMany: entries
            ?.filter((e) => e.id && e.id > 0)
            .map((e) => ({
              where: { id: e.id },
              data: {
                userId: e.userId,
                date: e.date,
                startTime: e.startTime,
                endTime: e.endTime,
                totalHours:
                  Number(e.endTime.split(":")[0]) +
                  Number(e.endTime.split(":")[1]) / 60 -
                  (Number(e.startTime.split(":")[0]) + Number(e.startTime.split(":")[1]) / 60),
              },
            })),
          // Create new entries
          create: entries
            ?.filter((e) => !e.id || e.id <= 0)
            .map((e) => ({
              userId: e.userId,
              date: e.date,
              startTime: e.startTime,
              endTime: e.endTime,
              totalHours:
                Number(e.endTime.split(":")[0]) +
                Number(e.endTime.split(":")[1]) / 60 -
                (Number(e.startTime.split(":")[0]) + Number(e.startTime.split(":")[1]) / 60),
            })),
        },
      },
      include: {
        entries: { include: { user: { select: { email: true, firstName: true } } } },
      },
    });

    // send emails if published
    if (status === "PUBLISHED") {
      const emails = batch.entries.map((e) => e.user.email).filter(Boolean);
      await Promise.all(
        [...new Set(emails)].map((email) =>
          sendEmail(email!, "📅 Your schedule has been published", "<p>Your schedule is published.</p>")
        )
      );
    }

    return NextResponse.json(batch);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

// DELETE batch and all its entries
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const batchId = parseInt(id, 10);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
    }

    // Verify batch exists
    const batch = await prisma.scheduleBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Delete batch (cascade will delete entries)
    await prisma.scheduleBatch.delete({
      where: { id: batchId },
    });

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 }
    );
  }
}
