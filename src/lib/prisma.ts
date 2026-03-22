import { PrismaClient } from "@/generated/prisma";

// Ensure the Prisma Client is fresh after schema changes
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

