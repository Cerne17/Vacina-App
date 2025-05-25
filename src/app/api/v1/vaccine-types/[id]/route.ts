import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;
    const vaccineTypeId = parseInt(id, 10);

    if (isNaN(vaccineTypeId)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const vaccineType = await prisma.tipoVacina.findUnique({
      where: {
        Cd_TipoVacina: vaccineTypeId,
      },
    });

    if (!vaccineType) {
      return NextResponse.json(
        { message: "Vaccine type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vaccineType);
  } catch (error) {
    console.error(`Failed to fetch vaccine type with ID ${params.id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch vaccine type" },
      { status: 500 }
    );
  }
}
