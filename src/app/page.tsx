import Link from "next/link";
import { HomePanel } from "@/components/HomePanel";
import { Logo } from "@/components/SiteHeader";

const MODES = [
  {
    href: "/play/ai",
    icon: "🤖",
    title: "Đấu với máy",
    text: "Ba mức Dễ · Vừa · Khó. Chọn cầm X hoặc O.",
  },
  {
    href: "/play/local",
    icon: "👥",
    title: "Hai người một máy",
    text: "Ngồi cạnh nhau, thay phiên đánh trên cùng màn hình.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col gap-6 pb-12 pt-10 sm:pt-16">
      <div className="text-center">
        <Logo large />
        <p className="mt-4 text-lg text-neutral-300">Cờ caro — vào là chơi, không cần đăng nhập.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group rounded-3xl border border-line bg-panel p-5 transition-colors hover:border-gold"
          >
            <span className="text-3xl">{mode.icon}</span>
            <span className="mt-3 flex items-center justify-between text-xl font-bold text-white">
              {mode.title}
              <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
            </span>
            <span className="mt-1 block text-sm text-neutral-400">{mode.text}</span>
          </Link>
        ))}
        <div className="rounded-3xl border border-dashed border-line p-5 sm:col-span-2">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-bold text-neutral-300">
            🌐 Chơi online với người thật
            <span className="shrink-0 whitespace-nowrap rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">Sắp ra mắt</span>
          </span>
          <span className="mt-1 block text-sm text-neutral-400">
            Ghép trận nhanh hoặc gửi link phòng cho bạn bè.
          </span>
        </div>
      </div>

      <HomePanel />

      <p className="text-center text-xs text-neutral-500">
        Luật: bàn 15×15, X đi trước, 5 quân liền nhau là thắng — trừ khi bị chặn cả hai đầu.
      </p>
    </main>
  );
}
