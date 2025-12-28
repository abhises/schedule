import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { sendEmail } from "@/lib/mailer"; // adjust path

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

export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = (await req.json()) as {
      id: number;
      role: Role;
    };

    if (!id || !role) {
      return NextResponse.json(
        { error: "User ID and role required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Send role update email
    if (user.email) {
      await sendEmail(
        user.email,
        "🔔 Your role has been updated",
        `
        <p>Hello ${user.firstName ?? "User"} ${user.lastName ?? ""},</p>
        <p>Your account role has been updated successfully.</p>
        <p><b>New Role:</b> ${user.role}</p>
        <br/>
        <p>
          If you believe this change was made in error, please contact support.
        </p>
        <br/>
        <p>— Team</p>
        `
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = (await req.json()) as { id: number };

    if (!id)
      return NextResponse.json({ error: "User ID required" }, { status: 400 });

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
