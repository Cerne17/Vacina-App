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
    const factoryId = parseInt(id, 10);

    if (isNaN(factoryId)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const factory = await prisma.fabrica.findUnique({
      where: {
        Cd_Fabrica: factoryId,
      },
      include: {
        Endereco: true, // Include the related Endereco (address) data
      },
    });

    if (!factory) {
      return NextResponse.json(
        { message: "Factory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(factory);
  } catch (error) {
    console.error(`Failed to fetch factory with ID ${params.id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch factory" },
      { status: 500 }
    );
  }
}
