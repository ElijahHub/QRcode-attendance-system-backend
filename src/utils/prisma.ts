import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function connectToDb() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

export async function disconnectFromDb() {
  try {
    await prisma.$disconnect();
    console.log("Disconnected from the database");
  } catch (error) {
    console.error("Error disconnecting from the database:", error);
  }
}

export default prisma;
