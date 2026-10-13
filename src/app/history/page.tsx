import type { Metadata } from "next";
import { HistoryView } from "@/components/HistoryView";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Lịch sử đấu — CaroVIP" };

export default function HistoryPage() {
  return (
    <main>
      <SiteHeader />
      <h1 className="mb-4 text-2xl font-bold text-white">Lịch sử đấu</h1>
      <HistoryView />
    </main>
  );
}
