import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function GET() {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      include: {
        Pessoa: {
          include: {
            Endereco: true,
          },
        },
      },
      orderBy: {
        Cd_Funcionario: "asc",
      },
    });
    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error("Failed to fetch health workers:", error);
    return NextResponse.json(
      { message: "Failed to fetch health workers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Nm_PrimeiroNome, Nm_Sobrenome, Cd_CPF, Ds_Email, Cd_Endereco } =
      body;

    // Basic validation for Pessoa fields
    if (
      !Nm_PrimeiroNome ||
      !Nm_Sobrenome ||
      !Cd_CPF ||
      !Ds_Email ||
      typeof Cd_Endereco !== "number"
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields or invalid data types for the person. Required: Nm_PrimeiroNome, Nm_Sobrenome, Cd_CPF, Ds_Email (all strings), Cd_Endereco (number).",
        },
        { status: 400 }
      );
    }

    // Important: Cd_Endereco must be a valid ID of an existing Endereco.
    // We'll rely on Prisma/DB constraints for this, but further validation could be added.

    const newHealthWorker = await prisma.funcionario.create({
      data: {
        // Funcionario itself might not have direct fields to create here,
        // its creation is tied to the creation of a Pessoa.
        // If Funcionario had other direct fields, they would go here.
        Pessoa: {
          // This is where the nested write happens
          create: {
            Nm_PrimeiroNome,
            Nm_Sobrenome,
            Cd_CPF,
            Ds_Email,
            Cd_Endereco,
          },
        },
      },
      include: {
        // Include the newly created Pessoa and their Endereco in the response
        Pessoa: {
          include: {
            Endereco: true,
          },
        },
      },
    });

    return NextResponse.json(newHealthWorker, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Failed to create health worker:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation (e.g., Ds_Email for Pessoa already exists)
      if (error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined;
        // Check if the target includes 'Ds_Email' for a more specific message
        if (target && target.includes("Ds_Email")) {
          return NextResponse.json(
            { message: `A person with this email (Ds_Email) already exists.` },
            { status: 409 } // 409 Conflict
          );
        }
        return NextResponse.json(
          {
            message: `A record with these details (fields: ${
              target?.join(", ") || "unknown"
            }) already exists.`,
          },
          { status: 409 } // 409 Conflict
        );
      }
      // Foreign key constraint failed (e.g., Cd_Endereco does not exist in Endereco table)
      if (error.code === "P2003" || error.code === "P2025") {
        // P2025 "An operation failed because it depends on one or more records that were required but not found." (e.g. Endereco)
        return NextResponse.json(
          {
            message:
              "Invalid Endereco ID: The specified address (Cd_Endereco) for the person does not exist.",
          },
          { status: 400 } // Bad Request as the client provided an invalid foreign key
        );
      }
    }
    return NextResponse.json(
      { message: "Failed to create health worker" },
      { status: 500 }
    );
  }
}
