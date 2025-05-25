// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Import Link

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vacina App POC",
  description: "Proof of Concept for Database Class",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-slate-800 text-white p-4">
          {" "}
          {/* Basic Nav Styling */}
          <ul className="container mx-auto flex gap-4">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/vaccine-types">Vaccine Types</Link>
            </li>
            {/* Add links for Factories and Health Workers later */}
            {/* <li><Link href="/factories">Factories</Link></li> */}
            {/* <li><Link href="/health-workers">Health Workers</Link></li> */}
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
