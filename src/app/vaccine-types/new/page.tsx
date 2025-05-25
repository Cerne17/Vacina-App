"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation"; // For navigation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function NewVaccineTypePage() {
  const router = useRouter(); // Initialize router for navigation
  const [name, setName] = useState("");
  const [shelfLife, setShelfLife] = useState(""); // Pz_Validade
  const [shelfLifeAfterOpening, setShelfLifeAfterOpening] = useState(""); // Pz_ValidadeAposAbrir
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
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
      const response = await fetch("/api/v1/vaccine-types", {
        method: "POST",
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
            `Failed to create vaccine type: ${response.statusText}`
        );
      }

      // On successful creation, navigate back to the list page
      router.push("/vaccine-types");
      // You might also want to show a success toast/message here
      // For now, we'll just navigate.
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating vaccine type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Vaccine Type</h1>
        <Link href="/vaccine-types">
          <Button variant="outline">Back to List</Button>
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Submitting..." : "Add Vaccine Type"}
        </Button>
      </form>
    </div>
  );
}
