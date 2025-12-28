// app/api/schedules/[id]/entries/[entryId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type RouteParams = {
  params: Promise<{ id: string; entryId: string }>;
};


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batchId = Number(params.id);
    const entryId = Number(params.entryId);

    if (isNaN(batchId) || isNaN(entryId)) {
      return NextResponse.json(
        { error: "Invalid batch or entry ID" },
        { status: 400 }
      );
    }

    const { startTime, endTime } = await req.json();

    // ---------------- VALIDATION ----------------
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format (HH:mm)" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // ---------------- BATCH CHECK ----------------
    const batch = await prisma.scheduleBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch.status !== "DRAFTED") {
      return NextResponse.json(
        { error: "Only DRAFTED batches can be edited" },
        { status: 400 }
      );
    }

    // ---------------- ENTRY CHECK ----------------
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.batchId !== batchId) {
      return NextResponse.json(
        { error: "Entry not found in this batch" },
        { status: 404 }
      );
    }

    // ---------------- TIME CONFLICT CHECK ----------------
    const otherEntries = await prisma.scheduleEntry.findMany({
      where: {
        userId: entry.userId,
        date: entry.date,
        NOT: { id: entryId },
      },
    });

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    const newStart = new Date(entry.date);
    newStart.setHours(sh, sm, 0, 0);

    const newEnd = new Date(entry.date);
    newEnd.setHours(eh, em, 0, 0);

    for (const e of otherEntries) {
      const [esh, esm] = e.startTime.split(":").map(Number);
      const [eeh, eem] = e.endTime.split(":").map(Number);

      const es = new Date(entry.date);
      es.setHours(esh, esm, 0, 0);

      const ee = new Date(entry.date);
      ee.setHours(eeh, eem, 0, 0);

      // overlap rule
      if (newStart < ee && newEnd > es) {
        return NextResponse.json(
          { error: "Time conflict for this user on the same day" },
          { status: 409 }
        );
      }
    }

    // ---------------- HOURS CALC ----------------
    const totalHours =
      (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60);

    // ---------------- UPDATE ----------------
    const updatedEntry = await prisma.scheduleEntry.update({
      where: { id: entryId },
      data: {
        startTime,
        endTime,
        totalHours: Math.round(totalHours * 100) / 100,
      },
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
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("PATCH schedule entry error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, entryId } = await params;
    const batchId = parseInt(id, 10);
    const entryIdNum = parseInt(entryId, 10);

    if (isNaN(batchId) || isNaN(entryIdNum)) {
      return NextResponse.json(
        { error: "Invalid batch or entry ID" },
        { status: 400 }
      );
    }

    // Verify batch exists and is in DRAFTED status
    const batch = await prisma.scheduleBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    if (batch.status !== "DRAFTED") {
      return NextResponse.json(
        { error: "Can only delete entries from DRAFTED batches" },
        { status: 400 }
      );
    }

    // Verify entry belongs to this batch
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryIdNum },
    });

    if (!entry || entry.batchId !== batchId) {
      return NextResponse.json(
        { error: "Entry not found in this batch" },
        { status: 404 }
      );
    }

    // Delete entry
    await prisma.scheduleEntry.delete({
      where: { id: entryIdNum },
    });

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}