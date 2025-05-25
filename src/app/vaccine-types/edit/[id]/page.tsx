"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation"; // For navigation and route params
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface TipoVacina {
  Cd_TipoVacina: number;
  Nm_TipoVacina: string;
  Pz_Validade: number;
  Pz_ValidadeAposAbrir: number;
}

export default function EditVaccineTypePage() {
  const router = useRouter();
  const params = useParams(); // Hook to get dynamic route parameters
  const id = params.id as string; // id will be a string from params

  const [name, setName] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [shelfLifeAfterOpening, setShelfLifeAfterOpening] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // For loading initial data
  const [error, setError] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState(""); // To display in title

  useEffect(() => {
    if (id) {
      const fetchVaccineTypeDetails = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/v1/vaccine-types/${id}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Vaccine type not found.");
            }
            throw new Error(
              `Failed to fetch vaccine type details: ${response.statusText}`
            );
          }
          const data: TipoVacina = await response.json();
          setName(data.Nm_TipoVacina);
          setOriginalName(data.Nm_TipoVacina); // Store original name for title
          setShelfLife(data.Pz_Validade.toString());
          setShelfLifeAfterOpening(data.Pz_ValidadeAposAbrir.toString());
          setError(null);
        } catch (err: any) {
          setError(err.message);
          console.error("Error fetching vaccine type details:", err);
        } finally {
          setIsFetching(false);
        }
      };
      fetchVaccineTypeDetails();
    }
  }, [id]); // Re-run if id changes

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim() || !shelfLife.trim() || !shelfLifeAfterOpening.trim()) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    const Pz_Validade = parseInt(shelfLife, 10);
    const Pz_ValidadeAposAbrir = parseInt(shelfLifeAfterOpening, 10);

    if (
      isNaN(Pz_Validade) ||
      isNaN(Pz_ValidadeAposAbrir) ||
      Pz_Validade <= 0 ||
      Pz_ValidadeAposAbrir <= 0
    ) {
      setError("Shelf life values must be positive numbers.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/v1/vaccine-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nm_TipoVacina: name,
          Pz_Validade: Pz_Validade,
          Pz_ValidadeAposAbrir: Pz_ValidadeAposAbrir,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to update vaccine type: ${response.statusText}`
        );
      }

      router.push("/vaccine-types"); // Navigate back to the list on success
      // Optionally, show a success toast/message
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating vaccine type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto p-4">
        Loading vaccine type details...
      </div>
    );
  }

  // If error occurred during fetch and no data was loaded for the form
  if (error && !name && !originalName) {
    return (
      <div className="container mx-auto p-4 max-w-md text-red-500">
        <h1 className="text-2xl font-bold mb-6">Edit Vaccine Type</h1>
        Error: {error}
        <div className="mt-4">
          <Link href="/vaccine-types">
            <Button variant="outline">Back to List</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Edit Vaccine Type: {originalName || `ID ${id}`}
        </h1>
        <Link href="/vaccine-types">
          <Button variant="outline" size="sm">
            Back to List
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Vaccine Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Pfizer BioNTech"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shelfLife">Shelf Life (Total Days)</Label>
          <Input
            id="shelfLife"
            type="number"
            value={shelfLife}
            onChange={(e) => setShelfLife(e.target.value)}
            placeholder="e.g., 180"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shelfLifeAfterOpening">
            Shelf Life After Opening (Days)
          </Label>
          <Input
            id="shelfLifeAfterOpening"
            type="number"
            value={shelfLifeAfterOpening}
            onChange={(e) => setShelfLifeAfterOpening(e.target.value)}
            placeholder="e.g., 28"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
        {/* Display submission errors here */}
        <Button
          type="submit"
          disabled={isLoading || isFetching}
          className="w-full"
        >
          {isLoading ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
