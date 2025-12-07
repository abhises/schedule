import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- Create Users ---
  const users = await prisma.user.createMany({
    data: [
      { name: "John Doe", email: "john@example.com", role: "USER" },
      { name: "Admin One", email: "admin@example.com", role: "ADMIN" },
      { name: "Sarah Smith", email: "sarah@example.com", role: "USER" },
    ],
  });

  console.log("Users created!");

  // Fetch created users for schedule creation
  const john = await prisma.user.findUnique({ where: { email: "john@example.com" } });
  const sarah = await prisma.user.findUnique({ where: { email: "sarah@example.com" } });

  // --- Create a Schedule ---
  const schedule = await prisma.schedule.create({
    data: {
      status: "DRAFT",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-21"),

      shifts: {
        create: [
          // Shift for John
          {
            date: new Date("2025-01-01"),
            startTime: "09:00",
            endTime: "17:00",
            userId: john!.id,
          },
          {
            date: new Date("2025-01-02"),
            startTime: "09:00",
            endTime: "17:00",
            userId: john!.id,
          },

          // Shift for Sarah
          {
            date: new Date("2025-01-01"),
            startTime: "10:00",
            endTime: "18:00",
            userId: sarah!.id,
          },
        ],
      },
    },
  });

  console.log("Schedule created!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
