"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import table components
import { Button } from "@/components/ui/button"; // For an "Add New" button later
import Link from "next/link"; // To link to a "create new" page

// Define an interface for the structure of your Vaccine Type data
interface TipoVacina {
  Cd_TipoVacina: number;
  Nm_TipoVacina: string;
  Pz_Validade: number;
  Pz_ValidadeAposAbrir: number;
}

export default function VaccineTypesPage() {
  const [vaccineTypes, setVaccineTypes] = useState<TipoVacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVaccineTypes() {
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
    }
    fetchVaccineTypes();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading vaccine types...</div>
    );
  }

  if (error) {
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

      {vaccineTypes.length === 0 ? (
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
              {/* Add <TableHead>Actions</TableHead> here later */}
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
                {/* Add action buttons (Edit, Delete) here later */}
                {/* <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
