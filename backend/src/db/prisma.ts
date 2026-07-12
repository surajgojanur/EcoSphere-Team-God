import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["warn", "error"]
});

export async function assertDatabaseReady(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

