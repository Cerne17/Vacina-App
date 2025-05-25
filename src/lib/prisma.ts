// src/lib/prisma.ts
// Assuming your prisma schema output is: <project_root>/src/generated/prisma
// And this file is at: <project_root>/src/lib/prisma.ts
import { PrismaClient } from "../generated/prisma"; // Adjust path if necessary

// Extend the NodeJS.Global interface to include 'prisma'
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
