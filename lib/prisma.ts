import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaHash?: string;
};

function getSchemaHash() {
  try {
    const schema = readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf8");
    return createHash("md5").update(schema).digest("hex");
  } catch {
    return "unknown";
  }
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const schemaHash = getSchemaHash();

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaHash &&
  globalForPrisma.prismaSchemaHash !== schemaHash
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaHash = schemaHash;
}
