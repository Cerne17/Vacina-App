import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function GET() {
  try {
    const factories = await prisma.fabrica.findMany({
      include: {
        Endereco: true,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Nm_Fabrica, Cd_CNPJFabrica, Cd_Endereco } = body;

    // Basic validation
    if (!Nm_Fabrica || !Cd_CNPJFabrica || typeof Cd_Endereco !== "number") {
      return NextResponse.json(
        {
          message:
            "Missing required fields or invalid data types. Required: Nm_Fabrica (string), Cd_CNPJFabrica (string), Cd_Endereco (number).",
        },
        { status: 400 }
      );
    }

    const newFactory = await prisma.fabrica.create({
      data: {
        Nm_Fabrica,
        Cd_CNPJFabrica,
        Cd_Endereco,
      },
      include: {
        Endereco: true, // Include the address details in the response
      },
    });

    return NextResponse.json(newFactory, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Failed to create factory:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation (e.g., combination of Nm_Fabrica and Cd_CNPJFabrica already exists)
      if (error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined;
        return NextResponse.json(
          {
            message: `A factory with these details (fields: ${
              target?.join(", ") || "unknown"
            }) already exists.`,
          },
          { status: 409 } // 409 Conflict
        );
      }
      // Foreign key constraint failed (e.g., Cd_Endereco does not exist in Endereco table)
      // P2003 is more specific to DB level FK constraint, P2025 can occur if Prisma checks relations.
      // Prisma's create operation implies connecting to an existing Endereco, so if Cd_Endereco is invalid,
      // it might lead to P2025 "An operation failed because it depends on one or more records that were required but not found."
      // or a P2003 if the DB constraint is hit first.
      if (error.code === "P2003" || error.code === "P2025") {
        return NextResponse.json(
          {
            message:
              "Invalid Endereco ID: The specified address does not exist.",
          },
          { status: 400 } // Bad Request as the client provided an invalid foreign key
        );
      }
    }
    return NextResponse.json(
      { message: "Failed to create factory" },
      { status: 500 }
    );
  }
}
