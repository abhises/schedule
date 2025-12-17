// app/api/schedules/route.ts
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { date, startTime, endTime, userIds } = await req.json();

  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const totalHours = (end.getTime() - start.getTime()) / 36e5;

  const batch = await prisma.scheduleBatch.create({
    data: {
      entries: {
        create: userIds.map((userId: number) => ({
          date: new Date(date),
          startTime,
          endTime,
          totalHours,
          userId,
        })),
      },
    },
  });

  return Response.json(batch);
}
