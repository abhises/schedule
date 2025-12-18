// app/api/schedules/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET single batch by ID
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
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
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
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
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
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

    const body = await req.json();
    const { status } = body;

    if (!["DRAFTED", "PUBLISHED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const batch = await prisma.scheduleBatch.update({
      where: { id: batchId },
      data: { status },
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

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Error updating batch:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 }
    );
  }
}

// DELETE batch and all its entries
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
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
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
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