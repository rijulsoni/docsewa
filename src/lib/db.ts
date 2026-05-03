import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
