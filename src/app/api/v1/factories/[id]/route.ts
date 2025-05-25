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

export async function PUT(
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

    const body = await request.json();
    // Only include fields that are actually updatable by the client
    const { Nm_Fabrica, Cd_CNPJFabrica, Cd_Endereco } = body;

    // Basic validation: ensure at least one field to update is provided
    // and that provided fields have correct types if they exist
    if (
      Nm_Fabrica === undefined &&
      Cd_CNPJFabrica === undefined &&
      Cd_Endereco === undefined
    ) {
      return NextResponse.json(
        { message: "No fields provided for update." },
        { status: 400 }
      );
    }
    if (Nm_Fabrica !== undefined && typeof Nm_Fabrica !== "string") {
      return NextResponse.json(
        { message: "Invalid Nm_Fabrica format." },
        { status: 400 }
      );
    }
    if (Cd_CNPJFabrica !== undefined && typeof Cd_CNPJFabrica !== "string") {
      return NextResponse.json(
        { message: "Invalid Cd_CNPJFabrica format." },
        { status: 400 }
      );
    }
    if (Cd_Endereco !== undefined && typeof Cd_Endereco !== "number") {
      return NextResponse.json(
        { message: "Invalid Cd_Endereco format (must be a number)." },
        { status: 400 }
      );
    }

    // Construct data object carefully to only include provided fields
    const dataToUpdate: Prisma.FabricaUpdateInput = {};
    if (Nm_Fabrica !== undefined) dataToUpdate.Nm_Fabrica = Nm_Fabrica;
    if (Cd_CNPJFabrica !== undefined)
      dataToUpdate.Cd_CNPJFabrica = Cd_CNPJFabrica;
    if (Cd_Endereco !== undefined) dataToUpdate.Cd_Endereco = Cd_Endereco;

    const updatedFactory = await prisma.fabrica.update({
      where: {
        Cd_Fabrica: factoryId,
      },
      data: dataToUpdate,
      include: {
        Endereco: true, // Include address details in the response
      },
    });

    return NextResponse.json(updatedFactory);
  } catch (error) {
    console.error(`Failed to update factory with ID ${params.id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record to update not found
        return NextResponse.json(
          { message: "Factory not found to update" },
          { status: 404 }
        );
      }
      if (error.code === "P2002") {
        // Unique constraint failed
        const target = error.meta?.target as string[] | undefined;
        return NextResponse.json(
          {
            message: `Update failed: A factory with these details (fields: ${
              target?.join(", ") || "unknown"
            }) already exists.`,
          },
          { status: 409 } // Conflict
        );
      }
      if (
        error.code === "P2003" ||
        (error.code === "P2025" && error.message.includes("Endereco"))
      ) {
        // Foreign key constraint or related record not found for Endereco
        return NextResponse.json(
          {
            message:
              "Invalid Endereco ID: The specified address does not exist for update.",
          },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { message: "Failed to update factory" },
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
    const factoryId = parseInt(id, 10);

    if (isNaN(factoryId)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Optionally, check if the factory has related Lote records before deleting
    // For simplicity, we'll let Prisma handle it and catch the error if any

    const deletedFactory = await prisma.fabrica.delete({
      where: {
        Cd_Fabrica: factoryId,
      },
    });

    return NextResponse.json(deletedFactory);
    // Or for 204 No Content: return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete factory with ID ${params.id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record to delete not found
        return NextResponse.json(
          { message: "Factory not found to delete" },
          { status: 404 }
        );
      }
      if (error.code === "P2003") {
        // Foreign key constraint failed (e.g., Lotes are linked to this Fabrica)
        return NextResponse.json(
          {
            message:
              "Cannot delete factory: It is referenced by other records (e.g., Lotes). Please delete or reassign them first.",
          },
          { status: 409 } // Conflict
        );
      }
    }
    return NextResponse.json(
      { message: "Failed to delete factory" },
      { status: 500 }
    );
  }
}
