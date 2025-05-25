import { NextResponse, type NextRequest } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Nm_TipoVacina, Pz_Validade, Pz_ValidadeAposAbrir } = body;

    // Basic validation
    if (
      !Nm_TipoVacina ||
      typeof Pz_Validade !== "number" ||
      typeof Pz_ValidadeAposAbrir !== "number"
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields or invalid data types. Required: Nm_TipoVacina (string), Pz_Validade (number), Pz_ValidadeAposAbrir (number).",
        },
        { status: 400 }
      );
    }

    const newVaccineType = await prisma.tipoVacina.create({
      data: {
        Nm_TipoVacina,
        Pz_Validade,
        Pz_ValidadeAposAbrir,
      },
    });

    return NextResponse.json(newVaccineType, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Failed to create vaccine type:", error);
    // Check for specific Prisma errors, e.g., unique constraint violation if applicable
    // For now, a generic 500 error
    return NextResponse.json(
      { message: "Failed to create vaccine type" },
      { status: 500 }
    );
  }
}
