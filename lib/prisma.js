import { PrismaClient } from "@prisma/client";
import { sqliteRuntimeUrl } from "./database-url.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(process.env.DATABASE_URL
      ? {
          datasources: {
            db: { url: sqliteRuntimeUrl(process.env.DATABASE_URL) },
          },
        }
      : {}),
    transactionOptions: { maxWait: 10000, timeout: 10000 },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
