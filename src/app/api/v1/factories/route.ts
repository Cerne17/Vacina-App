import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const factories = await prisma.fabrica.findMany({
      include: {
        Endereco: true, // Include the related Endereco (address) data
      },
    });
    return NextResponse.json(factories);
  } catch (error) {
    console.error("Failed to fetch factories:", error);
    return NextResponse.json(
      { message: "Failed to fetch factories" },
      { status: 500 }
    );
  }
}
