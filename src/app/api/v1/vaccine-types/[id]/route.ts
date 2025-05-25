import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

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

export async function PUT(
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

    const body = await request.json();
    const { Nm_TipoVacina, Pz_Validade, Pz_ValidadeAposAbrir } = body;

    // Basic validation: ensure at least one field to update is provided
    // And that provided fields have correct types if they exist
    if (
      Nm_TipoVacina === undefined &&
      Pz_Validade === undefined &&
      Pz_ValidadeAposAbrir === undefined
    ) {
      return NextResponse.json(
        { message: "No fields provided for update." },
        { status: 400 }
      );
    }
    if (Nm_TipoVacina !== undefined && typeof Nm_TipoVacina !== "string") {
      return NextResponse.json(
        { message: "Invalid Nm_TipoVacina format." },
        { status: 400 }
      );
    }
    if (Pz_Validade !== undefined && typeof Pz_Validade !== "number") {
      return NextResponse.json(
        { message: "Invalid Pz_Validade format." },
        { status: 400 }
      );
    }
    if (
      Pz_ValidadeAposAbrir !== undefined &&
      typeof Pz_ValidadeAposAbrir !== "number"
    ) {
      return NextResponse.json(
        { message: "Invalid Pz_ValidadeAposAbrir format." },
        { status: 400 }
      );
    }

    const updatedVaccineType = await prisma.tipoVacina.update({
      where: {
        Cd_TipoVacina: vaccineTypeId,
      },
      data: {
        Nm_TipoVacina, // Will only update if provided in body
        Pz_Validade, // Will only update if provided in body
        Pz_ValidadeAposAbrir, // Will only update if provided in body
      },
    });

    return NextResponse.json(updatedVaccineType);
  } catch (error) {
    console.error(`Failed to update vaccine type with ID ${params.id}:`, error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // P2025: Record to update not found
      return NextResponse.json(
        { message: "Vaccine type not found to update" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update vaccine type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deletedVaccineType = await prisma.tipoVacina.delete({
      where: {
        Cd_TipoVacina: vaccineTypeId,
      },
    });

    // Successfully deleted, return the deleted object or just a success message
    return NextResponse.json(deletedVaccineType);
    // Alternatively, for 204 No Content:
    // return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete vaccine type with ID ${params.id}:`, error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // P2025: Record to delete not found
      return NextResponse.json(
        { message: "Vaccine type not found to delete" },
        { status: 404 }
      );
    }
    // You might also want to handle P2003: Foreign key constraint failed on the database (e.g., if Lotes are linked)
    // For now, a generic 500 for other errors
    return NextResponse.json(
      { message: "Failed to delete vaccine type" },
      { status: 500 }
    );
  }
}
