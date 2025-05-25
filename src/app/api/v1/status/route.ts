// app/api/v1/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Optional: Check database connectivity
    // This simple query tries to fetch the current timestamp from the database
    // For SQL Server, SELECT 1 is a minimal query.
    // Using $executeRaw instead of $queryRaw for commands that don't return data,
    // or $queryRawUnsafe if you absolutely need it for something simple like SELECT 1.
    // For a simple check, $queryRaw`SELECT 1` is fine.
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "Connected",
    });
  } catch (error) {
    console.error("Health check DB connection error:", error);
    // In App Router, NextResponse.json automatically sets status 200 unless specified otherwise.
    // For error status, you need to pass it as a second argument.
    return NextResponse.json(
      {
        status: "Service Unavailable",
        timestamp: new Date().toISOString(),
        database: "Disconnected",
      },
      { status: 503 }
    );
  }
}
