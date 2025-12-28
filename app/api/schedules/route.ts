// app/api/schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/mailer";

type ScheduleEntryInput = {
  date: string; // ISO date string "2024-01-15"
  startTime: string; // "10:00"
  endTime: string; // "14:00"
  userId: number;
};

type CreateScheduleBatchRequest = {
  entries: ScheduleEntryInput[];
};

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateScheduleBatchRequest = await req.json();
    const { entries } = body;

    console.log("Received entries:", entries);

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "At least one schedule entry is required" },
        { status: 400 }
      );
    }

    if (entries.length > 21) {
      return NextResponse.json(
        { error: "Maximum 21 entries allowed per batch" },
        { status: 400 }
      );
    }

    for (const entry of entries) {
      if (!entry.date || !entry.startTime || !entry.endTime || !entry.userId) {
        return NextResponse.json(
          { error: "Invalid entry format. Missing required fields." },
          { status: 400 }
        );
      }

      if (!/^\d{2}:\d{2}$/.test(entry.startTime)) {
        return NextResponse.json(
          { error: `Invalid start time format: ${entry.startTime}` },
          { status: 400 }
        );
      }

      if (!/^\d{2}:\d{2}$/.test(entry.endTime)) {
        return NextResponse.json(
          { error: `Invalid end time format: ${entry.endTime}` },
          { status: 400 }
        );
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        return NextResponse.json(
          { error: `Invalid date format: ${entry.date}` },
          { status: 400 }
        );
      }
    }

    // Parse dates without timezone conversion (keep as local date)
    const dates = entries.map((e) => {
      const [year, month, day] = e.date.split("-").map(Number);
      return new Date(year, month - 1, day);
    });

    const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    console.log("Date range:", startDate, endDate);

    const totalDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const preparedEntries = entries.map((entry) => {
      const [startH, startM] = entry.startTime.split(":").map(Number);
      const [endH, endM] = entry.endTime.split(":").map(Number);

      // Parse date without timezone conversion
      const [year, month, day] = entry.date.split("-").map(Number);
      const entryDate = new Date(year, month - 1, day);

      const startDateTime = new Date(
        year,
        month - 1,
        day,
        startH,
        startM,
        0,
        0
      );
      const endDateTime = new Date(year, month - 1, day, endH, endM, 0, 0);

      const totalHours =
        (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

      return {
        date: entryDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        totalHours: Math.round(totalHours * 100) / 100,
        userId: entry.userId,
      };
    });

    // console.log("Prepared entries:", preparedEntries);

    const batch = await prisma.scheduleBatch.create({
      data: {
        status: "DRAFTED",
        startDate,
        endDate,
        totalDays,
        entries: {
          createMany: {
            data: preparedEntries,
            // skipDuplicates: true,
          },
        },
      },
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
        },
      },
    });
    const uniqueUsers = new Map<
      string,
      { firstName?: string; lastName?: string }
    >();

    batch.entries.forEach((entry) => {
      if (entry.user?.email) {
        uniqueUsers.set(entry.user.email, {
          firstName: entry.user.firstName ?? "",
          lastName: entry.user.lastName ?? "",
        });
      }
    });

    if (uniqueUsers.size > 0) {
      Promise.all(
        [...uniqueUsers.entries()].map(([email, user]) =>
          sendEmail(
            email,
            "📝 Drafted schedule available",
            `
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>Your work schedule has been <b>drafted</b>.</p>
        <p>Please login and visit your dashboard to see the drafted schedule.</p>
        <p>For any updates, contact admin.</p>
        <br/>
        <p>— Team</p>
        `
          )
        )
      ).catch((err) => {
        console.error("Background email error:", err);
      });
    }

    // console.log("Batch created:", batch);

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Schedule creation error:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json(
          { error: "Duplicate schedule entry for this user and date" },
          { status: 400 }
        );
      }

      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json(
          { error: "Invalid user ID. User does not exist." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batches = await prisma.scheduleBatch.findMany({
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
