"use client";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your App!</h1>

      <div className="space-x-4">
        <Button>Default Button</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled Button</Button>
      </div>

      <div className="mt-8">
        <Button size="lg">Large Button</Button>
        <Button size="sm">Small Button</Button>
        <Button size="icon">
          {" "}
          {/* You might need an icon inside for this to look right */}
          ICON
        </Button>
      </div>

      <div className="mt-8">
        <Button onClick={() => alert("Button clicked!")}>Click Me</Button>
      </div>
    </main>
  );
}
