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
          include: {
            Endereco: true,
          },
        },
      },
    });

    if (!funcionario) {
      return NextResponse.json(
        { message: "Health worker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(funcionario);
  } catch (error) {
    console.error(`Failed to fetch health worker with ID ${params.id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch health worker" },
      { status: 500 }
    );
  }
}
// --- End of GET Handler ---

export async function PUT(
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

    const body = await request.json();
    // These are fields for the Pessoa record
    const { Nm_PrimeiroNome, Nm_Sobrenome, Cd_CPF, Ds_Email, Cd_Endereco } =
      body;

    // Basic validation: ensure at least one field is provided for update
    if (
      Nm_PrimeiroNome === undefined &&
      Nm_Sobrenome === undefined &&
      Cd_CPF === undefined &&
      Ds_Email === undefined &&
      Cd_Endereco === undefined
    ) {
      return NextResponse.json(
        { message: "No fields provided for update." },
        { status: 400 }
      );
    }

    // Construct data for Pessoa update carefully
    const pessoaDataToUpdate: Prisma.PessoaUpdateInput = {};
    if (Nm_PrimeiroNome !== undefined)
      pessoaDataToUpdate.Nm_PrimeiroNome = Nm_PrimeiroNome;
    if (Nm_Sobrenome !== undefined)
      pessoaDataToUpdate.Nm_Sobrenome = Nm_Sobrenome;
    if (Cd_CPF !== undefined) pessoaDataToUpdate.Cd_CPF = Cd_CPF;
    if (Ds_Email !== undefined) pessoaDataToUpdate.Ds_Email = Ds_Email;
    if (Cd_Endereco !== undefined) {
      if (typeof Cd_Endereco !== "number") {
        return NextResponse.json(
          { message: "Invalid Cd_Endereco format (must be a number)." },
          { status: 400 }
        );
      }
      pessoaDataToUpdate.Cd_Endereco = Cd_Endereco;
    }

    const updatedHealthWorker = await prisma.funcionario.update({
      where: {
        Cd_Funcionario: funcionarioId,
      },
      data: {
        Pessoa: {
          // Nested update for the related Pessoa
          update: pessoaDataToUpdate,
        },
      },
      include: {
        // Include updated details in the response
        Pessoa: {
          include: {
            Endereco: true,
          },
        },
      },
    });

    return NextResponse.json(updatedHealthWorker);
  } catch (error) {
    console.error(
      `Failed to update health worker with ID ${params.id}:`,
      error
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record to update not found (either Funcionario or required related Pessoa if structure was different)
        return NextResponse.json(
          { message: "Health worker or associated person not found to update" },
          { status: 404 }
        );
      }
      if (error.code === "P2002") {
        // Unique constraint failed (e.g., for Pessoa.Ds_Email)
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes("Ds_Email")) {
          return NextResponse.json(
            {
              message:
                "Update failed: This email (Ds_Email) is already in use.",
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            message: `Update failed: A record with conflicting unique details (fields: ${
              target?.join(", ") || "unknown"
            }) already exists.`,
          },
          { status: 409 }
        );
      }
      if (
        error.code === "P2003" &&
        error.message.includes("Pessoa_Endereco_Cd_Endereco_fk")
      ) {
        // Foreign key constraint for Endereco
        return NextResponse.json(
          {
            message:
              "Invalid Endereco ID: The specified address (Cd_Endereco) for the person does not exist.",
          },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { message: "Failed to update health worker" },
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
    const funcionarioId = parseInt(id, 10);

    if (isNaN(funcionarioId)) {
      return NextResponse.json(
        { message: "Invalid Funcionario ID format" },
        { status: 400 }
      );
    }

    // Important: Deleting Funcionario does NOT delete the Pessoa by default via this operation.
    // The Pessoa record will remain.
    // Also, if this Funcionario has related Plantao or Vacinacao records, deletion will fail.
    const deletedFuncionario = await prisma.funcionario.delete({
      where: {
        Cd_Funcionario: funcionarioId,
      },
      // You might want to include Pessoa to return full details of what was unlinked
      include: {
        Pessoa: {
          include: { Endereco: true },
        },
      },
    });

    return NextResponse.json(deletedFuncionario);
    // Or for 204 No Content: return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      `Failed to delete health worker with ID ${params.id}:`,
      error
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record to delete not found
        return NextResponse.json(
          { message: "Health worker not found to delete" },
          { status: 404 }
        );
      }
      if (error.code === "P2003") {
        // Foreign key constraint failed
        // This usually means there are related records (e.g., Plantao, Vacinacao)
        // preventing the deletion of this Funcionario.
        return NextResponse.json(
          {
            message:
              "Cannot delete health worker: They are referenced by other records (e.g., duty shifts or vaccinations). Please remove those references first.",
          },
          { status: 409 } // Conflict
        );
      }
    }
    return NextResponse.json(
      { message: "Failed to delete health worker" },
      { status: 500 }
    );
  }
}
