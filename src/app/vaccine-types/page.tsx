"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface TipoVacina {
  Cd_TipoVacina: number;
  Nm_TipoVacina: string;
  Pz_Validade: number;
  Pz_ValidadeAposAbrir: number;
}

export default function VaccineTypesPage() {
  const router = useRouter(); // For navigation
  const [vaccineTypes, setVaccineTypes] = useState<TipoVacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // No need for separate delete confirmation state if AlertDialogTrigger handles opening

  const fetchVaccineTypes = async () => {
    // Encapsulate fetch logic
    try {
      setLoading(true);
      const response = await fetch("/api/v1/vaccine-types");
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();
      setVaccineTypes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching vaccine types:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccineTypes();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/vaccine-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to delete vaccine type: ${response.statusText}`
        );
      }

      // Refresh the list after successful deletion
      // For a better UX, you could also remove the item from the local state:
      // setVaccineTypes(prevTypes => prevTypes.filter(type => type.Cd_TipoVacina !== id));
      fetchVaccineTypes();
      // You might want to add a success toast/message here
    } catch (err: any) {
      setError(`Deletion failed: ${err.message}`); // Show error specific to deletion
      console.error("Error deleting vaccine type:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading vaccine types...</div>
    );
  }

  if (error && vaccineTypes.length === 0) {
    // Only show full page error if list is empty
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vaccine Types</h1>
        <Link href="/vaccine-types/new">
          <Button>Add New Vaccine Type</Button>
        </Link>
      </div>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}{" "}
      {/* Show error above table if list might still render */}
      {vaccineTypes.length === 0 && !loading ? ( // check !loading here
        <p>No vaccine types found. Please add some!</p>
      ) : (
        <Table>
          <TableCaption>A list of available vaccine types.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Shelf Life (Total)</TableHead>
              <TableHead>Shelf Life (After Opening)</TableHead>
              <TableHead className="text-right">Actions</TableHead>{" "}
              {/* Actions column */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vaccineTypes.map((vaccineType) => (
              <TableRow key={vaccineType.Cd_TipoVacina}>
                <TableCell className="font-medium">
                  {vaccineType.Cd_TipoVacina}
                </TableCell>
                <TableCell>{vaccineType.Nm_TipoVacina}</TableCell>
                <TableCell>{vaccineType.Pz_Validade} days</TableCell>
                <TableCell>{vaccineType.Pz_ValidadeAposAbrir} days</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link
                    href={`/vaccine-types/edit/${vaccineType.Cd_TipoVacina}`}
                  >
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the vaccine type "{vaccineType.Nm_TipoVacina}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(vaccineType.Cd_TipoVacina)
                          }
                          // Optional: style the confirm button more distinctively if needed
                          // className="bg-red-600 hover:bg-red-700"
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
