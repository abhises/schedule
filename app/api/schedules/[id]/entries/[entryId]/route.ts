// app/api/schedules/[id]/entries/[entryId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type RouteParams = {
  params: Promise<{ id: string; entryId: string }>;
};

export async function PATCH(
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

    const body = await req.json();
    const { startTime, endTime } = body;

    // Validate time format
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return NextResponse.json(
        { error: "Invalid start time format" },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid end time format" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
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
        { error: "Can only edit entries in DRAFTED batches" },
        { status: 400 }
      );
    }

    // Get the entry to calculate hours
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryIdNum },
    });

    if (!entry || entry.batchId !== batchId) {
      return NextResponse.json(
        { error: "Entry not found in this batch" },
        { status: 404 }
      );
    }

    // Calculate total hours
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startDateTime = new Date();
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date();
    endDateTime.setHours(endH, endM, 0, 0);

    const totalHours =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

    // Update entry
    const updatedEntry = await prisma.scheduleEntry.update({
      where: { id: entryIdNum },
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
    console.error("Error updating entry:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }

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