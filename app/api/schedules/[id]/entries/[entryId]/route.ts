// app/api/schedules/[id]/entries/[entryId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/* ======================= PATCH ======================= */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, entryId } = await context.params;
    const batchId = Number(id);
    const entryIdNum = Number(entryId);

    if (isNaN(batchId) || isNaN(entryIdNum)) {
      return NextResponse.json(
        { error: "Invalid batch or entry ID" },
        { status: 400 }
      );
    }

    const { startTime, endTime } = await req.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryIdNum },
    });

    if (!entry || entry.batchId !== batchId) {
      return NextResponse.json(
        { error: "Entry not found in this batch" },
        { status: 404 }
      );
    }

    const updatedEntry = await prisma.scheduleEntry.update({
      where: { id: entryIdNum },
      data: { startTime, endTime },
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
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

/* ======================= DELETE ======================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, entryId } = await context.params;
    const batchId = Number(id);
    const entryIdNum = Number(entryId);

    if (isNaN(batchId) || isNaN(entryIdNum)) {
      return NextResponse.json(
        { error: "Invalid batch or entry ID" },
        { status: 400 }
      );
    }

    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryIdNum },
    });

    if (!entry || entry.batchId !== batchId) {
      return NextResponse.json(
        { error: "Entry not found in this batch" },
        { status: 404 }
      );
    }

    await prisma.scheduleEntry.delete({
      where: { id: entryIdNum },
    });

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
