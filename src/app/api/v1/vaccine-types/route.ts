import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vaccineTypes = await prisma.tipoVacina.findMany();
    return NextResponse.json(vaccineTypes);
  } catch (error) {
    console.error("Failed to fetch vaccine types:", error);
    return NextResponse.json(
      { message: "Failed to fetch vaccine types" },
      { status: 500 }
    );
  }
}
