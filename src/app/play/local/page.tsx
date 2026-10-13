import type { Metadata } from "next";
import { Game } from "@/components/Game";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Hai người một máy — CaroVIP" };

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <h1 className="mb-4 text-2xl font-bold text-white">Hai người một máy</h1>
      <Game mode="local" />
    </main>
  );
}
