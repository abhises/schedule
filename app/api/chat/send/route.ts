import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import { auth } from "@clerk/nextjs/server";

type CreateChatMessageRequest = {
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateChatMessageRequest = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Find internal user using Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        imageUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Save message
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Broadcast to everyone
    await pusher.trigger("global-chat", "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Chat message error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Chat error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch chat messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
