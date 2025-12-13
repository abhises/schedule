import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    // Always return an array
    return NextResponse.json(users ?? []);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 }); // return empty array on error
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = (await req.json()) as { id: number };

    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
