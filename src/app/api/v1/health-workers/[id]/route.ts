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
    const funcionarioId = parseInt(id, 10);

    if (isNaN(funcionarioId)) {
      return NextResponse.json(
        { message: "Invalid Funcionario ID format" },
        { status: 400 }
      );
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: {
        Cd_Funcionario: funcionarioId,
      },
      include: {
        Pessoa: {
          // Include the related Pessoa
          include: {
            Endereco: true, // And for that Pessoa, include their Endereco
          },
        },
      },
    });

    if (!funcionario) {
      return NextResponse.json(
        { message: "Funcionario not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(funcionario);
  } catch (error) {
    console.error(`Failed to fetch funcionario with ID ${params.id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch funcionario" },
      { status: 500 }
    );
  }
}
